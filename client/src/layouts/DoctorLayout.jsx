import { Outlet } from "react-router-dom"
import { DoctorNav } from "@/components/doctor/doctor-nav"
import { getDoctorProfile } from "@/api/doctor-actions"
import { useAuth } from "@/context/auth-context"
import { useAsync } from "@/hooks/use-async"

export default function DoctorLayout() {
    const { user } = useAuth()
    const { data: profile, loading } = useAsync(() => getDoctorProfile(), [])

    return (
        <div className="min-h-screen bg-background">
            <DoctorNav user={user} hasProfile={!loading && !!profile} />
            <main className="container mx-auto px-4 py-8">
                <Outlet context={{ profile, profileLoading: loading }} />
            </main>
        </div>
    )
}
