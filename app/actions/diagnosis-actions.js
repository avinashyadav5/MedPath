"use server"

import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { generateDiagnosis } from "@/lib/ai-diagnosis"
import { redirect } from "next/navigation"

export async function submitAssessment(formData) {
    const session = await getSession()
    if (!session || session.role !== "patient") {
        return { error: "Unauthorized. Please log in as a patient." }
    }

    const patientData = {
        name: formData.get("name"),
        age: Number.parseInt(formData.get("age")),
        gender: formData.get("gender"),
        city: formData.get("city"),
        symptoms: formData.get("symptoms"),
        duration: formData.get("duration"),
        existingConditions: formData.get("existingConditions"),
        medications: formData.get("medications"),
    }

    if (!patientData.name || !patientData.age || !patientData.gender || !patientData.city || !patientData.symptoms) {
        return { error: "Please fill in all required fields" }
    }

    let predictionId = null

    try {
        // Generate AI diagnosis
        const diagnosis = await generateDiagnosis(patientData)

        // Save to database
        const result = await sql`
      INSERT INTO predictions (
        user_id,
        patient_name,
        age,
        gender,
        city,
        symptoms,
        duration,
        existing_conditions,
        medications,
        diagnosis,
        risk_percent,
        urgency,
        advice,
        red_flags,
        specialty,
        hospital_tags,
        raw_ai_response
      ) VALUES (
        ${session.id},
        ${patientData.name},
        ${patientData.age},
        ${patientData.gender},
        ${patientData.city},
        ${patientData.symptoms},
        ${patientData.duration || null},
        ${patientData.existingConditions || null},
        ${patientData.medications || null},
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

        predictionId = result[0].id
    } catch (error) {
        console.error("Diagnosis error:", error)
        return { error: error.message || "Failed to generate diagnosis. Please try again." }
    }

    if (predictionId) {
        redirect(`/patient/result/${predictionId}`)
    }

    return { error: "Failed to save diagnosis" }
}

export async function submitTriageAssessment(data) {
    const session = await getSession()
    if (!session || session.role !== "patient") {
        return { error: "Unauthorized. Please log in as a patient." }
    }

    let predictionId = null

    try {
        // Generate AI diagnosis
        const diagnosis = await generateDiagnosis(data)

        // Save to database
        const result = await sql`
      INSERT INTO predictions (
        user_id,
        patient_name,
        age,
        gender,
        city,
        symptoms,
        duration,
        existing_conditions,
        medications,
        diagnosis,
        risk_percent,
        urgency,
        advice,
        red_flags,
        specialty,
        hospital_tags,
        raw_ai_response
      ) VALUES (
        ${session.id},
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

        predictionId = result[0].id
    } catch (error) {
        console.error("Diagnosis error:", error)
        return { error: error.message || "Failed to generate diagnosis. Please try again." }
    }

    if (predictionId) {
        redirect(`/patient/result/${predictionId}`)
    }

    return { error: "Failed to save diagnosis" }
}

export async function getPrediction(id) {
    const session = await getSession()
    if (!session) return null
    if (isNaN(id)) return null

    try {
        const result = await sql`
      SELECT * FROM predictions WHERE id = ${id} AND user_id = ${session.id}
    `
        return result[0] || null
    } catch (error) {
        console.error("Error fetching prediction:", error)
        return null
    }
}

export async function getPatientHistory() {
    const session = await getSession()
    if (!session || session.role !== "patient") return []

    try {
        const result = await sql`
      SELECT id, diagnosis, risk_percent, urgency, specialty, created_at
      FROM predictions
      WHERE user_id = ${session.id}
      ORDER BY created_at DESC
      LIMIT 10
    `
        return result
    } catch (error) {
        console.error("Error fetching history:", error)
        return []
    }
}
