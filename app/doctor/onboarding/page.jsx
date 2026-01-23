import { OnboardingForm } from "@/components/doctor/onboarding-form";
import { getDoctorProfile } from "@/app/actions/doctor-actions";
import { redirect } from "next/navigation";
export default async function OnboardingPage() {
    const profile = await getDoctorProfile();
    if (profile) {
        redirect("/doctor/dashboard");
    }
    return (<div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">Set up your doctor profile to start receiving appointments</p>
      </div>
      <OnboardingForm />
    </div>);
}
