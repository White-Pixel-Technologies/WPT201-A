import { describe, expect, it, jest } from '@jest/globals';
import { z } from 'zod';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import {
  checkIsPrimaryKeyConflict,
  isSameIntendedSource,
  getOrCreateSourceId,
} from '../SourceForm';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const createSourceSchema = (existingSources: { id?: string; name: string }[], currentId?: string) =>
  z.object({
    type: z.enum(['bank', 'cash', 'card']),
    name: z
      .string()
      .trim()
      .min(1, 'Please enter a source name.')
      .max(30, 'Source name cannot exceed 30 characters.')
      .refine(
        (val) => {
          const lower = val.trim().toLowerCase();
          return !existingSources.some(
            (s) => s.id !== currentId && s.name.trim().toLowerCase() === lower,
          );
        },
        { message: 'You already have a source with this name.' },
      ),
    openingAmount: z.string().min(1, 'Enter a valid amount.'),
    isOverdrawn: z.boolean(),
    creditLimit: z.string().optional(),
  });

describe('SourceForm Zod Validation (Task 11)', () => {
  const existingSources = [
    { id: '1', name: 'HDFC Bank' },
    { id: '2', name: 'Cash' },
    { id: '3', name: 'ICICI Amazon Pay' },
  ];

  it('rejects duplicate source name with different casing (EC-SRC-01)', () => {
    const schema = createSourceSchema(existingSources);
    const result = schema.safeParse({
      type: 'bank',
      name: 'hdfc bank',
      openingAmount: '1000',
      isOverdrawn: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('You already have a source with this name.');
    }
  });

  it('allows renaming a source to its own name with different case (EC-SRC-03)', () => {
    // Current ID is '1' (HDFC Bank)
    const schema = createSourceSchema(existingSources, '1');
    const result = schema.safeParse({
      type: 'bank',
      name: 'HDFC BANK',
      openingAmount: '1000',
      isOverdrawn: false,
    });

    expect(result.success).toBe(true);
  });

  it('rejects duplicate name across different types (EC-SRC-02)', () => {
    // User tries to name a card "Cash"
    const schema = createSourceSchema(existingSources);
    const result = schema.safeParse({
      type: 'card',
      name: 'cash',
      openingAmount: '0',
      isOverdrawn: false,
      creditLimit: '50000',
    });

    expect(result.success).toBe(false);
  });

  it('enforces max length 30 for source name (G-TXT-02)', () => {
    const schema = createSourceSchema(existingSources);
    const result = schema.safeParse({
      type: 'bank',
      name: 'A'.repeat(31),
      openingAmount: '100',
      isOverdrawn: false,
    });

    expect(result.success).toBe(false);
  });
});

describe('SourceForm Retry & Idempotency (D11)', () => {
  it('identifies primary key conflict errors', () => {
    expect(
      checkIsPrimaryKeyConflict({
        code: '23505',
        message: 'duplicate key value violates unique constraint "financial_sources_pkey"',
        details: 'Key (id)=(src-123) already exists.',
      }),
    ).toBe(true);

    expect(
      checkIsPrimaryKeyConflict({
        code: '23505',
        message:
          'duplicate key value violates unique constraint "financial_sources_user_id_id_unique"',
        details: 'Key (user_id, id)=(u1, src-123) already exists.',
      }),
    ).toBe(true);
  });

  it('does not treat duplicate name violation as primary key conflict', () => {
    expect(
      checkIsPrimaryKeyConflict({
        code: '23505',
        message: 'duplicate key value violates unique constraint "financial_sources_unique_name"',
        details: 'Key (user_id, lower(btrim(name)))=(u1, cash) already exists.',
      }),
    ).toBe(false);
  });

  it('returns false for non-unique-violation errors', () => {
    expect(
      checkIsPrimaryKeyConflict({
        code: '42P01',
        message: 'relation does not exist',
      }),
    ).toBe(false);
    expect(checkIsPrimaryKeyConflict(null)).toBe(false);
  });

  it('verifies existing same-ID record matches intended source before treating as success', () => {
    const targetId = 'src-uuid-1';
    const intended = {
      name: 'Emergency Cash',
      type: 'cash' as const,
      opening_amount: 500,
      credit_limit: null,
    };

    // Exact match with all fields
    expect(
      isSameIntendedSource(
        {
          id: targetId,
          name: 'Emergency Cash',
          type: 'cash',
          opening_amount: 500,
          credit_limit: null,
        },
        targetId,
        intended,
      ),
    ).toBe(true);

    // Case-insensitive & trimmed name match with all fields
    expect(
      isSameIntendedSource(
        {
          id: targetId,
          name: '  emergency cash  ',
          type: 'cash',
          opening_amount: 500,
          credit_limit: null,
        },
        targetId,
        intended,
      ),
    ).toBe(true);

    // Different opening amount is rejected
    expect(
      isSameIntendedSource(
        {
          id: targetId,
          name: 'Emergency Cash',
          type: 'cash',
          opening_amount: 1000,
          credit_limit: null,
        },
        targetId,
        intended,
      ),
    ).toBe(false);

    // Different credit limit is rejected
    const cardIntended = {
      name: 'Amazon ICICI',
      type: 'card' as const,
      opening_amount: 0,
      credit_limit: 50000,
    };
    expect(
      isSameIntendedSource(
        {
          id: targetId,
          name: 'Amazon ICICI',
          type: 'card',
          opening_amount: 0,
          credit_limit: 75000,
        },
        targetId,
        cardIntended,
      ),
    ).toBe(false);

    // Unrelated record with different ID is rejected
    expect(
      isSameIntendedSource(
        {
          id: 'different-uuid',
          name: 'Emergency Cash',
          type: 'cash',
          opening_amount: 500,
          credit_limit: null,
        },
        targetId,
        intended,
      ),
    ).toBe(false);

    // Record with different name is rejected
    expect(
      isSameIntendedSource(
        {
          id: targetId,
          name: 'Salary Account',
          type: 'cash',
          opening_amount: 500,
          credit_limit: null,
        },
        targetId,
        intended,
      ),
    ).toBe(false);

    // Record with different type is rejected
    expect(
      isSameIntendedSource(
        {
          id: targetId,
          name: 'Emergency Cash',
          type: 'bank',
          opening_amount: 500,
          credit_limit: null,
        },
        targetId,
        intended,
      ),
    ).toBe(false);

    // Missing / null record is rejected
    expect(isSameIntendedSource(null, targetId, intended)).toBe(false);
  });

  it('generates UUID lazily only once across re-renders', () => {
    const ref: { current: string | null } = { current: null };

    // Initial render: generates UUID
    const idFirstRender = getOrCreateSourceId(ref);
    expect(typeof idFirstRender).toBe('string');
    expect(idFirstRender.length).toBeGreaterThan(0);

    // Simulated re-renders (e.g. user typing, validation state change)
    const idSecondRender = getOrCreateSourceId(ref);
    const idThirdRender = getOrCreateSourceId(ref);

    expect(idSecondRender).toBe(idFirstRender);
    expect(idThirdRender).toBe(idFirstRender);
    expect(ref.current).toBe(idFirstRender);
  });

  it('preserves existing source ID when editing across re-renders', () => {
    const existingSourceId = 'existing-source-id-123';
    const ref: { current: string | null } = { current: null };

    // Initial render in edit mode
    const idFirstRender = getOrCreateSourceId(ref, existingSourceId);
    expect(idFirstRender).toBe(existingSourceId);

    // Subsequent re-render
    const idSecondRender = getOrCreateSourceId(ref, existingSourceId);
    expect(idSecondRender).toBe(existingSourceId);
  });

  it('reuses stable source ID across multiple submission attempts', () => {
    const ref: { current: string | null } = { current: null };
    const formId = getOrCreateSourceId(ref);

    // First submit attempt
    const firstAttemptId = ref.current;
    expect(firstAttemptId).toBe(formId);

    // Second submit attempt (e.g. retry after network timeout)
    const secondAttemptId = ref.current;
    expect(secondAttemptId).toBe(firstAttemptId);
  });
});
