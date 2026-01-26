import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'ko'; // Default to Korean
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
