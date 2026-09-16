import { Router } from "express"
import { sql } from "../db.js"
import { asyncHandler, requireAuth, requireRole } from "../middleware/auth.js"

const router = Router()

/** was: bookAppointment(formData) */
router.post(
    "/",
    requireRole("patient"),
    asyncHandler(async (req, res) => {
        const doctorId = Number(req.body.doctorId)
        const predictionId = req.body.predictionId ? Number(req.body.predictionId) : null
        const { appointmentDate, timeSlot, diagnosis, hospitalName } = req.body

        if (!doctorId || !appointmentDate || !timeSlot) {
            return res.status(400).json({ error: "Please fill in all required fields" })
        }

        const existing = await sql`
      SELECT id FROM appointments
      WHERE doctor_id = ${doctorId}
      AND appointment_date = ${appointmentDate}
      AND time_slot = ${timeSlot}
      AND status != 'cancelled'
    `

        if (existing.length > 0) {
            return res.status(409).json({ error: "This time slot is already booked. Please choose another." })
        }

        await sql`
      INSERT INTO appointments (
        patient_id, doctor_id, prediction_id, diagnosis,
        hospital_name, appointment_date, time_slot, status
      ) VALUES (
        ${req.user.id}, ${doctorId}, ${predictionId}, ${diagnosis || null},
        ${hospitalName || null}, ${appointmentDate}, ${timeSlot}, 'pending'
      )
    `

        res.json({ success: true })
    })
)

/** was: getPatientAppointments(status) — the neon fragment composition is gone,
 *  replaced by two explicit queries so the SQL stays parameterised. */
router.get(
    "/",
    requireRole("patient"),
    asyncHandler(async (req, res) => {
        const status = req.query.status

        const result =
            status && status !== "all"
                ? await sql`
          SELECT a.*, u.name as doctor_name, dp.specialty,
                 dp.city as doctor_city, dp.hospital_name
          FROM appointments a
          JOIN users u ON a.doctor_id = u.id
          LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
          WHERE a.patient_id = ${req.user.id} AND a.status = ${status}
          ORDER BY a.appointment_date DESC, a.time_slot ASC
        `
                : await sql`
          SELECT a.*, u.name as doctor_name, dp.specialty,
                 dp.city as doctor_city, dp.hospital_name
          FROM appointments a
          JOIN users u ON a.doctor_id = u.id
          LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
          WHERE a.patient_id = ${req.user.id}
          ORDER BY a.appointment_date DESC, a.time_slot ASC
        `

        res.json(result)
    })
)

/** was: getDoctorAvailableSlots(doctorId, date) */
router.get(
    "/slots",
    asyncHandler(async (req, res) => {
        const doctorId = Number(req.query.doctorId)
        const date = req.query.date
        if (Number.isNaN(doctorId) || !date) return res.json([])

        const doctorResult = await sql`
      SELECT availability FROM doctor_profiles WHERE user_id = ${doctorId}
    `
        if (doctorResult.length === 0) return res.json([])

        const availability = doctorResult[0].availability || []

        const bookedResult = await sql`
      SELECT time_slot FROM appointments
      WHERE doctor_id = ${doctorId}
      AND appointment_date = ${date}
      AND status != 'cancelled'
    `
        const bookedSlots = bookedResult.map((r) => r.time_slot)

        res.json(availability.filter((slot) => !bookedSlots.includes(slot)))
    })
)

/** was: getAppointmentById(id) */
router.get(
    "/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) return res.status(404).json({ error: "Not found" })

        const result = await sql`
      SELECT * FROM appointments
      WHERE id = ${id}
      AND (patient_id = ${req.user.id} OR doctor_id = ${req.user.id})
    `
        if (!result[0]) return res.status(404).json({ error: "Not found" })
        res.json(result[0])
    })
)

/** was: getChatDetails(appointmentId) */
router.get(
    "/:id/chat-details",
    requireAuth,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) return res.status(404).json({ error: "Not found" })

        const result = await sql`
      SELECT
        a.id, a.appointment_date, a.time_slot, a.status,
        a.diagnosis as appointment_diagnosis, a.doctor_id, a.patient_id,
        p_user.name as patient_name, p_user.email as patient_email,
        d_user.name as doctor_name, d_user.email as doctor_email,
        dp.specialty as doctor_specialty, dp.city as doctor_city, dp.hospital_name,
        pr.symptoms, pr.diagnosis as prediction_diagnosis, pr.risk_percent, pr.urgency
      FROM appointments a
      JOIN users p_user ON a.patient_id = p_user.id
      JOIN users d_user ON a.doctor_id = d_user.id
      LEFT JOIN doctor_profiles dp ON d_user.id = dp.user_id
      LEFT JOIN predictions pr ON a.prediction_id = pr.id
      WHERE a.id = ${id}
      AND (a.patient_id = ${req.user.id} OR a.doctor_id = ${req.user.id})
    `
        if (!result[0]) return res.status(404).json({ error: "Not found" })
        res.json(result[0])
    })
)

/** was: cancelAppointment(appointmentId) */
router.post(
    "/:id/cancel",
    requireAuth,
    asyncHandler(async (req, res) => {
        await sql`
      UPDATE appointments
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number(req.params.id)} AND patient_id = ${req.user.id}
    `
        res.json({ success: true })
    })
)

export default router
