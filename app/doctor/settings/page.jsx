import { getDoctorProfile } from "@/app/actions/doctor-actions";
import { SettingsForm } from "@/components/doctor/settings-form";
import { redirect } from "next/navigation";
export default async function SettingsPage() {
    const profile = await getDoctorProfile();
    if (!profile) {
        redirect("/doctor/onboarding");
    }
    return (<div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and availability</p>
      </div>
      <SettingsForm profile={profile}/>
    </div>);
}
