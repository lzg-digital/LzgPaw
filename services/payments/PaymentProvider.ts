/**
 * Payment provider abstraction.
 *
 * Checkout (`app/api/checkout/route.ts`) and the webhook handler
 * (`app/api/webhooks/dpo/route.ts`) depend ONLY on this interface —
 * never on a specific provider's request/response shape. That means
 * swapping or adding a payment provider later never touches order logic.
 */

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Where the provider should send the browser back to after payment. */
  returnUrl: string;
}

export interface CreatePaymentResult {
  /** URL to send the customer's browser to (a hosted payment page). */
  redirectUrl: string;
  /** The provider's own id for this payment attempt — stored on the order
   * as `payment_reference` so the webhook can be matched back to it. */
  providerReference: string;
}

export interface WebhookVerificationResult {
  /** False on any signature/authenticity failure. A false result must
   * always be rejected with 401/400 — never processed "anyway". */
  valid: boolean;
  /** Provider's unique id for this specific event delivery — the
   * idempotency key stored in `payment_events.provider_event_id`. */
  providerEventId: string;
  eventType: string;
  /** Maps back to our order — must equal `orders.order_number` or
   * `orders.id`; the webhook handler rejects anything that doesn't. */
  orderReference: string | null;
  amount: number | null;
  currency: string | null;
  status: 'paid' | 'failed' | 'cancelled' | 'unknown';
}

export interface PaymentProvider {
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  /**
   * @param rawBody The exact, unparsed request body bytes/string. Signature
   * verification MUST run against the raw body, not a re-serialized JSON
   * object — re-serializing can change byte-for-byte content and silently
   * break signature checks.
   */
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult>;
}

export class PaymentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentConfigurationError';
  }
}
