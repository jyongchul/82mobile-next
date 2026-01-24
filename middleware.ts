import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'en', 'zh', 'ja'],

  // Used when no locale matches
  defaultLocale: 'ko',

  // Always use locale prefix
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|en|zh|ja)/:path*']
};
