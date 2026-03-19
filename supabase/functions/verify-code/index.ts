// Supabase Edge Function: verify-code
// Called by the PortfolioLite app when user enters their unlock code
// Returns { valid: true } if code is active, marks it as used

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

Deno.serve(async (req: Request) => {
  // Allow CORS for mobile app requests
  const corsHeaders = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ valid: false, error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { code } = await req.json() as { code: string };

    if (!code || typeof code !== "string" || code.length !== 8) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid code format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Look up the code
    const { data, error } = await supabase
      .from("unlock_codes")
      .select("id, status, amount")
      .eq("code", code.trim())
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ valid: false, error: "Code not found" }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (data.status === "used") {
      return new Response(
        JSON.stringify({ valid: false, error: "Code already used" }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (data.status === "expired") {
      return new Response(
        JSON.stringify({ valid: false, error: "Code expired" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Code is valid — mark as used
    await supabase
      .from("unlock_codes")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", data.id);

    console.log("[verify-code] Code redeemed successfully:", code);

    return new Response(
      JSON.stringify({ valid: true, amount: data.amount }),
      { status: 200, headers: corsHeaders }
    );

  } catch (e) {
    console.error("[verify-code] Unexpected error:", e);
    return new Response(
      JSON.stringify({ valid: false, error: "Server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});