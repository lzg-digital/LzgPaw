# LzgPaw Deployment

## Production hosting

LzgPaw is a server-backed Next.js ecommerce app. Do **not** deploy the production checkout to GitHub Pages: GitHub Pages serves static files and cannot run the Next.js API routes used for checkout, admin operations, DPO callbacks, rate limiting, or Supabase service-role operations.

Use a Next.js-compatible server deployment such as Vercel or another Node.js host.

## Required production variables

- `NEXT_PUBLIC_SITE_URL` — exact HTTPS production URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPPORT_EMAIL=Ricopack0117@gmail.com`
- `DPO_COMPANY_TOKEN`
- `DPO_SERVICE_TYPE`
- `DPO_API_URL=https://secure.3gdirectpay.com/API/v6/`

Never expose the Supabase service-role key or DPO company token as a `NEXT_PUBLIC_` variable.

## DPO flow

1. Server creates a DPO `createToken` transaction.
2. Shopper is redirected to DPO's hosted payment page.
3. DPO sends/redirects the result to `/api/webhooks/dpo`.
4. The server calls DPO `verifyToken` using the transaction token.
5. The server checks the verified amount and currency against the stored order.
6. Only then is the order marked `paid`.

DPO's official documentation recommends the hosted flow and server-side verification; raw card details do not pass through LzgPaw.

## Current business status

LzgPaw is an unregistered online brand. The website must not claim that it is a registered company, corporation, or incorporated entity. A live DPO merchant account may require DPO's own merchant onboarding requirements; use DPO sandbox credentials for integration testing until live onboarding is complete.
