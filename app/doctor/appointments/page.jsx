import { getDoctorProfile, getDoctorAppointments, } from "@/app/actions/doctor-actions";
import AppointmentsPage from "@/components/doctor/appointments-page";
import { redirect } from "next/navigation";
export default async function DoctorAppointmentsPage() {
    const profile = await getDoctorProfile();
    if (!profile) {
        redirect("/doctor/onboarding");
    }
    const appointments = await getDoctorAppointments();
    return (<AppointmentsPage appointments={appointments} // ✅ FIXED — remove TS error
    />);
}
