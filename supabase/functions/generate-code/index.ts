const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_SECRET  = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

function generateCode(): string {
  // Use cryptographically secure random values instead of Math.random()
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (10000000 + (array[0] % 90000000)).toString();
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

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = ['https://portfoliolite.tech', 'https://www.portfoliolite.tech', 'http://localhost:8081'];
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
    return new Response("Use POST", { status: 405, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // VERIFY SIGNATURE (Secure)
    const isValid = await verifySignature(rawBody, signature);
    if (!isValid) {
      console.error("[generate-code] Invalid signature. Check your RAZORPAY_WEBHOOK_SECRET.");
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "payment.captured") return new Response("Ignored", { status: 200, headers: corsHeaders });

    const entity = event.payload?.payment?.entity;
    const paymentId = entity?.id;
    const amount    = entity?.amount;
    const customerEmail = entity?.email || event.payload?.payment_link?.entity?.customer?.email || event.payload?.order?.entity?.customer?.email;

    if (!paymentId) return new Response("No payment ID", { status: 400, headers: corsHeaders });

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
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── Insert New Code with Retry Loop ──────────────────────────────
    let finalCode = "";
    let inserted = false;
    let lastError = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      finalCode = generateCode();
      
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/unlock_codes`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE,
          "Authorization": `Bearer ${SUPABASE_SERVICE}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          code: finalCode,
          payment_id: paymentId,
          amount,
          status: "active"
        })
      });

      if (resp.ok) {
        inserted = true;
        break;
      }
      
      lastError = await resp.text();
      console.log(`[generate-code] Attempt ${attempt} failed:`, lastError);
    }

    if (!inserted) {
      console.error("DB Insert Failed after 3 attempts:", lastError);
      return new Response("Internal server error", { status: 500, headers: corsHeaders });
    }

    console.log("[generate-code] Success! Code generated:", finalCode);

    // ── Send Email via Resend ───────────────────────────────────────
    if (customerEmail) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        try {
          const emailResp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "support@portfoliolite.tech",
              to: [customerEmail],
              subject: "Your PortfolioLite Unlock Code",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h2>Thank you for upgrading!</h2>
                  <p>Your PortfolioLite Pro payment was successful.</p>
                  <p>Here is your 8-digit unlock code:</p>
                  <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <strong style="font-size: 32px; letter-spacing: 5px; color: #0EA5E9;">${finalCode}</strong>
                  </div>
                  <p>To redeem this code:</p>
                  <ol>
                    <li>Open <strong>PortfolioLite</strong> on your device</li>
                    <li>Go to the Pro upgrade screen</li>
                    <li>Enter the code above in the "Already Purchased?" section</li>
                  </ol>
                  <p>If you experience any issues, please reply to this email.</p>
                  <p>Best regards,<br>The PortfolioLite Team</p>
                </div>
              `
            })
          });
          if (!emailResp.ok) {
            console.error("[generate-code] Resend email failed:", await emailResp.text());
          } else {
            console.log("[generate-code] Unlock code emailed to:", customerEmail);
          }
        } catch (emailErr) {
          console.error("[generate-code] Error sending email:", emailErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, code: finalCode }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Internal Error:", (e as Error).message);
    return new Response("Error: " + (e as Error).message, { status: 500, headers: corsHeaders });
  }
});