import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DoctorNav } from "@/components/doctor/doctor-nav";
import { getDoctorProfile } from "@/app/actions/doctor-actions";

export default async function DoctorLayout({ children }) {
    const session = await getSession();
    if (!session)
        redirect("/login");

    // Redirect if not doctor
    if (session.role !== "doctor") {
        if (session.role === "admin") {
            redirect("/admin/dashboard");
        } else {
            redirect("/patient/assessment");
        }
    }

    const profile = await getDoctorProfile();
    return (
        <div className="min-h-screen bg-background">
            <DoctorNav user={session} hasProfile={!!profile} />
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    );
}
