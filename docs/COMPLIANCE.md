# LzgPaw — International Security & Compliance Requirements

> **Not legal advice.** This is an engineering reference so the codebase and
> business process line up with the *kinds* of obligations an international
> DTC store typically has. Laws differ by country and change over time.
> Before launch, have a lawyer or accountant confirm the specifics for every
> country you actively sell into — especially tax, consumer-rights wording,
> and any claims in your Privacy Policy / Terms.

LzgPaw sells physical goods online to consumers in the US and internationally.
That puts it under several overlapping regimes at once: data protection law
(where the *customer* is), payment security rules (because it takes cards),
consumer-protection / distance-selling law (because it's a remote sale), and
tax/customs law (because goods cross borders). This document is organized by
regime, and each section says what's already implemented in this codebase vs.
what's a business/legal decision you still need to make.

---

## 1. Data protection & privacy law

| Regime | Applies when | Key obligations |
|---|---|---|
| **GDPR** (EU) / **UK GDPR** | Any EU/UK resident buys or browses | Lawful basis for processing, right to access/delete/export data, breach notice within 72h, data minimization, a named contact for privacy requests |
| **CCPA/CPRA** (California) | CA residents, above certain revenue/volume thresholds | Right to know/delete/opt-out of "sale or sharing" of personal info, a "Do Not Sell or Share My Info" link if applicable |
| **PIPEDA** (Canada) | Canadian customers | Consent for collection, breach notification, reasonable safeguards |
| Similar laws (Brazil LGPD, Australia Privacy Act, etc.) | Customers in those countries | Broadly similar principles to GDPR |

**What this codebase already does:**
- Collects the minimum needed to ship an order and process payment (`customers`, `addresses`, `orders` tables) — no unnecessary profiling fields.
- `analytics_events` stores a random `session_id`, not a name/email/user id, and (see §7 below) never fires before the visitor consents.
- Data lives in Postgres (Supabase) with Row Level Security, so no anonymous/public role can read customer or order data — see `database/schema.sql`.
- `SUPPORT_EMAIL` env var gives you one real, monitored address to name as the privacy contact in `/legal/privacy-policy`.

**What you still need to decide/do:**
- Pick a Supabase project **region** deliberately (data residency). If you have EU customers, hosting in the EU reduces cross-border-transfer questions; if you keep US hosting, your Privacy Policy needs a cross-border-transfer clause.
- Add a **Data Processing Addendum** reference to your Privacy Policy naming your sub-processors: Supabase (database/storage), Vercel (hosting), DPO Pay by Network (payments), and any email/analytics tool you add later.
- Decide how you'll honor a "delete my data" request (a manual admin process is fine at small scale — document the process).
- If you ever target children's products/marketing, COPPA (US) and similar child-privacy laws add extra rules — out of scope for a pet-hair-remover store today, but worth remembering if the catalog grows.

---

## 2. Payment security — PCI DSS

Because LzgPaw takes card payments, **PCI DSS** (Payment Card Industry Data
Security Standard) applies. The single biggest thing you can do to keep this
simple: **never let LzgPaw's own servers touch raw card numbers.**

- The `services/payments/PaymentProvider` abstraction (see `services/payments/`) is built so checkout redirects to, or tokenizes through, DPO Pay by Network's own hosted payment flow — the card PAN should never hit `/api/checkout` or be stored in `orders`/`payment_events`. Confirm DPO Pay by Network's integration supports a hosted/tokenized flow (most mobile-money-first African PSPs do); if DPO Pay by Network ever asks you to post raw card fields to your own backend, that pulls you into a much heavier PCI SAQ tier — avoid it.
- `payment_events.raw_payload` stores the *webhook* payload for audit/idempotency, not card data — do not extend it to store PANs, CVVs, or full card numbers under any circumstance.
- Security headers, TLS-only (HSTS), and no `NEXT_PUBLIC_` secret leakage (§21–24 of the original build spec) are already part of `next.config.js` / `.env.example` and reduce PCI scope further.

---

## 3. Consumer protection & distance-selling law

Selling remotely (no face-to-face transaction) triggers extra consumer
protections in most markets:

- **EU Consumer Rights Directive**: EU customers generally get a **14-day right of withdrawal** (cooling-off period) independent of your own returns policy, plus a legal requirement to show the *total* price (incl. any known taxes/fees) before payment is confirmed.
- **US**: FTC rules require clear, non-deceptive pricing and shipping-time disclosures; several states have their own return-policy disclosure laws.
- **UK**: Consumer Contracts Regulations — similar 14-day cancellation right.

**In the codebase:** the checkout flow shows subtotal, shipping, discount, tax and total as separate line items before payment is initiated (`orders` schema has all of these as distinct columns, never bundled into one opaque number), and `/legal/returns-policy` is a real, editable page rather than a paragraph buried in the Terms.

**Your decision:** your stated returns policy must be *at least* as generous as the strictest law you're actively selling under — practically, that usually means matching the EU's 14-day minimum store-wide rather than running different policies per country.

---

## 4. Tax, duties & customs

- **Sales tax / VAT / GST**: whether LzgPaw owes tax in a given US state or country depends on "nexus" rules that vary by state/country and change with revenue volume — this is the one item most worth a real accountant's sign-off before you scale past a handful of orders.
- `orders.tax_amount` exists as its own column so a tax calculation can be plugged in later (e.g., a tax API) without a schema change — it is **not** auto-calculated today; until you wire one in, keep tax-inclusive/exclusive pricing clearly labeled at checkout.
- **Customs & duties on international shipments**: decide and disclose whether LzgPaw ships **DDP** (Delivered Duty Paid — you collect duties at checkout, customer never gets a surprise bill) or **DDU/DAP** (customer pays duties on delivery). Whichever you pick, say so explicitly on `/legal/shipping-policy` — an undisclosed DDU shipment is a common source of chargebacks and complaints.

---

## 5. Cookie / tracking consent (ePrivacy + GDPR + CCPA)

The EU's ePrivacy rules (and, more loosely, CCPA's "opt-out of sale/sharing")
mean **non-essential cookies or tracking scripts should not fire until the
visitor has consented** — a "we use cookies" banner that tracks anyway before
you click anything is not compliant.

**Implemented in this pass:**
- `components/layout/CookieConsent.tsx` — a real consent banner (Accept / Reject / Necessary-only), styled to the brand, keyboard- and screen-reader-accessible.
- `lib/consent.ts` — reads/writes the consent choice in a first-party cookie; nothing else in the app is allowed to check `document.cookie` directly for this.
- `lib/analytics.ts` — `trackEvent()` checks consent before sending *any* behavioral event (`page_view`, `product_view`, `add_to_cart`, etc.) to `/api/track-event`. If the visitor rejects or hasn't answered yet, events are silently dropped, not queued.
- Strictly necessary things (the cart itself, the consent choice, an active checkout session) are not gated — those aren't "tracking," they're the site functioning.

This means analytics undercounts until a visitor accepts — that's the correct, compliant behavior, not a bug.

---

## 6. Accessibility law

- **US**: ADA Title III has been applied to ecommerce sites in numerous court cases even though the statute predates the web.
- **EU**: the **European Accessibility Act** applies to ecommerce from June 2025.

Both effectively point to the same technical bar: **WCAG 2.1 AA**. Section 38
of the build (semantic HTML, keyboard nav, labels, alt text, contrast) is
aimed at that bar directly — treat accessibility bugs as launch blockers, not
a "nice to have," since in the US specifically this is an active litigation
area for ecommerce.

---

## 7. Fraud, sanctions & anti-money-laundering

- International shipping means occasionally screening against **sanctioned countries/regions** and denied-party lists is a real consideration once volume grows — most payment processors (DPO Pay by Network included) do some of this on their end as part of merchant onboarding, but don't assume it covers your shipping carrier too.
- Keep `internal_notes` on `orders` for flagging anything that looks like card testing or fraud (many small orders, mismatched billing/shipping country, etc.) — there's no automated fraud scoring in this build; add one (or use DPO Pay by Network's, if offered) before scaling paid ad traffic, which is the most common vector for card-testing fraud.

---

## 8. Breach notification

If customer or order data is ever exposed:
- **GDPR**: notify your supervisory authority within 72 hours if EU residents are affected, and affected individuals "without undue delay" if the breach is high-risk.
- **US**: notification timelines are state-by-state (most states require "without unreasonable delay," some set a hard day count).

Practically: know *before* an incident who you'd contact (e.g., Supabase's status/security contact, your own counsel) — that's a business runbook, not a code change, but write it down somewhere your team can find it under pressure.

---

## Summary — what's code, what's process

| Requirement | Status |
|---|---|
| RLS locking down orders/customers/payment data | ✅ implemented (`database/schema.sql`) |
| No card data touching LzgPaw's own servers | ✅ enforced by the payment abstraction — confirm DPO Pay by Network's actual flow matches |
| Cookie/analytics consent gate | ✅ implemented this pass |
| Security headers, HSTS, no leaked secrets | ✅ implemented (`next.config.js`, `.gitignore`, `.env.example`) |
| Accessible markup | ✅ ongoing discipline as pages are built |
| Tax calculation | ⚠️ column exists, calculation not wired — needs an accountant + likely a tax API |
| Customs/duties disclosure (DDP vs DDU) | ⚠️ business decision — put the answer in `/legal/shipping-policy` |
| Data residency / sub-processor list in Privacy Policy | ⚠️ pick a Supabase region, list sub-processors |
| Sanctions/fraud screening for shipping | ⚠️ not automated — manual review via `internal_notes` for now |
| Legal review of Terms/Privacy/Returns wording per country | ⚠️ recommended before scaling past initial launch markets |
