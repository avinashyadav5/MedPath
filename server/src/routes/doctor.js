import { Router } from "express"
import { sql } from "../db.js"
import { asyncHandler, requireAuth, requireRole } from "../middleware/auth.js"

const router = Router()

/** was: getDoctorProfile() */
router.get(
    "/profile",
    requireRole("doctor"),
    asyncHandler(async (req, res) => {
        const result = await sql`
      SELECT dp.*, u.name, u.email
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.user_id = ${req.user.id}
    `
        res.json(result[0] || null)
    })
)

/** was: getDoctorAppointments(dateFilter) */
router.get(
    "/appointments",
    requireRole("doctor"),
    asyncHandler(async (req, res) => {
        const dateFilter = req.query.date || null

        const result = dateFilter
            ? await sql`
        SELECT a.*, u.name as patient_name, u.email as patient_email,
               p.symptoms, p.diagnosis as prediction_diagnosis, p.risk_percent, p.urgency
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        LEFT JOIN predictions p ON a.prediction_id = p.id
        WHERE a.doctor_id = ${req.user.id}
        AND a.appointment_date = ${dateFilter}
        ORDER BY a.appointment_date ASC, TO_TIMESTAMP(a.time_slot, 'HH:MI AM')::time ASC
      `
            : await sql`
        SELECT a.*, u.name as patient_name, u.email as patient_email,
               p.symptoms, p.diagnosis as prediction_diagnosis, p.risk_percent, p.urgency
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        LEFT JOIN predictions p ON a.prediction_id = p.id
        WHERE a.doctor_id = ${req.user.id}
        ORDER BY a.appointment_date ASC, TO_TIMESTAMP(a.time_slot, 'HH:MI AM')::time ASC
      `

        res.json(result)
    })
)

/** was: updateAppointmentStatus(appointmentId, status) in doctor-actions */
router.post(
    "/appointments/:id/status",
    requireRole("doctor"),
    asyncHandler(async (req, res) => {
        const { status } = req.body
        if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" })
        }

        await sql`
      UPDATE appointments
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number(req.params.id)} AND doctor_id = ${req.user.id}
    `
        res.json({ success: true })
    })
)

/** was: getDoctorStats() */
router.get(
    "/stats",
    requireRole("doctor"),
    asyncHandler(async (req, res) => {
        const [total, pending, today] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ${req.user.id}`,
            sql`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ${req.user.id} AND status = 'pending'`,
            sql`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ${req.user.id} AND appointment_date = CURRENT_DATE`,
        ])

        res.json({
            total: Number(total[0]?.count || 0),
            pending: Number(pending[0]?.count || 0),
            today: Number(today[0]?.count || 0),
        })
    })
)

/** was: getDoctorInfo() inlined in app/patient/book/[doctorId]/page.jsx */
router.get(
    "/:doctorId/public",
    requireAuth,
    asyncHandler(async (req, res) => {
        const doctorId = Number.parseInt(req.params.doctorId)
        if (Number.isNaN(doctorId)) return res.status(404).json({ error: "Not found" })

        const result = await sql`
      SELECT u.id, u.name, dp.specialty, dp.city, dp.hospital_name, dp.availability
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.id = ${doctorId} AND u.role = 'doctor'
    `
        if (!result[0]) return res.status(404).json({ error: "Doctor not found" })
        res.json(result[0])
    })
)

export default router
