import { Router } from "express"
import { sql } from "../db.js"
import { asyncHandler, requireAuth } from "../middleware/auth.js"

const router = Router()

/** Confirms the caller is actually on this appointment before touching messages. */
async function assertParticipant(appointmentId, userId) {
    const rows = await sql`
    SELECT status FROM appointments
    WHERE id = ${appointmentId} AND (patient_id = ${userId} OR doctor_id = ${userId})
  `
    return rows[0] || null
}

/** was: getMessages(appointmentId) — now access-checked, which the action was not */
router.get(
    "/:appointmentId/messages",
    requireAuth,
    asyncHandler(async (req, res) => {
        const appointmentId = Number(req.params.appointmentId)
        if (Number.isNaN(appointmentId)) return res.status(400).json({ error: "Bad id" })

        const appointment = await assertParticipant(appointmentId, req.user.id)
        if (!appointment) return res.status(403).json({ error: "Forbidden" })

        const rows = await sql`
      SELECT * FROM chat_messages
      WHERE appointment_id = ${appointmentId}
      ORDER BY created_at ASC
    `
        res.json({ success: true, messages: rows })
    })
)

/** was: sendMessage(appointmentId, message) */
router.post(
    "/:appointmentId/messages",
    requireAuth,
    asyncHandler(async (req, res) => {
        const appointmentId = Number(req.params.appointmentId)
        const { message } = req.body
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: "Message is empty" })
        }

        const appointment = await assertParticipant(appointmentId, req.user.id)
        if (!appointment) return res.status(403).json({ success: false, error: "Forbidden" })

        if (appointment.status !== "confirmed") {
            return res
                .status(400)
                .json({ success: false, error: "Chat is only available for confirmed appointments." })
        }

        const rows = await sql`
      INSERT INTO chat_messages (appointment_id, sender_id, sender_role, message)
      VALUES (${appointmentId}, ${req.user.id}, ${req.user.role}, ${message})
      RETURNING *
    `

        await sql`UPDATE appointments SET last_message_at = NOW() WHERE id = ${appointmentId}`

        res.json({ success: true, message: rows[0] })
    })
)

export default router
