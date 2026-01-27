# Roadmap: 82mobile.com Headless WordPress Migration

## Overview

This roadmap transforms 82mobile.com from a monolithic Next.js application into a true headless WordPress architecture through 7 carefully orchestrated phases. Starting with WordPress backend configuration (API-only mode, JWT authentication, CORS), progressing through infrastructure hardening (caching bypass, DNS strategy), building the Next.js frontend layer (API routes, cart sessions, UI components), integrating payment gateways, and culminating in zero-downtime production cutover with comprehensive testing. Each phase delivers independently verifiable capabilities that unblock subsequent work, minimizing risk while maintaining continuous operation of the live e-commerce site.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5, 6, 7): Planned milestone work
- Decimal phases (e.g., 2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: WordPress Backend API Setup** - Configure WordPress as headless backend with API-only access
- [x] **Phase 2: Infrastructure & Caching Strategy** - Overcome Gabia caching limitations and establish deployment infrastructure
- [x] **Phase 3: Next.js API Routes & Authentication** - Build Backend-for-Frontend proxy layer with secure credential management
- [ ] **Phase 4: Cart Implementation with CoCart** - Implement headless cart sessions with triple-redundant state management
- [ ] **Phase 5: Frontend UI Components** - Build product catalog, checkout flow, and multilingual UI
- [ ] **Phase 6: Payment Gateway Integration** - Integrate PortOne and Eximbay with webhook verification
- [ ] **Phase 7: Testing, Gradual Cutover, Stabilization** - Comprehensive testing, zero-downtime DNS cutover, 72-hour stabilization

## Phase Details

### Phase 1: WordPress Backend API Setup
**Goal**: WordPress configured as API-only headless backend with secure REST API access, CORS enabled, and frontend theme disabled

**Depends on**: Nothing (first phase)

**Requirements**: BACKEND-01, BACKEND-02, BACKEND-03, BACKEND-04, BACKEND-05, BACKEND-06, BACKEND-08

**Success Criteria** (what must be TRUE):
  1. WordPress public pages return 404 or redirect to Next.js domain; only /wp-admin remains accessible
  2. WooCommerce REST API endpoints (`/wp-json/wc/v3/products`, `/wp-json/wc/v3/orders`) respond successfully to requests from external domain (tested with curl/Postman)
  3. CORS preflight (OPTIONS) requests from Vercel domain succeed with proper headers (Access-Control-Allow-Origin, Access-Control-Allow-Credentials)
  4. JWT Authentication plugin generates valid tokens; tokens authenticate API requests successfully
  5. CoCart plugin installed and activated; cart token creation endpoint (`/wp-json/cocart/v2/cart`) accessible

**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Headless mode, JWT auth, CORS headers, and cache bypass
- [x] 01-02-PLAN.md — CoCart plugin installation and API documentation

---

### Phase 2: Infrastructure & Caching Strategy
**Goal**: Gabia hosting caching bypassed for API endpoints, DNS cutover strategy established, immediate production cutover ready (adjusted: no subdomain testing per user requirement)

**Depends on**: Phase 1

**Requirements**: BACKEND-07, DEPLOY-04

**Success Criteria** (what must be TRUE):
  1. API endpoints (`/wp-json/*`) return fresh data (no 24-48h cache delay) verified by HTTP header testing ✅
  2. ~~Subdomain `new.82mobile.com` configured and accessible (parallel run environment ready)~~ **REMOVED** - User requested immediate cutover ("바로 전환")
  3. DNS cutover plan documented with rollback procedure; low TTL DNS records (300s) configured in Cloudflare ✅
  4. .htaccess cache exclusion rules deployed and verified working for `/wp-json/` paths ✅
  5. Redis Object Cache plugin (if Gabia supports) configured and cache hit rate monitored ✅ (Redis unavailable on Gabia, documented)

**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Cache verification and 48-hour monitoring
- [x] 02-02-PLAN.md — Redis Object Cache testing (unavailable, documented)
- [x] 02-03-PLAN.md — DNS cutover strategy and Vercel configuration

---

### Phase 3: Next.js API Routes & Authentication
**Goal**: Backend-for-Frontend API proxy layer operational with secure credential management, all WordPress communication flows through Next.js routes

**Depends on**: Phase 2

**Requirements**: FRONTEND-01, FRONTEND-02, FRONTEND-03, DEPLOY-05

**Success Criteria** (what must be TRUE):
  1. `/api/products` route returns product data from WordPress API with pagination and filtering working
  2. `/api/orders` route creates orders in WooCommerce; order status retrieval works
  3. JWT tokens generated via `/api/auth/token` route; tokens included in Authorization headers for WordPress requests
  4. WooCommerce API credentials (consumer key/secret) never exposed to browser; only API routes access them
  5. Environment variables configured in Vercel dashboard; API routes read secrets correctly in all environments (development, preview, production)

**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Shared Infrastructure Libraries (env validation, error handling, JWT auth, CoCart utilities)
- [x] 03-02-PLAN.md — API Route Handlers (auth token, cart operations, product detail, JWT middleware)
- [x] 03-03-PLAN.md — Environment Configuration (.env templates, README docs, Vercel setup)

---

### Phase 4: Cart Implementation with CoCart
**Goal**: Headless cart sessions working with triple-redundant state management (Zustand + CoCart API + localStorage), cart persists across page navigations and browser sessions

**Depends on**: Phase 3

**Requirements**: FRONTEND-04

**Success Criteria** (what must be TRUE):
  1. User adds product to cart; cart state syncs with CoCart API and persists to WordPress database
  2. User refreshes page; cart items restore from CoCart session (cart not lost)
  3. Cart token stored in three places (HTTP-only cookie, localStorage backup, React Context); cart recovery logic handles missing tokens
  4. Cart quantity updates (add, remove, update) reflect immediately in UI and sync to CoCart backend
  5. Cart validates inventory at checkout (prevents ordering out-of-stock items)

**Plans**: TBD

Plans:
- [ ] 04-01: Build Zustand cart store with CoCart integration
- [ ] 04-02: Implement cart token storage and recovery logic
- [ ] 04-03: Add cart validation and inventory checks

---

### Phase 5: Frontend UI Components
**Goal**: Complete product catalog, cart UI, checkout flow, and multilingual support rendered by Next.js, consuming WordPress API data

**Depends on**: Phase 4

**Requirements**: FRONTEND-07

**Success Criteria** (what must be TRUE):
  1. Product listing page (`/[locale]/shop`) displays products from WordPress API with filtering (type, duration) and sorting
  2. Product detail pages (`/[locale]/shop/[slug]`) show product information, images, plan selection, and "Add to Cart" functionality
  3. Cart drawer opens with cart items; quantity controls work; cart totals calculate correctly
  4. Checkout form (`/[locale]/checkout`) validates customer details (React Hook Form + Zod); form submits to order API
  5. Language switcher (Korean/English) changes UI language and updates product data; routes reflect locale (`/ko/`, `/en/`)
  6. Mobile responsive design verified (320px - 1920px); touch interactions work on mobile devices

**Plans**: TBD

Plans:
- [ ] 05-01: Build product listing and detail pages
- [ ] 05-02: Create cart drawer and checkout form UI
- [ ] 05-03: Implement internationalization and responsive design

---

### Phase 6: Payment Gateway Integration
**Goal**: PortOne and Eximbay payment gateways integrated with webhook verification; payment flow completes end-to-end from checkout to order confirmation

**Depends on**: Phase 5

**Requirements**: FRONTEND-05, FRONTEND-06, TEST-04, CRITICAL-04

**Success Criteria** (what must be TRUE):
  1. User completes checkout; PortOne payment modal opens with correct order details (amount, currency, customer info)
  2. User completes payment in sandbox; webhook received at WordPress endpoint; webhook signature verified
  3. Order status updates from "Pending Payment" to "Processing" automatically after webhook received
  4. Order confirmation page displays with correct order number and payment status
  5. Webhook endpoint accessible from external domain (payment gateway servers); webhook retries handled gracefully
  6. Eximbay credentials configured (pending customer delivery); Eximbay payment flow tested in sandbox

**Plans**: TBD

Plans:
- [ ] 06-01: Integrate PortOne SDK and payment initiation
- [ ] 06-02: Build webhook endpoints with signature verification
- [ ] 06-03: Configure Eximbay and test international payments (when credentials available)

---

### Phase 7: Testing, Gradual Cutover, Stabilization
**Goal**: Zero-downtime production cutover complete; headless architecture verified working; old monolithic site decommissioned

**Depends on**: Phase 6

**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, TEST-01, TEST-02, TEST-03, TEST-05, TEST-06, TEST-07, CRITICAL-01, CRITICAL-02, CRITICAL-03

**Success Criteria** (what must be TRUE):
  1. End-to-end test passes: Browse products → Add to cart → Checkout → Pay → Receive confirmation (no console errors)
  2. Subdomain parallel run completes successfully; feature parity verified between old and new architecture
  3. DNS cutover executed; 82mobile.com resolves to Vercel Next.js frontend; no downtime observed
  4. Core Web Vitals meet targets (LCP < 2.5s, FID < 100ms, CLS < 0.1); Lighthouse score ≥ 90
  5. WordPress wp-admin accessible at 82mobile.com/wp-admin; product management works for customer
  6. Sentry error monitoring configured; no critical errors logged in first 72 hours post-cutover
  7. Playwright E2E test suite running; checkout flow automated test passes consistently
  8. Customer confirms: "모든 문제가 해결될떄까지" (All problems solved) ✓

**Plans**: TBD

Plans:
- [ ] 07-01: Build comprehensive test suite (Playwright E2E)
- [ ] 07-02: Execute parallel run and feature parity verification
- [ ] 07-03: Perform DNS cutover and 72-hour stabilization
- [ ] 07-04: Set up monitoring and automated testing infrastructure

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. WordPress Backend API Setup | 2/2 | Complete | 2026-01-27 |
| 2. Infrastructure & Caching Strategy | 3/3 | Complete | 2026-01-27 |
| 3. Next.js API Routes & Authentication | 3/3 | Complete | 2026-01-28 |
| 4. Cart Implementation with CoCart | 0/3 | Not started | - |
| 5. Frontend UI Components | 0/3 | Not started | - |
| 6. Payment Gateway Integration | 0/3 | Not started | - |
| 7. Testing, Gradual Cutover, Stabilization | 0/4 | Not started | - |

**Total Plans:** 21 plans across 7 phases
**Requirements Coverage:** 32/32 requirements mapped (100% ✓)
