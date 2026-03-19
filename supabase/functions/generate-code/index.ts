const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_SECRET  = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

function generateCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!signature || !RAZORPAY_SECRET) return false;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(RAZORPAY_SECRET);
  const bodyData = encoder.encode(body);
  
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    bodyData
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // VERIFY SIGNATURE (Secure)
    const isValid = await verifySignature(rawBody, signature);
    if (!isValid) {
      console.error("[generate-code] Invalid signature. Check your RAZORPAY_WEBHOOK_SECRET.");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "payment.captured") return new Response("Ignored", { status: 200 });

    const entity = event.payload?.payment?.entity;
    const paymentId = entity?.id;
    const amount    = entity?.amount;
    const code      = generateCode();

    if (!paymentId) return new Response("No payment ID", { status: 400 });

    // ── Check Idempotency ───────────────────────────────────────────
    const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/unlock_codes?payment_id=eq.${paymentId}`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_SERVICE,
        "Authorization": `Bearer ${SUPABASE_SERVICE}`,
      }
    });
    const existing = await checkResp.json();
    if (existing.length > 0) {
      console.log("[generate-code] Code already exists for payment:", paymentId);
      return new Response(JSON.stringify({ success: true, code: existing[0].code }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ── Insert New Code ─────────────────────────────────────────────
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/unlock_codes`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE,
        "Authorization": `Bearer ${SUPABASE_SERVICE}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        code,
        payment_id: paymentId,
        amount,
        status: "active"
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("DB Insert Failed:", err);
      return new Response(err, { status: 500 });
    }

    console.log("[generate-code] Success! Code generated:", code);
    return new Response(JSON.stringify({ success: true, code }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Internal Error:", e.message);
    return new Response("Error: " + e.message, { status: 500 });
  }
});