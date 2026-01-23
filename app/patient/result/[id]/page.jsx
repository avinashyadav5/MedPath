import { notFound, redirect } from "next/navigation"
import { getPrediction } from "@/app/actions/diagnosis-actions"
import { DiagnosisResult } from "@/components/patient/diagnosis-result"
import { getSession } from "@/lib/auth"

export default async function ResultPage({ params }) {
    const session = await getSession()
    if (!session) redirect("/login")

    const { id } = await params
    const prediction = await getPrediction(Number.parseInt(id))

    if (!prediction) {
        notFound()
    }

    return <DiagnosisResult prediction={prediction} />
}
