// Run this script to set up the admin user with the correct password hash
// The password hash is generated using the same algorithm as lib/auth.ts
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "medpath-salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function setupAdmin() {
    const adminPassword = "admin123";
    const hashedPassword = await hashPassword(adminPassword);
    console.log("Generated hash for admin123:", hashedPassword);
    try {
        // Update or insert admin user with correct password hash
        const result = await sql `
      INSERT INTO users (name, email, password, role, is_active, is_verified)
      VALUES ('Admin', 'admin@medpath.ai', ${hashedPassword}, 'admin', true, true)
      ON CONFLICT (email) DO UPDATE SET
        password = ${hashedPassword},
        role = 'admin',
        is_active = true,
        is_verified = true
      RETURNING id, email, role
    `;
        console.log("Admin user created/updated:", result[0]);
    }
    catch (error) {
        console.error("Error setting up admin:", error);
    }
}
setupAdmin();
