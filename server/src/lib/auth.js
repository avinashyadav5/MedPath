import { webcrypto } from "node:crypto"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "../db.js"

const crypto = globalThis.crypto ?? webcrypto

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "medpath-ai-secret-key-change-in-production"
)

export const SESSION_COOKIE = "session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * NOTE: this is the same SHA-256 + fixed-salt scheme the Next.js app used, kept
 * byte-for-byte so existing password hashes in the database still validate.
 * On a long-lived Node server there is no edge-runtime constraint any more, so
 * bcrypt/argon2 would be a strictly better choice — see README "Security notes".
 */
async function hashPassword(password) {
    const data = new TextEncoder().encode(password + "medpath-salt")
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
}

async function verifyPassword(password, hash) {
    return (await hashPassword(password)) === hash
}

export async function signSession(user) {
    return new SignJWT({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET)
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload
    } catch {
        return null
    }
}

export function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: SESSION_MAX_AGE * 1000,
        path: "/",
    }
}

/** Replaces `createSession()` — Next set the cookie itself, Express needs `res`. */
export async function createSession(res, user) {
    const token = await signSession(user)
    res.cookie(SESSION_COOKIE, token, cookieOptions())
    return token
}

export function destroySession(res) {
    res.clearCookie(SESSION_COOKIE, cookieOptions())
}

export async function registerUser(name, email, password, role) {
    try {
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`
        if (existing.length > 0) {
            return { error: "Email already registered" }
        }

        const hashedPassword = await hashPassword(password)

        const result = await sql`
      INSERT INTO users (name, email, password, role, is_active, is_verified)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, true, ${role === "admin"})
      RETURNING id, name, email, role, created_at, updated_at
    `

        return { user: result[0] }
    } catch (error) {
        console.error("Registration error:", error)
        return { error: "Failed to register user" }
    }
}

export async function loginUser(email, password) {
    try {
        const result = await sql`
      SELECT id, name, email, password, role, is_active, deleted_at
      FROM users
      WHERE email = ${email}
    `

        if (result.length === 0) {
            return { error: "Invalid email or password" }
        }

        const user = result[0]

        if (!user.is_active) {
            return { error: "Your account has been deactivated. Please contact support." }
        }

        if (user.deleted_at) {
            return { error: "This account no longer exists." }
        }

        if (!(await verifyPassword(password, user.password))) {
            return { error: "Invalid email or password" }
        }

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        }
    } catch (error) {
        console.error("Login error:", error)
        return { error: "Failed to login" }
    }
}

export { hashPassword }
