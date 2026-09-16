import { useParams } from "react-router-dom"
import { getPrediction } from "@/api/diagnosis-actions"
import { DiagnosisResult } from "@/components/patient/diagnosis-result"
import { NotFound, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function PatientResultPage() {
    const { id } = useParams()
    const { data: prediction, loading } = useAsync(() => getPrediction(Number.parseInt(id)), [id])

    if (loading) return <PageLoader label="Loading your result" />
    if (!prediction) return <NotFound message="That assessment doesn't exist, or isn't yours." />

    return <DiagnosisResult prediction={prediction} />
}
