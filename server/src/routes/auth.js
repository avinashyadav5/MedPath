import { Router } from "express"
import { sql } from "../db.js"
import { createSession, destroySession, loginUser, registerUser } from "../lib/auth.js"
import { asyncHandler, requireRole } from "../middleware/auth.js"

const router = Router()

/** was: register() in app/actions/auth-actions.js */
router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const { name, email, password, role } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" })
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" })
        }
        if (!["patient", "doctor"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" })
        }

        const { user, error } = await registerUser(name, email, password, role)
        if (error || !user) {
            return res.status(400).json({ error: error || "Registration failed" })
        }

        const token = await createSession(res, user)

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            redirectTo: role === "doctor" ? "/doctor/onboarding" : "/patient/assessment",
        })
    })
)

/** was: login() */
router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const { user, error } = await loginUser(email, password)
        if (error || !user) {
            return res.status(401).json({ error: error || "Login failed" })
        }

        const token = await createSession(res, user)

        const redirectTo =
            user.role === "admin"
                ? "/admin/dashboard"
                : user.role === "doctor"
                    ? "/doctor/dashboard"
                    : "/patient/assessment"

        res.json({ success: true, token, user, redirectTo })
    })
)

/** was: logout() */
router.post("/logout", (req, res) => {
    destroySession(res)
    res.json({ success: true, redirectTo: "/" })
})

/** was: getCurrentUser() — the client calls this once on boot to hydrate auth state */
router.get("/me", (req, res) => {
    res.json({ user: req.user })
})

/** was: saveDoctorProfile() */
router.post(
    "/doctor-profile",
    requireRole("doctor"),
    asyncHandler(async (req, res) => {
        // The form sends repeated fields, so these arrive as arrays.
        const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean)

        const specialties = toList(req.body.specialty).join(", ")
        const cities = toList(req.body.city).join(", ")
        const hospitalNames = toList(req.body.hospitalName).join(", ")
        const availability = toList(req.body.availability)

        if (!specialties || !cities) {
            return res.status(400).json({ error: "At least one specialty and city are required" })
        }

        await sql`
      INSERT INTO doctor_profiles (user_id, specialty, city, hospital_name, availability)
      VALUES (
        ${req.user.id},
        ${specialties},
        ${cities},
        ${hospitalNames},
        ${JSON.stringify(availability)}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        specialty = EXCLUDED.specialty,
        city = EXCLUDED.city,
        hospital_name = EXCLUDED.hospital_name,
        availability = EXCLUDED.availability,
        updated_at = CURRENT_TIMESTAMP
    `

        res.json({ success: true, redirectTo: "/doctor/dashboard" })
    })
)

export default router
