import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
export default async function AdminLayout({ children }) {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    if (session.role !== "admin") {
        if (session.role === "doctor") {
            redirect("/doctor/dashboard");
        }
        else {
            redirect("/patient/assessment");
        }
    }
    return (<div className="min-h-screen bg-background">
      <AdminSidebar user={session}/>
      <main className="lg:pl-72">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>);
}
