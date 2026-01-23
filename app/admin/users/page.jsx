import { getAllUsers } from "@/app/actions/admin-actions";
import { UsersManagement } from "@/components/admin/users-management";
export default async function AdminUsersPage({ searchParams, }) {
    const params = await searchParams;
    const { users, total, page, totalPages } = await getAllUsers({
        role: params.role,
        search: params.search,
        page: params.page ? Number.parseInt(params.page) : 1,
    });
    return <UsersManagement users={users} total={total} page={page} totalPages={totalPages}/>;
}
