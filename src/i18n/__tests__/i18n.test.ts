import * as fs from 'fs';
import * as path from 'path';
import en from '../en.json';
import defaultT, { t } from '../index';

const EN_JSON_PATH = path.resolve(__dirname, '../en.json');

/**
 * Scans raw JSON text for duplicate object keys at the same nesting scope,
 * since `JSON.parse` silently keeps only the last occurrence.
 */
function findDuplicateJsonKeys(rawJson: string): string[] {
  const duplicates: string[] = [];
  const stack: { type: 'object' | 'array'; keys?: Set<string>; expectingKey?: boolean }[] = [];
  let i = 0;

  while (i < rawJson.length) {
    const ch = rawJson[i];

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i += 1;
      continue;
    }

    if (ch === '{') {
      stack.push({ type: 'object', keys: new Set<string>(), expectingKey: true });
      i += 1;
      continue;
    }

    if (ch === '[') {
      stack.push({ type: 'array' });
      i += 1;
      continue;
    }

    if (ch === '}' || ch === ']') {
      stack.pop();
      const parent = stack[stack.length - 1];
      if (parent && parent.type === 'object') {
        parent.expectingKey = false;
      }
      i += 1;
      continue;
    }

    if (ch === ',') {
      const top = stack[stack.length - 1];
      if (top && top.type === 'object') {
        top.expectingKey = true;
      }
      i += 1;
      continue;
    }

    if (ch === ':') {
      const top = stack[stack.length - 1];
      if (top && top.type === 'object') {
        top.expectingKey = false;
      }
      i += 1;
      continue;
    }

    if (ch === '"') {
      let end = i + 1;
      while (end < rawJson.length) {
        if (rawJson[end] === '\\') {
          end += 2;
          continue;
        }
        if (rawJson[end] === '"') {
          break;
        }
        end += 1;
      }

      const rawLiteral = rawJson.slice(i, end + 1);
      const top = stack[stack.length - 1];

      if (top && top.type === 'object' && top.expectingKey && top.keys) {
        const keyName = JSON.parse(rawLiteral) as string;
        if (top.keys.has(keyName)) {
          duplicates.push(keyName);
        } else {
          top.keys.add(keyName);
        }
      }

      i = end + 1;
      continue;
    }

    i += 1;
  }

  return duplicates;
}

describe('i18n shared text (en.json & t)', () => {
  it('loads English translation messages with all 214 keys', () => {
    expect(en).toBeDefined();
    expect(typeof en).toBe('object');
    expect(Array.isArray(en)).toBe(false);
    expect(Object.keys(en)).toHaveLength(214);
  });

  it('exports both named and default t function', () => {
    expect(typeof t).toBe('function');
    expect(defaultT).toBe(t);
  });

  it('resolves representative keys across all domains', () => {
    expect(t('app.name')).toBe('WPT 201 - A');
    expect(t('err.required')).toBe('This field is required.');
    expect(t('info.offline')).toBe(
      "You're offline. Changes can't be saved until you're back online.",
    );
    expect(t('warn.over.limit')).toBe('This card is now over its limit.');
    expect(t('empty.home')).toBe('No transactions yet. Tap + to add your first one.');
    expect(t('toast.saved')).toBe('Changes saved');
    expect(t('notif.daily.body')).toBe('Did you spend anything today? Add it in a few taps.');
    expect(t('del.done')).toBe('Your account has been deleted.');
    expect(t('welcome.create_account')).toBe('Sign up with email');
    expect(t('reset.title')).toBe('Set new password');
    expect(t('nav.home')).toBe('Home');
    expect(t('source.detail.empty')).toBe('No transactions for this source yet.');
    expect(t('a11y.password.show')).toBe('Show password');
    expect(t('settings.logout')).toBe('Log out');
  });

  it('fills {app} automatically from app.name', () => {
    expect(t('confirm.logout.title')).toBe('Log out of WPT 201 - A on this device?');
    expect(t('info.notif.blocked')).toBe(
      "Notifications are blocked for WPT 201 - A. Turn them on in your phone's Settings.",
    );
    expect(t('confirm.logout.others.title')).toBe(
      "Log out of WPT 201 - A on all your other devices? They'll be logged out within about an hour.",
    );
    expect(t('notif.daily.title')).toBe('WPT 201 - A');
    expect(t('del.body')).toBe(
      "This permanently deletes your WPT 201 - A account and all your data: sources, transactions, tags and settings. This can't be undone.",
    );
  });

  it('keeps the app name in one source', () => {
    const appName = en['app.name'];
    const hardcodedKeys = Object.entries(en)
      .filter(([key, value]) => key !== 'app.name' && value.includes(appName))
      .map(([key]) => key);

    expect(hardcodedKeys).toEqual([]);
  });

  it('replaces dynamic placeholders including numeric zero', () => {
    expect(t('info.signup.check', { email: 'user@example.com' })).toBe(
      'Check your inbox. If user@example.com needs verifying, a link is on its way. Already verified? Log in.',
    );
    expect(t('info.currency.change', { old: 'INR', new: 'USD' })).toBe(
      "Your amounts won't be converted. INR will show as USD.",
    );
    expect(t('empty.month', { month: 'November' })).toBe('Nothing recorded in November.');
    expect(t('greeting.morning', { name: 'Alex' })).toBe('Good morning, Alex');
    expect(t('confirm.delete.txn.title', { type: 'expense', amount: '$25' })).toBe(
      'Delete this expense of $25?',
    );
    expect(t('checkemail.resend.countdown', { seconds: 30 })).toBe('Resend email (30)');
    expect(t('search.results', { count: 0 })).toBe('0 results');
    expect(t('label.adjust.balance', { signed_amount: '+100' })).toBe('Balance +100');
    expect(t('info.adjust.preview', { effect: '-50' })).toBe('This will add an adjustment of -50.');
    expect(t('warn.below.zero', { source: 'Cash' })).toBe('Cash is now below zero.');
    expect(t('confirm.currency.title', { currency: 'USD', old: 'INR', new: 'USD' })).toBe(
      "Change currency to USD? Your amounts won't be converted. INR will show as USD.",
    );
  });

  it('falls back safely for missing, empty, and prototype keys', () => {
    expect(t('missing.translation.key')).toBe('missing.translation.key');
    expect(t('')).toBe('');
    expect(t('toString')).toBe('toString');
    expect(t('constructor')).toBe('constructor');
    expect(t('__proto__')).toBe('__proto__');
    expect(t('greeting.morning')).toBe('Good morning, {name}');
    expect(t('greeting.morning', { name: undefined as unknown as string })).toBe(
      'Good morning, {name}',
    );
  });

  it('uses the en dash in password length messages', () => {
    expect(t('err.password.rule')).toContain('8–64');
    expect(t('reset.req.length')).toContain('8–64');
    expect(t('password.rule.length')).toContain('8–64');
  });

  it('has only non-empty string values and no double spaces', () => {
    const entries = Object.entries(en);
    const invalidValues = entries.filter(
      ([, value]) => typeof value !== 'string' || value.trim().length === 0,
    );
    const doubled = entries.filter(([, value]) => value.includes('  ')).map(([key]) => key);

    expect(invalidValues).toEqual([]);
    expect(doubled).toEqual([]);
  });

  it('stores en.json as valid UTF-8 JSON without BOM or duplicate keys', () => {
    const raw = fs.readFileSync(EN_JSON_PATH, 'utf8');

    expect(raw.charCodeAt(0)).not.toBe(0xfeff);
    expect(() => JSON.parse(raw)).not.toThrow();
    expect(findDuplicateJsonKeys(raw)).toEqual([]);
    expect(findDuplicateJsonKeys('{"a":"1","b":"2","a":"3"}')).toEqual(['a']);
  });
});
