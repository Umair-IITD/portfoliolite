import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwMandoh64z9EuPwOIVkiDr0MYmzLvSqpPKRSvwnBSgtCif-t8nOjFBinIAo_rc1ilaaw/exec";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Save to Supabase Waitlist
    const { error: dbError } = await supabase
      .from("waitlist")
      .upsert({ email, source: "landing_page" }, { onConflict: "email" });

    if (dbError) {
      console.error("DB Error:", dbError);
    }

    // 2. Forward to Google Sheets (Background)
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        timestamp: new Date().toISOString(),
        source: "landing_page_with_apk_delivery"
      })
    }).catch(e => console.error("Google Sheets Error:", e));

    // 3. Send Email via Resend
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PortfolioLite <support@portfoliolite.tech>",
        to: [email],
        subject: "Your PortfolioLite Beta Access — APK Inside",
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0;">Portfolio<span style="color: #00D4B4;">Lite</span></h1>
            </div>
            
            <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="margin-top: 0; color: #0f172a;">Welcome to the Beta! 🚀</h2>
              <p>Thank you for your interest in <strong>PortfolioLite</strong>. As promised, here is the direct link to download the early access Android APK.</p>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="https://portfoliolite.tech/portfoliolite-beta.apk" 
                   style="background: #00D4B4; color: #0f172a; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">
                   Download Beta APK
                </a>
              </div>
              
              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
                <strong>Note:</strong> Since this is a beta build not yet on the Play Store, your phone may ask for permission to "Install from Unknown Sources". This is normal for early-access apps.
              </p>
            </div>
            
            <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
              <p style="font-size: 14px; color: #94a3b8; font-weight: 500;">Why PortfolioLite?</p>
              <ul style="font-size: 13px; color: #64748b; padding-left: 20px;">
                <li><strong>Zero Cloud:</strong> No data ever leaves your phone.</li>
                <li><strong>All-in-One:</strong> Track SIPs, Gold, FDs, and Stocks.</li>
                <li><strong>Indie Growth:</strong> Built for investors who value absolute privacy.</li>
              </ul>
            </div>
            
            <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px;">
              Built by PortfolioLite India 🇮🇳<br>
              <a href="https://portfoliolite.tech" style="color: #00D4B4; text-decoration: none;">www.portfoliolite.tech</a>
            </p>
          </div>
        `,
      }),
    });

    if (resendResp.ok) {
      await supabase.from("waitlist").update({ apk_sent: true }).eq("email", email);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Internal Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
