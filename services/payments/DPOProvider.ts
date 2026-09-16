import 'server-only';
import type {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookVerificationResult,
} from './PaymentProvider';
import { PaymentConfigurationError } from './PaymentProvider';

const DPO_ENDPOINT = 'https://secure.3gdirectpay.com/API/v6/';

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]!));
}

function xmlValue(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? match[1].trim() : null;
}

function parseAmount(value: string | null): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export class DPOProvider implements PaymentProvider {
  private get companyToken() {
    const token = process.env.DPO_COMPANY_TOKEN;
    if (!token) throw new PaymentConfigurationError('DPO_COMPANY_TOKEN is not configured.');
    return token;
  }

  private get serviceType() {
    const service = process.env.DPO_SERVICE_TYPE;
    if (!service) throw new PaymentConfigurationError('DPO_SERVICE_TYPE is not configured.');
    return service;
  }

  private get endpoint() {
    return process.env.DPO_API_URL || DPO_ENDPOINT;
  }

  private async callDpo(xml: string): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Accept: 'application/xml',
      },
      body: xml,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    const body = await response.text();
    if (!response.ok) throw new Error(`DPO API HTTP ${response.status}`);
    return body;
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const siteUrl = new URL(params.returnUrl).origin;
    const redirectUrl = params.returnUrl;
    const backUrl = `${siteUrl}/api/webhooks/dpo`;
    const amount = params.amount.toFixed(2);
    const [firstName, ...lastParts] = params.customerName.trim().split(/\s+/);
    const lastName = lastParts.join(' ') || firstName;

    const xml = `<?xml version="1.0" encoding="utf-8"?>\n<API3G>\n` +
      `<CompanyToken>${escapeXml(this.companyToken)}</CompanyToken>` +
      `<Request>createToken</Request>` +
      `<Transaction>` +
      `<PaymentAmount>${amount}</PaymentAmount>` +
      `<PaymentCurrency>${escapeXml(params.currency.toUpperCase())}</PaymentCurrency>` +
      `<CompanyRef>${escapeXml(params.orderNumber)}</CompanyRef>` +
      `<CompanyRefUnique>1</CompanyRefUnique>` +
      `<OrderNumber>${escapeXml(params.orderNumber)}</OrderNumber>` +
      `<RedirectURL>${escapeXml(redirectUrl)}</RedirectURL>` +
      `<BackURL>${escapeXml(backUrl)}</BackURL>` +
      `<PTL>24</PTL>` +
      `<customerFirstName>${escapeXml(firstName)}</customerFirstName>` +
      `<customerLastName>${escapeXml(lastName)}</customerLastName>` +
      `<customerEmail>${escapeXml(params.customerEmail)}</customerEmail>` +
      `<customerPhone>${escapeXml(params.customerPhone ?? '')}</customerPhone>` +
      `<TransactionSource>Website</TransactionSource>` +
      `</Transaction>` +
      `<Services><Service>` +
      `<ServiceType>${escapeXml(this.serviceType)}</ServiceType>` +
      `<ServiceDescription>${escapeXml(`LzgPaw order ${params.orderNumber}`)}</ServiceDescription>` +
      `<ServiceDate>${new Date().toISOString().slice(0, 16).replace('T', ' ')}</ServiceDate>` +
      `</Service></Services>` +
      `</API3G>`;

    const responseXml = await this.callDpo(xml);
    const result = xmlValue(responseXml, 'Result');
    const explanation = xmlValue(responseXml, 'ResultExplanation') || 'DPO payment creation failed.';
    const token = xmlValue(responseXml, 'TransToken');
    const reference = xmlValue(responseXml, 'TransRef');

    if (result !== '000' || !token) {
      throw new Error(`DPO createToken failed (${result ?? 'unknown'}): ${explanation}`);
    }

    return {
      redirectUrl: `https://secure.3gdirectpay.com/payv2.php?ID=${encodeURIComponent(token)}`,
      providerReference: reference || token,
    };
  }

  async verifyWebhook(rawBody: string, _headers: Headers): Promise<WebhookVerificationResult> {
    const params = new URLSearchParams(rawBody);
    const transactionToken = params.get('TransactionToken') || params.get('TransToken');
    const companyRef = params.get('CompanyRef');

    if (!transactionToken && !companyRef) {
      return this.invalid('Missing DPO transaction token/reference.');
    }

    let xml = `<?xml version="1.0" encoding="utf-8"?>\n<API3G>` +
      `<CompanyToken>${escapeXml(this.companyToken)}</CompanyToken>` +
      `<Request>verifyToken</Request>`;
    if (transactionToken) xml += `<TransactionToken>${escapeXml(transactionToken)}</TransactionToken>`;
    else xml += `<CompanyRef>${escapeXml(companyRef!)}</CompanyRef>`;
    xml += `<VerifyTransaction>1</VerifyTransaction></API3G>`;

    const responseXml = await this.callDpo(xml);
    const result = xmlValue(responseXml, 'Result');
    const explanation = xmlValue(responseXml, 'ResultExplanation') || '';
    const amount = parseAmount(xmlValue(responseXml, 'TransactionFinalAmount') || xmlValue(responseXml, 'TransactionAmount'));
    const currency = xmlValue(responseXml, 'TransactionFinalCurrency') || xmlValue(responseXml, 'TransactionCurrency');
    const verifiedReference = xmlValue(responseXml, 'CompanyRef') || companyRef;
    const providerId = xmlValue(responseXml, 'TransactionRef') || xmlValue(responseXml, 'TransRef') || transactionToken || companyRef || '';

    const status: WebhookVerificationResult['status'] =
      result === '000' ? 'paid' : result === '900' || result === '003' || result === '001' || result === '005' || result === '007' ? 'unknown' : result === '904' ? 'cancelled' : 'failed';

    return {
      valid: result != null,
      providerEventId: providerId,
      eventType: `dpo:${result ?? 'unknown'}`,
      orderReference: verifiedReference,
      amount,
      currency,
      status,
    };
  }

  private invalid(message: string): WebhookVerificationResult {
    console.warn(`[dpo] ${message}`);
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
}
