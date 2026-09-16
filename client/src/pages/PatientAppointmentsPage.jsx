import { useSearchParams } from "react-router-dom"
import { getPatientAppointments } from "@/api/appointment-actions"
import { PatientAppointments } from "@/components/patient/patient-appointments"
import { PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function PatientAppointmentsPage() {
    const [searchParams] = useSearchParams()
    const status = searchParams.get("status") || undefined

    const { data: appointments, loading } = useAsync(() => getPatientAppointments(status), [status], {
        initialData: [],
    })

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
                <p className="text-muted-foreground">View and manage your scheduled appointments</p>
            </div>
            {loading ? (
                <PageLoader label="Loading appointments" />
            ) : (
                <PatientAppointments
                    key={status || "all"}
                    appointments={appointments || []}
                    currentStatus={status || "all"}
                />
            )}
        </div>
    )
}
