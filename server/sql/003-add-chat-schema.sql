-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add last_message_at to appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_appointment_id ON chat_messages(appointment_id);
