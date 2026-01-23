"use server"

import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { geocodeCity, fetchNearbyHospitals } from "@/lib/location-service"

export async function getNearbyDoctorsAndHospitals(predictionId) {
    const session = await getSession()
    if (!session) {
        return { hospitals: [], registeredDoctors: [], city: "", specialty: "", error: "Unauthorized" }
    }

    try {
        // Get prediction details
        const predictionResult = await sql`
      SELECT city, specialty, hospital_tags FROM predictions WHERE id = ${predictionId}
    `

        if (predictionResult.length === 0) {
            return { hospitals: [], registeredDoctors: [], city: "", specialty: "", error: "Prediction not found" }
        }

        const { city, specialty, hospital_tags } = predictionResult[0]
        const tags = hospital_tags

        // Get registered doctors in the system matching BOTH specialty and city
        const doctorResult = await sql`
      SELECT 
        u.id,
        u.name,
        dp.specialty,
        dp.city,
        dp.hospital_name,
        dp.availability
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor'
      AND dp.is_blocked = false
      AND (
        LOWER(dp.specialty) LIKE LOWER(${"%" + specialty + "%"})
      )
      AND (
        LOWER(dp.city) LIKE LOWER(${"%" + city + "%"})
      )
      ORDER BY dp.is_verified DESC, u.created_at DESC
      LIMIT 10
    `

        // Geocode city and fetch nearby hospitals
        const coords = await geocodeCity(city)

        if (!coords) {
            return {
                hospitals: [],
                registeredDoctors: doctorResult,
                city,
                specialty,
            }
        }

        const hospitals = await fetchNearbyHospitals(coords.lat, coords.lon, 10000, tags)

        return {
            hospitals,
            registeredDoctors: doctorResult,
            city,
            specialty,
        }
    } catch (error) {
        console.error("Error fetching nearby doctors:", error)
        return { hospitals: [], registeredDoctors: [], city: "", specialty: "", error: "Failed to fetch nearby doctors" }
    }
}
