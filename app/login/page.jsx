import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await getSession();
    if (session) {
        if (session.role === "admin") {
            redirect("/admin/dashboard");
        } else if (session.role === "doctor") {
            redirect("/doctor/dashboard");
        } else {
            redirect("/patient/assessment");
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <LoginForm />
        </div>
    );
}
