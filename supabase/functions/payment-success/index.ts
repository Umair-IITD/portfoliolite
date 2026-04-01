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
const GITHUB_PAGES_URL = 'https://umair-iitd.github.io/portfoliolite/payment-success.html'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

async function extractPaymentId(req: Request): Promise<string | null> {
  const url = new URL(req.url)

  // 1. Check GET query parameters first (standard Razorpay GET redirect)
  const fromQuery = url.searchParams.get('razorpay_payment_id')
    || url.searchParams.get('payment_id')
  if (fromQuery) return fromQuery

  // 2. Try POST body parsing (Razorpay sometimes POSTs with form data)
  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || ''

      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Standard HTML form POST
        const text = await req.text()
        const params = new URLSearchParams(text)
        const fromForm = params.get('razorpay_payment_id') || params.get('payment_id')
        if (fromForm) return fromForm

        // Log what we received for debugging
        console.log('[payment-success] Form body params:', text.substring(0, 200))

      } else if (contentType.includes('multipart/form-data')) {
        const form = await req.formData()
        const fromForm = form.get('razorpay_payment_id')?.toString()
          || form.get('payment_id')?.toString()
        if (fromForm) return fromForm

      } else if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => ({}))
        const fromJson = body?.razorpay_payment_id || body?.payment_id
        if (fromJson) return fromJson

      } else {
        // Unknown content type - try parsing as URL-encoded form anyway
        const text = await req.text()
        console.log('[payment-success] Unknown content-type body:', text.substring(0, 200))
        const params = new URLSearchParams(text)
        const fromForm = params.get('razorpay_payment_id') || params.get('payment_id')
        if (fromForm) return fromForm
      }
    } catch (e) {
      console.error('[payment-success] Body parse error:', e)
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const mode = url.searchParams.get('mode')

  // ── MODE 2: JSON API call from GitHub Pages JavaScript ──────────────────────
  if (mode === 'api') {
    const paymentId = url.searchParams.get('razorpay_payment_id')
      || url.searchParams.get('payment_id')

    if (!paymentId) {
      return new Response(JSON.stringify({ success: false, error: 'missing_payment_id' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const result = await lookupCode(paymentId)
    const status = result.success ? 200 : (result.error === 'pending' ? 202 : 500)
    return new Response(JSON.stringify(result), {
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  // ── MODE 1: Browser redirect from Razorpay ──────────────────────────────────
  // Extract payment ID from wherever Razorpay placed it
  const paymentId = await extractPaymentId(req)

  console.log('[payment-success] Redirect received, payment_id:', paymentId)
  console.log('[payment-success] Method:', req.method)
  console.log('[payment-success] Query:', url.search)

  if (paymentId) {
    // Redirect to GitHub Pages with the payment ID as a clean GET parameter
    const destination = `${GITHUB_PAGES_URL}?razorpay_payment_id=${encodeURIComponent(paymentId)}`
    console.log('[payment-success] Redirecting to:', destination)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': destination,
        ...CORS_HEADERS,
      },
    })
  }

  // No payment ID found anywhere — redirect to GitHub Pages with error flag
  // The page will show a helpful message
  console.warn('[payment-success] No payment_id found in request. Dumping all params...')
  const allParams: Record<string, string> = {}
  url.searchParams.forEach((v, k) => { allParams[k] = v })
  console.log('[payment-success] All query params:', JSON.stringify(allParams))

  const destination = `${GITHUB_PAGES_URL}?error=missing_id`
  return new Response(null, {
    status: 302,
    headers: {
      'Location': destination,
      ...CORS_HEADERS,
    },
  })
})
