# Feature Research: Headless WordPress Architecture

**Domain:** E-commerce platform migration (Monolithic Next.js → Headless WordPress)
**Researched:** 2026-01-27
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that MUST work for headless mode to be viable. Missing these = system broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product Listing via API | Core e-commerce function - users browse products | LOW | WooCommerce REST API v3 `GET /products` with pagination, filters (HIGH confidence) |
| Product Detail Retrieval | Users view individual product info | LOW | WooCommerce REST API `GET /products/{id}` or by slug (HIGH confidence) |
| Cart Session Management | Users must maintain cart across page loads | MEDIUM | Choose: Cart Tokens (official), CoCart (cookie-less), or Store API (HIGH confidence) |
| Order Creation via API | Guest checkout requires programmatic order creation | LOW | WooCommerce REST API `POST /orders` with billing details (HIGH confidence) |
| Order Status Retrieval | Users check order confirmation and status | LOW | WooCommerce REST API `GET /orders/{id}` with order key verification (HIGH confidence) |
| Payment Webhook Handling | Payment gateways must notify backend of payment completion | MEDIUM | WordPress webhook endpoints receive payment confirmations, verify signatures (HIGH confidence) |
| API Authentication | Secure access to WordPress backend | LOW | JWT tokens (plugins available) or Consumer Key/Secret (Basic Auth) (HIGH confidence) |
| Frontend Disabling | Prevent public access to WordPress theme frontend | LOW | Plugins (Headless Mode, Disable WP Frontend) or custom redirect code (HIGH confidence) |

### Differentiators (Competitive Advantage)

Features that make headless architecture BETTER than monolithic approach.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Zero Dependency on Theme | Frontend completely independent - no WordPress theming conflicts | LOW | Themes become irrelevant, only wp-admin accessed (HIGH confidence) |
| API-First Product Updates | Product changes in WordPress immediately available via API | LOW | Real-time sync without cache invalidation on frontend (HIGH confidence) |
| Decoupled Deployment | Frontend deploys independently from WordPress backend | LOW | Vercel deploys don't touch WordPress, reduces deployment risk (HIGH confidence) |
| Multi-Frontend Support | One WordPress backend serves web, mobile app, kiosks | MEDIUM | Same WooCommerce data powers multiple storefronts (HIGH confidence) |
| Frontend Performance Gains | Next.js optimizations (SSG, ISR, image optimization) | MEDIUM | Faster page loads vs WordPress PHP rendering (HIGH confidence) |
| Reduced Server Load | WordPress only serves API requests, not full page renders | LOW | Lower hosting costs, better scalability (HIGH confidence) |
| Advanced Caching | Next.js built-in caching separate from WordPress | LOW | React Query + Next.js caching independent of WP caching issues (HIGH confidence) |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly NOT build. Common mistakes in headless implementations.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| WordPress Login on Frontend | "Users should log in like normal WordPress" | Creates session management complexity, forces cookie dependency, loses headless benefits | Use JWT token authentication with custom login form, stateless auth |
| Full WooCommerce Block Editor | "Use WordPress Gutenberg for product pages" | Requires WordPress frontend rendering, defeats headless purpose | Build custom product templates in Next.js with Tailwind CSS |
| Direct WordPress URL Access | "Keep wordpress.com/products working" | Confuses users with two storefronts, SEO duplicate content issues | Redirect all WordPress frontend to Next.js frontend or disable entirely |
| Shared Session Between WP and Next.js | "Cart should work on both sites" | Cookie domain restrictions, CORS nightmare, security risks | Pick ONE frontend (Next.js), disable WordPress frontend completely |
| Real-Time Inventory Sync | "Show live stock counts" | Constant API polling, performance overhead, cache invalidation issues | Use webhook-triggered revalidation or accept 5-minute cache staleness |
| WooCommerce Native Checkout | "Use WordPress checkout page" | User redirects to WordPress mid-flow, breaks UX, loses analytics | Build custom checkout in Next.js, use WooCommerce API for order creation |

## Feature Dependencies

```
[API Authentication] (JWT or Basic Auth)
    └──enables──> [Product Listing via API]
    └──enables──> [Order Creation via API]
    └──enables──> [Cart Session Management]

[Frontend Disabling] (WordPress headless mode)
    └──requires──> [API-First Product Updates] (no theme to cache)
    └──enables──> [Decoupled Deployment] (frontend independent)

[Cart Session Management] (Cart Tokens or CoCart)
    └──requires──> [API Authentication]
    └──enables──> [Order Creation via API] (cart items passed to order)

[Payment Webhook Handling]
    └──requires──> [Order Creation via API] (order exists to update)
    └──enables──> [Order Status Retrieval] (status updated by webhook)

[Multi-Frontend Support]
    └──requires──> [API-First Product Updates]
    └──requires──> [Zero Dependency on Theme]
```

### Dependency Notes

- **API Authentication must be first:** All subsequent features require authenticated API access.
- **Frontend Disabling is critical:** Prevents SEO duplicate content and user confusion.
- **Cart Session Management is foundational:** Determines all downstream cart/checkout features.
- **Payment Webhooks are separate from order creation:** Two-step flow (create order → payment webhook updates status).

## Migration Path: Monolithic → Headless

### Current v1.0 Implementation (Monolithic)

```
Browser → Vercel Next.js → WooCommerce API
         (UI + API routes)   (Product data only)
```

**What works today:**
- ✅ Product listing via Next.js API routes
- ✅ Cart management via Zustand (localStorage)
- ✅ Order creation via WooCommerce API
- ✅ Payment processing via PortOne (browser SDK)
- ❌ WordPress theme still renders public pages
- ❌ No session management (guest checkout only)
- ❌ Payment webhooks not implemented

### Target Headless Implementation

```
Browser → Vercel Next.js     →  Gabia WordPress (Headless)
         (Frontend only)         (API-only, no theme)
                                 WooCommerce REST API
```

**What changes:**
1. **Disable WordPress Frontend:** Install Headless Mode plugin, block public access to WordPress URLs
2. **Implement JWT Authentication:** Replace Basic Auth (consumer key/secret) with JWT tokens for stateless auth
3. **Add Cart Session Management:** Migrate from localStorage-only to Cart Tokens or CoCart plugin
4. **Build Payment Webhooks:** Add webhook endpoints in Next.js to receive payment confirmations
5. **Update Order Flow:** Two-step (create order → wait for webhook → update status)

### Features Already Built (No Change Needed)

| Feature | Status | Notes |
|---------|--------|-------|
| Product Listing | ✅ Complete | `/api/products` already uses WooCommerce API |
| Product Detail | ✅ Complete | `/lib/woocommerce.ts` has `getProductBySlug()` |
| Order Creation | ✅ Complete | `/lib/woocommerce.ts` has `createOrder()` |
| Order Retrieval | ✅ Complete | `/lib/woocommerce.ts` has `getOrder()` |
| Payment Initiation | ✅ Complete | PortOne SDK integration in checkout flow |

### Features Requiring Migration

| Feature | Current | Target | Effort |
|---------|---------|--------|--------|
| WordPress Frontend | Theme renders public pages | Disabled (plugin or redirect) | LOW - 1 hour |
| API Authentication | Basic Auth (consumer key/secret) | JWT tokens (stateless) | MEDIUM - 4 hours |
| Cart Sessions | localStorage only | Cart Tokens or CoCart | MEDIUM - 6 hours |
| Payment Webhooks | None (payment confirmation in browser only) | Webhook endpoints in Next.js API | MEDIUM - 6 hours |
| Order Status Updates | Manual polling (none) | Webhook-driven status updates | LOW - 2 hours |

## MVP Definition

### Launch With (Headless v1)

Minimum viable headless implementation - what's needed for zero downtime migration.

- [x] **Disable WordPress Frontend** - Block public access to WordPress theme URLs
  - **Why essential:** Prevents duplicate content, forces API-only usage
  - **Effort:** 1 hour (install plugin or add redirect code)

- [x] **Cart Token Implementation** - Migrate from localStorage to WooCommerce Cart Tokens
  - **Why essential:** Enables server-side cart validation, prevents cart manipulation
  - **Effort:** 6 hours (integrate Cart Token API, migrate Zustand store)

- [x] **Payment Webhook Handler** - Accept payment confirmations from PortOne
  - **Why essential:** Current flow breaks if browser closes during payment
  - **Effort:** 6 hours (build webhook endpoint, verify signatures, update order status)

- [x] **JWT Authentication** - Replace Basic Auth with JWT tokens
  - **Why essential:** Stateless auth scales better, avoids exposing consumer keys in logs
  - **Effort:** 4 hours (install JWT plugin, update API calls)

### Add After Validation (v1.x)

Features to add once core headless mode is stable.

- [ ] **Order Status Webhooks** - Real-time order updates (shipping, delivery)
  - **Trigger:** After payment webhooks work reliably
  - **Effort:** 4 hours

- [ ] **Product Sync Webhooks** - WordPress product changes trigger Next.js revalidation
  - **Trigger:** When product updates need <5 minute propagation
  - **Effort:** 6 hours (webhook receiver + ISR revalidation)

- [ ] **User Authentication** - JWT-based user login for order history
  - **Trigger:** When repeat customer feature requested
  - **Effort:** 12 hours (login form, JWT flow, protected routes)

### Future Consideration (v2+)

Features to defer until headless architecture proves stable.

- [ ] **Multi-Frontend Support** - Mobile app using same WordPress API
  - **Why defer:** Validate web frontend first before expanding to mobile
  - **Effort:** 40+ hours (React Native app development)

- [ ] **GraphQL API** - Add WPGraphQL for more efficient queries
  - **Why defer:** REST API sufficient for current needs, GraphQL adds complexity
  - **Effort:** 16 hours (install WPGraphQL, rewrite queries)

- [ ] **Headless Admin Dashboard** - Custom admin UI for order management
  - **Why defer:** WordPress wp-admin works fine for now
  - **Effort:** 80+ hours (full admin UI rebuild)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Disable WordPress Frontend | HIGH (SEO, security) | LOW (1 hour) | P1 |
| Payment Webhook Handler | HIGH (reliability) | MEDIUM (6 hours) | P1 |
| JWT Authentication | MEDIUM (security) | MEDIUM (4 hours) | P1 |
| Cart Token Implementation | HIGH (validation) | MEDIUM (6 hours) | P1 |
| Order Status Webhooks | MEDIUM (UX) | MEDIUM (4 hours) | P2 |
| Product Sync Webhooks | MEDIUM (freshness) | MEDIUM (6 hours) | P2 |
| User Authentication | MEDIUM (repeat customers) | HIGH (12 hours) | P2 |
| Multi-Frontend Support | LOW (future-proofing) | HIGH (40+ hours) | P3 |
| GraphQL API | LOW (performance) | HIGH (16 hours) | P3 |
| Headless Admin Dashboard | LOW (convenience) | HIGH (80+ hours) | P3 |

**Priority key:**
- P1: Must have for headless migration (launch blockers)
- P2: Should have, add within 2-4 weeks post-launch
- P3: Nice to have, consider for v2.0+

## Technical Implementation Details

### WooCommerce REST API vs Store API vs CoCart

| Aspect | WooCommerce REST API | WooCommerce Store API | CoCart Plugin |
|--------|---------------------|----------------------|---------------|
| **Authentication** | Required (OAuth/JWT) | Unauthenticated (nonces for cart) | Optional (JWT or cookie-less) |
| **Cart Support** | ❌ None | ✅ Cart endpoints (block-based) | ✅ Full cart CRUD |
| **Use Case** | Admin operations (products, orders) | Gutenberg blocks frontend | Headless frontends |
| **Headless Ready** | ⚠️ Partial (no cart) | ⚠️ Limited (nonce issues) | ✅ Yes (designed for it) |
| **Session Management** | N/A | Browser cookies (nonces) | Cookie-less (database sessions) |
| **Maturity** | Stable (v3 since 2016) | Stable (2022+) | Mature (5+ years) |
| **Recommendation** | Use for products/orders | ❌ Avoid (nonce issues) | ✅ Use for cart |

**Decision:** Use WooCommerce REST API for products/orders + CoCart for cart management.

### Authentication Methods Comparison

| Method | Security | Complexity | Use Case | Recommendation |
|--------|----------|------------|----------|----------------|
| **Basic Auth (Consumer Key/Secret)** | ⚠️ Medium | LOW | Server-to-server | ❌ Avoid (keys in logs) |
| **OAuth 1.0a** | ✅ High | HIGH | Legacy integrations | ❌ Overkill |
| **JWT (JSON Web Tokens)** | ✅ High | MEDIUM | Modern apps | ✅ Recommended |
| **Cart Tokens** | ✅ High | LOW | Cart-specific | ✅ Use with CoCart |

**Decision:** Use JWT for admin operations (products, orders), Cart Tokens for cart operations.

### Session Management Options

| Option | Persistence | Validation | Scalability | Recommendation |
|--------|------------|------------|-------------|----------------|
| **localStorage Only (Current)** | ❌ Client-only | ❌ None | ✅ High | ❌ Insecure |
| **WooCommerce Cart Tokens** | ✅ Server-side | ✅ Token-based | ✅ High | ✅ Recommended |
| **CoCart Sessions** | ✅ Database | ✅ Token-based | ✅ High | ✅ Best for headless |
| **WordPress Cookies** | ⚠️ Cookie-based | ⚠️ Nonce-based | ⚠️ Medium | ❌ Breaks headless |

**Decision:** Migrate to CoCart plugin for cookie-less, database-backed sessions.

### Payment Webhook Flow

**Current Flow (Browser-Only):**
```
1. User clicks "Pay" → PortOne modal opens
2. Payment completes → Callback to browser
3. Browser calls `/api/payment/verify` → Success
4. Browser navigates to `/order-complete`
❌ PROBLEM: If browser closes during payment, order stays "pending"
```

**Headless Flow (Webhook-Driven):**
```
1. User clicks "Pay" → PortOne modal opens
2. Payment completes → Callback to browser + webhook to server
3. Webhook endpoint `/api/payment/webhook` receives notification
4. Server verifies payment signature
5. Server updates WooCommerce order status → "completed"
6. Server triggers email notification (future)
7. Browser polls `/api/orders/{id}` → Sees "completed" status
8. Browser navigates to `/order-complete`
✅ BENEFIT: Order updates even if browser closes
```

## Sources

**HIGH Confidence (Official Documentation):**
- [WooCommerce REST API Documentation](https://developer.woocommerce.com/docs/apis/rest-api/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WooCommerce Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/)

**MEDIUM Confidence (Verified Community Resources):**
- [Building Headless WooCommerce with REST API (Hippoo Auth)](https://hippoo.app/2025/07/22/building-a-headless-woocommerce-store-using-the-rest-api-and-hippoo-auth/)
- [WooCommerce REST API Integration Guide 2026 (Cloudways)](https://www.cloudways.com/blog/woocommerce-rest-api/)
- [WordPress as Headless CMS 2026 Guide (Ecommerce Launcher)](https://ecommercelauncher.com/woocommerce/wordpress-as-headless-cms)
- [Disable Frontend in Headless WordPress (DEV Community)](https://dev.to/rajeshkumaryadavdotcom/disable-frontend-in-headless-wordpress-l70)
- [CoCart Plugin for Headless WooCommerce](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/)
- [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- [Headless Mode Plugin](https://pluginmachine.com/plugin-machine-plugins/headless-mode/)
- [WooCommerce Headless Checkout Options (Jacob Arriola)](https://jacobarriola.com/post/headless-woocommerce-checkout-options/)
- [WooCommerce Store API vs REST API (WP Tavern)](https://wptavern.com/woocommerce-store-api-now-stable-provides-better-support-for-custom-frontends)

**LOW Confidence (Unverified - require validation):**
- Payment gateway webhook implementations (vendor-specific, need PortOne docs)
- Gabia hosting API restrictions (hosting-specific, need testing)

---

*Feature research for: Headless WordPress E-commerce Migration*
*Researched: 2026-01-27*
*Confidence: HIGH for table stakes and differentiators, MEDIUM for migration path*
