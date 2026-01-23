-- Video Call Signaling Table
CREATE TABLE IF NOT EXISTS video_call_signals (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice', 'end')),
  signal_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_video_call_signals_appointment_id ON video_call_signals(appointment_id);
