import { Router } from "express"
import { sql } from "../db.js"
import { fetchNearbyHospitals, geocodeCity } from "../lib/location-service.js"
import { asyncHandler, requireAuth } from "../middleware/auth.js"

const router = Router()

/** was: getNearbyDoctorsAndHospitals(predictionId) */
router.get(
    "/nearby/:predictionId",
    requireAuth,
    asyncHandler(async (req, res) => {
        const predictionId = Number(req.params.predictionId)
        const empty = { hospitals: [], registeredDoctors: [], city: "", specialty: "" }

        if (Number.isNaN(predictionId)) {
            return res.json({ ...empty, error: "Invalid prediction" })
        }

        try {
            const predictionResult = await sql`
        SELECT city, specialty, hospital_tags FROM predictions WHERE id = ${predictionId}
      `
            if (predictionResult.length === 0) {
                return res.json({ ...empty, error: "Prediction not found" })
            }

            const { city, specialty, hospital_tags: tags } = predictionResult[0]

            const registeredDoctors = await sql`
        SELECT u.id, u.name, dp.specialty, dp.city, dp.hospital_name, dp.availability
        FROM users u
        JOIN doctor_profiles dp ON u.id = dp.user_id
        WHERE u.role = 'doctor'
        AND dp.is_blocked = false
        AND LOWER(dp.specialty) LIKE LOWER(${"%" + specialty + "%"})
        AND LOWER(dp.city) LIKE LOWER(${"%" + city + "%"})
        ORDER BY dp.is_verified DESC, u.created_at DESC
        LIMIT 10
      `

            const coords = await geocodeCity(city)
            if (!coords) {
                return res.json({ hospitals: [], registeredDoctors, city, specialty })
            }

            const hospitals = await fetchNearbyHospitals(coords.lat, coords.lon, 10000, tags)
            res.json({ hospitals, registeredDoctors, city, specialty })
        } catch (error) {
            console.error("Error fetching nearby doctors:", error)
            res.json({ ...empty, error: "Failed to fetch nearby doctors" })
        }
    })
)

export default router
