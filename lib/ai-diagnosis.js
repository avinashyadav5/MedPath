import { z } from "zod"

const DiagnosisSchema = z.object({
    diagnosis: z.string(),
    riskPercent: z.number().min(0).max(100),
    urgency: z.enum(["low", "medium", "high", "critical"]),
    advice: z.string(),
    red_flags: z.union([z.string(), z.array(z.string())]).optional(),
    specialty: z.string(),
    hospitalTags: z.array(z.string()),
    // New Fields for Bayesian/Logical Inference
    hypotheses: z.array(z.object({
        name: z.string(),
        probability: z.number().min(0).max(100).describe("Posterior probability of this condition"),
        evidence_for: z.union([z.array(z.string()), z.string()]).transform(val => Array.isArray(val) ? val : [val]),
        evidence_against: z.union([z.array(z.string()), z.string()]).transform(val => Array.isArray(val) ? val : [val])
    })).describe("Top 3 differential diagnoses with probabilities"),
    reasoning_trace: z.array(z.string()).describe("Step-by-step logical deduction process")
})

export async function generateDiagnosis(patientData) {
    const prompt = `You are an advanced medical diagnostic engine using Bayesian Network principles and Logical Inference.

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
   - Estimate the Prior Probability for each based on demographics/prevalence.
   - Apply the Evidence (Symptoms/History) to calculate the Posterior Probability.
2. **Logical Inference**: Trace the deduction steps. (e.g., "Symptom X rules out Condition Y because...")
3. **Consensus**: Select the most likely condition as the final diagnosis.

Based on this, return a valid JSON object with:
1. "diagnosis": The single most likely condition.
2. "riskPercent": 0-100 severity score.
3. "urgency": "low", "medium", "high", "critical".
4. "advice": Clinical recommendation.
5. "red_flags": Critical warning signs.
6. "specialty": Standard medical specialty name (e.g., "Dermatology" NOT "Dermatologist", "Cardiology", "General Practice").
7. "hospitalTags": Search tags like ["hospital", "clinic"].
8. "hypotheses": Array of exactly 3 objects. Each object MUST have:
   - "name": (string) Name of the condition.
   - "probability": (number) Posterior probability (0-100).
   - "evidence_for": (string[]) Array of strings listing supporting symptoms.
   - "evidence_against": (string[]) Array of strings listing opposing factors.
9. "reasoning_trace": Array of strings showing your logical steps.

IMPORTANT: Respond ONLY with valid JSON.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a medical AI assistant that responds only in valid JSON format.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: "json_object" },
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
        throw new Error("No response from OpenAI API")
    }

    const parsed = JSON.parse(content)
    const validated = DiagnosisSchema.parse(parsed)

    if (Array.isArray(validated.red_flags)) {
        validated.red_flags = validated.red_flags.join(", ")
    }

    return validated
}
