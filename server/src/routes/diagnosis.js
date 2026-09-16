import { Router } from "express"
import { sql } from "../db.js"
import { generateDiagnosis } from "../lib/ai-diagnosis.js"
import { asyncHandler, requireAuth, requireRole } from "../middleware/auth.js"

const router = Router()

async function savePrediction(userId, data, diagnosis) {
    const result = await sql`
    INSERT INTO predictions (
      user_id, patient_name, age, gender, city, symptoms, duration,
      existing_conditions, medications, diagnosis, risk_percent, urgency,
      advice, red_flags, specialty, hospital_tags, raw_ai_response
    ) VALUES (
      ${userId},
      ${data.name},
      ${data.age},
      ${data.gender},
      ${data.city},
      ${data.symptoms},
      ${data.duration || null},
      ${data.existingConditions || null},
      ${data.medications || null},
      ${diagnosis.diagnosis},
      ${diagnosis.riskPercent},
      ${diagnosis.urgency},
      ${diagnosis.advice},
      ${diagnosis.red_flags || null},
      ${diagnosis.specialty},
      ${JSON.stringify(diagnosis.hospitalTags)},
      ${JSON.stringify(diagnosis)}
    )
    RETURNING id
  `
    return result[0].id
}

/** was: submitAssessment() — form-driven assessment */
router.post(
    "/assessment",
    requireRole("patient"),
    asyncHandler(async (req, res) => {
        const patientData = {
            name: req.body.name,
            age: Number.parseInt(req.body.age),
            gender: req.body.gender,
            city: req.body.city,
            symptoms: req.body.symptoms,
            duration: req.body.duration,
            existingConditions: req.body.existingConditions,
            medications: req.body.medications,
        }

        if (
            !patientData.name ||
            !patientData.age ||
            !patientData.gender ||
            !patientData.city ||
            !patientData.symptoms
        ) {
            return res.status(400).json({ error: "Please fill in all required fields" })
        }

        try {
            const diagnosis = await generateDiagnosis(patientData)
            const predictionId = await savePrediction(req.user.id, patientData, diagnosis)
            res.json({ success: true, predictionId, redirectTo: `/patient/result/${predictionId}` })
        } catch (error) {
            console.error("Diagnosis error:", error)
            res.status(500).json({ error: error.message || "Failed to generate diagnosis. Please try again." })
        }
    })
)

/** was: submitTriageAssessment() — data gathered by the AI triage nurse */
router.post(
    "/triage-assessment",
    requireRole("patient"),
    asyncHandler(async (req, res) => {
        const data = req.body

        try {
            const diagnosis = await generateDiagnosis(data)
            const predictionId = await savePrediction(req.user.id, data, diagnosis)
            res.json({ success: true, predictionId, redirectTo: `/patient/result/${predictionId}` })
        } catch (error) {
            console.error("Diagnosis error:", error)
            res.status(500).json({ error: error.message || "Failed to generate diagnosis. Please try again." })
        }
    })
)

/** was: getPrediction(id) */
router.get(
    "/prediction/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
        const id = Number.parseInt(req.params.id)
        if (Number.isNaN(id)) return res.status(404).json({ error: "Not found" })

        const result = await sql`
      SELECT * FROM predictions WHERE id = ${id} AND user_id = ${req.user.id}
    `
        if (!result[0]) return res.status(404).json({ error: "Not found" })
        res.json(result[0])
    })
)

/** was: getPatientHistory() */
router.get(
    "/history",
    requireRole("patient"),
    asyncHandler(async (req, res) => {
        const result = await sql`
      SELECT id, diagnosis, risk_percent, urgency, specialty, created_at
      FROM predictions
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
      LIMIT 10
    `
        res.json(result)
    })
)

export default router
