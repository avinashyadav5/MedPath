import { Outlet } from "react-router-dom"
import { PatientNav } from "@/components/patient/patient-nav"
import { useAuth } from "@/context/auth-context"

export default function PatientLayout() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-background">
            <PatientNav user={user} />
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}
