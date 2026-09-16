import { Navigate } from "react-router-dom"
import { getDoctorAppointments, getDoctorProfile } from "@/api/doctor-actions"
import AppointmentsPage from "@/components/doctor/appointments-page"
import { PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function DoctorAppointmentsPage() {
    const { data, loading } = useAsync(async () => {
        const profile = await getDoctorProfile()
        if (!profile) return { profile: null }

        return { profile, appointments: await getDoctorAppointments() }
    }, [])

    if (loading) return <PageLoader label="Loading appointments" />
    if (!data?.profile) return <Navigate to="/doctor/onboarding" replace />

    return <AppointmentsPage appointments={data.appointments} />
}
