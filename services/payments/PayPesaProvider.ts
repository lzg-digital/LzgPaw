import 'server-only';
import crypto from 'node:crypto';
import type {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookVerificationResult,
} from './PaymentProvider';
import { PaymentConfigurationError } from './PaymentProvider';

/**
 * ============================================================================
 * PayPesa Merchant API — INTEGRATION POINT, NOT A CONFIRMED IMPLEMENTATION
 * ============================================================================
 *
 * A search for PayPesa's official Merchant API documentation did not surface
 * a publicly indexed spec at the time this was written. Per the build brief:
 * "If exact API documentation is unavailable, create a clean
 * payment-provider abstraction and clearly mark the PayPesa integration
 * point instead of inventing an API." That's exactly what this file is.
 *
 * Every line below marked `// CONFIRM:` is a guess at a plausible REST
 * shape (endpoint path, field names, header names, signature scheme) and
 * MUST be checked against PayPesa's actual merchant dashboard / API
 * reference before this ever runs against real money. Until every
 * `CONFIRM` is resolved, treat this provider as **not production-ready** —
 * `createPayment` intentionally throws if the base URL isn't configured, and
 * `verifyWebhook` is written to fail closed (returns `valid: false`) rather
 * than risk marking a fake payment as real.
 *
 * What IS solid regardless of the exact PayPesa shape:
 *   - Secrets only ever come from server-side env vars (never NEXT_PUBLIC_).
 *   - Webhook verification happens against the raw request body.
 *   - The order/amount/currency cross-check against our own database
 *     happens in the webhook route, not here — this file only answers
 *     "is this request authentically from PayPesa," never "should we trust
 *     what it says."
 * ============================================================================
 */
export class PayPesaProvider implements PaymentProvider {
  private get apiBaseUrl() {
    const url = process.env.PAYPESA_API_BASE_URL;
    if (!url) {
      throw new PaymentConfigurationError(
        'PAYPESA_API_BASE_URL is not set. Add it (and the other PAYPESA_* vars) to your environment before accepting payments — see .env.example.'
      );
    }
    return url;
  }

  private get apiKey() {
    const key = process.env.PAYPESA_API_KEY;
    if (!key) throw new PaymentConfigurationError('PAYPESA_API_KEY is not set.');
    return key;
  }

  private get merchantId() {
    const id = process.env.PAYPESA_MERCHANT_ID;
    if (!id) throw new PaymentConfigurationError('PAYPESA_MERCHANT_ID is not set.');
    return id;
  }

  private get webhookSecret() {
    const secret = process.env.PAYPESA_WEBHOOK_SECRET;
    if (!secret) throw new PaymentConfigurationError('PAYPESA_WEBHOOK_SECRET is not set.');
    return secret;
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    // CONFIRM: exact endpoint path. Placeholder assumes a "create checkout
    // session" style REST endpoint, which is the most common pattern among
    // hosted-payment-page providers — but PayPesa's real path may differ.
    const endpoint = `${this.apiBaseUrl}/v1/checkout/sessions`;

    // CONFIRM: exact field names, auth scheme (Bearer token shown here is a
    // guess — PayPesa may use an HMAC-signed request, an API-key header, or
    // OAuth2 client-credentials instead).
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-Merchant-Id': this.merchantId,
      },
      body: JSON.stringify({
        merchant_reference: params.orderNumber,
        amount: params.amount,
        currency: params.currency,
        customer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
        },
        return_url: params.returnUrl,
        // CONFIRM: PayPesa's webhook/callback URL is very likely configured
        // once in their merchant dashboard rather than per-request — remove
        // this field if so.
        webhook_url: `${new URL(params.returnUrl).origin}/api/webhooks/paypesa`,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`PayPesa createPayment failed (${response.status}): ${body}`);
    }

    const data = await response.json();

    // CONFIRM: response field names for the hosted-page URL and the
    // provider's own transaction/session id.
    const redirectUrl = data.checkout_url ?? data.redirect_url;
    const providerReference = data.session_id ?? data.transaction_id;

    if (!redirectUrl || !providerReference) {
      throw new Error('PayPesa createPayment response did not include the expected fields.');
    }

    return { redirectUrl, providerReference };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    // CONFIRM: the actual signature header name and algorithm PayPesa uses.
    // HMAC-SHA256 over the raw body with a shared secret (as implemented
    // below) is the most common pattern across payment providers generally,
    // but must be verified against PayPesa's docs before going live.
    const signatureHeader = headers.get('x-paypesa-signature');

    if (!signatureHeader) {
      return {
        valid: false,
        providerEventId: '',
        eventType: 'unknown',
        orderReference: null,
        amount: null,
        currency: null,
        status: 'unknown',
      };
    }

    let secret: string;
    try {
      secret = this.webhookSecret;
    } catch {
      // Fail closed: no configured secret means we cannot verify anything.
      return {
        valid: false,
        providerEventId: '',
        eventType: 'unknown',
        orderReference: null,
        amount: null,
        currency: null,
        status: 'unknown',
      };
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const valid =
      signatureHeader.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));

    if (!valid) {
      return {
        valid: false,
        providerEventId: '',
        eventType: 'unknown',
        orderReference: null,
        amount: null,
        currency: null,
        status: 'unknown',
      };
    }

    // CONFIRM: exact payload field names PayPesa sends in a webhook body.
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        valid: false,
        providerEventId: '',
        eventType: 'unknown',
        orderReference: null,
        amount: null,
        currency: null,
        status: 'unknown',
      };
    }

    const statusMap: Record<string, WebhookVerificationResult['status']> = {
      completed: 'paid',
      success: 'paid',
      paid: 'paid',
      failed: 'failed',
      declined: 'failed',
      cancelled: 'cancelled',
    };

    return {
      valid: true,
      providerEventId: payload.event_id ?? payload.id,
      eventType: payload.event_type ?? payload.type ?? 'payment_update',
      orderReference: payload.merchant_reference ?? payload.reference ?? null,
      amount: typeof payload.amount === 'number' ? payload.amount : null,
      currency: payload.currency ?? null,
      status: statusMap[String(payload.status).toLowerCase()] ?? 'unknown',
    };
  }
}
