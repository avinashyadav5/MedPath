import { Navigate } from "react-router-dom"
import { getDoctorProfile } from "@/api/doctor-actions"
import { OnboardingForm } from "@/components/doctor/onboarding-form"
import { PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function DoctorOnboardingPage() {
    const { data: profile, loading } = useAsync(() => getDoctorProfile(), [])

    if (loading) return <PageLoader label="Loading your profile" />
    if (profile) return <Navigate to="/doctor/dashboard" replace />

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
                <p className="text-muted-foreground">
                    Set up your doctor profile to start receiving appointments
                </p>
            </div>
            <OnboardingForm />
        </div>
    )
}
