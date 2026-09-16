import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { PageLoader } from "@/components/page-state"

const homeFor = (role) =>
    role === "admin" ? "/admin/dashboard" : role === "doctor" ? "/doctor/dashboard" : "/patient/assessment"

/**
 * Replaces the `getSession()` + `redirect()` block at the top of each Next layout.
 * Waits for the session fetch before deciding, so a refresh doesn't bounce you to /login.
 */
export function RequireRole({ role, children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <PageLoader label="Checking your session" />

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    if (role && user.role !== role) {
        return <Navigate to={homeFor(user.role)} replace />
    }

    return children
}

/** For /login and /register: signed-in users get sent to their dashboard. */
export function RedirectIfAuthed({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <PageLoader label="Checking your session" />
    if (user) return <Navigate to={homeFor(user.role)} replace />

    return children
}
