import { api, qs } from "@/lib/api-client"
import { revalidate } from "@/lib/navigation"

/* dashboard */

export async function getAdminDashboardStats() {
    return api.get("/admin/stats")
}

export async function getRecentActivity(limit = 10) {
    return api.get(`/admin/activity${qs({ limit })}`)
}

/* users */

export async function getAllUsers(filters = {}) {
    const { role, search, page = 1, limit } = filters
    return api.get(`/admin/users${qs({ role, search, page, limit })}`)
}

export async function toggleUserStatus(userId) {
    try {
        const result = await api.post(`/admin/users/${userId}/toggle-status`)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function deleteUser(userId) {
    try {
        const result = await api.del(`/admin/users/${userId}`)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function updateUserRole(userId, newRole) {
    try {
        const result = await api.post(`/admin/users/${userId}/role`, { role: newRole })
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

/* doctors */

export async function getAllDoctors(filters = {}) {
    const { verified, blocked, search, page = 1, limit } = filters
    return api.get(`/admin/doctors${qs({ verified, blocked, search, page, limit })}`)
}

export async function verifyDoctor(userId) {
    try {
        const result = await api.post(`/admin/doctors/${userId}/verify`)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function toggleDoctorBlock(userId) {
    try {
        const result = await api.post(`/admin/doctors/${userId}/toggle-block`)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function updateDoctorProfile(userId, data) {
    try {
        const result = await api.put(`/admin/doctors/${userId}`, data)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

/* appointments */

export async function getAllAppointments(filters = {}) {
    const { doctorId, patientId, status, date, page = 1, limit } = filters
    return api.get(`/admin/appointments${qs({ doctorId, patientId, status, date, page, limit })}`)
}

export async function updateAppointmentStatus(appointmentId, status) {
    try {
        const result = await api.post(`/admin/appointments/${appointmentId}/status`, { status })
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

/* diagnoses */

export async function getAllDiagnoses(filters = {}) {
    const { flagged, urgency, minRisk, search, page = 1, limit } = filters
    return api.get(`/admin/diagnoses${qs({ flagged, urgency, minRisk, search, page, limit })}`)
}

export async function flagDiagnosis(predictionId, reason) {
    try {
        const result = await api.post(`/admin/diagnoses/${predictionId}/flag`, { reason })
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function unflagDiagnosis(predictionId) {
    try {
        const result = await api.post(`/admin/diagnoses/${predictionId}/unflag`)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message }
    }
}

/* analytics + audit */

export async function getAnalyticsData() {
    return api.get("/admin/analytics")
}

export async function getAuditLogs(filters = {}) {
    const { actionType, targetType, page = 1, limit } = filters
    return api.get(`/admin/audit-logs${qs({ actionType, targetType, page, limit })}`)
}
