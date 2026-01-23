import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
export default async function PatientHome() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    if (session.role !== "patient") {
        redirect("/doctor/dashboard");
    }
    // Default patient landing page
    redirect("/patient/appointments");
}
