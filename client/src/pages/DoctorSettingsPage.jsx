import { Navigate } from "react-router-dom"
import { getDoctorProfile } from "@/api/doctor-actions"
import { SettingsForm } from "@/components/doctor/settings-form"
import { PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function DoctorSettingsPage() {
    const { data: profile, loading } = useAsync(() => getDoctorProfile(), [])

    if (loading) return <PageLoader label="Loading your settings" />
    if (!profile) return <Navigate to="/doctor/onboarding" replace />

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and availability</p>
            </div>
            <SettingsForm profile={profile} />
        </div>
    )
}
