import { Router } from "express"
import Groq from "groq-sdk"
import { asyncHandler, requireAuth } from "../middleware/auth.js"

const router = Router()

const systemPrompt = `You are an experienced, empathetic triage nurse assistant called "MedPath Nurse". 
    Your goal is to interview the patient to gather specific information before they can be diagnosed.
    
    You need to gather the following information (if not already provided):
    1. **Demographics**: Name, Age, Gender, City (ask these first if you don't know them).
    2. **Main Symptom**: What brings them in today?
    3. **Duration**: How long has this been happening?
    4. **Severity/Qualities**: Pain scale (1-10), sharp/dull, constant/intermittent, etc.
    5. **Related History**: Any similar past issues, existing conditions, or family history.
    6. **Medications**: What are they currently taking?

    Protocol:
    - Start by introducing yourself and asking for their name and age if not provided.
    - Ask ONE or TWO questions at a time. Do not overwhelm the patient.
    - Be conversational and polite (e.g., "I'm sorry to hear you're in pain.")
    - If the patient gives a vague answer, ask for clarification.
    - Once you have ALL required information (Demographics + Clinical Data), you MUST respond with a JSON object containing the patient data.
    - Do NOT diagnose the patient yourself in the chat. Just gather the data.
    - If the patient asks for a diagnosis, say "I've gathered your information, let me submit this to the doctor/system for analysis." and provide the data JSON.
    
    When you have all the information, respond ONLY with a JSON object in this exact format:
    {
        "assessmentComplete": true,
        "name": "patient name",
        "age": 25,
        "gender": "gender",
        "city": "city name",
        "symptoms": "main symptoms",
        "duration": "duration",
        "severity": "severity description",
        "existingConditions": "conditions or none",
        "medications": "medications or none",
        "summary": "brief professional summary"
    }`

/** was: app/api/triage/route.js — returns plain text, same as the Next route did */
router.post(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const { messages } = req.body

        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: "messages must be an array" })
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || process.env.GROQ_API })

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
                ],
                temperature: 0.7,
                max_tokens: 1024,
            })

            res.type("text/plain; charset=utf-8")
            res.send(completion.choices[0]?.message?.content || "")
        } catch (error) {
            console.error("Groq triage error:", error)
            res.status(500).json({ error: "Failed to process triage conversation" })
        }
    })
)

export default router
