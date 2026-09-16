import { Router } from "express"
import { sql } from "../db.js"
import { hashPassword } from "../lib/auth.js"
import { asyncHandler } from "../middleware/auth.js"

const router = Router()

/**
 * was: app/api/setup-admin/route.js. Bootstrap-only: creates the first admin.
 * Guarded by SETUP_SECRET so it cannot be hit by anyone once deployed.
 */
router.post(
    "/admin",
    asyncHandler(async (req, res) => {
        if (!process.env.SETUP_SECRET || req.get("x-setup-secret") !== process.env.SETUP_SECRET) {
            return res.status(403).json({ error: "Setup endpoint is disabled" })
        }

        const { name = "System Admin", email, password } = req.body
        if (!email || !password) return res.status(400).json({ error: "email and password are required" })

        const hashed = await hashPassword(password)

        await sql`
      INSERT INTO users (name, email, password, role, is_active, is_verified)
      VALUES (${name}, ${email}, ${hashed}, 'admin', true, true)
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin'
    `

        res.json({ success: true, email })
    })
)

export default router
