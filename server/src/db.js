import "dotenv/config"
import { neon } from "@neondatabase/serverless"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error("[db] DATABASE_URL is not set. Please add DATABASE_URL in your environment variables.")
}

export const sql = connectionString
    ? neon(connectionString)
    : Object.assign(
          () => {
              throw new Error("DATABASE_URL is not set in environment variables")
          },
          {
              query: () => {
                  throw new Error("DATABASE_URL is not set in environment variables")
              },
          }
      )
