import { describe, expect, it } from '@jest/globals';
import { getDatabaseErrorKey } from '../databaseErrors';

describe('getDatabaseErrorKey', () => {
  it('returns generic error for null or invalid input', () => {
    expect(getDatabaseErrorKey(null)).toBe('err.generic');
    expect(getDatabaseErrorKey('error')).toBe('err.generic');
  });

  it('maps source limit errors', () => {
    expect(getDatabaseErrorKey({ message: 'WPT_SOURCE_LIMIT reached' })).toBe(
      'err.source.limit',
    );
  });

  it('maps negative cash errors', () => {
    expect(getDatabaseErrorKey({ code: 'EC-SRC-04' })).toBe(
      'err.source.negative_cash',
    );
  });

  it('maps locked source type errors', () => {
    expect(getDatabaseErrorKey({ message: 'WPT_TYPE_LOCKED' })).toBe(
      'err.source.type_locked',
    );
  });

  it('maps duplicate source name errors', () => {
    expect(
      getDatabaseErrorKey({
        message: 'duplicate key value violates unique constraint "financial_sources_unique_name"',
      }),
    ).toBe('err.name.duplicate.source');
  });

  it('maps source has transactions foreign key delete error', () => {
    expect(
      getDatabaseErrorKey({
        message: 'update or delete on table "financial_sources" violates foreign key constraint "transactions_source_fk"',
      }),
    ).toBe('info.source.has.txns');
  });

  it('maps max balance error', () => {
    expect(getDatabaseErrorKey({ message: 'WPT_BAL_MAX' })).toBe(
      'err.amount.max',
    );
  });

  it('maps network and fetch errors', () => {
    expect(getDatabaseErrorKey({ message: 'Network request failed' })).toBe(
      'err.network.save',
    );
    expect(getDatabaseErrorKey({ message: 'Fetch failed' })).toBe(
      'err.network.save',
    );
  });

  it('returns generic error for unknown database errors', () => {
    expect(
      getDatabaseErrorKey({ code: 'UNKNOWN', message: 'Something failed' }),
    ).toBe('err.generic');
  });
});
