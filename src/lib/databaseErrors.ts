
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

  const errorText = [
    err.code,
    err.message,
    err.details,
    err.hint,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  if (errorText.includes('WPT_SOURCE_LIMIT')) {
    return 'err.source.limit';
  }

  if (errorText.includes('EC-SRC-04')) {
    return 'err.source.negative_cash';
  }

  if (errorText.includes('WPT_TYPE_LOCKED')) {
    return 'err.source.type_locked';
  }

  if (
    errorText.includes('NETWORK') ||
    errorText.includes('FETCH')
  ) {
    return 'err.network.save';
  }

  return 'err.generic';
}
