# LzgPaw

A production-oriented Next.js storefront for LzgPaw, an international pet-care
brand. Everything a customer or admin sees — products, prices, bundles,
reviews, orders — is database-driven; nothing is hardcoded into the frontend.

This README is the map. For deeper detail on two specific topics, see:
- `docs/COMPLIANCE.md` — international data-protection, PCI, tax, and
  consumer-law considerations.
- Inline comments in `services/payments/PayPesaProvider.ts` — exactly what
  is and isn't confirmed against PayPesa's real API.

## Tech stack

Next.js 14 (App Router) · TypeScript · Supabase (Postgres + Auth + Storage) ·
Tailwind CSS · Vercel · PayPesa (payment abstraction)

## Design system

Brand tokens live in `tailwind.config.ts`:

| Token | Hex | Use |
|---|---|---|
| `forest` | `#173F35` | Primary brand color — header, footer, trust |
| `cream` | `#F8F6F0` | Page background |
| `sage` | `#DDE9DF` | Section backgrounds, subtle dividers |
| `clay` | `#E88B3A` | Conversion actions ONLY — Add to Cart, Shop Now |
| `ink` | `#17211E` | Body text |

Headings use **Fraunces** (serif), body text uses **Inter** — set up in
`app/layout.tsx` via `next/font/google`.

## Getting started

### 1. Create a Supabase project
Create a project at supabase.com. Pick your region deliberately — see
`docs/COMPLIANCE.md` §1 on data residency.

### 2. Run the database schema
Paste the entire contents of `database/schema.sql` into the Supabase SQL
Editor and run it. This creates every table, the `product_ratings` view,
RLS policies, and the `product-media` storage bucket.

### 3. Configure environment variables
```
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from Supabase → Project Settings → API.

### 4. Install dependencies and create your admin account
```
npm install
npm run create-admin   # reads ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD
                        # from .env.local — see scripts/create-admin.ts
```
Remove the `ADMIN_BOOTSTRAP_*` lines from `.env.local` once this succeeds —
they're a one-time setup input, not a standing secret the app needs.

### 5. Run it
```
npm run dev
```
Visit `http://localhost:3000` for the storefront, `/admin/login` for the
dashboard. The homepage will look sparse until you add a product — that's
correct behavior, not a bug: every empty state (`Products will appear here
as soon as they're published…`, `Real customer reviews coming soon.`, etc.)
is intentional. Nothing here fabricates data to look "finished" before it is.

### 6. Add your first product
`/admin/products/new` → fill in the basics, upload photos, enter your real
supplier/shipping/other costs and your chosen selling price. The **Pricing
Intelligence** panel shows total cost, estimated profit, and margin as you
type — it only ever explains the price you enter; it never changes it (see
`lib/pricing.ts` and the generated columns in `database/schema.sql`).

## Project structure

```
/app
  /(storefront)     customer-facing pages — own layout (header/footer/cart)
  /admin            admin dashboard — separate layout, session-gated
  /api              route handlers (checkout, webhooks, admin CRUD, etc.)
/components         organized by area: home, shop, product, cart, admin, ui, seo
/lib                data access (lib/data/*), cart state, auth, validation, utils
/services/payments  payment-provider abstraction — see below
/database           schema.sql (the full DB) 
/scripts            create-admin.ts (one-time setup CLI)
/docs               COMPLIANCE.md
```

Two small, deliberate deviations from a generic suggested layout: API routes
live under `/app/api` rather than a separate top-level `/api`, and general
helpers live in `/lib/utils.ts` rather than a separate `/utils` folder —
both because that's the convention the Next.js App Router actually expects,
and matching the framework beats matching a folder name.

## Payments (PayPesa)

`services/payments/PaymentProvider.ts` defines the interface every other
part of the app depends on. `PayPesaProvider.ts` implements it, but — flagged
explicitly in that file — PayPesa's official Merchant API documentation
wasn't available to build against directly, so every endpoint path, field
name, and signature scheme in that file is marked `// CONFIRM:` and must be
checked against PayPesa's real docs/dashboard before going live. Until then:

- `createPayment` throws a clear configuration error (not a fake success) if
  `PAYPESA_API_BASE_URL` etc. aren't set — checkout will surface "online
  payment is not yet configured" rather than pretending to work.
- `verifyWebhook` fails closed (`valid: false`) on anything it can't verify
  — a webhook is never trusted by default.

Orders are created in `pending_payment` at checkout and only ever flip to
`paid` inside `app/api/webhooks/paypesa/route.ts`, after signature
verification and an amount/currency cross-check against what we recorded at
checkout time. Nothing the browser says about payment status is trusted
anywhere in this codebase.

## Admin dashboard

`/admin` (session-protected — see "Security" below): revenue/orders/products
at a glance, plus:
- **Products** — full CRUD, image/video upload, variants, benefits, FAQ,
  SEO fields, and Pricing Intelligence.
- **Bundles** — multi-product bundles with manual pricing.
- **Orders** — fulfillment status + tracking. Payment status is
  intentionally read-only here; it only changes via the webhook.
- **Discount Codes** — percentage/fixed codes, validated server-side at checkout.
- **Reviews** — approve / reject / hide / delete. "Verified Purchase" is set
  automatically, server-side, only when a matching paid order is found —
  never on the reviewer's say-so.
- **Settings** — announcement bar, trust strip, shipping defaults, support
  email, social links. Each is hidden on the storefront entirely when unset,
  rather than falling back to an invented default claim.

## Security summary

- **RLS everywhere**: `orders`, `customers`, `payment_events`,
  `discount_codes`, `admin_users`, and `rate_limit_events` have zero
  anon/authenticated policies — only server code using the service-role key
  can touch them.
- **Two-layer admin gate**: `middleware.ts` (any request, "is anyone logged
  in") + `app/admin/(dashboard)/layout.tsx` (`requireAdmin()`, "is this
  specific user an active admin").
- **No hardcoded credentials**: the admin account is created via
  `npm run create-admin`, reading from env vars, never from source.
- **Brute-force protection**: `admin_login_attempts` rate-limits
  `/api/admin/login` per email and per IP. A generic Postgres-backed limiter
  (`lib/rate-limit.ts`) also protects `/api/checkout`, `/api/reviews`, and
  `/api/account/order-lookup` — the last of these matters more than it might
  look, since order numbers are sequential and guessable; rate limiting is
  the real control preventing someone from iterating them against a known
  email to view another customer's order.
- **Upload validation**: MIME allowlist, size limits, magic-byte sniffing,
  and filenames generated server-side (`crypto.randomUUID()`) — the
  client's filename/extension is never trusted (`app/api/admin/upload/route.ts`).
- **Content-Security-Policy is generated per-request in `middleware.ts`,
  not as a static header** — it needs a fresh nonce every request so the
  App Router's own inline hydration scripts keep working under a strict
  `script-src`. **This is the one piece of this build most worth verifying
  yourself in a real browser against a preview deploy** before launch (open
  devtools → Console/Network on every page type — home, shop, product,
  checkout, admin) — CSP is notoriously easy to get subtly wrong, and this
  was written and reviewed without the ability to run a live browser test.
- **No raw values passed into PostgREST `.or()`/`.and()` filter strings**:
  the one legitimate use of this (product search) goes through
  `escapePostgrestValue()` in `lib/utils.ts`; the webhook's order lookup
  avoids the pattern entirely in favor of parameterized `.eq()` calls.
  Interpolating unescaped input into these is a real, easy-to-miss
  injection class specific to PostgREST — worth remembering if you add new
  filtered queries later.
- **SQL functions are locked down from the public RPC surface**: creating a
  Postgres function grants PUBLIC execute by default, which means
  `increment_discount_usage` and `generate_order_number` would otherwise be
  directly callable by anyone via `/rest/v1/rpc/<name>` regardless of RLS —
  see the `revoke`/`grant` block at the end of `database/schema.sql`.
- **JSON-LD is escaped before embedding** (`lib/json-ld.ts`) — `<`/`>`/`&`
  are escaped so a stray `</script>` in any embedded string can't break out
  of the script tag, standard hardening for `dangerouslySetInnerHTML` +
  structured data.
- **The payment return URL is never derived from the request** (i.e. never
  `request.nextUrl.origin` / the `Host` header) — only from the
  server-configured `NEXT_PUBLIC_SITE_URL`, so a spoofed Host header can't
  redirect customers or PayPesa's webhook callback to another domain.
- **Secrets hygiene**: `.gitignore` blocks every `.env*` variant except
  `.env.example`; `SUPABASE_SERVICE_ROLE_KEY` and all `PAYPESA_*` secrets are
  read only in server-only modules (enforced by the `server-only` package).

**Before your first deploy**, verify secrets actually won't be committed:
```
git check-ignore -v .env.local
```
This should print a match against `.gitignore`. If it prints nothing,
stop and fix your `.gitignore` before running `git add`.

## SEO

Per-page metadata, canonical URLs, Open Graph tags, a dynamic `sitemap.xml`
(`app/sitemap.ts`) built from real active products/categories, `robots.txt`
disallowing `/admin` and `/api`, and JSON-LD for Organization, Product (with
`aggregateRating` included only when real approved reviews exist), and
Breadcrumbs.

## Security audit notes

This codebase went through an explicit security-focused review pass after
the initial build (not just written once and assumed correct). Real issues
were found and fixed, including: a Host-header injection in the checkout
return URL, two PostgREST filter-injection points (unescaped values passed
into `.or()` filters — one public-facing, in product search), two SQL
functions that were callable by anyone through the public RPC API by
default (a Supabase/PostgREST default that's easy to miss), a discount
code's usage limit never actually being enforced, missing rate limiting on
an order-lookup endpoint where order numbers are sequential enough to
brute-force, and — the most consequential one — a `script-src` CSP that
would have broken the entire site's interactivity in production because it
didn't account for how the Next.js App Router streams hydration data
through inline scripts it generates itself.

That last one is also the one most worth re-verifying yourself: CSP with a
nonce is correct as implemented and matches Next.js's documented pattern
for it, but this was written and reviewed without the ability to run an
actual browser against a live build (see "Security summary" above). Treat
a full click-through on a preview deploy — home, shop, product, cart,
checkout, admin — as part of setup, not optional polish.

## Known gaps / next steps

Being upfront about what this scaffold does *not* do yet, rather than
papering over it:

- **PayPesa integration is unconfirmed** — see above. This is the single
  most important thing to resolve before accepting real payments.
- **Tax calculation isn't wired up** — `orders.tax_amount` exists but is
  always `0` today. Needs an accountant's input before automating (see
  `docs/COMPLIANCE.md` §4).
- **Multi-attribute variants** (e.g. Color × Size as independent choices)
  aren't modeled — `product_variants` supports one option dimension cleanly
  (documented in `components/product/ProductPurchasePanel.tsx`). Fine for a
  single-product launch; would need a small schema change to grow past that.
- **Contact page has no form backend** — it links to a `mailto:` for now
  rather than pretending to send a message it can't yet deliver. Wiring up
  a transactional email provider is a natural next step.
- **Legal pages are templates**, not finished policies — every bracketed
  placeholder (`[date]`, `[Registered business name]`, etc.) needs a real
  answer, and the whole set should get a lawyer's pass before launch,
  especially for whichever countries you actively sell into.
- **No automated tests** — none were in scope for this pass; given the
  amount of money-and-data-handling logic in `app/api/checkout` and
  `app/api/webhooks`, that's the highest-value place to start.
