# 82Mobile - Headless WordPress Architecture

## What This Is

Migration of 82mobile.com e-commerce platform to headless WordPress architecture, decoupling the existing monolithic Next.js application into:

- **Backend:** Gabia WordPress (API-only, WooCommerce REST API) - No frontend rendering
- **Frontend:** Next.js 14 on Vercel - Modern React SSR/SSG consuming WordPress API
- **Goal:** Production-ready headless architecture with complete integration and testing

**Customer:** 권아담 (Adam Korea Simcard)
**Domain:** 82mobile.com (Korean SIM cards and eSIM for international tourists)
**Current Status:** v1.0 monolithic Next.js deployed, functioning but needs architectural separation

## Core Value

**THE ONE THING that must work:**

Seamless backend/frontend separation where WordPress provides product catalog and order management via REST API, while Next.js handles all user-facing experiences with zero downtime during migration.

**Success means:** Customers can browse products, add to cart, checkout, and complete payment through the new headless architecture with identical (or improved) user experience.

## Context

### History

**v1.0 Milestone Completed (Previous Work):**
- 7 implementation phases
- 31 execution plans
- 48 git commits
- Deployed at https://82mobile-next.vercel.app
- Features: Product catalog, cart system, checkout flow, PortOne payment integration
- Stack: Next.js 14 App Router, WooCommerce API, Zustand state, React Query, next-intl i18n

**Current Architecture (Monolithic):**
```
Browser → Vercel Next.js → WooCommerce API (82mobile.com)
         (UI + API routes)   (Product data only)
```

**Target Architecture (Headless):**
```
Browser → Vercel Next.js     →  Gabia WordPress (Headless)
         (Frontend only)         (API-only, no theme)
                                 WooCommerce REST API
```

### Brownfield Codebase

Complete codebase mapping completed (7 comprehensive documents in `.planning/codebase/`):
- **STACK.md**: Tech stack (Next.js 14, React 18, WooCommerce API, payment gateways, 30 total dependencies)
- **INTEGRATIONS.md**: External APIs (WooCommerce OAuth 1.0a, PortOne payments, next-intl, Google Analytics)
- **ARCHITECTURE.md**: System design (App Router patterns, state management, data flows, single-page homepage)
- **STRUCTURE.md**: File organization (app/[locale] routes, components, lib utilities, stores)
- **CONVENTIONS.md**: Code standards (TypeScript strict, Tailwind utility-first, React patterns, git commits)
- **TESTING.md**: Testing strategy (Vitest, Playwright, MSW - not yet implemented, zero current coverage)
- **CONCERNS.md**: Technical debt (authentication system, error monitoring, Eximbay credentials, automated testing)

**Total Codebase:** 20+ TypeScript/JavaScript files, 30 npm packages, ~118-126KB first load JS (optimized)

### Constraints

**Must Not Break:**
- Existing WooCommerce product data (catalog, inventory, pricing)
- Customer order history
- Payment gateway integrations (PortOne active, Eximbay pending)
- Multilingual support (Korean, English via next-intl)

**Technical Constraints:**
- **Gabia Hosting:** Shared WordPress hosting, extreme server-level caching (24-48 hour TTL)
- **Domain:** 82mobile.com currently on Vercel (domain assignment conflict to resolve)
- **Budget:** No additional hosting costs, work within existing Gabia + Vercel free tier
- **Timeline:** Customer requirement: "모든 문제가 해결될떄까지" (Solve ALL problems until everything works)

**Known Issues to Address:**
- Vercel domain already assigned error (domain conflict)
- No authentication system (guest checkout only)
- No error monitoring (Sentry)
- Eximbay payment credentials pending from customer
- Zero automated test coverage

### Team

**Developer:** 이종철 (하얀모자마케팅 / Whitehat Marketing)
- Email: jyongchul@naver.com
- Using Claude Code (GSD workflow) for structured implementation

**Customer:** 권아담 (Adam Korea Simcard)
- Email: adamwoohaha@naver.com
- Phone: 010-6424-6530

## Requirements

### Validated (Existing v1.0 Capabilities)

✅ **E-commerce Core:**
- ✓ Product catalog display with filtering (type, duration)
- ✓ Product detail pages with plan selection (3/5/10/20/30 days)
- ✓ Shopping cart system (Zustand + localStorage persistence)
- ✓ Cart drawer UI with quantity controls
- ✓ Checkout form (React Hook Form + Zod validation)
- ✓ Order creation via WooCommerce API
- ✓ Order confirmation page

✅ **Payment Integration:**
- ✓ PortOne payment gateway (Korean domestic payments) - Active
- ✓ Payment webhook handling
- ✓ Eximbay infrastructure ready (credentials pending from customer)

✅ **Internationalization:**
- ✓ Multilingual support (Korean, English)
- ✓ Locale-based routing (/ko/, /en/)
- ✓ next-intl integration with message files

✅ **UI/UX Features:**
- ✓ Responsive mobile-first design (Tailwind CSS)
- ✓ Dancheong Korean cultural color theme
- ✓ Smooth scrolling with Lenis (60fps)
- ✓ 3D product card animations (Framer Motion)
- ✓ Single-page homepage with hash navigation
- ✓ Mobile drawer navigation

✅ **Performance:**
- ✓ First Load JS ~118-126KB (target <220KB met)
- ✓ LCP <2.5s, CLS <0.1 (Core Web Vitals targets met)
- ✓ Image optimization with Next.js Image
- ✓ Font optimization with next/font

✅ **Integration:**
- ✓ WooCommerce REST API client (OAuth 1.0a)
- ✓ Product data fetching and transformation
- ✓ Order creation and status retrieval
- ✓ React Query caching (5-minute stale time)

### Active (Headless Architecture Work)

**Backend Configuration:**
- [ ] Configure WordPress as headless (disable frontend theme rendering)
- [ ] Verify WooCommerce REST API accessibility from external domains
- [ ] Set up CORS headers for Vercel frontend requests
- [ ] Configure authentication tokens/API keys for production
- [ ] Test API endpoints from external client
- [ ] Document API authentication flow

**Frontend Updates:**
- [ ] Update environment variables for headless backend URL
- [ ] Verify all API routes consume WordPress REST API correctly
- [ ] Test authentication flow with headless backend
- [ ] Ensure payment webhooks route correctly
- [ ] Update error handling for cross-origin requests

**Deployment & Integration:**
- [ ] Resolve Vercel domain assignment conflict (82mobile.com)
- [ ] Deploy headless WordPress to Gabia (verify API-only mode)
- [ ] Deploy Next.js frontend to Vercel
- [ ] Configure DNS records for both environments
- [ ] Set up environment variable management (Vercel dashboard)

**Testing & Verification:**
- [ ] Test product listing from headless WordPress
- [ ] Test cart operations (add, remove, update quantity)
- [ ] Test checkout flow end-to-end
- [ ] Test payment processing (PortOne sandbox)
- [ ] Verify order creation in WooCommerce
- [ ] Test multilingual functionality (ko/en switching)
- [ ] Performance testing (Core Web Vitals on new architecture)

**Critical Issues Resolution:**
- [ ] Resolve Vercel domain conflict ("already assigned to another project")
- [ ] Implement basic error monitoring (Sentry or similar)
- [ ] Set up automated testing foundation (Vitest + Playwright)
- [ ] Obtain Eximbay credentials from customer (international payments)

### Out of Scope (v2.0 or Later)

**Authentication System:**
- User accounts and login (v1.0 is guest checkout only) - Effort: 3-5 days
- Email/password login
- OAuth integration (Google, Naver, KakaoTalk)
- Session management with JWT
- User profile management
- Rationale: v1.0 focuses on guest checkout experience, authentication adds complexity

**Advanced Features:**
- Email notification service (Resend or SendGrid) - Effort: 2 days
- SMS notifications (Aligo or Twilio) - Effort: 1 day
- A/B testing infrastructure - Effort: 2-3 days
- Order tracking system with eSIM delivery status
- Dynamic SEO metadata (currently static)
- Rate limiting on API routes
- Image optimization migration (to Vercel Blob or CDN)

**Testing Infrastructure:**
- Comprehensive test suite (unit, integration, E2E) - Effort: 5-7 days
- Visual regression testing (Playwright Visual Comparisons)
- Load testing for API routes
- Accessibility auditing (axe-core)
- Rationale: Focus on headless architecture first, testing foundation in v2.0

**Security Enhancements:**
- localStorage cart encryption
- Advanced webhook signature verification
- CORS configuration hardening
- API rate limiting

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Headless WordPress Architecture** | Decouple backend API from frontend UI for better scalability and modern frontend experience | — Pending implementation |
| **Keep WooCommerce as Backend** | Existing product catalog, order history, and customer data; no migration needed | ✓ Validated in v1.0 |
| **Next.js on Vercel for Frontend** | Optimal performance with Edge CDN, SSR/SSG capabilities, zero-config deployment | ✓ Validated in v1.0 |
| **Gabia Hosting for WordPress** | Customer's existing hosting, no additional costs, WordPress already configured | ✓ Validated |
| **PortOne for Payments (Domestic)** | Korean market standard, simple integration, active and working | ✓ Validated in v1.0 |
| **Eximbay for International** | Foreign card support for tourist market, infrastructure ready | — Pending credentials from customer |
| **Guest Checkout Only (v1.0)** | Simplify MVP, defer authentication complexity to v2.0 | ✓ Validated in v1.0 |
| **Zero Automated Testing (v1.0)** | Ship fast, defer testing infrastructure to v2.0 after architecture stabilizes | — Technical debt acknowledged |
| **Zustand for Client State** | Lightweight (~1KB), simple API, localStorage persistence built-in | ✓ Validated in v1.0 |
| **React Query for Server State** | Automatic caching, background refetching, request deduplication | ✓ Validated in v1.0 |
| **next-intl for i18n** | App Router native, file-based routing, type-safe translations | ✓ Validated in v1.0 |
| **Tailwind CSS for Styling** | Utility-first, custom Dancheong theme, excellent DX | ✓ Validated in v1.0 |

## Success Criteria

**Definition of Done for Headless Architecture:**

1. **Backend (WordPress) is API-Only:**
   - WordPress accessible at 82mobile.com/wp-admin (admin only)
   - WordPress frontend theme disabled or returns minimal HTML
   - WooCommerce REST API accessible from external domains
   - CORS headers configured for Vercel domain
   - All product data available via `/wp-json/wc/v3/products`
   - All order operations work via `/wp-json/wc/v3/orders`

2. **Frontend (Next.js) is Fully Functional:**
   - Deployed to Vercel at 82mobile.com (domain configured correctly)
   - Product listing loads from WordPress API
   - Cart operations work (add, remove, update)
   - Checkout flow completes successfully
   - Payment processing works (PortOne)
   - Order confirmation displays
   - Multilingual switching works (ko/en)

3. **Integration Testing Passes:**
   - End-to-end user flow: Browse → Add to cart → Checkout → Pay → Confirm
   - No console errors in production
   - Core Web Vitals targets met (LCP <2.5s, CLS <0.1)
   - Mobile responsive design verified

4. **Customer Acceptance:**
   - Customer can access WordPress admin at 82mobile.com/wp-admin
   - Customer can manage products via WooCommerce
   - Customer confirms frontend works as expected
   - "모든 문제가 해결될떄까지" (All problems solved) ✓

## Risk Assessment

**High Risk:**
- **Vercel Domain Conflict:** Domain already assigned to another project (discovered during initial attempt)
  - Mitigation: Investigate current assignment, remove from old project, or update DNS strategy
- **Gabia Extreme Caching:** Server-level caching (24-48 hour TTL) may interfere with WordPress updates
  - Mitigation: Use WordPress Customizer for urgent changes (database-stored, bypasses cache)
- **No Automated Testing:** Zero test coverage increases regression risk
  - Mitigation: Manual comprehensive testing, defer automated testing to v2.0

**Medium Risk:**
- **Eximbay Credentials Pending:** International payment blocked until customer provides credentials
  - Mitigation: Complete architecture with PortOne only, add Eximbay later
- **CORS Configuration:** WordPress may reject requests from Vercel domain
  - Mitigation: Test CORS early, configure headers via WordPress plugin or htaccess
- **Performance Regression:** API latency to Gabia may impact page load times
  - Mitigation: React Query aggressive caching (5-minute stale time), verify Core Web Vitals

**Low Risk:**
- **Environment Variable Management:** Credentials must be configured in both WordPress and Vercel
  - Mitigation: Document all environment variables, use secure storage (Vercel secrets)
- **DNS Propagation Delay:** Domain changes may take 24-48 hours to propagate
  - Mitigation: Plan deployment timing, inform customer of propagation period

---

*Last updated: 2026-01-27 after GSD initialization*
