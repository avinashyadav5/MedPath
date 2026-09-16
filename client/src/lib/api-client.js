/**
 * Thin fetch wrapper. `credentials: "include"` is what carries the session
 * cookie to the API on a different origin during development.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "")
const TOKEN_KEY = "medpath_token"

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function setToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
    } catch {}
}

export function clearToken() {
    setToken(null)
}

export class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.name = "ApiError"
        this.status = status
    }
}

async function request(path, { method = "GET", body, headers, raw = false } = {}) {
    const token = getToken()
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    const response = await fetch(`${BASE_URL}/api${path}`, {
        method,
        credentials: "include",
        headers: {
            ...(body !== undefined && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
            ...authHeaders,
            ...headers,
        },
        body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (raw) return response

    const text = await response.text()
    const data = text ? safeParse(text) : null

    if (!response.ok) {
        throw new ApiError(data?.error || `Request failed (${response.status})`, response.status)
    }

    return data
}

function safeParse(text) {
    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

export const api = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
    put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
    raw: request,
    baseUrl: BASE_URL,
}

/** Actions took FormData; this turns it into a plain object, keeping repeats as arrays. */
export function formDataToObject(formData) {
    if (!(formData instanceof FormData)) return formData

    const result = {}
    for (const [key, value] of formData.entries()) {
        if (key in result) {
            result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value]
        } else {
            result[key] = value
        }
    }
    return result
}

/** Some fields must stay arrays even when the form submitted only one value. */
export function formDataToObjectWithArrays(formData, arrayKeys) {
    const result = formDataToObject(formData)
    for (const key of arrayKeys) {
        if (key in result && !Array.isArray(result[key])) result[key] = [result[key]]
    }
    return result
}

/** Builds a querystring, dropping undefined/empty values. */
export function qs(params) {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params || {})) {
        if (value === undefined || value === null || value === "") continue
        search.set(key, String(value))
    }
    const str = search.toString()
    return str ? `?${str}` : ""
}
