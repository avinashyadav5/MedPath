import { useSearchParams } from "react-router-dom"
import { getAllDiagnoses } from "@/api/admin-actions"
import { DiagnosesManagement } from "@/components/admin/diagnoses-management"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

const asBool = (v) => (v === "true" ? true : v === "false" ? false : undefined)

export default function AdminDiagnosesPage() {
    const [searchParams] = useSearchParams()
    const flagged = asBool(searchParams.get("flagged"))
    const urgency = searchParams.get("urgency") || undefined
    const minRiskParam = searchParams.get("minRisk")
    const minRisk = minRiskParam ? Number.parseInt(minRiskParam) : undefined
    const search = searchParams.get("search") || undefined
    const page = Number(searchParams.get("page")) || 1

    const { data, loading, error, reload } = useAsync(
        () => getAllDiagnoses({ flagged, urgency, minRisk, search, page }),
        [flagged, urgency, minRisk, search, page]
    )

    if (loading) return <PageLoader label="Loading diagnoses" />
    if (error) return <PageError error={error} onRetry={reload} />

    return (
        <DiagnosesManagement
            diagnoses={data.diagnoses}
            total={data.total}
            page={data.page}
            totalPages={data.totalPages}
        />
    )
}
