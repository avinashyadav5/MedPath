/**
 * Same export names and signatures as the old app/actions/auth-actions.js, so
 * every component that imported from there works untouched. The difference is
 * these run in the browser and talk to the Express API.
 */
import { api, clearToken, formDataToObject, formDataToObjectWithArrays, setToken } from "@/lib/api-client"
import { navigateTo } from "@/lib/navigation"

function notifyAuthChange(user) {
    window.dispatchEvent(new CustomEvent("medpath:auth", { detail: user }))
}

export async function register(formData) {
    const { name, email, password, role } = formDataToObject(formData)

    if (!name || !email || !password || !role) return { error: "All fields are required" }
    if (password.length < 6) return { error: "Password must be at least 6 characters" }

    try {
        const result = await api.post("/auth/register", { name, email, password, role })
        if (result?.token) setToken(result.token)
        if (result?.user) notifyAuthChange(result.user)
        navigateTo(result.redirectTo, { replace: true })
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function login(formData) {
    const { email, password } = formDataToObject(formData)
    if (!email || !password) return { error: "Email and password are required" }

    try {
        const result = await api.post("/auth/login", { email, password })
        if (result?.token) setToken(result.token)
        if (result?.user) notifyAuthChange(result.user)
        return result
    } catch (error) {
        return { error: error.message }
    }
}

export async function logout() {
    try {
        await api.post("/auth/logout")
    } finally {
        clearToken()
        notifyAuthChange(null)
        navigateTo("/", { replace: true })
    }
}

export async function getCurrentUser() {
    try {
        const { user } = await api.get("/auth/me")
        return user
    } catch {
        return null
    }
}

export async function saveDoctorProfile(formData) {
    const body = formDataToObjectWithArrays(formData, ["specialty", "city", "hospitalName", "availability"])

    try {
        const result = await api.post("/auth/doctor-profile", body)
        navigateTo(result.redirectTo)
        return result
    } catch (error) {
        return { error: error.message }
    }
}
