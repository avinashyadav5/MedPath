import { api, formDataToObject, qs } from "@/lib/api-client"
import { revalidate } from "@/lib/navigation"

export async function bookAppointment(formData) {
    const data = formDataToObject(formData)

    if (!data.doctorId || !data.appointmentDate || !data.timeSlot) {
        return { error: "Please fill in all required fields" }
    }

    try {
        const result = await api.post("/appointments", data)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message || "Failed to book appointment. Please try again." }
    }
}

export async function getPatientAppointments(status) {
    try {
        return await api.get(`/appointments${qs({ status })}`)
    } catch {
        return []
    }
}

export async function cancelAppointment(appointmentId) {
    try {
        const result = await api.post(`/appointments/${appointmentId}/cancel`)
        revalidate()
        return result
    } catch (error) {
        return { error: error.message || "Failed to cancel appointment" }
    }
}

export async function getDoctorAvailableSlots(doctorId, date) {
    if (Number.isNaN(Number(doctorId))) return []
    try {
        return await api.get(`/appointments/slots${qs({ doctorId, date })}`)
    } catch {
        return []
    }
}

export async function getAppointmentById(id) {
    try {
        return await api.get(`/appointments/${id}`)
    } catch {
        return null
    }
}

export async function getChatDetails(appointmentId) {
    try {
        return await api.get(`/appointments/${appointmentId}/chat-details`)
    } catch {
        return null
    }
}
