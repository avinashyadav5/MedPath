import { Navigate } from "react-router-dom"
import { getDoctorAppointments, getDoctorProfile, getDoctorStats } from "@/api/doctor-actions"
import { DashboardContent } from "@/components/doctor/dashboard-content"
import { PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function DoctorDashboardPage() {
    const { data, loading } = useAsync(async () => {
        const profile = await getDoctorProfile()
        if (!profile) return { profile: null }

        const [stats, appointments] = await Promise.all([getDoctorStats(), getDoctorAppointments()])
        return { profile, stats, appointments }
    }, [])

    if (loading) return <PageLoader label="Loading your dashboard" />
    if (!data?.profile) return <Navigate to="/doctor/onboarding" replace />

    return <DashboardContent profile={data.profile} stats={data.stats} appointments={data.appointments} />
}
