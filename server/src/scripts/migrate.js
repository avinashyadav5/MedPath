import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { sql } from "../db.js"

const sqlDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../sql")

/**
 * Runs the four schema files in order. Statements are split on semicolons at
 * the end of a line, which is enough for this schema (no functions/triggers).
 */
async function run() {
    const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith(".sql")).sort()

    for (const file of files) {
        console.log(`\n--- ${file}`)
        const contents = fs.readFileSync(path.join(sqlDir, file), "utf8")

        const statements = contents
            .split(/;\s*$/m)
            .map((s) => s.trim())
            .filter((s) => s && !s.startsWith("--"))

        for (const statement of statements) {
            try {
                await sql.query(statement)
                console.log("  ok:", statement.split("\n")[0].slice(0, 70))
            } catch (error) {
                console.error("  FAILED:", statement.split("\n")[0].slice(0, 70))
                console.error("   ", error.message)
            }
        }
    }

    console.log("\nMigration complete.")
}

run().catch((e) => {
    console.error(e)
    process.exit(1)
})
