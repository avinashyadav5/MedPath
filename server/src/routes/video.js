import { Router } from "express"
import { sql } from "../db.js"
import { asyncHandler, requireAuth } from "../middleware/auth.js"

const router = Router()

async function isParticipant(appointmentId, userId) {
    const rows = await sql`
    SELECT id FROM appointments
    WHERE id = ${appointmentId} AND (patient_id = ${userId} OR doctor_id = ${userId})
  `
    return rows.length > 0
}

/** was: saveSignal(appointmentId, type, data) */
router.post(
    "/:appointmentId/signals",
    requireAuth,
    asyncHandler(async (req, res) => {
        const appointmentId = Number(req.params.appointmentId)
        const { type, data } = req.body

        if (!["offer", "answer", "ice", "end"].includes(type)) {
            return res.status(400).json({ success: false, error: "Invalid signal type" })
        }
        if (!(await isParticipant(appointmentId, req.user.id))) {
            return res.status(403).json({ success: false, error: "Forbidden" })
        }

        await sql`
      INSERT INTO video_call_signals (appointment_id, sender_id, signal_type, signal_data)
      VALUES (${appointmentId}, ${req.user.id}, ${type}, ${data})
    `
        res.json({ success: true })
    })
)

/** was: getSignals(appointmentId) */
router.get(
    "/:appointmentId/signals",
    requireAuth,
    asyncHandler(async (req, res) => {
        const appointmentId = Number(req.params.appointmentId)
        if (!(await isParticipant(appointmentId, req.user.id))) {
            return res.status(403).json({ success: false, error: "Forbidden" })
        }

        const rows = await sql`
      SELECT * FROM video_call_signals
      WHERE appointment_id = ${appointmentId}
      ORDER BY id ASC
    `
        res.json({ success: true, signals: rows })
    })
)

/** was: clearSignals(appointmentId) */
router.delete(
    "/:appointmentId/signals",
    requireAuth,
    asyncHandler(async (req, res) => {
        const appointmentId = Number(req.params.appointmentId)
        if (!(await isParticipant(appointmentId, req.user.id))) {
            return res.status(403).json({ success: false, error: "Forbidden" })
        }

        await sql`DELETE FROM video_call_signals WHERE appointment_id = ${appointmentId}`
        res.json({ success: true })
    })
)

export default router
