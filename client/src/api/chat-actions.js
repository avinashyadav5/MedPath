import { api } from "@/lib/api-client"

export async function sendMessage(appointmentId, message) {
    try {
        return await api.post(`/chat/${appointmentId}/messages`, { message })
    } catch (error) {
        return { success: false, error: error.message }
    }
}

export async function getMessages(appointmentId) {
    try {
        return await api.get(`/chat/${appointmentId}/messages`)
    } catch {
        return { success: false, messages: [] }
    }
}
