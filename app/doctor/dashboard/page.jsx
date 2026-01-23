import { getDoctorProfile, getDoctorStats, getDoctorAppointments } from "@/app/actions/doctor-actions";
import { DashboardContent } from "@/components/doctor/dashboard-content";
import { redirect } from "next/navigation";
export default async function DoctorDashboard() {
    const profile = await getDoctorProfile();
    if (!profile) {
        redirect("/doctor/onboarding");
    }
    const [stats, appointments] = await Promise.all([getDoctorStats(), getDoctorAppointments()]);
    return <DashboardContent profile={profile} stats={stats} appointments={appointments}/>;
}
