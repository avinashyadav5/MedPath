import { getPatientAppointments } from "@/app/actions/appointment-actions";
import { PatientAppointments } from "@/components/patient/patient-appointments";
export default async function AppointmentsPage({ searchParams, }) {
    const { status } = await searchParams;
    const appointments = await getPatientAppointments(status);
    return (<div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your scheduled appointments</p>
      </div>
      <PatientAppointments key={status || "all"} appointments={appointments} currentStatus={status || "all"}/>
    </div>);
}
