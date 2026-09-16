import { useSearchParams } from "react-router-dom"
import { getAuditLogs } from "@/api/admin-actions"
import { AuditLogsView } from "@/components/admin/audit-logs-view"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function AdminAuditLogsPage() {
    const [searchParams] = useSearchParams()
    const actionType = searchParams.get("actionType") || undefined
    const targetType = searchParams.get("targetType") || undefined
    const page = Number(searchParams.get("page")) || 1

    const { data, loading, error, reload } = useAsync(
        () => getAuditLogs({ actionType, targetType, page }),
        [actionType, targetType, page]
    )

    if (loading) return <PageLoader label="Loading audit logs" />
    if (error) return <PageError error={error} onRetry={reload} />

    return (
        <AuditLogsView logs={data.logs} total={data.total} page={data.page} totalPages={data.totalPages} />
    )
}
