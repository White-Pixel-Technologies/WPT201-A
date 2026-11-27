import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';

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
