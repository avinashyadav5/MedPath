import { useParams } from "react-router-dom"
import { getPrediction } from "@/api/diagnosis-actions"
import { getNearbyDoctorsAndHospitals } from "@/api/location-actions"
import { NearbyDoctorsView } from "@/components/patient/nearby-doctors-view"
import { NotFound, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function PatientNearbyDoctorsPage() {
    const { id } = useParams()
    const predictionId = Number(id)

    const { data, loading } = useAsync(async () => {
        if (Number.isNaN(predictionId)) return null

        const [prediction, nearby] = await Promise.all([
            getPrediction(predictionId),
            getNearbyDoctorsAndHospitals(predictionId),
        ])

        return prediction ? { prediction, nearby } : null
    }, [predictionId])

    if (loading) return <PageLoader label="Finding doctors and hospitals near you" />
    if (!data) return <NotFound message="That assessment doesn't exist, or isn't yours." />

    const { prediction, nearby } = data

    return (
        <NearbyDoctorsView
            hospitals={nearby.hospitals}
            registeredDoctors={nearby.registeredDoctors}
            city={nearby.city}
            specialty={nearby.specialty}
            predictionId={predictionId}
            diagnosis={prediction.diagnosis}
            error={nearby.error}
        />
    )
}
