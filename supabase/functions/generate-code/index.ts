// Supabase Edge Function: generate-code
// Triggered by Razorpay webhook after successful payment
// Generates a unique 8-digit unlock code and stores it in DB

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_SECRET  = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

// Generate a random 8-digit numeric code
function generateCode(): string {
  const digits = Math.floor(10000000 + Math.random() * 90000000);
  return digits.toString();
}

// Verify Razorpay webhook signature
function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac("sha256", RAZORPAY_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const rawBody   = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // Verify the webhook is genuinely from Razorpay
    if (!verifySignature(rawBody, signature)) {
      console.error("[generate-code] Invalid Razorpay signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only process successful payment events
    if (event.event !== "payment.captured") {
      return new Response("Ignored event", { status: 200 });
    }

    const payment    = event.payload.payment.entity;
    const paymentId  = payment.id as string;
    const amount     = payment.amount as number; // in paise

    // Check we haven't already generated a code for this payment
    const { data: existing } = await supabase
      .from("unlock_codes")
      .select("code")
      .eq("payment_id", paymentId)
      .single();

    if (existing) {
      console.log("[generate-code] Code already exists for payment:", paymentId);
      return new Response(JSON.stringify({ code: existing.code }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate unique code (retry if collision)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: collision } = await supabase
        .from("unlock_codes")
        .select("id")
        .eq("code", code)
        .single();
      if (!collision) break;
      code = generateCode();
      attempts++;
    }

    // Store in DB
    const { error } = await supabase.from("unlock_codes").insert({
      code,
      payment_id: paymentId,
      amount,
      status: "active",
    });

    if (error) {
      console.error("[generate-code] DB insert error:", error);
      return new Response("DB error", { status: 500 });
    }

    console.log("[generate-code] Code generated:", code, "for payment:", paymentId);
    return new Response(JSON.stringify({ success: true, code }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("[generate-code] Unexpected error:", e);
    return new Response("Internal error", { status: 500 });
  }
});