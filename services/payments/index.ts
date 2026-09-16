import 'server-only';
import type { PaymentProvider } from './PaymentProvider';
import { DPOPayProvider } from './DPOPayProvider';

export function getPaymentProvider(): PaymentProvider {
  return new DPOPayProvider();
}

export * from './PaymentProvider';
