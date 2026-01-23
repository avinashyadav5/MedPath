import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientNav } from "@/components/patient/patient-nav";

export default async function PatientLayout({ children }) {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Redirect if not patient
    if (session.role !== "patient") {
        if (session.role === "admin") {
            redirect("/admin/dashboard");
        } else {
            redirect("/doctor/dashboard");
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <PatientNav user={session} />
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    );
}
