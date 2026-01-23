import { getAnalyticsData } from "@/app/actions/admin-actions";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
export default async function AdminAnalyticsPage() {
    const analytics = await getAnalyticsData();
    return <AnalyticsDashboard data={analytics}/>;
}
