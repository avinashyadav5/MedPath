import { getAdminDashboardStats, getRecentActivity } from "@/api/admin-actions"
import { AdminDashboardContent } from "@/components/admin/dashboard-content"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function AdminDashboardPage() {
    const { data, loading, error, reload } = useAsync(async () => {
        const [stats, recentActivity] = await Promise.all([getAdminDashboardStats(), getRecentActivity(10)])
        return { stats, recentActivity }
    }, [])

    if (loading) return <PageLoader label="Loading dashboard" />
    if (error) return <PageError error={error} onRetry={reload} />

    return <AdminDashboardContent stats={data.stats} recentActivity={data.recentActivity} />
}
