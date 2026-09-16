import { Outlet } from "react-router-dom"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/context/auth-context"

export default function AdminLayout() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar user={user} />
            <main className="lg:pl-72">
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
