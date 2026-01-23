import { getAllDiagnoses } from "@/app/actions/admin-actions";
import { DiagnosesManagement } from "@/components/admin/diagnoses-management";
export default async function AdminDiagnosesPage({ searchParams, }) {
    const params = await searchParams;
    const { diagnoses, total, page, totalPages } = await getAllDiagnoses({
        flagged: params.flagged === "true" ? true : params.flagged === "false" ? false : undefined,
        urgency: params.urgency,
        minRisk: params.minRisk ? Number.parseInt(params.minRisk) : undefined,
        search: params.search,
        page: params.page ? Number.parseInt(params.page) : 1,
    });
    return <DiagnosesManagement diagnoses={diagnoses} total={total} page={page} totalPages={totalPages}/>;
}
