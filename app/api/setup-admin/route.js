import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password + "medpath-salt")
        .digest("hex");
}
export async function GET() {
    try {
        const password = "admin123";
        const hashedPassword = hashPassword(password);
        // Check if admin exists
        const existingAdmin = await sql `
      SELECT id FROM users WHERE email = 'admin@medpath.ai'
    `;
        if (existingAdmin.length > 0) {
            // Update existing admin password
            await sql `
        UPDATE users 
        SET password = ${hashedPassword}, role = 'admin', is_active = true, is_verified = true
        WHERE email = 'admin@medpath.ai'
      `;
            return NextResponse.json({
                success: true,
                message: "Admin user updated successfully",
                credentials: { email: "admin@medpath.ai", password: "admin123" },
            });
        }
        else {
            // Create new admin user
            await sql `
        INSERT INTO users (name, email, password, role, is_active, is_verified)
        VALUES ('Admin', 'admin@medpath.ai', ${hashedPassword}, 'admin', true, true)
      `;
            return NextResponse.json({
                success: true,
                message: "Admin user created successfully",
                credentials: { email: "admin@medpath.ai", password: "admin123" },
            });
        }
    }
    catch (error) {
        console.error("Setup admin error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
