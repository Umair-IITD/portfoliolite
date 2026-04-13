-- 003_waitlist_table.sql
-- Table to store waitlist signups

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    apk_sent BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'landing_page'
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Service Role Only Access (Functions use service role)
CREATE POLICY "Service Role Only" ON public.waitlist
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
