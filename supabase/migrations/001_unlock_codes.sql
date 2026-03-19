-- PortfolioLite unlock codes table
-- Run this in Supabase SQL Editor once

CREATE TABLE IF NOT EXISTS unlock_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,          -- 8-digit code shown to user
  payment_id      TEXT NOT NULL,                 -- Razorpay payment ID
  amount          INTEGER NOT NULL,              -- amount in paise (4500 = ₹45)
  status          TEXT NOT NULL DEFAULT 'active' -- active | used | expired
                    CHECK(status IN ('active','used','expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at         TIMESTAMPTZ,                   -- when the user redeemed it
  device_hint     TEXT                           -- optional: first 8 chars of device fingerprint
);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_unlock_codes_code ON unlock_codes(code);

-- Index for Razorpay payment ID lookups
CREATE INDEX IF NOT EXISTS idx_unlock_codes_payment_id ON unlock_codes(payment_id);

-- Auto-expire codes older than 30 days (run as a cron if needed)
-- For now codes are permanent — user can redeem any time after paying