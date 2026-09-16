import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
    console.error("[db] DATABASE_URL is not set. Copy .env.example to .env and fill it in.")
}

export const sql = neon(process.env.DATABASE_URL)
