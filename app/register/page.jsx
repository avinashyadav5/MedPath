import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function RegisterPage() {
    const session = await getSession();
    if (session) {
        if (session.role === "doctor") {
            redirect("/doctor/dashboard");
        }
        else {
            redirect("/patient/assessment");
        }
    }
    return (<div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <RegisterForm />
    </div>);
}
