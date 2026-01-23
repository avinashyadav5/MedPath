import { getAllDoctors } from "@/app/actions/admin-actions";
import { DoctorsManagement } from "@/components/admin/doctors-management";
export default async function AdminDoctorsPage({ searchParams, }) {
    const params = await searchParams;
    const { doctors, total, page, totalPages } = await getAllDoctors({
        verified: params.verified === "true" ? true : params.verified === "false" ? false : undefined,
        blocked: params.blocked === "true" ? true : params.blocked === "false" ? false : undefined,
        search: params.search,
        page: params.page ? Number.parseInt(params.page) : 1,
    });
    return <DoctorsManagement doctors={doctors} total={total} page={page} totalPages={totalPages}/>;
}
