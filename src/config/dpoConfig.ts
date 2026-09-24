/**
 * DPO Pay (Direct Pay Online Group) Integration Configuration
 * 
 * HAPA NDIPO UNAPOWEKA API KEYS ZA DPO PAY:
 * ==========================================
 * 1. Unaweza kuziweka moja kwa moja kwenye faili hili la:
 *    src/config/dpoConfig.ts
 * 
 * 2. Au unaweza kuziweka kwenye faili la .env (au .env.local):
 *    VITE_DPO_COMPANY_TOKEN="WEKA_COMPANY_TOKEN_YAKO_HAPA"
 *    VITE_DPO_SERVICE_TYPE="WEKA_SERVICE_TYPE_YAKO_HAPA"
 *    VITE_DPO_ENV="production"  // au "sandbox" kwa majaribio
 * 
 * 3. Pia unaweza kuziweka moja kwa moja kutoka kwenye ukurasa wa siri wa Admin:
 *    /#admin -> Nenda kwenye tab ya "DPO Pay API Settings" na ubofye "Save API Settings".
 */

export interface DpoApiCredentials {
  companyToken: string;
  serviceType: string;
  environment: 'sandbox' | 'production';
  endpointUrl: string;
  currency: string;
  redirectUrl?: string;
  backUrl?: string;
}

const DPO_STORAGE_KEY = 'lzgpaw_dpo_api_config_v1';

export const DEFAULT_DPO_CONFIG: DpoApiCredentials = {
  // Weka Company Token uliyopewa na DPO Pay
  companyToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DPO_COMPANY_TOKEN) || 'DPO_COMPANY_TOKEN_PENDING',
  // Weka Service Type Code (e.g. 38549 kwa ecommerce / standard goods)
  serviceType: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DPO_SERVICE_TYPE) || '38549',
  // Chagua 'sandbox' kwa majaribio au 'production' kwa mauzo halisi
  environment: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DPO_ENV === 'production') ? 'production' : 'sandbox',
  // URL ya DPO Pay API
  endpointUrl: 'https://secure.3gdirectpay.com/API/v6/',
  currency: 'USD',
};

export class DpoConfigService {
  public static getCredentials(): DpoApiCredentials {
    try {
      const saved = localStorage.getItem(DPO_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_DPO_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read saved DPO credentials', e);
    }
    return DEFAULT_DPO_CONFIG;
  }

  public static saveCredentials(creds: Partial<DpoApiCredentials>) {
    try {
      const current = this.getCredentials();
      const updated = { ...current, ...creds };
      localStorage.setItem(DPO_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Could not save DPO credentials', e);
      return DEFAULT_DPO_CONFIG;
    }
  }

  public static isConfigured(): boolean {
    const creds = this.getCredentials();
    return creds.companyToken !== 'DPO_COMPANY_TOKEN_PENDING' && creds.companyToken.length > 5;
  }
}
