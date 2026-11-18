import messages from './en.json';

type MessageVariables = Record<string, string | number>;

const translations = messages as unknown as Record<string, string>;
export function t(
  key: string,
  vars: MessageVariables = {},
): string {
  const message = translations[key] ?? key;

  return message.replace(/\{(\w+)\}/g, (placeholder, name) => {
    return String(vars[name] ?? placeholder);
  });
}