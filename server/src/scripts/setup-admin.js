import "dotenv/config"
import readline from "node:readline/promises"
import { sql } from "../db.js"
import { hashPassword } from "../lib/auth.js"

/** CLI equivalent of the old /api/setup-admin route. Run: npm run setup-admin */
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const name = (await rl.question("Admin name [System Admin]: ")) || "System Admin"
const email = await rl.question("Admin email: ")
const password = await rl.question("Admin password: ")
rl.close()

if (!email || !password) {
    console.error("email and password are required")
    process.exit(1)
}

const hashed = await hashPassword(password)

await sql`
  INSERT INTO users (name, email, password, role, is_active, is_verified)
  VALUES (${name}, ${email}, ${hashed}, 'admin', true, true)
  ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin', is_active = true
`

console.log(`\nAdmin ready: ${email}`)
process.exit(0)
