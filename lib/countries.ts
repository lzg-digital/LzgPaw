export interface CountryOption {
  name: string;
  code: string; // ISO 3166-1 alpha-2
}

// Not exhaustive — covers the US plus the other markets named in the brief
// as priorities, plus a broad set of major English/EU/Gulf/African/Asian
// markets. Add more as LzgPaw expands; the checkout schema (lib/validation.ts)
// accepts any 2-letter code, so this list only limits what's easy to pick
// from a dropdown, not what the system can process.
export const COUNTRIES: CountryOption[] = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Australia', code: 'AU' },
  { name: 'New Zealand', code: 'NZ' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Norway', code: 'NO' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Finland', code: 'FI' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Austria', code: 'AT' },
  { name: 'Poland', code: 'PL' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Tanzania', code: 'TZ' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Ghana', code: 'GH' },
  { name: 'India', code: 'IN' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Mexico', code: 'MX' },
];
