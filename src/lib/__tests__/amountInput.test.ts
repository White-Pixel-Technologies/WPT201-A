import { describe, expect, it } from '@jest/globals';
import { finishAmountInput, formatAmount, sanitizeAmountInput } from '../money';

describe('keypad (G-MON-03, G-MON-04)', () => {
  it('removes leading zeros', () => {
    expect(sanitizeAmountInput('0050')).toBe('50');
  });

  it('turns "." into "0."', () => {
    expect(sanitizeAmountInput('.')).toBe('0.');
  });

  it('blocks a third decimal digit (EC-TXN-02)', () => {
    expect(sanitizeAmountInput('0.001', '0.00')).toBe('0.00');
  });

  it('blocks letters and a second dot', () => {
    expect(sanitizeAmountInput('12a', '12')).toBe('12');
    expect(sanitizeAmountInput('1.2.', '1.2')).toBe('1.2');
  });

  it('allows the maximum 999999999.99 (EC-TXN-03)', () => {
    expect(sanitizeAmountInput('999999999.99')).toBe('999999999.99');
  });

  it('blocks amounts above maximum (EC-TXN-04)', () => {
    expect(sanitizeAmountInput('1000000000', '100000000')).toBe('100000000');
  });

  it('saves "50." as 50.00', () => {
    expect(finishAmountInput('50.')).toBe('50.00');
  });
});

describe('display (G-MON-06)', () => {
  it('hides .00 in lists', () => {
    expect(formatAmount(1200, 'INR', { hideZeroPaise: true })).toBe('₹1,200');
  });

  it('keeps paise when present', () => {
    expect(formatAmount(1200.5, 'INR', { hideZeroPaise: true })).toBe('₹1,200.50');
  });

  it('shows the largest amount', () => {
    expect(formatAmount(999999999.99, 'INR')).toBe('₹99,99,99,999.99');
  });
});
