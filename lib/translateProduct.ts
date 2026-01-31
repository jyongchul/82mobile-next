/**
 * Translate Korean product names to English using pattern matching.
 * WooCommerce products are stored in Korean only; this provides
 * client-side translation for the English locale.
 */

const NAME_REPLACEMENTS: [RegExp, string][] = [
  [/데이터 플랜/g, 'Data Plan'],
  [/통화 포함/g, 'Calls Included'],
  [/무제한/g, 'Unlimited'],
  [/매일/g, 'Daily'],
  [/일\b/g, 'Days'],
];

export function translateProductName(name: string, locale: string): string {
  if (locale === 'ko') return name;

  let translated = name;
  for (const [pattern, replacement] of NAME_REPLACEMENTS) {
    translated = translated.replace(pattern, replacement);
  }

  // Fix "30Days" → "30 Days" (ensure space before "Days")
  translated = translated.replace(/(\d)Days/g, '$1 Days');

  return translated;
}
