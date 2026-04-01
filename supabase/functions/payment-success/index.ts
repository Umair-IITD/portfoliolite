// Supabase Edge Function: payment-success
// Returns JSON with the unlock code for a given Razorpay payment ID
// The actual HTML page is hosted as a static file that calls this API

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  let paymentId = url.searchParams.get('razorpay_payment_id') || url.searchParams.get('payment_id')

  // Also try parsing POST form data (Razorpay sometimes POSTs)
  if (!paymentId && req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const form = await req.formData()
        paymentId = form.get('razorpay_payment_id')?.toString() || null
      } else {
        const body = await req.json().catch(() => ({}))
        paymentId = body?.razorpay_payment_id || body?.payment_id || null
      }
    } catch (e) {
      console.error('[payment-success] Failed to parse body:', e)
    }
  }

  if (!paymentId) {
    return new Response(JSON.stringify({ success: false, error: 'missing_payment_id' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

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
      const row = data[0]
      return new Response(JSON.stringify({ success: true, code: row.code, status: row.status }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    } else {
      // Code not yet generated — webhook might still be processing
      return new Response(JSON.stringify({ success: false, error: 'pending' }), {
        status: 202,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }
  } catch (e) {
    console.error('[payment-success] DB error:', e)
    return new Response(JSON.stringify({ success: false, error: 'db_error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
