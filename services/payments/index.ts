import 'server-only';
import type { PaymentProvider } from './PaymentProvider';
import { DPOProvider } from './DPOProvider';

export function getPaymentProvider(): PaymentProvider {
  return new DPOProvider();
}

export * from './PaymentProvider';
