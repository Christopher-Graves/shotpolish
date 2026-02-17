# Shot Polish — Cloudflare Worker API

Handles license validation and Stripe webhooks for the Pro tier.

## Routes

| Method | Path                     | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | `/api/health`            | Health check                             |
| POST   | `/api/create-checkout`   | Create a Stripe Checkout session         |
| POST   | `/api/webhook`           | Stripe webhook handler                   |
| POST   | `/api/validate-license`  | Validate a license key                   |

---

## First-time Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Install dependencies

```bash
cd worker
npm install
```

### 3. Create the KV namespace

```bash
wrangler kv:namespace create LICENSES
```

Copy the `id` from the output and paste it into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "LICENSES"
id      = "YOUR_NAMESPACE_ID_HERE"
```

### 4. Set secrets

```bash
wrangler secret put STRIPE_SECRET_KEY
# Paste your Stripe secret key (sk_live_... or sk_test_...)

wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste your Stripe webhook signing secret (whsec_...)
```

> ⚠️ **Never** commit secrets to git. They live only in Cloudflare.

### 5. Deploy

```bash
npm run deploy
```

---

## Stripe Setup

### Create products & prices in Stripe Dashboard

1. Go to **Products → Add product**
2. Create "Shot Polish Pro — Monthly": `$8 / month` (recurring)
3. Create "Shot Polish Pro — Lifetime": `$49` (one-time)
4. Copy the **Price IDs** (format: `price_...`)
5. Update `src/pro.js` in the frontend with the real price IDs

### Configure Webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://shotpolish-api.YOUR_SUBDOMAIN.workers.dev/api/webhook`
   _(or `https://shotpolish.com/api/webhook` if using a custom route)_
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** → `wrangler secret put STRIPE_WEBHOOK_SECRET`

---

## Deploying on Cloudflare Pages (recommended)

If the frontend is deployed on Cloudflare Pages, you can bind the worker to the same domain so `/api/*` requests go to the worker automatically.

In your Pages project settings → **Functions → KV namespace bindings** and **Environment variables**, mirror the same secrets.

Or use a `_routes.json` in the Pages project root:

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

---

## Local Development

```bash
npm run dev
# Worker runs at http://localhost:8787
```

Then in the frontend set:
```
window.SHOTPOLISH_API_URL = 'http://localhost:8787/api'
```

Or temporarily hardcode in `src/license.js` for testing.

---

## License Key Format

```
SP-XXXX-XXXX-XXXX-XXXX
```

- `SP` prefix identifies ShotPolish keys
- Four groups of 4 uppercase alphanumeric characters
- Human-readable and easy to type/copy

---

## KV Data Model

**Key:** `SP-XXXX-XXXX-XXXX-XXXX`
**Value:**
```json
{
  "email": "customer@example.com",
  "purchaseDate": "2024-01-15T10:30:00.000Z",
  "active": true,
  "stripeSessionId": "cs_...",
  "priceId": "price_..."
}
```

**Reverse lookup key:** `email:customer@example.com` → `SP-XXXX-XXXX-XXXX-XXXX`
