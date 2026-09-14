import 'server-only';
import type { PaymentProvider } from './PaymentProvider';
import { PayPesaProvider } from './PayPesaProvider';

/**
 * Single place that decides which PaymentProvider implementation is active.
 * Order/checkout/webhook code should import `getPaymentProvider`, never a
 * concrete provider class directly — that's what makes adding a second
 * provider later (or swapping PayPesa out) a one-line change here.
 */
export function getPaymentProvider(): PaymentProvider {
  return new PayPesaProvider();
}

export * from './PaymentProvider';
