"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function saveSignal(
    appointmentId,
    type,
    data
) {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (!token) return { success: false, error: "Not authenticated" }

    const payload = await verifyToken(token)
    if (!payload) return { success: false, error: "Invalid token" }

    await sql`
    INSERT INTO video_call_signals
      (appointment_id, sender_id, signal_type, signal_data)
    VALUES
      (${appointmentId}, ${payload.id}, ${type}, ${data})
  `

    return { success: true }
}

export async function getSignals(appointmentId) {
    const rows = await sql`
    SELECT * 
    FROM video_call_signals
    WHERE appointment_id = ${appointmentId}
    ORDER BY id ASC
  `
    return { success: true, signals: rows }
}

export async function clearSignals(appointmentId) {
    await sql`
    DELETE FROM video_call_signals
    WHERE appointment_id = ${appointmentId}
  `
    return { success: true }
}
