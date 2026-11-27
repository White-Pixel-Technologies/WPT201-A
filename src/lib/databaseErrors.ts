export function getDatabaseErrorKey(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'err.generic';
  }

  const err = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  const errorText = [err.code, err.message, err.details, err.hint]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  if (errorText.includes('WPT_SOURCE_LIMIT')) {
    return 'err.source.limit';
  }

  if (
    errorText.includes('FINANCIAL_SOURCES_UNIQUE_NAME') ||
    errorText.includes('UNIQUE_NAME') ||
    errorText.includes('DUPLICATE KEY')
  ) {
    return 'err.name.duplicate.source';
  }

  if (
    errorText.includes('TRANSACTIONS_SOURCE_FK') ||
    errorText.includes('TRANSACTIONS_TO_SOURCE_FK') ||
    errorText.includes('VIOLATES FOREIGN KEY')
  ) {
    return 'info.source.has.txns';
  }

  if (
    errorText.includes('WPT_BAL_MAX') ||
    errorText.includes('WPT_BAL_MIN') ||
    errorText.includes('BAL-10')
  ) {
    return 'err.amount.max';
  }

  if (errorText.includes('EC-SRC-04') || errorText.includes('SOURCES_OPENING_SIGN')) {
    return 'err.source.negative_cash';
  }

  if (errorText.includes('WPT_TYPE_LOCKED')) {
    return 'err.source.type_locked';
  }

  if (errorText.includes('NETWORK') || errorText.includes('FETCH')) {
    return 'err.network.save';
  }

  return 'err.generic';
}
