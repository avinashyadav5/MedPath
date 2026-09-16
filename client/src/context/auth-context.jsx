import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { getCurrentUser } from "@/api/auth-actions"

/**
 * Next read the session server-side on every request. Here the session is
 * fetched once on boot from /api/auth/me and shared through context.
 */
const AuthContext = createContext({ user: null, loading: true, refresh: () => { }, setUser: () => { } })

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const current = await getCurrentUser()
        setUser(current)
        setLoading(false)
        return current
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const value = useMemo(() => ({ user, loading, refresh, setUser }), [user, loading, refresh])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext)
}
