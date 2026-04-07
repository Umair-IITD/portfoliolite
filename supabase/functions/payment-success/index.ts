// Supabase Edge Function: payment-success
//
// Dual-mode function:
// MODE 1 (Browser Redirect from Razorpay): Receives Razorpay redirect (GET or POST),
//   extracts the payment ID from wherever Razorpay puts it, then 302-redirects the
//   browser to the GitHub Pages success page with the ID as a clean URL parameter.
//
// MODE 2 (API call from GitHub Pages JS): Returns JSON with the unlock code.
//   Detected by the presence of ?mode=api in the query string.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const GITHUB_PAGES_URL = 'https://portfoliolite.tech/payment-success.html'

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowedOrigins = [
    'https://portfoliolite.tech',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
  ]
  const isAllowed = allowedOrigins.includes(origin) || origin.startsWith('exp://') || origin.startsWith('expo-development-client://')

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://portfoliolite.tech',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

async function extractPaymentId(req: Request): Promise<string | null> {
  const url = new URL(req.url)
  const allValues: string[] = []

  // Collect all possible strings from query params
  url.searchParams.forEach((val) => allValues.push(val))

  // Collect all possible strings from body if POST
  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await req.text()
        const params = new URLSearchParams(text)
        params.forEach((val) => allValues.push(val))
      } else if (contentType.includes('application/json')) {
        const body = await req.json()
        const flatten = (obj: any) => {
          for (const k in obj) {
            if (typeof obj[k] === 'string') allValues.push(obj[k])
            else if (typeof obj[k] === 'object') flatten(obj[k])
          }
        }
        flatten(body)
      }
    } catch (e) {
      console.error('[payment-success] Body extract error:', e)
    }
  }

  // 1. Prioritize known keys
  const preferred = url.searchParams.get('razorpay_payment_id')
    || url.searchParams.get('payment_id')
    || url.searchParams.get('razorpay_payment_link_id')
  if (preferred) return preferred

  // 2. Brute-force: Look for anything starting with pay_ or plink_
  for (const val of allValues) {
    if (typeof val === 'string' && (val.startsWith('pay_') || val.startsWith('plink_'))) {
      return val
    }
  }

  return null
}

async function lookupCode(paymentId: string): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/unlock_codes?payment_id=eq.${paymentId}&select=code,status`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const data = await resp.json()
    if (data && data.length > 0) {
      return { success: true, code: data[0].code }
    }
    return { success: false, error: 'pending' }
  } catch (e) {
    console.error('[payment-success] DB error:', e)
    return { success: false, error: 'db_error' }
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const mode = url.searchParams.get('mode')

  if (mode === 'api') {
    const paymentId = await extractPaymentId(req)
    if (!paymentId) {
      return new Response(JSON.stringify({ success: false, error: 'missing_payment_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await lookupCode(paymentId)
    const status = result.success ? 200 : (result.error === 'pending' ? 202 : 500)
    return new Response(JSON.stringify(result), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const paymentId = await extractPaymentId(req)
  if (paymentId) {
    const destination = `${GITHUB_PAGES_URL}?razorpay_payment_id=${encodeURIComponent(paymentId)}`
    return new Response(null, {
      status: 302,
      headers: { 'Location': destination, ...corsHeaders },
    })
  }

  const destination = `${GITHUB_PAGES_URL}?error=missing_id`
  return new Response(null, {
    status: 302,
    headers: { 'Location': destination, ...corsHeaders },
  })
})
