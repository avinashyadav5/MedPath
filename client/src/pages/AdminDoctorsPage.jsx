import { useSearchParams } from "react-router-dom"
import { getAllDoctors } from "@/api/admin-actions"
import { DoctorsManagement } from "@/components/admin/doctors-management"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

const asBool = (v) => (v === "true" ? true : v === "false" ? false : undefined)

export default function AdminDoctorsPage() {
    const [searchParams] = useSearchParams()
    const verified = asBool(searchParams.get("verified"))
    const blocked = asBool(searchParams.get("blocked"))
    const search = searchParams.get("search") || undefined
    const page = Number(searchParams.get("page")) || 1

    const { data, loading, error, reload } = useAsync(
        () => getAllDoctors({ verified, blocked, search, page }),
        [verified, blocked, search, page]
    )

    if (loading) return <PageLoader label="Loading doctors" />
    if (error) return <PageError error={error} onRetry={reload} />

    return (
        <DoctorsManagement
            doctors={data.doctors}
            total={data.total}
            page={data.page}
            totalPages={data.totalPages}
        />
    )
}
