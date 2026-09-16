import { getAnalyticsData } from "@/api/admin-actions"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function AdminAnalyticsPage() {
    const { data, loading, error, reload } = useAsync(() => getAnalyticsData(), [])

    if (loading) return <PageLoader label="Crunching the numbers" />
    if (error) return <PageError error={error} onRetry={reload} />

    return <AnalyticsDashboard data={data} />
}
