/**
 * Shot Polish — Cloudflare Worker API
 *
 * Routes:
 *  GET  /api/health            — Health check
 *  POST /api/create-checkout   — Create Stripe Checkout session
 *  POST /api/webhook           — Stripe webhook handler
 *  POST /api/validate-license  — Validate a license key
 *
 * Secrets (set via `wrangler secret put`):
 *  STRIPE_SECRET_KEY
 *  STRIPE_WEBHOOK_SECRET
 *
 * KV Bindings:
 *  LICENSES — stores license key → { email, purchaseDate, active }
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ─── License Key Generator ─────────────────────────────────────────────────────
// Format: SP-XXXX-XXXX-XXXX-XXXX (24 chars + prefix + dashes)

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const groups = [];
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let byteIdx = 0;
  for (let g = 0; g < 4; g++) {
    let group = '';
    for (let i = 0; i < 4; i++) {
      group += chars[bytes[byteIdx++] % chars.length];
    }
    groups.push(group);
  }
  return 'SP-' + groups.join('-');
}

// ─── Stripe Signature Verification ────────────────────────────────────────────

async function verifyStripeSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  try {
    const parts = {};
    for (const part of signature.split(',')) {
      const eqIdx = part.indexOf('=');
      if (eqIdx > -1) parts[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
    }
    const { t: timestamp, v1: sigV1 } = parts;
    if (!timestamp || !sigV1) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBytes = await crypto.subtle.sign(
      'HMAC', key, new TextEncoder().encode(signedPayload),
    );
    const computed = Array.from(new Uint8Array(sigBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time compare
    if (computed.length !== sigV1.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ sigV1.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

// ─── Route Handlers ────────────────────────────────────────────────────────────

async function handleCreateCheckout(request, env) {
  try {
    const { priceId, successUrl, cancelUrl } = await request.json();
    if (!priceId || !successUrl || !cancelUrl) {
      return json({ error: 'Missing required fields: priceId, successUrl, cancelUrl' }, 400);
    }

    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'mode': priceId.includes('monthly') ? 'subscription' : 'payment',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'allow_promotion_codes': 'true',
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: session.error?.message || 'Stripe error' }, 400);
    }

    return json({ url: session.url });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleWebhook(request, env) {
  try {
    const body = await request.text();
    const sig  = request.headers.get('stripe-signature');

    const valid = await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) return json({ error: 'Invalid signature' }, 400);

    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email
                 || session.customer_email
                 || 'unknown@example.com';

      const licenseKey  = generateLicenseKey();
      const licenseData = {
        email,
        purchaseDate: new Date().toISOString(),
        active: true,
        stripeSessionId: session.id,
        priceId: session.line_items?.data?.[0]?.price?.id ?? null,
      };

      // Store by license key
      await env.LICENSES.put(licenseKey, JSON.stringify(licenseData));
      // Store reverse lookup by email (latest key wins)
      await env.LICENSES.put(`email:${email}`, licenseKey);

      // TODO: Send email with license key via email service (Mailgun, Resend, etc.)
      console.log(`License issued: ${licenseKey} → ${email}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      // Deactivate license on subscription cancellation
      const sub = event.data.object;
      const email = sub.customer_email;
      if (email) {
        const key = await env.LICENSES.get(`email:${email}`);
        if (key) {
          const raw = await env.LICENSES.get(key);
          if (raw) {
            const data = JSON.parse(raw);
            data.active = false;
            await env.LICENSES.put(key, JSON.stringify(data));
          }
        }
      }
    }

    return json({ received: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleValidateLicense(request, env) {
  try {
    const { key } = await request.json();
    if (!key || typeof key !== 'string') {
      return json({ valid: false, error: 'No key provided' });
    }

    const normalized = key.trim().toUpperCase();

    // Basic format check: SP-XXXX-XXXX-XXXX-XXXX
    if (!/^SP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) {
      return json({ valid: false, error: 'Invalid key format' });
    }

    const raw = await env.LICENSES.get(normalized);
    if (!raw) return json({ valid: false });

    const license = JSON.parse(raw);
    if (!license.active) return json({ valid: false, error: 'License deactivated' });

    return json({ valid: true, email: license.email });
  } catch (err) {
    return json({ valid: false, error: err.message }, 500);
  }
}

// ─── Main Fetch Handler ────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const { pathname } = new URL(request.url);

    if (pathname === '/api/health' && request.method === 'GET') {
      return json({ ok: true, service: 'shotpolish-api', ts: Date.now() });
    }

    if (pathname === '/api/create-checkout' && request.method === 'POST') {
      return handleCreateCheckout(request, env);
    }

    if (pathname === '/api/webhook' && request.method === 'POST') {
      return handleWebhook(request, env);
    }

    if (pathname === '/api/validate-license' && request.method === 'POST') {
      return handleValidateLicense(request, env);
    }

    return json({ error: 'Not found' }, 404);
  },
};
