// Supabase Edge Function: verify-code
// Called by the PortfolioLite app when user enters their unlock code
// Returns { valid: true } if code is active, marks it as used

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = ['https://portfoliolite.tech', 'http://localhost:8081'];
  const isAllowed = allowedOrigins.includes(origin) || origin.startsWith('exp://');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://portfoliolite.tech',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ valid: false, error: "Use POST" }), { status: 405, headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  try {
    const { code, deviceId } = await req.json() as { code: string; deviceId?: string };
    const currentHint = deviceId ? deviceId.substring(0, 8) : "unknown";

    // ── 1. RATE LIMIT CHECK (Last 15 minutes) ────────────────────────
    const { count } = await supabase
      .from("security_logs")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "failed_verification")
      .or(`ip_address.eq.${clientIP},device_id.eq.${currentHint}`)
      .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (count !== null && count >= 5) {
      console.warn(`[verify-code] Rate limit hit for IP: ${clientIP} / Device: ${currentHint}`);
      return new Response(
        JSON.stringify({ valid: false, error: "Too many failed attempts. Try again in 15 minutes." }),
        { status: 429, headers: corsHeaders }
      );
    }

    if (!code || typeof code !== "string" || code.length !== 8) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid code format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ── 2. VERIFY CODE ───────────────────────────────────────────────
    const { data, error } = await supabase
      .from("unlock_codes")
      .select("id, status, amount, device_hint")
      .eq("code", code.trim())
      .single();

    if (error || !data) {
      // LOG FAILURE FOR RATE LIMITING
      await supabase.from("security_logs").insert({
        event_type: "failed_verification",
        ip_address: clientIP,
        device_id: currentHint
      });

      return new Response(
        JSON.stringify({ valid: false, error: "Code not found" }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (data.status === "expired") {
      return new Response(JSON.stringify({ valid: false, error: "Code expired" }), { status: 200, headers: corsHeaders });
    }

    // ── 3. DEVICE-TIED LOGIC ─────────────────────────────────────────
    if (data.status === "used") {
      if (data.device_hint === currentHint) {
        return new Response(
          JSON.stringify({ valid: true, message: "Purchase restored", amount: data.amount }),
          { status: 200, headers: corsHeaders }
        );
      }
      
      // LOG ATTEMPT TO USE CODE ON ANOTHER DEVICE
      await supabase.from("security_logs").insert({
        event_type: "failed_verification",
        ip_address: clientIP,
        device_id: currentHint
      });

      return new Response(
        JSON.stringify({ valid: false, error: "Code already used on another device" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // ── 4. REDEMPTION ────────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from("unlock_codes")
      .update({ 
        status: "used", 
        used_at: new Date().toISOString(),
        device_hint: currentHint
      })
      .eq("id", data.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ valid: false, error: "Redemption failed" }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, amount: data.amount }),
      { status: 200, headers: corsHeaders }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ valid: false, error: "Server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});