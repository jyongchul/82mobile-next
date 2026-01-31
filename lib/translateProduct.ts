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
  // Match "일" after digits (e.g., "30일" → "30 Days")
  [/(\d+)일/g, '$1 Days'],
];

export function translateProductName(name: string, locale: string): string {
  if (locale === 'ko') return name;

  let translated = name;
  for (const [pattern, replacement] of NAME_REPLACEMENTS) {
    translated = translated.replace(pattern, replacement);
  }

  return translated;
}
