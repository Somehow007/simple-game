type TranslationKey = string;
type TranslationValue = string | ((...args: unknown[]) => string);
type Translations = Record<TranslationKey, TranslationValue>;

const locales: Record<string, Translations> = {};

export function registerLocale(locale: string, translations: Translations): void {
  locales[locale] = translations;
}

export function getTranslation(locale: string, key: string, ...args: unknown[]): string {
  const translations = locales[locale] ?? locales['zh'];
  const value = translations[key];
  if (typeof value === 'function') {
    return value(...args);
  }
  return value ?? key;
}

export function t(key: string, ...args: unknown[]): string {
  return getTranslation('zh', key, ...args);
}

export { type Translations };
