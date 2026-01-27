# Phase 3: Next.js API Routes & Authentication - Research

**Researched:** 2026-01-27
**Domain:** Next.js 14 API Routes (App Router) + WordPress REST API + WooCommerce + JWT Authentication
**Confidence:** HIGH

## Summary

Phase 3 implements a Backend-for-Frontend (BFF) proxy layer using Next.js 14 App Router Route Handlers to mediate between the frontend and WordPress/WooCommerce backend. The architecture follows established headless commerce patterns where Next.js securely manages API credentials and provides optimized, typed API endpoints to the frontend.

The project uses Next.js 14.2.0 with App Router architecture, meaning Route Handlers (not Pages Router API Routes) are the correct pattern. Existing implementation in `/app/api/` shows proper Route Handler structure with TypeScript, proper error handling, and environment variable management via Vercel.

**Current State Analysis:**
- ✅ Route Handlers already exist: `/app/api/products/route.ts`, `/app/api/orders/`, `/app/api/payment/`
- ✅ WooCommerce client library configured in `/lib/woocommerce.ts` with proper TypeScript types
- ✅ Environment variables structure defined (`.env.example`)
- ⚠️ JWT authentication not yet implemented (no `/app/api/auth/` directory found)
- ⚠️ CoCart integration for cart sessions not yet implemented (no `/app/api/cart/` directory found)
- ⚠️ Environment variables may not include JWT secret and cart session keys

**Primary recommendation:** Extend existing Route Handler architecture with JWT authentication middleware and CoCart cart session management, maintaining current TypeScript patterns and error handling structure.

## Standard Stack

The established libraries/tools for Next.js + WordPress headless commerce:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.2+ | Full-stack framework with Route Handlers | App Router Route Handlers are the modern replacement for Pages Router API Routes; official Next.js pattern for API endpoints in 2026 |
| @woocommerce/woocommerce-rest-api | 1.0.1 | WooCommerce REST API client | Official WooCommerce JavaScript SDK with OAuth 1.0a and Basic Auth support; already installed in project |
| TypeScript | 5+ | Type safety for API contracts | Prevents runtime errors with WooCommerce response types; Next.js provides built-in RouteContext and NextApiRequest/Response types |
| jose | Latest | JWT verification (Edge Runtime compatible) | Unlike jsonwebtoken, jose works in Edge Runtime; required for middleware JWT validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.23+ | Request/response validation | Already in project; use for validating incoming API request bodies and query params |
| next-auth (NextAuth.js) | 4.x/5.x | OAuth/JWT authentication layer | Optional - only if complex auth flows needed; may be overkill for WordPress-only auth |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @woocommerce/woocommerce-rest-api | axios + manual OAuth | Manual implementation gives more control but requires handling OAuth 1.0a signature generation; library is more maintainable |
| jose | jsonwebtoken | jsonwebtoken doesn't work in Edge Runtime; jose is required for Next.js middleware |
| Route Handlers (App Router) | API Routes (Pages Router) | Pages Router API Routes still work but are legacy; App Router Route Handlers are the modern pattern with better TypeScript support |

**Installation:**
```bash
# Core dependencies (already installed)
npm install @woocommerce/woocommerce-rest-api

# JWT middleware support (NEW - required for Phase 3)
npm install jose

# Optional: Enhanced auth
npm install next-auth
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   ├── auth/
│   │   └── token/
│   │       └── route.ts          # JWT token generation endpoint
│   ├── products/
│   │   ├── route.ts               # GET /api/products (already exists)
│   │   └── [slug]/
│   │       └── route.ts           # GET /api/products/:slug
│   ├── orders/
│   │   ├── route.ts               # POST /api/orders, GET /api/orders
│   │   └── [id]/
│   │       └── route.ts           # GET /api/orders/:id
│   ├── cart/
│   │   ├── route.ts               # GET /api/cart (CoCart integration)
│   │   ├── add-item/
│   │   │   └── route.ts           # POST /api/cart/add-item
│   │   └── update-item/
│   │       └── route.ts           # PUT /api/cart/update-item
│   └── middleware.ts              # JWT validation middleware (optional)
├── [locale]/
│   └── ...                         # Frontend pages
└── globals.css

lib/
├── woocommerce.ts                  # WooCommerce client (already exists)
├── wordpress-auth.ts               # JWT authentication utilities (NEW)
├── cart-session.ts                 # CoCart session management (NEW)
└── types/
    ├── woocommerce.ts              # WooCommerce API types (extend existing)
    └── api.ts                      # API response types (NEW)
```

### Pattern 1: Route Handler with WooCommerce Proxy
**What:** Route Handler that proxies WordPress REST API requests with credential injection
**When to use:** All WooCommerce API operations (products, orders, customers)
**Example:**
```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { woo } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    // WooCommerce credentials injected server-side (never exposed to client)
    const { data } = await woo.get('products', {
      page,
      per_page: perPage,
      status: 'publish',
    });

    return NextResponse.json({
      success: true,
      products: data,
      total: data.length
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);

    // Structured error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: error.status || 500 }
    );
  }
}
```
**Source:** Current implementation in project + [Next.js Route Handlers docs](https://nextjs.org/docs/app/getting-started/route-handlers)

### Pattern 2: JWT Token Generation Endpoint
**What:** Endpoint that authenticates with WordPress JWT plugin and returns token
**When to use:** User login, session establishment
**Example:**
```typescript
// app/api/auth/token/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Call WordPress JWT Authentication plugin
    const response = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.message },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Store JWT in httpOnly cookie (secure, not accessible via JavaScript)
    const res = NextResponse.json({
      success: true,
      token: data.token,
      user: {
        email: data.user_email,
        displayName: data.user_display_name
      }
    });

    res.cookies.set('auth-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return res;
  } catch (error: any) {
    console.error('JWT token error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```
**Source:** [WordPress JWT Auth in Next.js](https://tillitsdone.com/blogs/wordpress-api-auth-in-next-js/) + [Next.js JWT Middleware Guide](https://dev.to/leapcell/implementing-jwt-middleware-in-nextjs-a-complete-guide-to-auth-1b2d)

### Pattern 3: JWT Middleware for Protected Routes
**What:** Next.js middleware that validates JWT tokens before reaching Route Handlers
**When to use:** Protecting routes that require authentication (orders, profile, admin operations)
**Example:**
```typescript
// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Only protect /api/orders and /api/profile routes
  if (
    !request.nextUrl.pathname.startsWith('/api/orders') &&
    !request.nextUrl.pathname.startsWith('/api/profile')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Verify JWT using jose (Edge Runtime compatible)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Add user info to request headers for downstream Route Handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-email', payload.email as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('JWT verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/orders/:path*', '/api/profile/:path*']
};
```
**Source:** [Implementing JWT Middleware in Next.js](https://leapcell.medium.com/implementing-jwt-middleware-in-next-js-a-complete-guide-to-auth-300d9c7fcae2)

### Pattern 4: CoCart Session Management
**What:** Route Handlers that proxy CoCart plugin for cart session management
**When to use:** All cart operations (add/remove items, get cart, clear cart)
**Example:**
```typescript
// app/api/cart/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get cart key from cookie (CoCart uses this for session identification)
    const cartKey = request.headers.get('cookie')
      ?.split('; ')
      .find(c => c.startsWith('woocommerce_cart_hash='))
      ?.split('=')[1];

    const response = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/cocart/v2/cart`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(cartKey && { 'Cart-Key': cartKey })
        }
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      cart: data
    });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json();

    // CoCart add item endpoint
    const response = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/cocart/v2/cart/add-item`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // CoCart requires form-encoded
        },
        body: new URLSearchParams({
          id: productId.toString(),
          quantity: quantity.toString()
        })
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      cart: data
    });
  } catch (error: any) {
    console.error('Cart add item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}
```
**Source:** [CoCart Plugin Documentation](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/) + Project CONTEXT.md (CoCart requires form-encoded format on Gabia hosting)

### Anti-Patterns to Avoid

- **Calling your own API routes from Server Components:** Don't make HTTP requests to `/api/*` from server-side code (getServerSideProps, Server Components). Instead, call the underlying function directly. This avoids unnecessary network hops within the same server.

- **Exposing WooCommerce credentials to client:** Never use `NEXT_PUBLIC_` prefix for WooCommerce consumer keys/secrets. These must only be accessed in Route Handlers (server-side).

- **Using jsonwebtoken library:** The `jsonwebtoken` library doesn't work in Edge Runtime. Use `jose` library instead for JWT verification in middleware.

- **Sequential await calls:** Don't chain multiple independent API calls with sequential `await`. Start all promises simultaneously and only await when data is needed, reducing latency by 2-10×.

- **Not validating environment variables:** Always validate that required environment variables exist at runtime, especially in production. Route Handlers should fail fast with clear error messages if credentials are missing.

**Sources:**
- [Common mistakes with Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Next.js API Routes: The Ultimate Guide](https://makerkit.dev/blog/tutorials/nextjs-api-best-practices)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth 1.0a signature generation for WooCommerce | Custom crypto implementation | @woocommerce/woocommerce-rest-api library | OAuth 1.0a requires complex signature generation with timestamp, nonce, and HMAC-SHA1; library handles this correctly and is maintained by WooCommerce team |
| JWT token verification | Manual base64 decoding + signature check | jose library | JWT verification requires cryptographic validation, expiry checking, and algorithm verification; jose is Edge Runtime compatible and handles all edge cases |
| Cart session management | Custom cookie + localStorage solution | CoCart plugin + database sessions | Cart sessions need server-side persistence for order processing; localStorage doesn't survive page reloads across devices; CoCart provides database-backed sessions |
| API request/response type validation | Manual if/else checks | zod schema validation | Type validation requires checking nested objects, array types, optional fields, and providing clear error messages; zod provides declarative schemas with excellent TypeScript integration |
| Environment variable validation | Runtime checks scattered across files | Centralized validation function with zod | Environment variables can be missing or invalid in production; centralized validation at startup prevents runtime failures and provides clear error messages |

**Key insight:** WordPress + WooCommerce headless architecture is a solved problem with mature tooling. The complexity lies in OAuth 1.0a authentication, JWT token management, and cart session persistence across devices. Use official libraries rather than reimplementing cryptographic operations or session management.

## Common Pitfalls

### Pitfall 1: Environment Variables Not Available in Route Handlers (Vercel)
**What goes wrong:** Environment variables show as `undefined` in Route Handlers despite being configured in Vercel dashboard
**Why it happens:**
- Variables added after deployment aren't available until next deploy
- Variables configured for wrong environment (development/preview/production)
- Next.js 15+ changed Route Handler caching defaults (GET requests cached by default)
**How to avoid:**
1. Add `export const dynamic = 'force-dynamic'` to all Route Handlers that read environment variables
2. Redeploy after adding new environment variables in Vercel dashboard
3. Verify variables are set for correct environment (preview vs production)
4. Use `vercel env pull` locally to sync environment variables
**Warning signs:**
- WooCommerce API returns 401/403 errors in production but works locally
- Console logs show `undefined` for `process.env.WC_CONSUMER_KEY`
- Route Handler returns cached responses with stale data
**Sources:** [Next.js 15 environment variables missing in API Routes](https://community.vercel.com/t/next-js-15-environment-variables-missing-in-api-routes/28705) + [How to add Vercel environment variables](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables)

### Pitfall 2: CORS Errors Despite WordPress Plugin Configuration
**What goes wrong:** Browser shows CORS errors when calling WordPress REST API directly, or API returns 403 errors
**Why it happens:**
- WordPress CORS plugin not configured for Vercel preview domains (*.vercel.app)
- Browser preflight OPTIONS requests failing
- WordPress returning CORS headers but with incorrect origin
- Gabia hosting WAF blocking requests with certain headers
**How to avoid:**
1. Use Next.js API Routes as proxy (NEVER call WordPress directly from browser)
2. Configure WordPress CORS plugin to allow specific Vercel domain (not wildcard *)
3. Ensure WordPress .htaccess includes cache bypass for `/wp-json/` (already done in Phase 2)
4. Test with `curl` from server-side to isolate client vs server issues
**Warning signs:**
- Browser console: "Access-Control-Allow-Origin header is missing"
- API works in Postman but fails in browser
- Different behavior between localhost and Vercel preview
**Sources:** Project CONTEXT.md (Phase 1 decisions) + [Headless WooCommerce with Next.js](https://www.webbycrown.com/headless-woocommerce-rest-api/)

### Pitfall 3: Exposing API Keys in Client-Side Code
**What goes wrong:** WooCommerce consumer keys/secrets leaked in frontend JavaScript bundles
**Why it happens:**
- Using `NEXT_PUBLIC_` prefix for sensitive credentials
- Passing environment variables as props to Client Components
- Reading `process.env` in components that run on client-side
**How to avoid:**
1. NEVER use `NEXT_PUBLIC_` prefix for WooCommerce keys, JWT secrets, or API credentials
2. Keep all credential access in Route Handlers (server-side only)
3. Use Data Access Layer pattern - only specific files in `/lib` can read `process.env`
4. Audit build output: search `.next/static/` for leaked credentials
**Warning signs:**
- Can find `ck_` or `cs_` strings in browser DevTools Network tab (JavaScript files)
- Next.js build output shows "Compiled successfully" but bundles > 500KB
- Credential strings visible in browser's View Source
**Sources:** [Next.js Data Security Guide](https://nextjs.org/docs/app/guides/data-security) + [Do not use secrets in environment variables](https://www.nodejs-security.com/blog/do-not-use-secrets-in-environment-variables-and-here-is-how-to-do-it-better)

### Pitfall 4: CoCart Content-Type Mismatch (Gabia Hosting Specific)
**What goes wrong:** CoCart API returns 400 Bad Request errors or "Invalid JSON" errors when adding items to cart
**Why it happens:**
- Gabia hosting WAF/mod_security blocks `application/json` requests to certain endpoints
- CoCart plugin expects `application/x-www-form-urlencoded` format on some hosting configurations
- This is a hosting-specific quirk, not standard WooCommerce behavior
**How to avoid:**
1. Use `application/x-www-form-urlencoded` content type for CoCart requests
2. Send data as URLSearchParams: `new URLSearchParams({ id: productId, quantity: qty })`
3. Test CoCart endpoints early in development to catch encoding issues
4. Document hosting-specific requirements in code comments
**Warning signs:**
- CoCart works in local development but fails in production
- 400 errors with message "Invalid JSON" despite valid JSON payload
- Same endpoint works with form-encoded but not JSON
**Sources:** Project CONTEXT.md (Phase 1 decisions: "CoCart Form-Encoded Requirement") + [CoCart Plugin Documentation](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/)

### Pitfall 5: JWT Token Storage in localStorage (XSS Vulnerability)
**What goes wrong:** JWT tokens stored in localStorage are accessible via client-side JavaScript, making them vulnerable to XSS attacks
**Why it happens:**
- Common tutorial pattern shows `localStorage.setItem('token', jwt)`
- Developers think localStorage is "secure" because it's isolated per domain
- Not understanding that any JavaScript (including malicious scripts) can read localStorage
**How to avoid:**
1. Store JWT tokens in httpOnly cookies (inaccessible to client-side JavaScript)
2. Set cookie flags: `httpOnly: true, secure: true, sameSite: 'strict'`
3. Never expose token to client - only server-side Route Handlers should see it
4. Use middleware to validate token from cookie before reaching protected routes
**Warning signs:**
- Token visible in browser DevTools → Application → Local Storage
- Authentication code includes `localStorage.getItem('token')`
- Sending token in Authorization header from client-side fetch calls
**Sources:** [Best Practices in Implementing JWT in Next.js 15](https://www.wisp.blog/blog/best-practices-in-implementing-jwt-in-nextjs-15) + [How to Think About Security in Next.js](https://nextjs.org/blog/security-nextjs-server-components-actions)

### Pitfall 6: Not Handling WordPress API Rate Limits
**What goes wrong:** Route Handlers return errors after burst of requests, or WordPress temporarily blocks IP
**Why it happens:**
- WooCommerce REST API has rate limits (varies by hosting configuration)
- Multiple parallel requests from frontend (e.g., product list + cart + user profile)
- No retry logic or backoff strategy
**How to avoid:**
1. Implement exponential backoff for failed requests
2. Add response caching where appropriate (e.g., product catalog with ISR)
3. Use React Query's `staleTime` and `cacheTime` to reduce API calls
4. Monitor API response headers for rate limit info: `X-WP-RateLimit-Limit`, `X-WP-RateLimit-Remaining`
**Warning signs:**
- Intermittent 429 Too Many Requests errors
- WordPress returns 503 Service Unavailable after peak traffic
- Slowdowns during product browsing or checkout
**Sources:** [WooCommerce REST API Developer's Guide](https://brainspate.com/blog/woocommerce-rest-api-developer-guide/) + [REST API Security Best Practices](https://www.levo.ai/resources/blogs/rest-api-security-best-practices)

## Code Examples

Verified patterns from official sources and project requirements:

### Environment Variable Configuration (Vercel Dashboard)
```bash
# Required environment variables for Phase 3
# Add these in Vercel dashboard → Settings → Environment Variables

# WordPress Backend
WORDPRESS_URL=https://82mobile.com
WORDPRESS_API_URL=https://82mobile.com/wp-json

# WooCommerce API Credentials (generated in Phase 1)
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxx

# JWT Authentication Secret (from WordPress JWT plugin in Phase 1)
JWT_SECRET=your-jwt-secret-here

# CoCart Session
COCART_API_URL=https://82mobile.com/wp-json/cocart/v2

# Next.js Public Variables (safe to expose)
NEXT_PUBLIC_URL=https://82mobile.vercel.app
NEXT_PUBLIC_WORDPRESS_DOMAIN=82mobile.com
```
**Source:** [Vercel Environment Variables Guide](https://vercel.com/docs/environment-variables) + [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables)

### Environment Variable Validation (Centralized)
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  WORDPRESS_URL: z.string().url(),
  WORDPRESS_API_URL: z.string().url(),
  WC_CONSUMER_KEY: z.string().min(20).startsWith('ck_'),
  WC_CONSUMER_SECRET: z.string().min(20).startsWith('cs_'),
  JWT_SECRET: z.string().min(32),
  COCART_API_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables at startup
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Environment validation failed. Check your .env file or Vercel dashboard.');
  }
}

// Export validated environment
export const env = validateEnv();
```
**Source:** [Next.js Data Security - Environment Validation](https://nextjs.org/docs/app/guides/data-security) + [Managing Next.js Secrets in CI/CD](https://medium.com/@nima.shokofar/managing-next-js-secrets-in-ci-cd-part-1-05e76e81a2c4)

### Error Handling Utility (Reusable)
```typescript
// lib/api-error.ts
import { NextResponse } from 'next/server';

export interface ApiError {
  success: false;
  error: string;
  message: string;
  code?: string;
  statusCode?: number;
}

export function handleApiError(error: any, context: string = 'API Error'): NextResponse {
  console.error(`${context}:`, error);

  // WordPress/WooCommerce specific error
  if (error.response?.data) {
    const wpError = error.response.data;
    return NextResponse.json(
      {
        success: false,
        error: context,
        message: wpError.message || 'WordPress API error',
        code: wpError.code || 'WORDPRESS_ERROR'
      },
      { status: error.response.status || 500 }
    );
  }

  // Network/fetch error
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return NextResponse.json(
      {
        success: false,
        error: 'Service unavailable',
        message: 'Could not connect to WordPress backend',
        code: 'NETWORK_ERROR'
      },
      { status: 503 }
    );
  }

  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: context,
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR'
    },
    { status: 500 }
  );
}
```
**Source:** [Next.js API Routes Error Handling](https://dev.to/sneakysensei/nextjs-api-routes-global-error-handling-and-clean-code-practices-3g9p) + [Handling API Errors in Next.js](https://giancarlobuomprisco.com/next/handling-api-errors-in-nextjs)

### TypeScript Types for API Responses
```typescript
// lib/types/api.ts
import { WooProduct, WooOrder } from './woocommerce';

// Standard API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// Products API response
export interface ProductsResponse extends ApiResponse {
  products: WooProduct[];
  total: number;
  page: number;
  perPage: number;
}

// Single product response
export interface ProductResponse extends ApiResponse {
  product: WooProduct;
}

// Order creation response
export interface OrderResponse extends ApiResponse {
  order: WooOrder;
}

// Cart response (CoCart)
export interface CartResponse extends ApiResponse {
  cart: {
    cart_key: string;
    items: CartItem[];
    totals: {
      subtotal: string;
      total: string;
      currency: string;
    };
  };
}

export interface CartItem {
  item_key: string;
  product_id: number;
  name: string;
  quantity: number;
  price: string;
  line_total: string;
  featured_image: string;
}

// JWT Auth response
export interface AuthTokenResponse extends ApiResponse {
  token: string;
  user: {
    id: number;
    email: string;
    displayName: string;
  };
}
```
**Source:** [Configuration: TypeScript | Next.js](https://nextjs.org/docs/pages/api-reference/config/typescript) + Project's existing `/lib/woocommerce.ts` types

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API Routes (`pages/api/*.ts`) | App Router Route Handlers (`app/api/*/route.ts`) | Next.js 13 (2022) | Route Handlers use Web Request/Response APIs, support streaming, and have better TypeScript integration; API Routes still work but are legacy |
| jsonwebtoken library for JWT | jose library for JWT | Next.js Edge Runtime adoption (2023) | jsonwebtoken doesn't work in Edge Runtime; jose is required for middleware JWT verification |
| localStorage for JWT tokens | httpOnly cookies | Security best practices (ongoing) | localStorage is vulnerable to XSS; httpOnly cookies are inaccessible to client-side JavaScript |
| Client-side WordPress API calls with exposed credentials | Next.js API Routes as BFF proxy | Jamstack/headless CMS era (2020+) | Credentials stay server-side; client never sees WooCommerce keys; reduces attack surface |
| Wildcard CORS (`*`) | Specific domain CORS | CORS security tightening (2021+) | Wildcard CORS allows any domain to access API; specific domain prevents unauthorized access |
| Default Route Handler caching (GET cached) | Explicit cache control with `dynamic = 'force-dynamic'` | Next.js 15 (2024) | GET Route Handlers now cached by default; must opt-out explicitly for dynamic data |

**Deprecated/outdated:**
- **getServerSideProps with fetch to own API routes**: Call underlying function directly in Server Components instead of making HTTP request to `/api/*`
- **API Routes in Pages Router for new projects**: Use Route Handlers in App Router; Pages Router API Routes are legacy (still supported but not recommended)
- **Calling WordPress REST API directly from browser**: Always proxy through Next.js Route Handlers to protect credentials

**Sources:**
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Migrating to App Router | Next.js](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [API Routes vs Route Handlers Comparison](https://medium.com/@techxp/api-routes-vs-route-handlers-in-next-js-a-practical-comparison-ffa38773fc42)

## Open Questions

Things that couldn't be fully resolved:

1. **JWT Secret Management Strategy**
   - What we know: WordPress JWT Authentication plugin generates a secret during setup (Phase 1)
   - What's unclear: Whether the secret needs to be synced between WordPress and Vercel, or if Next.js only needs to verify tokens generated by WordPress
   - Recommendation: Retrieve JWT secret from WordPress plugin settings (Phase 1 deliverable) and add to Vercel environment variables as `JWT_SECRET`. Next.js middleware will use this to verify tokens but not generate them (only WordPress generates tokens).

2. **CoCart Session Persistence Across Devices**
   - What we know: CoCart uses database-backed sessions identified by cart key
   - What's unclear: How cart key is generated and shared between frontend and backend without user login
   - Recommendation: Use CoCart's automatic cart key generation on first request, store key in httpOnly cookie, and pass in subsequent requests. For logged-in users, associate cart key with WordPress user ID.

3. **Rate Limiting Strategy for High Traffic**
   - What we know: WordPress REST API has rate limits, Gabia shared hosting has resource constraints
   - What's unclear: Exact rate limits on Gabia hosting, whether Redis/object caching is available (Phase 2 confirmed Redis unavailable)
   - Recommendation: Implement client-side caching with React Query (already installed), add exponential backoff in Route Handlers, and monitor for 429 errors. Consider Vercel Edge Caching for product catalog (ISR with revalidation).

4. **Error Handling for WordPress Downtime**
   - What we know: Gabia hosting can have downtime during maintenance, cache bypass means no static fallback for API responses
   - What's unclear: Whether to implement circuit breaker pattern, how long to retry before failing
   - Recommendation: Add timeout to all WordPress API calls (10s max), implement exponential backoff with max 3 retries, return cached data from Vercel if available (stale-while-revalidate pattern). Display user-friendly error message on frontend.

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Route Handlers Documentation](https://nextjs.org/docs/app/getting-started/route-handlers) - Official Next.js docs for Route Handlers architecture
- [WooCommerce REST API Documentation v3](https://woocommerce.github.io/woocommerce-rest-api-docs/) - Official WooCommerce REST API reference
- [CoCart Plugin - WordPress.org](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/) - Official CoCart plugin documentation
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables) - Official environment variable handling
- [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables) - Official Vercel env var configuration
- Project existing implementation: `/app/api/products/route.ts`, `/lib/woocommerce.ts`

### Secondary (MEDIUM confidence)
- [Headless WooCommerce REST API with React and Next.js](https://www.webbycrown.com/headless-woocommerce-rest-api/) - Comprehensive guide to headless WooCommerce architecture
- [Secure WordPress API Routes in Next.js Apps](https://tillitsdone.com/blogs/wordpress-api-auth-in-next-js/) - WordPress-specific JWT authentication with Next.js
- [Implementing JWT Middleware in Next.js: Complete Guide](https://leapcell.medium.com/implementing-jwt-middleware-in-next-js-a-complete-guide-to-auth-300d9c7fcae2) - JWT middleware patterns
- [Common Mistakes with Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Official Vercel blog on avoiding pitfalls
- [Next.js Data Security Guide](https://nextjs.org/docs/app/guides/data-security) - Official security best practices
- [WooCommerce REST API: Complete Developer's Guide for 2026](https://brainspate.com/blog/woocommerce-rest-api-developer-guide/) - Current best practices for WooCommerce integration

### Tertiary (LOW confidence - marked for validation)
- [Next.js 15 environment variables missing in API Routes - Vercel Community](https://community.vercel.com/t/next-js-15-environment-variables-missing-in-api-routes/28705) - Community-reported issue, needs official verification
- [Do not use secrets in environment variables](https://www.nodejs-security.com/blog/do-not-use-secrets-in-environment-variables-and-here-is-how-to-do-it-better) - Third-party security blog, principles sound but not Next.js-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js 14 App Router Route Handlers are official pattern, @woocommerce/woocommerce-rest-api is official library, project already uses these
- Architecture: HIGH - Route Handler patterns verified in Next.js official docs, existing project implementation confirms viability
- JWT Authentication: MEDIUM - jose library is correct for Edge Runtime, but WordPress JWT plugin integration needs Phase 1 deliverable (JWT secret) to verify
- CoCart Integration: MEDIUM - CoCart plugin documented, but form-encoded requirement is Gabia-hosting-specific quirk (verified in Phase 1 CONTEXT.md)
- Environment Variables: HIGH - Vercel env var management is well-documented, Next.js 15 caching changes confirmed in official release notes
- Error Handling: HIGH - Patterns verified in Next.js docs and existing project implementation shows proper structure
- Security: HIGH - httpOnly cookie pattern for JWT is security best practice, Data Access Layer pattern confirmed in Next.js security guide
- Pitfalls: HIGH - All pitfalls sourced from official Vercel blog, Next.js docs, or project-specific Phase 1/2 decisions

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - Next.js is stable, WooCommerce REST API v3 is mature)
**Next.js version researched:** 14.2+ (App Router)
**WooCommerce API version:** v3 (current stable)

**Research limitations:**
- JWT secret retrieval from WordPress plugin not verified (awaiting Phase 1 deliverable)
- CoCart session management tested conceptually but not against production Gabia hosting
- Rate limiting thresholds on Gabia hosting not confirmed (needs production testing)
- Vercel Edge Caching strategy for WooCommerce data needs performance testing

**Recommended validation tasks during planning:**
1. Verify JWT secret is accessible from WordPress admin (Phase 1 deliverable)
2. Test CoCart form-encoded requests against production WordPress (confirm 400 error with JSON)
3. Create test Route Handler with environment variable access to confirm Vercel deployment behavior
4. Review existing `/app/api/products/route.ts` for patterns to replicate across other endpoints
