export interface Currency {
  code: string;
  name: string;
  symbol: string;
  prefix: boolean;
  useSpace: boolean;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', prefix: true, useSpace: false },
  { code: 'USD', name: 'US Dollar', symbol: '$', prefix: true, useSpace: false },
  { code: 'EUR', name: 'Euro', symbol: '€', prefix: true, useSpace: false },
  { code: 'GBP', name: 'British Pound', symbol: '£', prefix: true, useSpace: false },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', prefix: true, useSpace: false },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', prefix: true, useSpace: false },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', prefix: true, useSpace: false },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', prefix: true, useSpace: false },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', prefix: true, useSpace: false },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', prefix: true, useSpace: true },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', prefix: true, useSpace: true },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', prefix: true, useSpace: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', prefix: true, useSpace: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', prefix: true, useSpace: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', prefix: true, useSpace: true },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD', prefix: true, useSpace: true },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', prefix: true, useSpace: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', prefix: true, useSpace: true },
];

export const CURRENCY_MAP = new Map<string, Currency>(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

export function getCurrency(code: string | null | undefined): Currency {
  if (!code) return SUPPORTED_CURRENCIES[0];
  return CURRENCY_MAP.get(code.toUpperCase()) ?? SUPPORTED_CURRENCIES[0];
}

/** Pre-select currency based on user's region/locale (ONB-03). Defaults to INR. */
export function detectDefaultCurrency(): string {
  try {
    let locale = '';
    if (typeof navigator !== 'undefined' && navigator.language) {
      locale = navigator.language;
    } else if (typeof Intl !== 'undefined') {
      locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    }

    const parts = locale.split(/[-_]/);
    const country = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';

    const countryToCurrency: Record<string, string> = {
      IN: 'INR',
      US: 'USD',
      GB: 'GBP',
      JP: 'JPY',
      BD: 'BDT',
      SG: 'SGD',
      AU: 'AUD',
      CA: 'CAD',
      MY: 'MYR',
      LK: 'LKR',
      NP: 'NPR',
      AE: 'AED',
      SA: 'SAR',
      QA: 'QAR',
      KW: 'KWD',
      OM: 'OMR',
      CH: 'CHF',
      DE: 'EUR',
      FR: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
      NL: 'EUR',
      BE: 'EUR',
      AT: 'EUR',
      IE: 'EUR',
      PT: 'EUR',
      FI: 'EUR',
      GR: 'EUR',
    };

    if (country && countryToCurrency[country]) {
      return countryToCurrency[country];
    }
  } catch {
    // ignore
  }

  return 'INR';
}
