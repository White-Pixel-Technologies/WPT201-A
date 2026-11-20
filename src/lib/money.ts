import { getCurrency } from '../constants/currencies';

/**
 * Pasting into amount fields (G-MON-05):
 * 1. Remove these, in any case and whether before or after the number:
 *    ₹, Rs., Rs, INR, and the selected currency's symbol or code.
 * 2. Remove a trailing "/-".
 * 3. Remove spaces and commas.
 * 4. If the result is a valid amount, return it as string. Otherwise return null.
 *
 * Examples from PRD:
 * "₹1,20,000.50" -> 120000.50
 * "Rs. 1,200/-" -> 1200.00
 * "1200 Rs" -> 1200.00
 */
export function cleanPastedAmount(
    input: string,
    currencyCode = 'INR'
): string | null {
    if (!input || typeof input !== 'string') return null;

    let str = input.trim();

    // 1. Remove trailing "/-" (or "/="), allowing optional whitespace
    str = str.replace(/\s*\/[-=]\s*$/, '');

    // 2. Remove known symbols and codes
    const curr = getCurrency(currencyCode);
    const rawSymbols = ['₹', 'Rs.', 'Rs', 'INR', curr.code, curr.symbol];
    for (const sym of rawSymbols) {
        if (!sym) continue;
        const escaped = sym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        str = str.replace(regex, '');
    }

    // 3. Remove spaces and commas
    str = str.replace(/[\s,]/g, '');

    // 4. Handle leading dot e.g. ".50" -> "0.50"
    if (str.startsWith('.')) {
        str = '0' + str;
    }

    // Remove leading zeros ("0050" -> "50", but "0.50" -> "0.50")
    if (/^0+[0-9]/.test(str)) {
        str = str.replace(/^0+/, '');
    }

    // Validate format (digits with optional 1 or 2 decimal places)
    if (!/^\d+(\.\d{1,2})?$/.test(str)) {
        return null;
    }

    const num = parseFloat(str);
    if (!Number.isFinite(num) || num <= 0 || num > 999999999.99) {
        return null;
    }

    return str;
}

/**
 * Format Indian number grouping:
 * e.g. 100000 -> "1,00,000"
 */
function formatIndianGrouping(intStr: string): string {
    if (intStr.length <= 3) return intStr;
    const lastThree = intStr.slice(-3);
    const rest = intStr.slice(0, -3);
    const pairs = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return pairs + ',' + lastThree;
}

/**
 * Format standard number grouping (thousands):
 * e.g. 1000000 -> "1,000,000"
 */
function formatStandardGrouping(intStr: string): string {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Display format for amounts (G-MON-06, G-MON-07):
 * INR: Indian grouping with symbol, e.g. ₹1,00,000.00
 * - hideZeroPaise: if true and whole amount, hide ".00" (e.g. ₹1,200). Always show paise when present (₹1,200.50).
 */
export function formatAmount(
    amount: number,
    currencyCode = 'INR',
    options: { hideZeroPaise?: boolean } = {}
): string {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const fixed = absAmount.toFixed(2);
    const [intPart, decPart] = fixed.split('.');

    const isINR = currencyCode.toUpperCase() === 'INR';
    const groupedInt = isINR
        ? formatIndianGrouping(intPart)
        : formatStandardGrouping(intPart);

    let formattedNumber = groupedInt;
    if (options.hideZeroPaise && decPart === '00') {
        formattedNumber = groupedInt;
    } else {
        formattedNumber = `${groupedInt}.${decPart}`;
    }

    const curr = getCurrency(currencyCode);
    const sign = isNegative ? '−' : '';
    const space = curr.useSpace ? ' ' : '';

    if (curr.prefix) {
        return `${sign}${curr.symbol}${space}${formattedNumber}`;
    }
    return `${sign}${formattedNumber}${space}${curr.symbol}`;
}

/**
 * Short format (G-MON-08):
 * Chart labels and small tiles only, always with one decimal:
 * - Below 1,000: full amount (₹950)
 * - From 1,000: K (₹12.5K)
 * - INR from 1,00,000: L (₹3.4L). INR from 1,00,00,000: Cr (₹2.1Cr)
 * - Other currencies: M from 1,000,000 and B from 1,000,000,000
 */
export function formatShortAmount(
    amount: number,
    currencyCode = 'INR'
): string {
    const isNegative = amount < 0;
    const abs = Math.abs(amount);
    const isINR = currencyCode.toUpperCase() === 'INR';
    const curr = getCurrency(currencyCode);
    const sign = isNegative ? '−' : '';
    const space = curr.useSpace ? ' ' : '';

    let valueStr = '';
    let suffix = '';

    if (isINR) {
        if (abs >= 10000000) {
            // 1 Cr = 1,00,00,000
            valueStr = (abs / 10000000).toFixed(1);
            suffix = 'Cr';
        } else if (abs >= 100000) {
            // 1 L = 1,00,000
            valueStr = (abs / 100000).toFixed(1);
            suffix = 'L';
        } else if (abs >= 1000) {
            // 1 K = 1,000
            valueStr = (abs / 1000).toFixed(1);
            suffix = 'K';
        } else {
            valueStr = Math.round(abs).toString();
        }
    } else {
        if (abs >= 1000000000) {
            valueStr = (abs / 1000000000).toFixed(1);
            suffix = 'B';
        } else if (abs >= 1000000) {
            valueStr = (abs / 1000000).toFixed(1);
            suffix = 'M';
        } else if (abs >= 1000) {
            valueStr = (abs / 1000).toFixed(1);
            suffix = 'K';
        } else {
            valueStr = Math.round(abs).toString();
        }
    }

    return `${sign}${curr.symbol}${space}${valueStr}${suffix}`;
}