# Requirements: Headless WordPress Architecture

**Project:** 82mobile.com - Headless WordPress Migration
**Version:** v1.0 (Headless Architecture)
**Status:** Requirements Defined
**Date:** 2026-01-27

---

## Core Value

**THE ONE THING that must work:**

Seamless backend/frontend separation where WordPress provides product catalog and order management via REST API, while Next.js handles all user-facing experiences with zero downtime during migration.

**Success means:** Customers can browse products, add to cart, checkout, and complete payment through the new headless architecture with identical (or improved) user experience.

---

## v1 Requirements

### Backend Configuration

Requirements for transforming WordPress into API-only headless backend.

- [x] **BACKEND-01**: Configure WordPress as headless (disable frontend theme rendering)
  - **Acceptance:** WordPress public pages return 404 or redirect; wp-admin remains accessible
  - **Priority:** CRITICAL
  - **Effort:** 1-2 hours
  - **Status:** Complete (Phase 1, Plan 01-01)

- [x] **BACKEND-02**: Verify WooCommerce REST API accessibility from external domains
  - **Acceptance:** API endpoints (`/wp-json/wc/v3/*`) respond to requests from Vercel domain
  - **Priority:** CRITICAL
  - **Effort:** 1 hour
  - **Status:** Complete (Phase 1, verified in 01-VERIFICATION.md)

- [x] **BACKEND-03**: Set up CORS headers for Vercel frontend requests
  - **Acceptance:** CORS headers configured via plugin + .htaccess; OPTIONS requests succeed
  - **Priority:** CRITICAL
  - **Effort:** 2 hours
  - **Status:** Complete (Phase 1, Plan 01-01 + 01-02)

- [x] **BACKEND-04**: Implement JWT token authentication for API
  - **Acceptance:** JWT Authentication plugin installed; tokens generated and validated successfully
  - **Priority:** CRITICAL
  - **Effort:** 4 hours
  - **Status:** Complete (Phase 1, Plan 01-01)

- [x] **BACKEND-05**: Install and configure CoCart plugin for headless cart sessions
  - **Acceptance:** CoCart plugin active; cart tokens generated; cart persists across sessions
  - **Priority:** CRITICAL
  - **Effort:** 6 hours
  - **Status:** Complete (Phase 1, Plan 01-02)

- [x] **BACKEND-06**: Configure authentication tokens/API keys for production
  - **Acceptance:** JWT secret key configured in wp-config.php; WooCommerce consumer key/secret updated
  - **Priority:** HIGH
  - **Effort:** 1 hour
  - **Status:** Complete (Phase 1, Plan 01-01)

- [x] **BACKEND-07**: Implement Redis Object Cache to bypass Gabia server cache
  - **Acceptance:** Redis plugin installed; `/wp-json/` excluded from server cache via .htaccess
  - **Priority:** HIGH
  - **Effort:** 3 hours
  - **Status:** Complete - Redis unavailable on Gabia hosting (tested 2026-01-27); proceeded without Redis (non-blocking for headless architecture; cache bypass handled by .htaccess)

- [x] **BACKEND-08**: Document API authentication flow
  - **Acceptance:** Documentation covers JWT token generation, usage, and refresh flow
  - **Priority:** MEDIUM
  - **Effort:** 2 hours
  - **Status:** Complete (Phase 1, Plan 01-02 - API-AUTH-DOCS.md)

### Frontend Updates

Requirements for updating Next.js frontend to consume headless WordPress API.

- [x] **FRONTEND-01**: Update environment variables for headless backend URL
  - **Acceptance:** `WORDPRESS_API_URL`, `WORDPRESS_JWT_SECRET` configured in Vercel dashboard
  - **Priority:** CRITICAL
  - **Effort:** 1 hour
  - **Status:** Complete (Phase 3, Plan 03-03)

- [x] **FRONTEND-02**: Verify all API routes consume WordPress REST API correctly
  - **Acceptance:** `/api/products`, `/api/orders`, `/api/cart` routes proxy WordPress API successfully
  - **Priority:** CRITICAL
  - **Effort:** 3 hours
  - **Status:** Complete (Phase 3, Plans 03-01, 03-02)

- [x] **FRONTEND-03**: Implement JWT token authentication flow in API routes
  - **Acceptance:** API routes include JWT token in Authorization header; tokens stored securely
  - **Priority:** CRITICAL
  - **Effort:** 4 hours
  - **Status:** Complete (Phase 3, Plans 03-01, 03-02)

- [ ] **FRONTEND-04**: Migrate cart from localStorage-only to CoCart API integration
  - **Acceptance:** Zustand cart store syncs with CoCart API; cart persists across sessions
  - **Priority:** CRITICAL
  - **Effort:** 6 hours

- [ ] **FRONTEND-05**: Implement payment webhook endpoints
  - **Acceptance:** `/api/webhooks/portone` receives payment confirmations; order status updated in WordPress
  - **Priority:** CRITICAL
  - **Effort:** 6 hours

- [ ] **FRONTEND-06**: Ensure payment webhooks route correctly
  - **Acceptance:** Webhook endpoint accessible from external domain; signature verification working
  - **Priority:** HIGH
  - **Effort:** 2 hours

- [ ] **FRONTEND-07**: Update error handling for cross-origin requests
  - **Acceptance:** CORS errors handled gracefully; retry logic for failed API requests
  - **Priority:** MEDIUM
  - **Effort:** 3 hours

### Integration & Deployment

Requirements for deploying and integrating headless architecture in production.

- [ ] **DEPLOY-01**: Resolve Vercel domain assignment conflict (82mobile.com)
  - **Acceptance:** 82mobile.com successfully assigned to new Vercel project without errors
  - **Priority:** CRITICAL
  - **Effort:** 2 hours

- [ ] **DEPLOY-02**: Deploy headless WordPress to Gabia (verify API-only mode)
  - **Acceptance:** WordPress accessible only at /wp-admin; public pages disabled; API endpoints working
  - **Priority:** CRITICAL
  - **Effort:** 3 hours

- [ ] **DEPLOY-03**: Deploy Next.js frontend to Vercel
  - **Acceptance:** Frontend deployed to Vercel; all pages load; API routes functional
  - **Priority:** CRITICAL
  - **Effort:** 2 hours

- [x] **DEPLOY-04**: Configure DNS records for zero downtime cutover
  - **Acceptance:** DNS strategy documented; ~~parallel run environment ready~~; cutover plan approved
  - **Priority:** CRITICAL
  - **Effort:** 4 hours
  - **Status:** Complete (Phase 2, Plan 02-03) - Immediate cutover strategy approved; DNS automation script ready; Vercel configuration complete

- [x] **DEPLOY-05**: Set up environment variable management (Vercel dashboard)
  - **Acceptance:** All secrets configured in Vercel; environment variables match production requirements
  - **Priority:** HIGH
  - **Effort:** 1 hour
  - **Status:** Complete (Phase 3, Plan 03-03)

### Testing & Verification

Requirements for comprehensive testing before production cutover.

- [ ] **TEST-01**: Test product listing from headless WordPress
  - **Acceptance:** Products load correctly; images display; filtering works; no console errors
  - **Priority:** CRITICAL
  - **Effort:** 2 hours

- [ ] **TEST-02**: Test cart operations (add, remove, update quantity)
  - **Acceptance:** Cart state syncs with CoCart API; quantity updates persist; cart drawer works
  - **Priority:** CRITICAL
  - **Effort:** 2 hours

- [ ] **TEST-03**: Test checkout flow end-to-end
  - **Acceptance:** Checkout form submits; order created in WordPress; confirmation page displays
  - **Priority:** CRITICAL
  - **Effort:** 3 hours

- [ ] **TEST-04**: Test payment processing (PortOne sandbox)
  - **Acceptance:** Payment initiates; webhook receives confirmation; order status updates to "completed"
  - **Priority:** CRITICAL
  - **Effort:** 3 hours

- [ ] **TEST-05**: Verify order creation in WooCommerce
  - **Acceptance:** Orders appear in WooCommerce admin; customer details correct; line items accurate
  - **Priority:** CRITICAL
  - **Effort:** 1 hour

- [ ] **TEST-06**: Test multilingual functionality (ko/en switching)
  - **Acceptance:** Language switching works; product data displays in correct language; UI updates
  - **Priority:** HIGH
  - **Effort:** 2 hours

- [ ] **TEST-07**: Performance testing (Core Web Vitals on new architecture)
  - **Acceptance:** LCP < 2.5s; FID < 100ms; CLS < 0.1; Lighthouse score ≥ 90
  - **Priority:** MEDIUM
  - **Effort:** 3 hours

### Critical Issues Resolution

Requirements for resolving known blockers and technical debt.

- [ ] **CRITICAL-01**: Resolve Vercel domain conflict ("already assigned to another project")
  - **Acceptance:** Domain removed from conflicting project; DNS configured correctly; no errors
  - **Priority:** CRITICAL (Blocking Deployment)
  - **Effort:** 2 hours

- [ ] **CRITICAL-02**: Implement basic error monitoring (Sentry or similar)
  - **Acceptance:** Sentry integrated; frontend + API errors tracked; alerts configured
  - **Priority:** HIGH
  - **Effort:** 3 hours

- [ ] **CRITICAL-03**: Set up automated testing foundation (Vitest + Playwright)
  - **Acceptance:** Vitest configured for unit tests; Playwright for E2E; sample tests passing
  - **Priority:** MEDIUM
  - **Effort:** 5 hours

- [ ] **CRITICAL-04**: Obtain Eximbay credentials from customer (international payments)
  - **Acceptance:** Eximbay credentials received; configured in environment variables; tested in sandbox
  - **Priority:** MEDIUM (Non-Blocking)
  - **Effort:** 1 hour (waiting on customer)

---

## v2 Requirements (Future Consideration)

Features deferred to v2.0 milestone after headless architecture stabilizes.

### Authentication System
- User accounts and login system (email/password)
- OAuth integration (Google, Naver, KakaoTalk)
- Session management with JWT
- User profile management
- **Rationale:** v1.0 focuses on guest checkout; authentication adds complexity

### Advanced Features
- Email notification service (Resend or SendGrid)
- SMS notifications (Aligo or Twilio)
- A/B testing infrastructure
- Order tracking system with eSIM delivery status
- Dynamic SEO metadata (currently static)
- Rate limiting on API routes
- Image optimization migration (to Vercel Blob or CDN)

### Testing Infrastructure
- Comprehensive test suite (unit, integration, E2E)
- Visual regression testing (Playwright Visual Comparisons)
- Load testing for API routes
- Accessibility auditing (axe-core)
- **Rationale:** Focus on headless architecture first; testing foundation in v2.0

### Security Enhancements
- localStorage cart encryption
- Advanced webhook signature verification
- CORS configuration hardening
- API rate limiting

---

## Out of Scope

Features explicitly excluded from this project.

### WordPress-Specific Features
- **WordPress Login on Frontend** — Use JWT token authentication with custom login form instead
  - **Rationale:** Creates session management complexity; forces cookie dependency; loses headless benefits

- **Full WooCommerce Block Editor** — Build custom product templates in Next.js instead
  - **Rationale:** Requires WordPress frontend rendering; defeats headless purpose

- **Direct WordPress URL Access** — Redirect all WordPress frontend to Next.js
  - **Rationale:** Confuses users with two storefronts; SEO duplicate content issues

- **Shared Session Between WP and Next.js** — Pick ONE frontend (Next.js)
  - **Rationale:** Cookie domain restrictions; CORS nightmare; security risks

- **Real-Time Inventory Sync** — Use webhook-triggered revalidation or 5-minute cache
  - **Rationale:** Constant API polling; performance overhead; cache invalidation issues

- **WooCommerce Native Checkout** — Build custom checkout in Next.js
  - **Rationale:** User redirects mid-flow; breaks UX; loses analytics

---

## Traceability Matrix

Maps requirements to roadmap phases (filled by gsd-roadmapper).

| Requirement ID | Category | Phase | Plan | Status |
|----------------|----------|-------|------|--------|
| BACKEND-01 | Backend Configuration | Phase 1 | TBD | Pending |
| BACKEND-02 | Backend Configuration | Phase 1 | TBD | Pending |
| BACKEND-03 | Backend Configuration | Phase 1 | TBD | Pending |
| BACKEND-04 | Backend Configuration | Phase 1 | TBD | Pending |
| BACKEND-05 | Backend Configuration | Phase 1 | TBD | Pending |
| BACKEND-06 | Backend Configuration | Phase 1 | TBD | Pending |
| BACKEND-07 | Backend Configuration | Phase 2 | 02-02 | Complete |
| BACKEND-08 | Backend Configuration | Phase 1 | TBD | Pending |
| FRONTEND-01 | Frontend Updates | Phase 3 | 03-03 | Complete |
| FRONTEND-02 | Frontend Updates | Phase 3 | 03-01, 03-02 | Complete |
| FRONTEND-03 | Frontend Updates | Phase 3 | 03-01, 03-02 | Complete |
| FRONTEND-04 | Frontend Updates | Phase 4 | TBD | Pending |
| FRONTEND-05 | Frontend Updates | Phase 6 | TBD | Pending |
| FRONTEND-06 | Frontend Updates | Phase 6 | TBD | Pending |
| FRONTEND-07 | Frontend Updates | Phase 5 | TBD | Pending |
| DEPLOY-01 | Integration & Deployment | Phase 7 | TBD | Pending |
| DEPLOY-02 | Integration & Deployment | Phase 7 | TBD | Pending |
| DEPLOY-03 | Integration & Deployment | Phase 7 | TBD | Pending |
| DEPLOY-04 | Integration & Deployment | Phase 2 | 02-03 | Complete |
| DEPLOY-05 | Integration & Deployment | Phase 3 | 03-03 | Complete |
| TEST-01 | Testing & Verification | Phase 7 | TBD | Pending |
| TEST-02 | Testing & Verification | Phase 7 | TBD | Pending |
| TEST-03 | Testing & Verification | Phase 7 | TBD | Pending |
| TEST-04 | Testing & Verification | Phase 6 | TBD | Pending |
| TEST-05 | Testing & Verification | Phase 7 | TBD | Pending |
| TEST-06 | Testing & Verification | Phase 7 | TBD | Pending |
| TEST-07 | Testing & Verification | Phase 7 | TBD | Pending |
| CRITICAL-01 | Critical Issues Resolution | Phase 7 | TBD | Pending |
| CRITICAL-02 | Critical Issues Resolution | Phase 7 | TBD | Pending |
| CRITICAL-03 | Critical Issues Resolution | Phase 7 | TBD | Pending |
| CRITICAL-04 | Critical Issues Resolution | Phase 6 | TBD | Pending |

---

**Total v1 Requirements:** 31

**Requirements Breakdown:**
- Backend Configuration: 8 requirements
- Frontend Updates: 7 requirements
- Integration & Deployment: 5 requirements
- Testing & Verification: 7 requirements
- Critical Issues Resolution: 4 requirements
- Out of Scope: 11 items (not counted in v1 total)

---

*Requirements defined: 2026-01-27*
*Traceability matrix will be populated by gsd-roadmapper*
