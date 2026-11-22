
import { describe, expect, it } from '@jest/globals';
import { cleanPastedAmount, formatAmount, formatShortAmount } from '../money';

describe('cleanPastedAmount (G-MON-05)', () => {
  it('cleans rupee symbols, trailing /-, spaces and commas', () => {
    expect(cleanPastedAmount('₹1,20,000.50')).toBe('120000.50');
    expect(cleanPastedAmount('Rs. 1,200/-')).toBe('1200');
    expect(cleanPastedAmount('1200 Rs')).toBe('1200');
    expect(cleanPastedAmount('₹ 500 /-')).toBe('500');
  });

  it('handles foreign currencies and codes', () => {
    expect(cleanPastedAmount('$1,250.00', 'USD')).toBe('1250.00');
    expect(cleanPastedAmount('AED 2,500.75', 'AED')).toBe('2500.75');
  });

  it('rejects invalid amounts or negative amounts', () => {
    expect(cleanPastedAmount('')).toBeNull();
    expect(cleanPastedAmount('abc')).toBeNull();
    expect(cleanPastedAmount('-50')).toBeNull();
    expect(cleanPastedAmount('0')).toBeNull();
    expect(cleanPastedAmount('12.345')).toBeNull(); // more than 2 decimals
    expect(cleanPastedAmount('10000000000')).toBeNull(); // over max
  });
});

describe('formatAmount (G-MON-06, G-MON-07)', () => {
  it('formats INR with Indian grouping', () => {
    expect(formatAmount(100000)).toBe('₹1,00,000.00');
    expect(formatAmount(999999999.99)).toBe('₹99,99,99,999.99');
  });

  it('supports hiding .00 when whole amount (lists/home)', () => {
    expect(formatAmount(1200, 'INR', { hideZeroPaise: true })).toBe('₹1,200');
    expect(formatAmount(1200.5, 'INR', { hideZeroPaise: true })).toBe(
      '₹1,200.50',
    );
  });

  it('formats negative amounts with minus sign', () => {
    expect(formatAmount(-500, 'INR', { hideZeroPaise: true })).toBe('−₹500');
  });

  it('formats other currencies with standard grouping', () => {
    expect(formatAmount(1234567.89, 'USD')).toBe('$1,234,567.89');
    expect(formatAmount(1250, 'AED')).toBe('AED 1,250.00');
    expect(formatAmount(1250, 'SGD')).toBe('S$ 1,250.00');
    expect(formatAmount(1250, 'AUD')).toBe('A$ 1,250.00');
    expect(formatAmount(1250, 'CAD')).toBe('C$ 1,250.00');
  });
});

describe('formatShortAmount (G-MON-08)', () => {
  it('formats INR amounts using K, L, Cr', () => {
    expect(formatShortAmount(950)).toBe('₹950');
    expect(formatShortAmount(12500)).toBe('₹12.5K');
    expect(formatShortAmount(340000)).toBe('₹3.4L');
    expect(formatShortAmount(21000000)).toBe('₹2.1Cr');
  });

  it('formats negative amounts correctly', () => {
    expect(formatShortAmount(-12500)).toBe('−₹12.5K');
  });

  it('formats non-INR currencies using K, M, B', () => {
    expect(formatShortAmount(1200000, 'USD')).toBe('$1.2M');
    expect(formatShortAmount(1500000000, 'USD')).toBe('$1.5B');
  });
});
