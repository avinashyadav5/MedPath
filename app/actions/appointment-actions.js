"use server"

import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function bookAppointment(formData) {
    const session = await getSession()
    if (!session || session.role !== "patient") {
        return { error: "Unauthorized. Please log in as a patient." }
    }

    const doctorId = Number(formData.get("doctorId"))
    const predictionId = formData.get("predictionId") ? Number(formData.get("predictionId")) : null
    const appointmentDate = formData.get("appointmentDate")
    const timeSlot = formData.get("timeSlot")
    const diagnosis = formData.get("diagnosis")
    const hospitalName = formData.get("hospitalName")

    if (!doctorId || !appointmentDate || !timeSlot) {
        return { error: "Please fill in all required fields" }
    }

    try {
        // Check for overlapping appointments
        const existing = await sql`
      SELECT id FROM appointments
      WHERE doctor_id = ${doctorId}
      AND appointment_date = ${appointmentDate}
      AND time_slot = ${timeSlot}
      AND status != 'cancelled'
    `

        if (existing.length > 0) {
            return { error: "This time slot is already booked. Please choose another." }
        }

        // Create appointment
        await sql`
      INSERT INTO appointments (
        patient_id,
        doctor_id,
        prediction_id,
        diagnosis,
        hospital_name,
        appointment_date,
        time_slot,
        status
      ) VALUES (
        ${session.id},
        ${doctorId},
        ${predictionId},
        ${diagnosis || null},
        ${hospitalName || null},
        ${appointmentDate},
        ${timeSlot},
        'pending'
      )
    `

        return { success: true }
    } catch (error) {
        console.error("Booking error:", error)
        return { error: "Failed to book appointment. Please try again." }
    }
}

export async function getPatientAppointments(status) {
    const session = await getSession()
    if (!session || session.role !== "patient") return []

    try {
        const statusFilter = status && status !== "all"
            ? sql`AND a.status = ${status}`
            : sql``

        const result = await sql`
      SELECT 
        a.*,
        u.name as doctor_name,
        dp.specialty,
        dp.city as doctor_city,
        dp.hospital_name
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE a.patient_id = ${session.id}
      ${statusFilter}
      ORDER BY a.appointment_date DESC, a.time_slot ASC
    `
        return result
    } catch (error) {
        console.error("Error fetching appointments:", error)
        return []
    }
}

export async function cancelAppointment(appointmentId) {
    const session = await getSession()
    if (!session) {
        return { error: "Unauthorized" }
    }

    try {
        await sql`
      UPDATE appointments
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${appointmentId} AND patient_id = ${session.id}
    `
        return { success: true }
    } catch (error) {
        console.error("Error cancelling appointment:", error)
        return { error: "Failed to cancel appointment" }
    }
}

export async function getDoctorAvailableSlots(doctorId, date) {
    if (isNaN(doctorId)) return []
    try {
        // Get doctor's availability
        const doctorResult = await sql`
      SELECT availability FROM doctor_profiles WHERE user_id = ${doctorId}
    `

        if (doctorResult.length === 0) {
            return []
        }

        const availability = doctorResult[0].availability

        // Get booked slots for this date
        const bookedResult = await sql`
      SELECT time_slot FROM appointments
      WHERE doctor_id = ${doctorId}
      AND appointment_date = ${date}
      AND status != 'cancelled'
    `

        const bookedSlots = bookedResult.map((r) => r.time_slot)

        // Return available slots (not booked)
        return availability.filter((slot) => !bookedSlots.includes(slot))
    } catch (error) {
        console.error("Error fetching available slots:", error)
        return []
    }
}

export async function getAppointmentById(id) {
    const session = await getSession()
    if (!session) return null
    if (isNaN(id)) return null

    try {
        const result = await sql`
      SELECT * FROM appointments 
      WHERE id = ${id} 
      AND (patient_id = ${session.id} OR doctor_id = ${session.id})
    `
        return result[0] || null
    } catch (error) {
        console.error("Error fetching appointment:", error)
        return null
    }
}

export async function getChatDetails(appointmentId) {
    const session = await getSession()
    if (!session) return null
    if (isNaN(appointmentId)) return null

    try {
        const result = await sql`
      SELECT 
        a.id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.diagnosis as appointment_diagnosis,
        a.doctor_id,
        a.patient_id,
        
        -- Patient Details
        p_user.name as patient_name,
        p_user.email as patient_email,
        
        -- Doctor Details
        d_user.name as doctor_name,
        d_user.email as doctor_email,
        dp.specialty as doctor_specialty,
        dp.city as doctor_city,
        dp.hospital_name,
        
        -- Prediction Details
        pr.symptoms,
        pr.diagnosis as prediction_diagnosis,
        pr.risk_percent,
        pr.urgency
      FROM appointments a
      JOIN users p_user ON a.patient_id = p_user.id
      JOIN users d_user ON a.doctor_id = d_user.id
      LEFT JOIN doctor_profiles dp ON d_user.id = dp.user_id
      LEFT JOIN predictions pr ON a.prediction_id = pr.id
      WHERE a.id = ${appointmentId}
      AND (a.patient_id = ${session.id} OR a.doctor_id = ${session.id})
    `
        return result[0] || null
    } catch (error) {
        console.error("Error fetching chat details:", error)
        return null
    }
}
