import { api, qs } from "@/lib/api-client"
import { revalidate } from "@/lib/navigation"

export async function getDoctorProfile() {
    try {
        return await api.get("/doctor/profile")
    } catch {
        return null
    }
}

export async function getDoctorAppointments(dateFilter) {
    try {
        return await api.get(`/doctor/appointments${qs({ date: dateFilter })}`)
    } catch {
        return []
    }
}

export async function updateAppointmentStatus(appointmentId, status) {
    try {
        const result = await api.post(`/doctor/appointments/${appointmentId}/status`, { status })
        revalidate()
        return result
    } catch (error) {
        return { error: error.message || "Failed to update appointment" }
    }
}

export async function getDoctorStats() {
    try {
        return await api.get("/doctor/stats")
    } catch {
        return { total: 0, pending: 0, today: 0 }
    }
}

/** was inlined in the booking page as getDoctorInfo() */
export async function getDoctorInfo(doctorId) {
    try {
        return await api.get(`/doctor/${doctorId}/public`)
    } catch {
        return null
    }
}
