"use server"

import { redirect } from "next/navigation"
import { registerUser, loginUser, createSession, destroySession, getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function register(formData) {
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const role = formData.get("role")

    if (!name || !email || !password || !role) {
        return { error: "All fields are required" }
    }

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters" }
    }

    const { user, error } = await registerUser(name, email, password, role)

    if (error || !user) {
        return { error: error || "Registration failed" }
    }

    // Create session
    await createSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    })

    // Redirect based on role
    if (role === "doctor") {
        redirect("/doctor/onboarding")
    } else {
        redirect("/patient/assessment")
    }
}

export async function login(formData) {
    const email = formData.get("email")
    const password = formData.get("password")

    if (!email || !password) {
        return { error: "Email and password are required" }
    }

    const { user, error } = await loginUser(email, password)

    console.log("[v0] Login attempt for:", email)
    console.log("[v0] Login result - user:", user, "error:", error)

    if (error || !user) {
        return { error: error || "Login failed" }
    }

    await createSession(user)

    console.log("[v0] User role:", user.role)

    // Redirect based on role
    if (user.role === "admin") {
        console.log("[v0] Returning admin redirect")
        return { success: true, redirectTo: "/admin/dashboard" }
    } else if (user.role === "doctor") {
        console.log("[v0] Returning doctor redirect")
        return { success: true, redirectTo: "/doctor/dashboard" }
    } else {
        console.log("[v0] Returning patient redirect")
        return { success: true, redirectTo: "/patient/assessment" }
    }
}

export async function logout() {
    await destroySession()
    redirect("/")
}

export async function getCurrentUser() {
    return await getSession()
}

export async function saveDoctorProfile(formData) {
    const session = await getSession()
    if (!session || session.role !== "doctor") {
        return { error: "Unauthorized" }
    }

    const specialties = formData.getAll("specialty").filter(Boolean).join(", ")
    const cities = formData.getAll("city").filter(Boolean).join(", ")
    const hospitalNames = formData.getAll("hospitalName").filter(Boolean).join(", ")
    const availability = formData.getAll("availability")

    if (!specialties || !cities) {
        return { error: "At least one specialty and city are required" }
    }

    try {
        await sql`
      INSERT INTO doctor_profiles (user_id, specialty, city, hospital_name, availability)
      VALUES (
        ${session.id}, 
        ${specialties}, 
        ${cities}, 
        ${hospitalNames}, 
        ${JSON.stringify(availability)}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        specialty = EXCLUDED.specialty,
        city = EXCLUDED.city,
        hospital_name = EXCLUDED.hospital_name,
        availability = EXCLUDED.availability,
        updated_at = CURRENT_TIMESTAMP
    `
    } catch (error) {
        console.error("Error saving doctor profile:", error)
        return { error: "Failed to save profile" }
    }

    redirect("/doctor/dashboard")
}
