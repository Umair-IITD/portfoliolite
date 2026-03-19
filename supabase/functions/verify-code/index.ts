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
    const { code, deviceId } = await req.json() as { code: string; deviceId?: string };

    if (!code || typeof code !== "string" || code.length !== 8) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid code format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Look up the code
    const { data, error } = await supabase
      .from("unlock_codes")
      .select("id, status, amount, device_id")
      .eq("code", code.trim())
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ valid: false, error: "Code not found" }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (data.status === "expired") {
      return new Response(
        JSON.stringify({ valid: false, error: "Code expired" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // --- Device-Tied Restore Logic ---
    if (data.status === "used") {
      // If code was previously used on THIS device, allow "Restore"
      if (deviceId && data.device_id === deviceId) {
        return new Response(
          JSON.stringify({ valid: true, message: "Purchase restored", amount: data.amount }),
          { status: 200, headers: corsHeaders }
        );
      }
      // Otherwise, block sharing
      return new Response(
        JSON.stringify({ valid: false, error: "Code already used on another device" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // --- First-time Redemption ---
    // Code is active — mark as used and tie to this device
    const { error: updateError } = await supabase
      .from("unlock_codes")
      .update({ 
        status: "used", 
        used_at: new Date().toISOString(),
        device_id: deviceId || "unknown" 
      })
      .eq("id", data.id);

    if (updateError) {
      console.error("[verify-code] Update failed:", updateError);
      return new Response(
        JSON.stringify({ valid: false, error: "Redemption failed. Check database schema." }),
        { status: 200, headers: corsHeaders }
      );
    }

    console.log("[verify-code] Code redeemed and tied to device:", code, deviceId);

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