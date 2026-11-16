import { describe, expect, it } from '@jest/globals';
import {
  SUPPORTED_CURRENCIES,
  getCurrency,
  detectDefaultCurrency,
} from '../currencies';

describe('currencies (CUR-01)', () => {
  it('contains all 18 supported currencies', () => {
    expect(SUPPORTED_CURRENCIES.length).toBe(18);
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain('INR');
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('JPY');
    expect(codes).toContain('BDT');
    expect(codes).toContain('SGD');
    expect(codes).toContain('AUD');
    expect(codes).toContain('CAD');
    expect(codes).toContain('MYR');
    expect(codes).toContain('LKR');
    expect(codes).toContain('NPR');
    expect(codes).toContain('AED');
    expect(codes).toContain('SAR');
    expect(codes).toContain('QAR');
    expect(codes).toContain('KWD');
    expect(codes).toContain('OMR');
    expect(codes).toContain('CHF');
  });

  it('defaults to INR if code is unknown or missing', () => {
    expect(getCurrency(null).code).toBe('INR');
    expect(getCurrency('UNKNOWN').code).toBe('INR');
  });

  it('detects default currency or falls back to INR', () => {
    const detected = detectDefaultCurrency();
    expect(typeof detected).toBe('string');
    expect(detected.length).toBe(3);
  });
});
