# DPO Pay by Network setup for LzgPaw

This project is wired to DPO Pay by Network's hosted checkout using the documented API v6 flow.

## 1. Create/approve the DPO merchant account
You need a live DPO merchant account before real payments can be processed.

## 2. Get these values from DPO
- Company Token
- Service Type ID
- Settlement/bank details

## 3. Add Vercel environment variables

```env
DPO_COMPANY_TOKEN=YOUR_LIVE_COMPANY_TOKEN
DPO_SERVICE_TYPE=YOUR_SERVICE_TYPE_ID
DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
DPO_HOSTED_CHECKOUT_URL=https://secure.3gdirectpay.com/payv3.php
DPO_ENV=live
NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN.com
```

Never put the Company Token in a `NEXT_PUBLIC_*` variable and never commit `.env.local`.

## 4. Test first
DPO provides sandbox credentials and test cards. Set the sandbox Company Token/Service Type in your local environment and test:
1. Add product to cart.
2. Checkout.
3. Redirect to DPO.
4. Complete sandbox payment.
5. Return to `/checkout/success`.
6. Confirm the order changes to `paid` only after server-side `verifyToken`.

## 5. Go live
Replace sandbox credentials with the production credentials issued by DPO after merchant approval.

The application does not collect card numbers or CVV. Payment is completed on DPO's hosted page, and the server verifies the transaction before marking an order as paid.
