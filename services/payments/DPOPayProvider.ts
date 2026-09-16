import 'server-only';
import type {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  PaymentConfirmation,
  WebhookVerificationResult,
} from './PaymentProvider';
import { PaymentConfigurationError } from './PaymentProvider';

/**
 * DPO Pay by Network (Direct Pay Online) API v6.
 *
 * IMPORTANT:
 * - The CompanyToken and ServiceType are server-only secrets/config.
 * - Card data never touches this application. Customers are redirected to
 *   DPO's hosted checkout.
 * - A payment is marked paid only after this server verifies the transaction
 *   with DPO (verifyToken) and cross-checks amount + currency with our order.
 *
 * DPO's current developer docs specify POST /API/v6/ with XML, createToken,
 * and a hosted URL of https://secure.3gdirectpay.com/payv3.php?ID={token}.
 */
export class DPOPayProvider implements PaymentProvider {
  private get apiUrl() {
    return process.env.DPO_API_URL?.trim() || 'https://secure.3gdirectpay.com/API/v6/';
  }

  private get companyToken() {
    const token = process.env.DPO_COMPANY_TOKEN?.trim();
    if (!token) throw new PaymentConfigurationError('DPO_COMPANY_TOKEN is not set.');
    return token;
  }

  private get serviceType() {
    const value = process.env.DPO_SERVICE_TYPE?.trim();
    if (!value) throw new PaymentConfigurationError('DPO_SERVICE_TYPE is not set.');
    return value;
  }

  private get hostedUrl() {
    return process.env.DPO_HOSTED_CHECKOUT_URL?.trim() || 'https://secure.3gdirectpay.com/payv3.php';
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const siteUrl = new URL(params.returnUrl).origin;
    const serviceDate = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const nameParts = params.customerName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${xmlEscape(this.companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${params.amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>${xmlEscape(params.currency)}</PaymentCurrency>
    <CompanyRef>${xmlEscape(params.orderNumber)}</CompanyRef>
    <OrderNumber>${xmlEscape(params.orderNumber)}</OrderNumber>
    <RedirectURL>${xmlEscape(params.returnUrl)}</RedirectURL>
    <BackURL>${xmlEscape(siteUrl + '/checkout')}</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>24</PTL>
    <customerFirstName>${xmlEscape(firstName)}</customerFirstName>
    <customerLastName>${xmlEscape(lastName)}</customerLastName>
    <customerEmail>${xmlEscape(params.customerEmail)}</customerEmail>
    ${params.customerPhone ? `<customerPhone>${xmlEscape(params.customerPhone)}</customerPhone>` : ''}
    <TransactionSource>Website</TransactionSource>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${xmlEscape(this.serviceType)}</ServiceType>
      <ServiceDescription>${xmlEscape(`LzgPaw order ${params.orderNumber}`)}</ServiceDescription>
      <ServiceDate>${xmlEscape(serviceDate)}</ServiceDate>
      <ServiceRef>${xmlEscape(params.orderNumber)}</ServiceRef>
    </Service>
  </Services>
</API3G>`;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Accept: 'application/xml',
      },
      body: xml,
      cache: 'no-store',
    });

    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`DPO createToken failed (${response.status}).`);
    }

    const result = xmlValue(raw, 'Result');
    const explanation = xmlValue(raw, 'ResultExplanation') || xmlValue(raw, 'Explanation');
    const token = xmlValue(raw, 'TransToken');
    const reference = xmlValue(raw, 'TransRef');

    if (result !== '000') {
      throw new Error(`DPO could not create the payment (${result || 'unknown'}).`);
    }
    if (!token || !reference) {
      throw new Error(`DPO did not return a payment token (${explanation || 'unknown error'}).`);
    }

    const redirectUrl = `${this.hostedUrl}?ID=${encodeURIComponent(token)}`;
    return { redirectUrl, providerReference: token };
  }

  async confirmPayment(params: {
    providerReference?: string | null;
    orderNumber: string;
    amount: number;
    currency: string;
  }): Promise<PaymentConfirmation> {
    const token = params.providerReference?.trim();
    const reference = params.orderNumber.trim();

    if (!token && !reference) {
      return {
        valid: false,
        status: 'unknown',
        providerReference: null,
        amount: null,
        currency: null,
        message: 'Missing DPO transaction reference.',
      };
    }

    const lookupTag = token
      ? `<TransactionToken>${xmlEscape(token)}</TransactionToken>`
      : `<CompanyRef>${xmlEscape(reference)}</CompanyRef>`;

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${xmlEscape(this.companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  ${lookupTag}
  <VerifyTransaction>1</VerifyTransaction>
</API3G>`;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Accept: 'application/xml',
      },
      body: xml,
      cache: 'no-store',
    });

    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`DPO verifyToken failed (${response.status}).`);
    }

    const result = xmlValue(raw, 'Result');
    const explanation = xmlValue(raw, 'ResultExplanation') || xmlValue(raw, 'Explanation');
    const paidAmountRaw = xmlValue(raw, 'TransactionAmount');
    const paidCurrency = xmlValue(raw, 'TransactionCurrency');
    const providerReference = xmlValue(raw, 'TransactionRef') || token || null;

    const paidAmount = paidAmountRaw ? Number(paidAmountRaw) : null;
    const status =
      result === '000'
        ? 'paid'
        : result === '001' || result === '003' || result === '005' || result === '007'
          ? 'pending'
          : result === '904'
            ? 'cancelled'
            : result === '900' || result === '003'
              ? 'pending'
              : result
                ? 'failed'
                : 'unknown';

    // Never trust a successful gateway status if DPO reports a different
    // amount/currency than the order we created.
    if (status === 'paid') {
      const amountMatches = paidAmount != null && Math.abs(paidAmount - params.amount) < 0.01;
      const currencyMatches = !paidCurrency || paidCurrency.toUpperCase() === params.currency.toUpperCase();
      if (!amountMatches || !currencyMatches) {
        return {
          valid: false,
          status: 'failed',
          providerReference,
          amount: paidAmount,
          currency: paidCurrency,
          message: 'Payment verification did not match the order amount or currency.',
        };
      }
    }

    return {
      valid: status !== 'unknown',
      status,
      providerReference,
      amount: paidAmount,
      currency: paidCurrency,
      message: explanation ?? undefined,
    };
  }

  /**
   * DPO's documented flow verifies the transaction after RedirectURL using
   * verifyToken. There is no reason to accept an unauthenticated browser
   * callback as proof of payment, so this generic webhook interface fails
   * closed rather than inventing a signature scheme.
   */
  async verifyWebhook(): Promise<WebhookVerificationResult> {
    return {
      valid: false,
      providerEventId: '',
      eventType: 'unsupported',
      orderReference: null,
      amount: null,
      currency: null,
      status: 'unknown',
    };
  }
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmlValue(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return match?.[1] ? decodeXml(match[1].trim()) : null;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
