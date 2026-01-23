import { cookies } from "next/headers"
import { sql } from "./db"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "medpath-ai-secret-key-change-in-production")

// Simple hash function using Web Crypto API (bcrypt alternative for edge)
async function hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + "medpath-salt")
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function verifyPassword(password, hash) {
    const passwordHash = await hashPassword(password)
    return passwordHash === hash
}

export async function createSession(user) {
    const token = await new SignJWT({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET)

    const cookieStore = await cookies()
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    })

    return token
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload
    } catch {
        return null
    }
}

export async function destroySession() {
    const cookieStore = await cookies()
    cookieStore.delete("session")
}

export async function registerUser(name, email, password, role) {
    try {
        // Check if user exists
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

        const isValid = await verifyPassword(password, user.password)

        if (!isValid) {
            return { error: "Invalid email or password" }
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }
    } catch (error) {
        console.error("Login error:", error)
        return { error: "Failed to login" }
    }
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload
    } catch {
        return null
    }
}

export async function requireAdmin() {
    const session = await getSession()
    if (!session || session.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }
    return session
}
