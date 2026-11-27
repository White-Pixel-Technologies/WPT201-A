import en from './en.json';

export type TranslationParams = Record<string, string | number>;
export type TranslationKey = keyof typeof en;

const translations: Record<string, unknown> = en;

function hasOwn(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Resolves a translation message from flat or nested dictionaries without
 * matching inherited Object.prototype properties.
 */
function resolveMessage(dictionary: Record<string, unknown>, key: string): string | undefined {
  if (!key) {
    return undefined;
  }

  if (hasOwn(dictionary, key)) {
    const direct = dictionary[key];
    return typeof direct === 'string' && direct.trim().length > 0 ? direct : undefined;
  }

  const nested = key.split('.').reduce<unknown>((current, part) => {
    if (
      current !== null &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      hasOwn(current as Record<string, unknown>, part)
    ) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, dictionary);

  return typeof nested === 'string' && nested.trim().length > 0 ? nested : undefined;
}

/**
 * Translates a key using the shared English dictionary, filling `{app}`
 * automatically from `app.name` and replacing `{placeholder}` tokens.
 * Falls back to the key string if the key is missing or invalid.
 */
export function t(key: string, params: TranslationParams = {}): string {
  if (typeof key !== 'string') {
    return '';
  }

  const value = resolveMessage(translations, key);

  if (value === undefined) {
    return key;
  }

  const appName = resolveMessage(translations, 'app.name');

  const allParams: TranslationParams = {
    ...params,
    ...(appName !== undefined ? { app: appName } : {}),
  };

  return value.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    if (!hasOwn(allParams as Record<string, unknown>, name)) {
      return placeholder;
    }

    const paramValue = allParams[name];
    return paramValue !== undefined && paramValue !== null ? String(paramValue) : placeholder;
  });
}

export { en };
export default t;
