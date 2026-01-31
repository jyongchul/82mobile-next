import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/wordpress-auth';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'en'],

  // Used when no locale matches
  defaultLocale: 'ko',

  // Always use locale prefix
  localePrefix: 'always'
});

/**
 * Combined middleware: handles both i18n and JWT authentication
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle JWT authentication for protected API routes
  if (pathname.startsWith('/api/')) {
    // Define protected route patterns
    const protectedPatterns = [
      /^\/api\/orders\/[^/]+/, // /api/orders/{id}
      /^\/api\/user\/.*/       // /api/user/*
    ];

    // Check if the current path matches any protected pattern
    const isProtectedRoute = protectedPatterns.some(pattern =>
      pattern.test(pathname)
    );

    if (isProtectedRoute) {
      // Extract JWT token from cookie or Authorization header
      const token = request.cookies.get('auth-token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            message: 'No authentication token provided',
            code: 'AUTH_REQUIRED'
          },
          { status: 401 }
        );
      }

      try {
        // Verify JWT token
        const isValid = await verifyJwtToken(token);

        if (!isValid) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid token',
              message: 'Authentication token is invalid or expired',
              code: 'AUTH_INVALID'
            },
            { status: 401 }
          );
        }

        // Token is valid - allow request to proceed
        return NextResponse.next();
      } catch (error: any) {
        console.error('[middleware] JWT verification error:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication failed',
            message: 'Failed to verify authentication token',
            code: 'AUTH_ERROR'
          },
          { status: 500 }
        );
      }
    }

    // Public API route - allow access
    return NextResponse.next();
  }

  // Proxy WordPress admin/login through our custom proxy (Host header injection)
  if (
    pathname.startsWith('/wp-admin') ||
    pathname.startsWith('/wp-login') ||
    pathname.startsWith('/wp-includes') ||
    pathname.startsWith('/wp-content')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/wp-proxy${pathname}`;
    return NextResponse.rewrite(url);
  }

  // wp-json uses vercel.json rewrites (API calls work fine)
  if (pathname.startsWith('/wp-json')) {
    return NextResponse.next();
  }

  // Handle internationalization for non-API routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except static files and Next.js internals
  matcher: ['/((?!_next|images|wp-admin|wp-login|wp-json|wp-includes|wp-content|favicon\\.ico|.*\\..*).*)', '/api/:path*']
};
