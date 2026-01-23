import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req) {
    const { messages } = await req.json()

    const result = streamText({
        model: openai("gpt-4o-mini"),
        messages,
        system: `You are an experienced, empathetic triage nurse assistant called "MedPath Nurse". 
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
    - Once you have ALL required information (Demographics + Clinical Data), you MUST use the 'finishAssessment' tool to submit the data.
    - Do NOT diagnose the patient yourself in the chat. Just gather the data.
    - If the patient asks for a diagnosis, say "I've gathered your information, let me submit this to the doctor/system for analysis." and call the tool.
    `,
        tools: {
            finishAssessment: tool({
                description: "Call this when you have gathered all necessary information (demographics + symptoms).",
                parameters: z.object({
                    name: z.string().describe("Patient's name"),
                    age: z.number().describe("Patient's age"),
                    gender: z.string().describe("Patient's gender"),
                    city: z.string().describe("Patient's city"),
                    symptoms: z.string().describe("The main symptoms described by the patient"),
                    duration: z.string().describe("How long the symptoms have persisted"),
                    severity: z.string().describe("Severity and qualities of the symptom"),
                    existingConditions: z.string().describe("Any relevant medical history or conditions"),
                    medications: z.string().describe("Current medications"),
                    summary: z.string().describe("A brief professional summary of the patient's condition for the doctor"),
                }),
            }),
        },
    })

    return result.toDataStreamResponse()
}
