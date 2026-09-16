import { api } from "@/lib/api-client"

export async function saveSignal(appointmentId, type, data) {
    try {
        return await api.post(`/video/${appointmentId}/signals`, { type, data })
    } catch (error) {
        return { success: false, error: error.message }
    }
}

export async function getSignals(appointmentId) {
    try {
        return await api.get(`/video/${appointmentId}/signals`)
    } catch {
        return { success: false, signals: [] }
    }
}

export async function clearSignals(appointmentId) {
    try {
        return await api.del(`/video/${appointmentId}/signals`)
    } catch {
        return { success: false }
    }
}
