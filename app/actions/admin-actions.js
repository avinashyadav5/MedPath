"use server"

import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Audit log helper
async function logAdminAction(
    adminId,
    actionType,
    targetType,
    targetId,
    description,
    metadata = {},
) {
    await sql`
    INSERT INTO audit_logs (admin_id, action_type, target_type, target_id, description, metadata)
    VALUES (${adminId}, ${actionType}, ${targetType}, ${targetId}, ${description}, ${JSON.stringify(metadata)})
  `
}

// Dashboard Stats
export async function getAdminDashboardStats() {
    const admin = await requireAdmin()

    const [usersResult, patientsResult, doctorsResult, appointmentsResult, highRiskResult] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`,
        sql`SELECT COUNT(*) as count FROM users WHERE role = 'patient' AND deleted_at IS NULL`,
        sql`SELECT COUNT(*) as count FROM users WHERE role = 'doctor' AND deleted_at IS NULL`,
        sql`SELECT COUNT(*) as count FROM appointments`,
        sql`SELECT COUNT(*) as count FROM predictions WHERE risk_percent >= 70`,
    ])

    return {
        totalUsers: Number(usersResult[0]?.count || 0),
        totalPatients: Number(patientsResult[0]?.count || 0),
        totalDoctors: Number(doctorsResult[0]?.count || 0),
        totalAppointments: Number(appointmentsResult[0]?.count || 0),
        highRiskCases: Number(highRiskResult[0]?.count || 0),
    }
}

// Get recent activity
export async function getRecentActivity(limit = 10) {
    await requireAdmin()

    const logs = await sql`
    SELECT al.*, u.name as admin_name
    FROM audit_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `

    return logs
}

// User Management
export async function getAllUsers(filters) {
    await requireAdmin()

    const { role, search, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    let query = sql`
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.is_verified, u.created_at, u.deleted_at,
           dp.specialty, dp.city, dp.is_verified as doctor_verified, dp.is_blocked
    FROM users u
    LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
    WHERE u.deleted_at IS NULL
  `

    if (role && role !== "all") {
        query = sql`${query} AND u.role = ${role}`
    }

    if (search) {
        query = sql`${query} AND (u.name ILIKE ${"%" + search + "%"} OR u.email ILIKE ${"%" + search + "%"})`
    }

    const users = await sql`${query} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    const countResult = await sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`

    return {
        users: users,
        total: Number(countResult[0]?.count || 0),
        page,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
    }
}

export async function toggleUserStatus(userId) {
    const admin = await requireAdmin()

    // Prevent admin from deactivating themselves
    if (userId === admin.id) {
        return { error: "Cannot deactivate your own account" }
    }

    const user = await sql`SELECT id, name, is_active, role FROM users WHERE id = ${userId}`
    if (user.length === 0) {
        return { error: "User not found" }
    }

    // Prevent deactivating other admins
    if (user[0].role === "admin") {
        return { error: "Cannot deactivate admin accounts" }
    }

    const newStatus = !user[0].is_active
    await sql`UPDATE users SET is_active = ${newStatus}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`

    await logAdminAction(
        admin.id,
        newStatus ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        "user",
        userId,
        `${newStatus ? "Activated" : "Deactivated"} user: ${user[0].name}`,
    )

    revalidatePath("/admin/users")
    return { success: true, newStatus }
}

export async function deleteUser(userId) {
    const admin = await requireAdmin()

    if (userId === admin.id) {
        return { error: "Cannot delete your own account" }
    }

    const user = await sql`SELECT id, name, role FROM users WHERE id = ${userId}`
    if (user.length === 0) {
        return { error: "User not found" }
    }

    if (user[0].role === "admin") {
        return { error: "Cannot delete admin accounts" }
    }

    // Soft delete
    await sql`UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`

    await logAdminAction(admin.id, "USER_DELETED", "user", userId, `Soft deleted user: ${user[0].name}`)

    revalidatePath("/admin/users")
    return { success: true }
}

export async function updateUserRole(userId, newRole) {
    const admin = await requireAdmin()

    // Prevent admin from changing their own role
    if (userId === admin.id) {
        return { error: "Cannot change your own role" }
    }

    const user = await sql`SELECT id, name, role FROM users WHERE id = ${userId}`
    if (user.length === 0) {
        return { error: "User not found" }
    }

    const oldRole = user[0].role
    if (oldRole === newRole) {
        return { success: true }
    }

    await sql`UPDATE users SET role = ${newRole}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`

    await logAdminAction(
        admin.id,
        "USER_ROLE_UPDATED",
        "user",
        userId,
        `Updated role for user ${user[0].name} from ${oldRole} to ${newRole}`,
        { oldRole, newRole },
    )

    revalidatePath("/admin/users")
    return { success: true }
}

// Doctor Management
export async function getAllDoctors(filters) {
    await requireAdmin()

    const { verified, blocked, search, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    const doctors = await sql`
    SELECT u.id, u.name, u.email, u.is_active, u.created_at,
           dp.id as profile_id, dp.specialty, dp.city, dp.hospital_name, 
           dp.is_verified, dp.is_blocked, dp.availability
    FROM users u
    INNER JOIN doctor_profiles dp ON u.id = dp.user_id
    WHERE u.role = 'doctor' AND u.deleted_at IS NULL
    ${verified !== undefined ? sql`AND dp.is_verified = ${verified}` : sql``}
    ${blocked !== undefined ? sql`AND dp.is_blocked = ${blocked}` : sql``}
    ${search ? sql`AND (u.name ILIKE ${"%" + search + "%"} OR dp.specialty ILIKE ${"%" + search + "%"})` : sql``}
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

    const countResult = await sql`
    SELECT COUNT(*) as count 
    FROM users u 
    INNER JOIN doctor_profiles dp ON u.id = dp.user_id 
    WHERE u.role = 'doctor' AND u.deleted_at IS NULL
  `

    return {
        doctors: doctors,
        total: Number(countResult[0]?.count || 0),
        page,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
    }
}

export async function verifyDoctor(userId) {
    const admin = await requireAdmin()

    await sql`
    UPDATE doctor_profiles 
    SET is_verified = true, updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = ${userId}
  `

    const doctor = await sql`SELECT name FROM users WHERE id = ${userId}`

    await logAdminAction(admin.id, "DOCTOR_VERIFIED", "doctor", userId, `Verified doctor: ${doctor[0]?.name}`)

    revalidatePath("/admin/doctors")
    return { success: true }
}

export async function toggleDoctorBlock(userId) {
    const admin = await requireAdmin()

    const profile = await sql`SELECT is_blocked FROM doctor_profiles WHERE user_id = ${userId}`
    if (profile.length === 0) {
        return { error: "Doctor profile not found" }
    }

    const newBlockedStatus = !profile[0].is_blocked
    await sql`
    UPDATE doctor_profiles 
    SET is_blocked = ${newBlockedStatus}, updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = ${userId}
  `

    const doctor = await sql`SELECT name FROM users WHERE id = ${userId}`

    await logAdminAction(
        admin.id,
        newBlockedStatus ? "DOCTOR_BLOCKED" : "DOCTOR_UNBLOCKED",
        "doctor",
        userId,
        `${newBlockedStatus ? "Blocked" : "Unblocked"} doctor: ${doctor[0]?.name}`,
    )

    revalidatePath("/admin/doctors")
    return { success: true, newBlockedStatus }
}

export async function updateDoctorProfile(userId, data) {
    const admin = await requireAdmin()

    if (data.specialty) {
        await sql`UPDATE doctor_profiles SET specialty = ${data.specialty} WHERE user_id = ${userId}`
    }
    if (data.availability) {
        await sql`UPDATE doctor_profiles SET availability = ${JSON.stringify(data.availability)} WHERE user_id = ${userId}`
    }

    await sql`UPDATE doctor_profiles SET updated_at = CURRENT_TIMESTAMP WHERE user_id = ${userId}`

    const doctor = await sql`SELECT name FROM users WHERE id = ${userId}`

    await logAdminAction(
        admin.id,
        "DOCTOR_PROFILE_UPDATED",
        "doctor",
        userId,
        `Updated doctor profile: ${doctor[0]?.name}`,
        data,
    )

    revalidatePath("/admin/doctors")
    return { success: true }
}

// Appointment Management
export async function getAllAppointments(filters) {
    await requireAdmin()

    const { doctorId, patientId, status, date, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    const appointments = await sql`
    SELECT a.*,
           p.name as patient_name, p.email as patient_email,
           d.name as doctor_name, d.email as doctor_email,
           dp.specialty, dp.hospital_name
    FROM appointments a
    INNER JOIN users p ON a.patient_id = p.id
    INNER JOIN users d ON a.doctor_id = d.id
    LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
    WHERE 1=1
    ${doctorId ? sql`AND a.doctor_id = ${doctorId}` : sql``}
    ${patientId ? sql`AND a.patient_id = ${patientId}` : sql``}
    ${status && status !== "all" ? sql`AND a.status = ${status}` : sql``}
    ${date ? sql`AND a.appointment_date = ${date}` : sql``}
    ORDER BY a.appointment_date DESC, a.time_slot DESC
    LIMIT ${limit} OFFSET ${offset}
  `

    const countResult = await sql`SELECT COUNT(*) as count FROM appointments`

    return {
        appointments: appointments,
        total: Number(countResult[0]?.count || 0),
        page,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
    }
}

export async function updateAppointmentStatus(appointmentId, status) {
    const admin = await requireAdmin()

    await sql`
    UPDATE appointments 
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${appointmentId}
  `

    await logAdminAction(
        admin.id,
        "APPOINTMENT_STATUS_UPDATED",
        "appointment",
        appointmentId,
        `Updated appointment status to: ${status}`,
    )

    revalidatePath("/admin/appointments")
    return { success: true }
}

// AI Diagnosis Monitoring
export async function getAllDiagnoses(filters) {
    await requireAdmin()

    const { flagged, urgency, minRisk, search, page = 1, limit = 20 } = filters
    const offset = (page - 1) * limit

    const diagnoses = await sql`
    SELECT pr.*, u.name as patient_name, u.email as patient_email,
           f.name as flagged_by_name
    FROM predictions pr
    INNER JOIN users u ON pr.user_id = u.id
    LEFT JOIN users f ON pr.flagged_by = f.id
    WHERE 1=1
    ${flagged !== undefined ? sql`AND pr.is_flagged = ${flagged}` : sql``}
    ${urgency && urgency !== "all" ? sql`AND pr.urgency = ${urgency}` : sql``}
    ${minRisk ? sql`AND pr.risk_percent >= ${minRisk}` : sql``}
    ${search ? sql`AND (pr.diagnosis ILIKE ${"%" + search + "%"} OR pr.symptoms ILIKE ${"%" + search + "%"})` : sql``}
    ORDER BY pr.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

    const countResult = await sql`SELECT COUNT(*) as count FROM predictions`

    return {
        diagnoses: diagnoses,
        total: Number(countResult[0]?.count || 0),
        page,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
    }
}

export async function flagDiagnosis(predictionId, reason) {
    const admin = await requireAdmin()

    await sql`
    UPDATE predictions 
    SET is_flagged = true, flag_reason = ${reason}, flagged_by = ${admin.id}, flagged_at = CURRENT_TIMESTAMP 
    WHERE id = ${predictionId}
  `

    await logAdminAction(admin.id, "DIAGNOSIS_FLAGGED", "prediction", predictionId, `Flagged diagnosis: ${reason}`)

    revalidatePath("/admin/diagnoses")
    return { success: true }
}

export async function unflagDiagnosis(predictionId) {
    const admin = await requireAdmin()

    await sql`
    UPDATE predictions 
    SET is_flagged = false, flag_reason = NULL, flagged_by = NULL, flagged_at = NULL 
    WHERE id = ${predictionId}
  `

    await logAdminAction(admin.id, "DIAGNOSIS_UNFLAGGED", "prediction", predictionId, "Removed flag from diagnosis")

    revalidatePath("/admin/diagnoses")
    return { success: true }
}

// Analytics
export async function getAnalyticsData() {
    await requireAdmin()

    // Most common diseases/diagnoses
    const commonDiseases = await sql`
    SELECT diagnosis, COUNT(*) as count
    FROM predictions
    GROUP BY diagnosis
    ORDER BY count DESC
    LIMIT 10
  `

    // City-wise patient distribution
    const cityDistribution = await sql`
    SELECT city, COUNT(*) as count
    FROM predictions
    GROUP BY city
    ORDER BY count DESC
    LIMIT 10
  `

    // Doctor utilization (appointments per doctor)
    const doctorUtilization = await sql`
    SELECT u.name as doctor_name, dp.specialty, COUNT(a.id) as appointment_count
    FROM users u
    INNER JOIN doctor_profiles dp ON u.id = dp.user_id
    LEFT JOIN appointments a ON u.id = a.doctor_id
    WHERE u.role = 'doctor'
    GROUP BY u.id, u.name, dp.specialty
    ORDER BY appointment_count DESC
    LIMIT 10
  `

    // Appointment status breakdown
    const appointmentStats = await sql`
    SELECT status, COUNT(*) as count
    FROM appointments
    GROUP BY status
  `

    // Risk level trends (last 30 days)
    const riskTrends = await sql`
    SELECT 
      DATE(created_at) as date,
      AVG(risk_percent) as avg_risk,
      COUNT(*) as count
    FROM predictions
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `

    // Urgency distribution
    const urgencyDistribution = await sql`
    SELECT urgency, COUNT(*) as count
    FROM predictions
    GROUP BY urgency
  `

    return {
        commonDiseases: commonDiseases,
        cityDistribution: cityDistribution,
        doctorUtilization: doctorUtilization,
        appointmentStats: appointmentStats,
        riskTrends: riskTrends,
        urgencyDistribution: urgencyDistribution,
    }
}

// Audit Logs
export async function getAuditLogs(filters) {
    await requireAdmin()

    const { actionType, targetType, page = 1, limit = 50 } = filters
    const offset = (page - 1) * limit

    const logs = await sql`
    SELECT al.*, u.name as admin_name, u.email as admin_email
    FROM audit_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    WHERE 1=1
    ${actionType && actionType !== "all" ? sql`AND al.action_type = ${actionType}` : sql``}
    ${targetType && targetType !== "all" ? sql`AND al.target_type = ${targetType}` : sql``}
    ORDER BY al.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

    const countResult = await sql`SELECT COUNT(*) as count FROM audit_logs`

    return {
        logs: logs,
        total: Number(countResult[0]?.count || 0),
        page,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
    }
}
