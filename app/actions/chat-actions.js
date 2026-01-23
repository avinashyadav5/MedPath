"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function sendMessage(
    appointmentId,
    message
) {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (!token) return { success: false }

    const payload = await verifyToken(token)
    if (!payload) return { success: false }

    /* 🔥 CHECK APPOINTMENT STATUS */
    const appointmentCheck = await sql`
    SELECT status FROM appointments WHERE id = ${appointmentId}
  `

    if (appointmentCheck.length === 0 || appointmentCheck[0].status !== 'confirmed') {
        return { success: false, error: "Chat is only available for confirmed appointments." }
    }

    const rows = await sql`
    INSERT INTO chat_messages
      (appointment_id, sender_id, sender_role, message)
    VALUES
      (${appointmentId}, ${payload.id}, ${payload.role}, ${message})
    RETURNING *
  `

    /* 🔥 UPDATE LAST MESSAGE TIME */
    await sql`
    UPDATE appointments
    SET last_message_at = NOW()
    WHERE id = ${appointmentId}
  `

    return { success: true, message: rows[0] }
}

export async function getMessages(appointmentId) {
    const rows = await sql`
    SELECT *
    FROM chat_messages
    WHERE appointment_id = ${appointmentId}
    ORDER BY created_at ASC
  `
    return { success: true, messages: rows }
}
