import { Router } from "express"
import { sql } from "../db.js"
import { asyncHandler, requireAdmin } from "../middleware/auth.js"

const router = Router()

// Every route below is admin-only. This replaces the per-action requireAdmin()
// call that each server action used to make for itself.
router.use(requireAdmin)

/**
 * The Next version built dynamic WHERE clauses by nesting neon `sql` fragments.
 * That is fragile, so filtered queries here use sql.query(text, params) with
 * $n placeholders — still fully parameterised, no string interpolation of values.
 */
function buildFilters(clauses) {
    const params = []
    const parts = []
    for (const [condition, value] of clauses) {
        if (value === undefined || value === null || value === "" || value === "all") continue
        params.push(value)
        parts.push(condition.replace("$?", `$${params.length}`))
    }
    return { where: parts.length ? ` AND ${parts.join(" AND ")}` : "", params }
}

async function logAdminAction(adminId, actionType, targetType, targetId, description, metadata = {}) {
    await sql`
    INSERT INTO audit_logs (admin_id, action_type, target_type, target_id, description, metadata)
    VALUES (${adminId}, ${actionType}, ${targetType}, ${targetId}, ${description}, ${JSON.stringify(metadata)})
  `
}

const asBool = (v) => (v === "true" ? true : v === "false" ? false : undefined)

/* ------------------------------------------------------------------ dashboard */

/** was: getAdminDashboardStats() */
router.get(
    "/stats",
    asyncHandler(async (_req, res) => {
        const [users, patients, doctors, appointments, highRisk] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`,
            sql`SELECT COUNT(*) as count FROM users WHERE role = 'patient' AND deleted_at IS NULL`,
            sql`SELECT COUNT(*) as count FROM users WHERE role = 'doctor' AND deleted_at IS NULL`,
            sql`SELECT COUNT(*) as count FROM appointments`,
            sql`SELECT COUNT(*) as count FROM predictions WHERE risk_percent >= 70`,
        ])

        res.json({
            totalUsers: Number(users[0]?.count || 0),
            totalPatients: Number(patients[0]?.count || 0),
            totalDoctors: Number(doctors[0]?.count || 0),
            totalAppointments: Number(appointments[0]?.count || 0),
            highRiskCases: Number(highRisk[0]?.count || 0),
        })
    })
)

/** was: getRecentActivity(limit) */
router.get(
    "/activity",
    asyncHandler(async (req, res) => {
        const limit = Math.min(Number(req.query.limit) || 10, 100)
        const logs = await sql`
      SELECT al.*, u.name as admin_name
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit}
    `
        res.json(logs)
    })
)

/* ---------------------------------------------------------------------- users */

/** was: getAllUsers(filters) */
router.get(
    "/users",
    asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const offset = (page - 1) * limit
        const search = req.query.search

        const params = []
        let where = ""

        if (req.query.role && req.query.role !== "all") {
            params.push(req.query.role)
            where += ` AND u.role = $${params.length}`
        }
        if (search) {
            params.push(`%${search}%`)
            where += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`
        }

        const users = await sql.query(
            `SELECT u.id, u.name, u.email, u.role, u.is_active, u.is_verified, u.created_at, u.deleted_at,
              dp.specialty, dp.city, dp.is_verified as doctor_verified, dp.is_blocked
       FROM users u
       LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
       WHERE u.deleted_at IS NULL${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        )

        const countResult = await sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`
        const total = Number(countResult[0]?.count || 0)

        res.json({ users, total, page, totalPages: Math.ceil(total / limit) })
    })
)

/** was: toggleUserStatus(userId) */
router.post(
    "/users/:id/toggle-status",
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.id)

        if (userId === req.user.id) {
            return res.status(400).json({ error: "Cannot deactivate your own account" })
        }

        const user = await sql`SELECT id, name, is_active, role FROM users WHERE id = ${userId}`
        if (user.length === 0) return res.status(404).json({ error: "User not found" })
        if (user[0].role === "admin") {
            return res.status(400).json({ error: "Cannot deactivate admin accounts" })
        }

        const newStatus = !user[0].is_active
        await sql`UPDATE users SET is_active = ${newStatus}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`

        await logAdminAction(
            req.user.id,
            newStatus ? "USER_ACTIVATED" : "USER_DEACTIVATED",
            "user",
            userId,
            `${newStatus ? "Activated" : "Deactivated"} user: ${user[0].name}`
        )

        res.json({ success: true, newStatus })
    })
)

/** was: deleteUser(userId) — soft delete */
router.delete(
    "/users/:id",
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.id)

        if (userId === req.user.id) {
            return res.status(400).json({ error: "Cannot delete your own account" })
        }

        const user = await sql`SELECT id, name, role FROM users WHERE id = ${userId}`
        if (user.length === 0) return res.status(404).json({ error: "User not found" })
        if (user[0].role === "admin") return res.status(400).json({ error: "Cannot delete admin accounts" })

        await sql`
      UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}
    `
        await logAdminAction(req.user.id, "USER_DELETED", "user", userId, `Soft deleted user: ${user[0].name}`)

        res.json({ success: true })
    })
)

/** was: updateUserRole(userId, newRole) */
router.post(
    "/users/:id/role",
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.id)
        const newRole = req.body.role

        if (userId === req.user.id) return res.status(400).json({ error: "Cannot change your own role" })
        if (!["patient", "doctor", "admin"].includes(newRole)) {
            return res.status(400).json({ error: "Invalid role" })
        }

        const user = await sql`SELECT id, name, role FROM users WHERE id = ${userId}`
        if (user.length === 0) return res.status(404).json({ error: "User not found" })

        const oldRole = user[0].role
        if (oldRole === newRole) return res.json({ success: true })

        await sql`UPDATE users SET role = ${newRole}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`

        await logAdminAction(
            req.user.id,
            "USER_ROLE_UPDATED",
            "user",
            userId,
            `Updated role for user ${user[0].name} from ${oldRole} to ${newRole}`,
            { oldRole, newRole }
        )

        res.json({ success: true })
    })
)

/* -------------------------------------------------------------------- doctors */

/** was: getAllDoctors(filters) */
router.get(
    "/doctors",
    asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const offset = (page - 1) * limit
        const search = req.query.search

        const params = []
        let where = ""

        const verified = asBool(req.query.verified)
        if (verified !== undefined) {
            params.push(verified)
            where += ` AND dp.is_verified = $${params.length}`
        }
        const blocked = asBool(req.query.blocked)
        if (blocked !== undefined) {
            params.push(blocked)
            where += ` AND dp.is_blocked = $${params.length}`
        }
        if (search) {
            params.push(`%${search}%`)
            where += ` AND (u.name ILIKE $${params.length} OR dp.specialty ILIKE $${params.length})`
        }

        const doctors = await sql.query(
            `SELECT u.id, u.name, u.email, u.is_active, u.created_at,
              dp.id as profile_id, dp.specialty, dp.city, dp.hospital_name,
              dp.is_verified, dp.is_blocked, dp.availability
       FROM users u
       INNER JOIN doctor_profiles dp ON u.id = dp.user_id
       WHERE u.role = 'doctor' AND u.deleted_at IS NULL${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        )

        const countResult = await sql`
      SELECT COUNT(*) as count
      FROM users u
      INNER JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor' AND u.deleted_at IS NULL
    `
        const total = Number(countResult[0]?.count || 0)

        res.json({ doctors, total, page, totalPages: Math.ceil(total / limit) })
    })
)

/** was: verifyDoctor(userId) */
router.post(
    "/doctors/:id/verify",
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.id)

        await sql`
      UPDATE doctor_profiles SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = ${userId}
    `
        const doctor = await sql`SELECT name FROM users WHERE id = ${userId}`
        await logAdminAction(req.user.id, "DOCTOR_VERIFIED", "doctor", userId, `Verified doctor: ${doctor[0]?.name}`)

        res.json({ success: true })
    })
)

/** was: toggleDoctorBlock(userId) */
router.post(
    "/doctors/:id/toggle-block",
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.id)

        const profile = await sql`SELECT is_blocked FROM doctor_profiles WHERE user_id = ${userId}`
        if (profile.length === 0) return res.status(404).json({ error: "Doctor profile not found" })

        const newBlockedStatus = !profile[0].is_blocked
        await sql`
      UPDATE doctor_profiles
      SET is_blocked = ${newBlockedStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `
        const doctor = await sql`SELECT name FROM users WHERE id = ${userId}`

        await logAdminAction(
            req.user.id,
            newBlockedStatus ? "DOCTOR_BLOCKED" : "DOCTOR_UNBLOCKED",
            "doctor",
            userId,
            `${newBlockedStatus ? "Blocked" : "Unblocked"} doctor: ${doctor[0]?.name}`
        )

        res.json({ success: true, newBlockedStatus })
    })
)

/** was: updateDoctorProfile(userId, data) */
router.put(
    "/doctors/:id",
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.id)
        const data = req.body

        if (data.specialty) {
            await sql`UPDATE doctor_profiles SET specialty = ${data.specialty} WHERE user_id = ${userId}`
        }
        if (data.availability) {
            await sql`
        UPDATE doctor_profiles SET availability = ${JSON.stringify(data.availability)} WHERE user_id = ${userId}
      `
        }
        await sql`UPDATE doctor_profiles SET updated_at = CURRENT_TIMESTAMP WHERE user_id = ${userId}`

        const doctor = await sql`SELECT name FROM users WHERE id = ${userId}`
        await logAdminAction(
            req.user.id,
            "DOCTOR_PROFILE_UPDATED",
            "doctor",
            userId,
            `Updated doctor profile: ${doctor[0]?.name}`,
            data
        )

        res.json({ success: true })
    })
)

/* --------------------------------------------------------------- appointments */

/** was: getAllAppointments(filters) */
router.get(
    "/appointments",
    asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const offset = (page - 1) * limit

        const { where, params } = buildFilters([
            ["a.doctor_id = $?", req.query.doctorId ? Number(req.query.doctorId) : undefined],
            ["a.patient_id = $?", req.query.patientId ? Number(req.query.patientId) : undefined],
            ["a.status = $?", req.query.status],
            ["a.appointment_date = $?", req.query.date],
        ])

        const appointments = await sql.query(
            `SELECT a.*,
              p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.email as doctor_email,
              dp.specialty, dp.hospital_name
       FROM appointments a
       INNER JOIN users p ON a.patient_id = p.id
       INNER JOIN users d ON a.doctor_id = d.id
       LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
       WHERE 1=1${where}
       ORDER BY a.appointment_date DESC, a.time_slot DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        )

        const countResult = await sql`SELECT COUNT(*) as count FROM appointments`
        const total = Number(countResult[0]?.count || 0)

        res.json({ appointments, total, page, totalPages: Math.ceil(total / limit) })
    })
)

/** was: updateAppointmentStatus(appointmentId, status) in admin-actions */
router.post(
    "/appointments/:id/status",
    asyncHandler(async (req, res) => {
        const appointmentId = Number(req.params.id)
        const { status } = req.body

        if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" })
        }

        await sql`
      UPDATE appointments SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${appointmentId}
    `
        await logAdminAction(
            req.user.id,
            "APPOINTMENT_STATUS_UPDATED",
            "appointment",
            appointmentId,
            `Updated appointment status to: ${status}`
        )

        res.json({ success: true })
    })
)

/* ------------------------------------------------------------------ diagnoses */

/** was: getAllDiagnoses(filters) */
router.get(
    "/diagnoses",
    asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const offset = (page - 1) * limit
        const search = req.query.search

        const params = []
        let where = ""

        const flagged = asBool(req.query.flagged)
        if (flagged !== undefined) {
            params.push(flagged)
            where += ` AND pr.is_flagged = $${params.length}`
        }
        if (req.query.urgency && req.query.urgency !== "all") {
            params.push(req.query.urgency)
            where += ` AND pr.urgency = $${params.length}`
        }
        if (req.query.minRisk) {
            params.push(Number(req.query.minRisk))
            where += ` AND pr.risk_percent >= $${params.length}`
        }
        if (search) {
            params.push(`%${search}%`)
            where += ` AND (pr.diagnosis ILIKE $${params.length} OR pr.symptoms ILIKE $${params.length})`
        }

        const diagnoses = await sql.query(
            `SELECT pr.*, u.name as patient_name, u.email as patient_email, f.name as flagged_by_name
       FROM predictions pr
       INNER JOIN users u ON pr.user_id = u.id
       LEFT JOIN users f ON pr.flagged_by = f.id
       WHERE 1=1${where}
       ORDER BY pr.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        )

        const countResult = await sql`SELECT COUNT(*) as count FROM predictions`
        const total = Number(countResult[0]?.count || 0)

        res.json({ diagnoses, total, page, totalPages: Math.ceil(total / limit) })
    })
)

/** was: flagDiagnosis(predictionId, reason) */
router.post(
    "/diagnoses/:id/flag",
    asyncHandler(async (req, res) => {
        const predictionId = Number(req.params.id)
        const reason = req.body.reason || ""

        await sql`
      UPDATE predictions
      SET is_flagged = true, flag_reason = ${reason}, flagged_by = ${req.user.id}, flagged_at = CURRENT_TIMESTAMP
      WHERE id = ${predictionId}
    `
        await logAdminAction(
            req.user.id,
            "DIAGNOSIS_FLAGGED",
            "prediction",
            predictionId,
            `Flagged diagnosis: ${reason}`
        )

        res.json({ success: true })
    })
)

/** was: unflagDiagnosis(predictionId) */
router.post(
    "/diagnoses/:id/unflag",
    asyncHandler(async (req, res) => {
        const predictionId = Number(req.params.id)

        await sql`
      UPDATE predictions
      SET is_flagged = false, flag_reason = NULL, flagged_by = NULL, flagged_at = NULL
      WHERE id = ${predictionId}
    `
        await logAdminAction(
            req.user.id,
            "DIAGNOSIS_UNFLAGGED",
            "prediction",
            predictionId,
            "Removed flag from diagnosis"
        )

        res.json({ success: true })
    })
)

/* ------------------------------------------------------------------ analytics */

/** was: getAnalyticsData() */
router.get(
    "/analytics",
    asyncHandler(async (_req, res) => {
        const [
            commonDiseases,
            cityDistribution,
            doctorUtilization,
            appointmentStats,
            riskTrends,
            urgencyDistribution,
        ] = await Promise.all([
            sql`SELECT diagnosis, COUNT(*) as count FROM predictions GROUP BY diagnosis ORDER BY count DESC LIMIT 10`,
            sql`SELECT city, COUNT(*) as count FROM predictions GROUP BY city ORDER BY count DESC LIMIT 10`,
            sql`
        SELECT u.name as doctor_name, dp.specialty, COUNT(a.id) as appointment_count
        FROM users u
        INNER JOIN doctor_profiles dp ON u.id = dp.user_id
        LEFT JOIN appointments a ON u.id = a.doctor_id
        WHERE u.role = 'doctor'
        GROUP BY u.id, u.name, dp.specialty
        ORDER BY appointment_count DESC
        LIMIT 10
      `,
            sql`SELECT status, COUNT(*) as count FROM appointments GROUP BY status`,
            sql`
        SELECT DATE(created_at) as date, AVG(risk_percent) as avg_risk, COUNT(*) as count
        FROM predictions
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
            sql`SELECT urgency, COUNT(*) as count FROM predictions GROUP BY urgency`,
        ])

        res.json({
            commonDiseases,
            cityDistribution,
            doctorUtilization,
            appointmentStats,
            riskTrends,
            urgencyDistribution,
        })
    })
)

/* ----------------------------------------------------------------- audit logs */

/** was: getAuditLogs(filters) */
router.get(
    "/audit-logs",
    asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 50
        const offset = (page - 1) * limit

        const { where, params } = buildFilters([
            ["al.action_type = $?", req.query.actionType],
            ["al.target_type = $?", req.query.targetType],
        ])

        const logs = await sql.query(
            `SELECT al.*, u.name as admin_name, u.email as admin_email
       FROM audit_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       WHERE 1=1${where}
       ORDER BY al.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        )

        const countResult = await sql`SELECT COUNT(*) as count FROM audit_logs`
        const total = Number(countResult[0]?.count || 0)

        res.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
    })
)

export default router
