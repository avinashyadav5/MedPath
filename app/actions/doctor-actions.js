"use server"

import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function getDoctorProfile() {
    const session = await getSession()
    if (!session || session.role !== "doctor") return null

    try {
        const result = await sql`
      SELECT dp.*, u.name, u.email
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.user_id = ${session.id}
    `
        return result[0] || null
    } catch (error) {
        console.error("Error fetching doctor profile:", error)
        return null
    }
}

export async function getDoctorAppointments(dateFilter) {
    const session = await getSession()
    if (!session || session.role !== "doctor") return []

    try {
        let result
        if (dateFilter) {
            result = await sql`
        SELECT 
          a.*,
          u.name as patient_name,
          u.email as patient_email,
          p.symptoms,
          p.diagnosis as prediction_diagnosis,
          p.risk_percent,
          p.urgency
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        LEFT JOIN predictions p ON a.prediction_id = p.id
        WHERE a.doctor_id = ${session.id}
        AND a.appointment_date = ${dateFilter}
        ORDER BY a.appointment_date ASC, TO_TIMESTAMP(a.time_slot, 'HH:MI AM')::time ASC
      `
        } else {
            result = await sql`
        SELECT 
          a.*,
          u.name as patient_name,
          u.email as patient_email,
          p.symptoms,
          p.diagnosis as prediction_diagnosis,
          p.risk_percent,
          p.urgency
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        LEFT JOIN predictions p ON a.prediction_id = p.id
        WHERE a.doctor_id = ${session.id}
        ORDER BY a.appointment_date ASC, TO_TIMESTAMP(a.time_slot, 'HH:MI AM')::time ASC
      `
        }
        return result
    } catch (error) {
        console.error("Error fetching appointments:", error)
        return []
    }
}

export async function updateAppointmentStatus(appointmentId, status) {
    const session = await getSession()
    if (!session || session.role !== "doctor") {
        return { error: "Unauthorized" }
    }

    try {
        await sql`
      UPDATE appointments
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${appointmentId} AND doctor_id = ${session.id}
    `
        return { success: true }
    } catch (error) {
        console.error("Error updating appointment:", error)
        return { error: "Failed to update appointment" }
    }
}

export async function getDoctorStats() {
    const session = await getSession()
    if (!session || session.role !== "doctor") return null

    try {
        const [totalResult, pendingResult, todayResult] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ${session.id}`,
            sql`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ${session.id} AND status = 'pending'`,
            sql`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ${session.id} AND appointment_date = CURRENT_DATE`,
        ])

        return {
            total: Number(totalResult[0]?.count || 0),
            pending: Number(pendingResult[0]?.count || 0),
            today: Number(todayResult[0]?.count || 0),
        }
    } catch (error) {
        console.error("Error fetching stats:", error)
        return { total: 0, pending: 0, today: 0 }
    }
}
