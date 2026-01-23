const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
    console.log("Creating video_call_signals table...");
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS video_call_signals (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice', 'end')),
        signal_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await sql`
      CREATE INDEX IF NOT EXISTS idx_video_call_signals_appointment_id 
      ON video_call_signals(appointment_id);
    `;
        console.log("Table created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}

main();
