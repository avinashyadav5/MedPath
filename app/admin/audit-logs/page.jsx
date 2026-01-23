import { getAuditLogs } from "@/app/actions/admin-actions";
import { AuditLogsView } from "@/components/admin/audit-logs-view";
export default async function AdminAuditLogsPage({ searchParams, }) {
    const params = await searchParams;
    const { logs, total, page, totalPages } = await getAuditLogs({
        actionType: params.actionType,
        targetType: params.targetType,
        page: params.page ? Number.parseInt(params.page) : 1,
    });
    return <AuditLogsView logs={logs} total={total} page={page} totalPages={totalPages}/>;
}
