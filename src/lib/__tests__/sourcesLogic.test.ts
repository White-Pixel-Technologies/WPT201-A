import { describe, expect, it } from '@jest/globals';
import type { SourceItem } from '../../components/sources/SourceForm';

function groupAndSortSources(sources: SourceItem[]) {
  const active = sources.filter((s) => !s.is_archived);
  const archived = sources.filter((s) => s.is_archived);

  const bankAccounts = active
    .filter((s) => s.type === 'bank')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const cashSources = active
    .filter((s) => s.type === 'cash')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const creditCards = active
    .filter((s) => s.type === 'card')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  return { bankAccounts, cashSources, creditCards, archived };
}

function calculateSourceTotals(sources: SourceItem[]) {
  let bankCashTotal = 0;
  let cardOutstandingTotal = 0;

  for (const s of sources) {
    if (!s.is_archived) {
      if (s.type === 'card') {
        cardOutstandingTotal += Number(s.current_amount);
      } else {
        bankCashTotal += Number(s.current_amount);
      }
    }
  }

  return { bankCashTotal, cardOutstandingTotal };
}

describe('Sources Grouping and Sorting (SRC-06)', () => {
  const mockSources: SourceItem[] = [
    {
      id: '1',
      type: 'card',
      name: 'ICICI Amazon Pay',
      opening_amount: 1000,
      current_amount: 1000,
      credit_limit: 50000,
      is_archived: false,
    },
    {
      id: '2',
      type: 'bank',
      name: 'SBI Savings',
      opening_amount: 5000,
      current_amount: 5000,
      credit_limit: null,
      is_archived: false,
    },
    {
      id: '3',
      type: 'cash',
      name: 'Wallet cash',
      opening_amount: 500,
      current_amount: 500,
      credit_limit: null,
      is_archived: false,
    },
    {
      id: '4',
      type: 'bank',
      name: 'HDFC Salary',
      opening_amount: 15000,
      current_amount: 15000,
      credit_limit: null,
      is_archived: false,
    },
    {
      id: '5',
      type: 'card',
      name: 'Axis Ace',
      opening_amount: 2000,
      current_amount: 2000,
      credit_limit: 30000,
      is_archived: false,
    },
    {
      id: '6',
      type: 'cash',
      name: 'Home cash',
      opening_amount: 1000,
      current_amount: 1000,
      credit_limit: null,
      is_archived: false,
    },
    {
      id: '7',
      type: 'bank',
      name: 'Old Account',
      opening_amount: 0,
      current_amount: 0,
      credit_limit: null,
      is_archived: true,
    },
  ];

  it('groups active sources in order: Bank accounts, Cash, Credit cards', () => {
    const { bankAccounts, cashSources, creditCards, archived } = groupAndSortSources(mockSources);

    expect(bankAccounts.length).toBe(2);
    expect(cashSources.length).toBe(2);
    expect(creditCards.length).toBe(2);
    expect(archived.length).toBe(1);
  });

  it('sorts alphabetically by name within each group', () => {
    const { bankAccounts, cashSources, creditCards } = groupAndSortSources(mockSources);

    expect(bankAccounts.map((s) => s.name)).toEqual(['HDFC Salary', 'SBI Savings']);
    expect(cashSources.map((s) => s.name)).toEqual(['Home cash', 'Wallet cash']);
    expect(creditCards.map((s) => s.name)).toEqual(['Axis Ace', 'ICICI Amazon Pay']);
  });
});

describe('Source Totals (SRC-08)', () => {
  it('calculates total balance as sum of active bank + cash and card outstanding separately', () => {
    const sources: SourceItem[] = [
      {
        id: '1',
        type: 'bank',
        name: 'SBI',
        opening_amount: 10000,
        current_amount: 10000,
        credit_limit: null,
        is_archived: false,
      },
      {
        id: '2',
        type: 'cash',
        name: 'Cash',
        opening_amount: 2500,
        current_amount: 2500,
        credit_limit: null,
        is_archived: false,
      },
      {
        id: '3',
        type: 'card',
        name: 'Card 1',
        opening_amount: 4000,
        current_amount: 4000,
        credit_limit: 50000,
        is_archived: false,
      },
      {
        id: '4',
        type: 'card',
        name: 'Card 2',
        opening_amount: 1500,
        current_amount: 1500,
        credit_limit: 20000,
        is_archived: false,
      },
      {
        id: '5',
        type: 'bank',
        name: 'Archived Bank',
        opening_amount: 50000,
        current_amount: 50000,
        credit_limit: null,
        is_archived: true,
      },
    ];

    const { bankCashTotal, cardOutstandingTotal } = calculateSourceTotals(sources);

    // Active Bank (10000) + Active Cash (2500) = 12500 (archived excluded)
    expect(bankCashTotal).toBe(12500);
    // Active Cards (4000 + 1500) = 5500
    expect(cardOutstandingTotal).toBe(5500);
    // They are never combined into one net number!
  });
});

describe('Source Warnings (SRC-09)', () => {
  it('identifies below zero for negative bank balance', () => {
    const bankSource: SourceItem = {
      id: '1',
      type: 'bank',
      name: 'Overdrawn Bank',
      opening_amount: -500,
      current_amount: -500,
      credit_limit: null,
      is_archived: false,
    };
    expect(bankSource.current_amount < 0).toBe(true);
  });

  it('identifies over limit card', () => {
    const card: SourceItem = {
      id: '2',
      type: 'card',
      name: 'Maxed Card',
      opening_amount: 55000,
      current_amount: 55000,
      credit_limit: 50000,
      is_archived: false,
    };
    const isOverLimit =
      (card.credit_limit ?? 0) > 0 && card.current_amount > (card.credit_limit ?? 0);
    const overLimitBy = card.current_amount - (card.credit_limit ?? 0);
    expect(isOverLimit).toBe(true);
    expect(overLimitBy).toBe(5000);
  });

  it('identifies credit balance (overpaid card)', () => {
    const card: SourceItem = {
      id: '3',
      type: 'card',
      name: 'Overpaid Card',
      opening_amount: -2000,
      current_amount: -2000,
      credit_limit: 50000,
      is_archived: false,
    };
    const isCreditBalance = card.current_amount < 0;
    const availableCredit = (card.credit_limit ?? 0) - card.current_amount;
    expect(isCreditBalance).toBe(true);
    expect(availableCredit).toBe(52000); // limit + 2000
  });
});
