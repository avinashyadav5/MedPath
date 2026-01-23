import { getAllAppointments } from "@/app/actions/admin-actions";
import { AppointmentsManagement } from "@/components/admin/appointments-management";
export default async function AdminAppointmentsPage({ searchParams, }) {
    const params = await searchParams;
    const { appointments, total, page, totalPages } = await getAllAppointments({
        status: params.status,
        date: params.date,
        page: params.page ? Number.parseInt(params.page) : 1,
    });
    return <AppointmentsManagement appointments={appointments} total={total} page={page} totalPages={totalPages}/>;
}
