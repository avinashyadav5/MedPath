import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
// Load env vars from .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, ...value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.join("=").trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
        }
    });
}
console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
const sql = neon(process.env.DATABASE_URL);
async function setupChat() {
    try {
        const sqlPath = path.join(process.cwd(), "scripts", "003-add-chat-schema.sql");
        const sqlContent = fs.readFileSync(sqlPath, "utf-8");
        console.log("Reading schema from:", sqlPath);
        // console.log("Content length:", sqlContent.length)
        // Split by semicolons to run statements individually if needed, 
        // but cleaner is to try running it all. 
        // If the HTTP driver supports multiple statements, this is fine.
        // If not, we might fail. 
        // NOTE: neon serverless http driver supports multi-statement queries usually.
        await sql(sqlContent);
        console.log("✅ Chat schema migration completed successfully.");
    }
    catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}
setupChat();
