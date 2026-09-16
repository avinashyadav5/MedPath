import { api, formDataToObject } from "@/lib/api-client"
import { navigateTo } from "@/lib/navigation"

export async function submitAssessment(formData) {
    const data = formDataToObject(formData)

    if (!data.name || !data.age || !data.gender || !data.city || !data.symptoms) {
        return { error: "Please fill in all required fields" }
    }

    try {
        const result = await api.post("/diagnosis/assessment", data)
        navigateTo(result.redirectTo)
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function submitTriageAssessment(data) {
    try {
        const result = await api.post("/diagnosis/triage-assessment", data)
        navigateTo(result.redirectTo)
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function getPrediction(id) {
    if (Number.isNaN(Number(id))) return null
    try {
        return await api.get(`/diagnosis/prediction/${id}`)
    } catch {
        return null
    }
}

export async function getPatientHistory() {
    try {
        return await api.get("/diagnosis/history")
    } catch {
        return []
    }
}
