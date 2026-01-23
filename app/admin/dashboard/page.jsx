import { getAdminDashboardStats, getRecentActivity } from "@/app/actions/admin-actions";
import { AdminDashboardContent } from "@/components/admin/dashboard-content";
export default async function AdminDashboardPage() {
    const [stats, activity] = await Promise.all([getAdminDashboardStats(), getRecentActivity(10)]);
    return <AdminDashboardContent stats={stats} recentActivity={activity}/>;
}
