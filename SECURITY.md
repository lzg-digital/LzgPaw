# LzgPaw Security Baseline

- Secrets are server-only and must never use `NEXT_PUBLIC_`.
- Supabase service-role credentials must exist only in the deployment environment.
- DPO Pay handles the hosted payment page; LzgPaw never accepts or stores raw card numbers.
- Payment completion is accepted only after server-side DPO `verifyToken` verification and an amount/currency match against the order.
- Admin access is protected by Supabase Auth plus server-side admin authorization.
- Public write endpoints are rate-limited and validated with Zod.
- Product uploads are type/size/magic-byte checked and written server-side.
- CSP, HSTS, clickjacking, MIME-sniffing and referrer protections are enabled.
- Before launch, deploy over HTTPS, configure DPO merchant credentials, run the database schema, create the admin account, and perform a complete checkout/webhook test in DPO sandbox.
