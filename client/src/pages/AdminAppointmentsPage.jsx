import { useSearchParams } from "react-router-dom"
import { getAllAppointments } from "@/api/admin-actions"
import { AppointmentsManagement } from "@/components/admin/appointments-management"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function AdminAppointmentsPage() {
    const [searchParams] = useSearchParams()
    const status = searchParams.get("status") || undefined
    const date = searchParams.get("date") || undefined
    const page = Number(searchParams.get("page")) || 1

    const { data, loading, error, reload } = useAsync(
        () => getAllAppointments({ status, date, page }),
        [status, date, page]
    )

    if (loading) return <PageLoader label="Loading appointments" />
    if (error) return <PageError error={error} onRetry={reload} />

    return (
        <AppointmentsManagement
            appointments={data.appointments}
            total={data.total}
            page={data.page}
            totalPages={data.totalPages}
        />
    )
}
