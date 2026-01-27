---
phase: 3
status: ready_to_plan
gathered: 2026-01-27
---

# Phase 3 Context: Next.js API Routes & Authentication

## Phase Goal

Backend-for-Frontend (BFF) API proxy layer operational with secure credential management, all WordPress communication flows through Next.js routes.

## Implementation Decisions

### Full Claude Discretion

User approved **Claude's discretion** for all Phase 3 technical decisions. Researcher and planner should follow Next.js + WordPress headless architecture best practices for:

**API Route Organization:**
- Route structure and naming conventions (RESTful patterns recommended)
- Request/response formatting
- Route grouping and modularity
- TypeScript types for API contracts

**Credential Management:**
- Environment variable handling (Vercel dashboard configuration)
- WordPress API credentials storage and access
- JWT secret management
- Credential validation and error handling

**Error Handling & Responses:**
- Error propagation from WordPress to Next.js to client
- HTTP status code mapping
- Error message formatting
- Retry logic and timeout handling
- CORS error handling

**Authentication Flow:**
- JWT token generation strategy
- Token refresh mechanism
- Session management approach
- Token storage (HttpOnly cookies vs headers)
- Token validation middleware

**Decision Rationale:**
- Phase 3 is technical infrastructure with established patterns
- Next.js API routes + WordPress REST API is a solved problem
- Standard approaches work well (no custom requirements)
- User prioritizes speed over custom specifications

---

## Key Constraints

**From Previous Phases:**
- WordPress backend at 82mobile.com (Gabia hosting)
- CORS headers configured for Vercel domain (Phase 1)
- JWT Authentication plugin active (Phase 1)
- CoCart plugin for cart sessions (Phase 1)
- Cache bypass verified working (Phase 2)
- Redis unavailable (Phase 2)

**Integration Points:**
- `/api/products` → WordPress `/wp-json/wc/v3/products`
- `/api/orders` → WordPress `/wp-json/wc/v3/orders`
- `/api/cart` → CoCart `/wp-json/cocart/v2/cart`
- `/api/auth/token` → JWT `/wp-json/jwt-auth/v1/token`

**Environment Variables Needed:**
- `WORDPRESS_API_URL` (http://82mobile.com/wp-json)
- `WORDPRESS_JWT_SECRET` (from Phase 1)
- `WOOCOMMERCE_CONSUMER_KEY` (from Phase 1)
- `WOOCOMMERCE_CONSUMER_SECRET` (from Phase 1)

---

## Success Criteria (from ROADMAP.md)

1. `/api/products` route returns product data from WordPress API with pagination and filtering working
2. `/api/orders` route creates orders in WooCommerce; order status retrieval works
3. JWT tokens generated via `/api/auth/token` route; tokens included in Authorization headers for WordPress requests
4. Environment variables configured in Vercel dashboard (WORDPRESS_API_URL, JWT secret, WooCommerce keys)
5. Error handling graceful (CORS errors, network failures, WordPress API errors)

---

## Dependencies

**Requires from Phase 1:**
- ✅ WordPress REST API accessible
- ✅ JWT Authentication plugin configured
- ✅ CORS headers for Vercel domain
- ✅ CoCart plugin active
- ✅ WooCommerce API credentials

**Requires from Phase 2:**
- ✅ Cache bypass verified
- ✅ DNS cutover strategy documented

**Blocks Phase 4:**
- Next.js API routes must be operational before frontend cart implementation

---

## Specific Ideas

None - standard Next.js API routes + WordPress REST API integration following established patterns.

---

## Deferred Ideas

None - discussion stayed within phase scope (no new capabilities suggested).

---

*Phase: 03-nextjs-api-routes-authentication*
*Context gathered: 2026-01-27*
*Approach: Full Claude discretion (technical best practices)*
