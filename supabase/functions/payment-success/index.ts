// Supabase Edge Function: payment-success
// Serves a premium HTML page to show the unlock code after payment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''

serve(async (req) => {
  const url = new URL(req.url)
  const paymentId = url.searchParams.get('razorpay_payment_id')

  let code = "Checking..."
  let status = "loading"

  if (paymentId) {
    try {
      // Query the database for the code associated with this payment ID
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/unlock_codes?payment_id=eq.${paymentId}&select=code`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      })
      const data = await resp.json()
      if (data && data.length > 0) {
        code = data[0].code
        status = "success"
      } else {
        code = "Processing..."
        status = "pending"
      }
    } catch (e) {
      code = "Error"
      status = "error"
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful - PortfolioLite</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0A0F1E;
          color: #F1F5F9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .card {
          background-color: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px;
          padding: 40px;
          width: 90%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .icon {
          width: 64px;
          height: 64px;
          background-color: rgba(0, 212, 180, 0.1);
          border-radius: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #00D4B4;
        }
        h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 12px;
        }
        p {
          color: #94A3B8;
          font-size: 15px;
          line-height: 1.5;
          margin: 0 0 32px;
        }
        .code-box {
          background-color: #0A0F1E;
          border: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
        }
        .code-label {
          font-size: 10px;
          font-weight: 800;
          color: #3B82F6;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .code-value {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #F5A623;
        }
        .status-pending { color: #F5A623; }
        .status-error { color: #EF4444; }
        .success { color: #22C55E; }
        
        .btn {
          background-color: #00D4B4;
          color: #0A0F1E;
          text-decoration: none;
          padding: 16px;
          border-radius: 14px;
          font-weight: 800;
          display: block;
          transition: transform 0.2s;
        }
        .btn:active { transform: scale(0.98); }
        
        .footer {
          margin-top: 24px;
          font-size: 12px;
          color: #64748B;
        }
      </style>
      ${status === 'pending' ? `
        <script>
          setTimeout(() => { window.location.reload(); }, 2000);
        </script>
      ` : ''}
    </head>
    <body>
      <div class="card">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1>Payment Successful!</h1>
        <p>Thank you for supporting PortfolioLite. Your unlock code is ready below.</p>
        
        <div class="code-box">
          <div class="code-label">YOUR UNLOCK CODE</div>
          <div class="code-value ${status === 'pending' ? 'status-pending' : ''}">
            ${code}
          </div>
        </div>
        
        <a href="#" class="btn" onclick="window.close(); return false;">Done</a>
        
        <div class="footer">
          Copy this code and enter it in the app.<br>
          We've also sent this to your email.
        </div>
      </div>
    </body>
    </html>
  `

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  })
})
