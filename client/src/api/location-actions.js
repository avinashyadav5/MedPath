import { api } from "@/lib/api-client"

export async function getNearbyDoctorsAndHospitals(predictionId) {
    try {
        return await api.get(`/location/nearby/${predictionId}`)
    } catch (error) {
        return {
            hospitals: [],
            registeredDoctors: [],
            city: "",
            specialty: "",
            error: error.message || "Failed to fetch nearby doctors",
        }
    }
}
