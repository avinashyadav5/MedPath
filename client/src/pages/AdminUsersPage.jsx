import { useSearchParams } from "react-router-dom"
import { getAllUsers } from "@/api/admin-actions"
import { UsersManagement } from "@/components/admin/users-management"
import { PageError, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function AdminUsersPage() {
    const [searchParams] = useSearchParams()
    const role = searchParams.get("role") || undefined
    const search = searchParams.get("search") || undefined
    const page = Number(searchParams.get("page")) || 1

    const { data, loading, error, reload } = useAsync(
        () => getAllUsers({ role, search, page }),
        [role, search, page]
    )

    if (loading) return <PageLoader label="Loading users" />
    if (error) return <PageError error={error} onRetry={reload} />

    return (
        <UsersManagement
            users={data.users}
            total={data.total}
            page={data.page}
            totalPages={data.totalPages}
        />
    )
}
