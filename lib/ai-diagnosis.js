import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

const DiagnosisSchema = z.object({
    diagnosis: z.string(),
    riskPercent: z.number().min(0).max(100),
    urgency: z.enum(["low", "medium", "high", "critical"]),
    advice: z.string(),
    red_flags: z.array(z.string()),
    specialty: z.string(),
    hospitalTags: z.array(z.string()),
    hypotheses: z.array(z.object({
        name: z.string(),
        probability: z.number().min(0).max(100),
        evidence_for: z.array(z.string()),
        evidence_against: z.array(z.string())
    })),
    reasoning_trace: z.array(z.string())
})

export async function generateDiagnosis(patientData) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in environment variables")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
        }
    })

    const systemInstruction = `You are an advanced medical diagnostic engine using Bayesian Network principles and Logical Inference.

PATIENT EVIDENCE:
- Name: ${patientData.name}
- Age: ${patientData.age} years old
- Gender: ${patientData.gender}
- Location: ${patientData.city}
- Main Symptoms: ${patientData.symptoms}
- Duration: ${patientData.duration || "Not specified"}
- Background: ${patientData.existingConditions || "None reported"}
- Meds: ${patientData.medications || "None reported"}

YOUR TASK:
1. **Bayesian Analysis**: Identify the top 3 differential diagnoses.
2. **Logical Inference**: Trace the deduction steps.
3. **Consensus**: Select the most likely condition as the final diagnosis.

Return ONLY a valid JSON object with ALL of these fields (use empty arrays if no data):
{
  "diagnosis": "condition name",
  "riskPercent": 0-100,
  "urgency": "low" | "medium" | "high" | "critical",
  "advice": "clinical recommendation",
  "red_flags": ["warning1", "warning2"] or [],
  "specialty": "Cardiology" (NOT "Cardiologist"),
  "hospitalTags": ["hospital", "clinic"],
  "hypotheses": [
    {
      "name": "condition",
      "probability": 0-100,
      "evidence_for": ["symptom1"],
      "evidence_against": ["factor1"]
    }
  ],
  "reasoning_trace": ["step1", "step2"]
}`

    try {
        const result = await model.generateContent(systemInstruction)
        const response = result.response
        let text = response.text()

        if (!text) {
            throw new Error("No response from Gemini API")
        }

        // Clean markdown code blocks
        text = text.replace(/```json/g, "").replace(/```/g, "").trim()

        const parsed = JSON.parse(text)
        const validated = DiagnosisSchema.parse(parsed)

        // Convert red_flags array to string
        if (Array.isArray(validated.red_flags)) {
            validated.red_flags = validated.red_flags.join(", ")
        }

        return validated
    } catch (error) {
        console.error("Gemini API Error:", error)
        throw new Error(`AI Diagnosis failed: ${error.message}`)
    }
}
