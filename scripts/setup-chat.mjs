import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) {
        dbUrl = match[1].trim().replace(/^["']|["']$/g, "");
    }
}

if (!dbUrl) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

console.log("Using DB URL:", dbUrl.replace(/:[^:@]*@/, ":***@")); // Mask password

const sql = neon(dbUrl);

async function run() {
    try {
        const sqlPath = path.join(process.cwd(), "scripts", "003-add-chat-schema.sql");
        const sqlContent = fs.readFileSync(sqlPath, "utf-8");
        console.log("Reading schema from:", sqlPath);

        // Execute SQL
        await sql(sqlContent);

        console.log("✅ Chat schema migration completed successfully.");
    } catch (e) {
        console.error("❌ Migration failed:", e);
        process.exit(1);
    }
}

run();
