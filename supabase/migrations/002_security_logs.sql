-- Security Logs Table (Rate Limiting)
-- Used to track failed verification attempts

CREATE TABLE IF NOT EXISTS security_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL,                 -- e.g., 'failed_verification'
  ip_address      TEXT,                          -- client IP
  device_id       TEXT,                          -- client device ID
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by IP/Device within a time window
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_device ON security_logs(device_id, created_at);

-- 🔒 RLS (Service Role Only)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Only Access" 
ON security_logs 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Maintenance: Auto-delete logs older than 24 hours to keep table small
-- In Supabase, you can set up a cron job or just manually clean it up.
-- For now, this table will store recent failures.
