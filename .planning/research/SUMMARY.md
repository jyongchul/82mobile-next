# Project Research Summary

**Project:** 82mobile.com - Headless WordPress Migration
**Domain:** E-commerce (WordPress + WooCommerce → Next.js 14 Headless)
**Researched:** 2026-01-27
**Confidence:** HIGH

## Executive Summary

This project transforms 82mobile.com from a monolithic Next.js application into a truly headless WordPress architecture, where WordPress serves as an API-only backend and Next.js (hosted on Vercel) handles all frontend rendering. The migration requires careful orchestration to achieve zero downtime for a live e-commerce site selling Korean SIM cards and eSIM services to international tourists.

The recommended approach involves a 7-phase migration strategy spanning 3-5 months, starting with WordPress backend configuration (CORS, JWT authentication, API setup), then building parallel Next.js frontend on a subdomain, followed by gradual DNS cutover with rollback capability. Critical success factors include: (1) handling Gabia's extreme 24-48h server caching through cache exclusion rules, (2) implementing CoCart for proper cart session management, (3) ensuring payment webhook routing remains stable during cutover, and (4) maintaining feature parity with existing site before migration.

Key risks center on the hosting environment: Gabia shared hosting has server-level caching that cannot be disabled via code, DNS cutover creates a propagation window where orders could be lost, and CORS misconfiguration could block all API requests post-deployment. Mitigation strategies include parallel run testing, low TTL DNS records during cutover, aggressive cache exclusion rules for API endpoints, and comprehensive webhook testing in staging before production launch.

## Key Findings

### Recommended Stack

The headless architecture requires specific WordPress plugins and Next.js libraries not present in the current monolithic setup. Critical additions include JWT authentication for secure API access, CoCart for cookie-less cart session management, and CORS configuration to allow cross-origin requests from Vercel to Gabia WordPress backend.

**Core technologies:**
- **Headless Mode plugin**: Disables WordPress frontend, keeps wp-admin and REST API accessible — essential to prevent SEO duplicate content and force API-only architecture
- **JWT Authentication for WP REST API** (by Enrique Chavez): Token-based authentication replacing Basic Auth — most popular plugin (200k+ installs), actively maintained through 2025
- **CoCart 4.2+**: Headless cart session management without WordPress cookies — purpose-built for headless WooCommerce, handles database-backed sessions with 48-hour cart token expiration
- **CORS configuration** (plugin + .htaccess): Allows Vercel domain to make API requests — must whitelist specific origin (no wildcard with credentials), handle OPTIONS preflight requests
- **Redis Object Cache plugin**: Bypasses Gabia's 24-48h server cache for database queries — critical for cache control given hosting limitations

**What NOT to add:**
- WPGraphQL (REST API sufficient, adds unnecessary complexity)
- WordPress authentication plugins for frontend login (use JWT instead)
- Gatsby/Next.js WordPress integration plugins (not needed for headless)
- Full page caching plugins (conflicts with Gabia server cache)

### Expected Features

**Must have (table stakes) — Launch blockers:**
- **Disable WordPress Frontend**: Block public access to WordPress theme, keep only wp-admin accessible — prevents SEO duplicate content, forces API-only usage
- **JWT Authentication**: Token-based API access — secure, scalable alternative to Basic Auth
- **Cart Token Implementation**: Migrate from localStorage-only to CoCart sessions — enables server-side cart validation, prevents cart manipulation
- **Payment Webhook Handler**: Accept payment confirmations from PortOne/Eximbay — current flow breaks if browser closes during payment
- **Order Creation via API**: Guest checkout requires programmatic WooCommerce order creation — already implemented in v1.0
- **CORS Configuration**: Allow Vercel requests to WordPress API — critical for cross-origin communication

**Should have (competitive advantage):**
- **Zero Dependency on Theme**: Frontend completely independent, no WordPress theming conflicts — themes become irrelevant except for wp-admin
- **API-First Product Updates**: Product changes in WordPress immediately available via API — real-time sync without frontend cache invalidation
- **Decoupled Deployment**: Vercel deploys independently from WordPress — reduces deployment risk, faster iterations
- **Frontend Performance Gains**: Next.js optimizations (SSG, ISR, image optimization) — faster page loads vs WordPress PHP rendering

**Defer (v2+):**
- Multi-Frontend Support (mobile app using same WordPress API) — validate web frontend first
- GraphQL API (WPGraphQL) — REST API sufficient for current needs
- User Authentication (JWT login for repeat customers) — v1.0 is guest checkout only
- Headless Admin Dashboard — WordPress wp-admin works fine for now

### Architecture Approach

The headless architecture separates frontend rendering (Next.js on Vercel) from backend API/data (WordPress on Gabia), connected via WooCommerce REST API and CoCart API. Next.js API routes act as a proxy layer (Backend-for-Frontend pattern) to secure API credentials, transform data, and handle caching. Cart state lives client-side (Zustand + localStorage) for fast interactions, with CoCart providing server-side session persistence. Orders are created only at checkout via API, not during cart operations.

**Major components:**
1. **WordPress Backend (Gabia)** — API-only, no theme rendering. Responsibilities: Product catalog storage, order management, payment webhook endpoints, cart session database. WooCommerce REST API v3 + CoCart v2 provide all data access.
2. **Next.js API Routes (Vercel)** — Backend-for-Frontend proxy. Responsibilities: Secure credential storage, request transformation, React Query caching, authentication token validation. Never exposes WooCommerce keys to browser.
3. **Next.js Frontend (Vercel)** — Pure rendering layer. Responsibilities: UI components, client-side cart (Zustand), payment gateway SDKs (PortOne browser SDK), internationalization (next-intl). No direct WordPress access.
4. **Integration Layer** — Three connection points: (a) Product/Order API calls proxied through Next.js routes, (b) Payment webhooks from gateways to WordPress (not Next.js), (c) Cart sessions via CoCart tokens stored in cookies + localStorage

**Critical patterns:**
- **API Route Proxy (Backend-for-Frontend)**: All WordPress communication goes through Next.js `/api/*` routes. Never call WordPress directly from client. Prevents CORS issues, secures credentials, enables caching.
- **Client-Side Cart + Server-Side Order Creation**: Cart in Zustand + localStorage for speed, CoCart sessions for persistence, order created in WooCommerce only at checkout. Don't create "draft orders" on every cart add.
- **Incremental Static Regeneration (ISR)**: Product pages statically generated at build, revalidated hourly. Balances performance with freshness given Gabia's caching constraints.

### Critical Pitfalls

**Top 5 pitfalls that could break the migration:**

1. **Zero Downtime Assumption with DNS Cutover** — DNS propagation takes 15 minutes to 48 hours, creating window where some users hit old site, others hit new site. Orders placed during this window can be lost or duplicated. **How to avoid**: Parallel run on subdomain first (`www.82mobile.com` = old, `new.82mobile.com` = headless), use low TTL DNS (300s) during cutover, implement order reconciliation system, keep old frontend running read-only for 72 hours post-cutover.

2. **CORS Misconfiguration Blocking Critical API Requests** — WordPress doesn't include CORS headers by default. Browser blocks all API requests from Vercel to Gabia WordPress. Preflight OPTIONS requests fail. Critical functionality breaks: product fetches, cart, checkout, order submission. **How to avoid**: Configure CORS headers via WordPress MU-plugin BEFORE writing frontend code. Never use wildcard `*` with credentials. Handle OPTIONS preflight. Test from deployed domain, not just localhost. Required headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Credentials`.

3. **Cart Session State Loss Between Page Navigations** — User adds to cart, navigates, cart becomes empty. WordPress sessions don't work in headless. Cart hash cookies don't transmit due to CORS. **How to avoid**: Install CoCart plugin for database-backed sessions. Store cart key in triple redundancy (HTTP-only cookie + React Context + localStorage backup). Send cart key with every request via headers. Enable `Access-Control-Allow-Credentials: true` so cookies transmit. Implement cart recovery logic on mount.

4. **Payment Gateway Webhook Routing Failures** — Payment completes, webhook sent to WordPress, webhook fails (404/500/timeout), order stays "Pending Payment" forever. Customer charged but order never fulfilled. **How to avoid**: Webhook URLs must remain on WordPress domain (not Next.js). WordPress backend must stay accessible at same domain/subdomain. Disable webhook caching via `.htaccess`. Monitor webhook health in WooCommerce logs. Test webhooks in staging before production. Require HTTPS.

5. **Aggressive Server Caching Serving Stale Frontend** — Gabia's 24-48h server cache serves old API responses. Deploy updates but users see stale data for days. Product prices outdated, stock status wrong. **How to avoid**: Exclude `/wp-json/` from Gabia cache via `.htaccess`. Configure Cloudflare cache rules (bypass for API endpoints). Use short ISR revalidation (5-10 minutes). Accept 1-hour staleness for product updates. Implement on-demand revalidation API for urgent changes. **CRITICAL**: Gabia shared hosting may not allow cache exclusion — may require hosting migration or VPS upgrade.

## Implications for Roadmap

Based on research, suggested 7-phase structure optimized for zero downtime and incremental validation:

### Phase 1: WordPress Backend API Setup
**Rationale:** Must configure WordPress for headless mode before any frontend work. Backend changes are independent and don't affect live site. This phase establishes foundation for all subsequent work.

**Delivers:**
- WordPress configured for headless (Headless Mode plugin installed)
- WooCommerce REST API keys created for production and staging
- JWT Authentication plugin installed and configured
- CORS headers configured (MU-plugin + .htaccess)
- CoCart plugin installed for cart session management
- API endpoints tested with Postman/curl

**Addresses Features:**
- Disable WordPress Frontend (table stakes)
- JWT Authentication (table stakes)
- CORS Configuration (table stakes)

**Avoids Pitfalls:**
- CORS misconfiguration (by testing before frontend built)
- Authentication token exposure (by establishing secure pattern early)

**Research Flag:** Standard setup, well-documented patterns, skip research-phase

---

### Phase 2: Infrastructure & Caching Strategy
**Rationale:** Must understand and work around Gabia's caching limitations before deploying frontend. Cache misconfiguration could make entire site unusable. DNS strategy needed for zero downtime cutover.

**Delivers:**
- .htaccess rules excluding `/wp-json/` from cache
- Cloudflare DNS configuration with low TTL (300s) prepared
- Cache monitoring tools (verify API responses aren't stale)
- Subdomain testing environment (`new.82mobile.com`)
- Rollback plan documented (change DNS back to old site)
- Redis Object Cache plugin configured (if Gabia supports)

**Addresses Features:**
- Decoupled Deployment (competitive advantage)
- Reduced Server Load (competitive advantage)

**Avoids Pitfalls:**
- Aggressive server caching (by configuring exclusions upfront)
- Zero downtime assumption (by establishing parallel run strategy)

**Research Flag:** **REQUIRES RESEARCH** — Gabia-specific caching behavior is undocumented. Need to test cache control methods, verify .htaccess rules work, confirm Redis availability. May discover hosting limitations requiring VPS upgrade.

---

### Phase 3: Next.js API Routes & Authentication
**Rationale:** Backend-for-Frontend proxy layer must be built before frontend UI. This secures credentials and establishes data transformation patterns.

**Delivers:**
- `lib/woocommerce.ts` client with JWT authentication
- `/api/products` route (GET with pagination, filtering)
- `/api/orders` route (POST order creation, GET order status)
- `/api/auth/token` route (JWT token generation if user auth needed)
- Environment variable management (Vercel dashboard + `.env.local`)
- API route tests (integration tests with staging WordPress)

**Uses Stack:**
- JWT Authentication plugin
- WooCommerce REST API v3
- Next.js API routes

**Implements Architecture:**
- API Route Proxy pattern
- Credential security (server-side only)

**Avoids Pitfalls:**
- Authentication token exposure (tokens never reach browser)

**Research Flag:** Standard Next.js API route patterns, skip research-phase

---

### Phase 4: Cart Implementation with CoCart
**Rationale:** Cart is most complex state management challenge in headless. Must get this right before building checkout, as checkout depends on cart state.

**Delivers:**
- Zustand cart store with persist middleware
- CoCart API integration for session persistence
- Cart token storage (cookie + localStorage + React Context)
- Cart recovery logic (restore cart on page load)
- Guest→logged-in cart merge (if user auth implemented later)
- Cart validation at checkout (verify items still in stock)

**Uses Stack:**
- CoCart plugin
- Zustand + React Query
- HTTP-only cookies

**Implements Architecture:**
- Client-Side Cart + Server-Side Session pattern

**Avoids Pitfalls:**
- Cart session state loss (by implementing triple redundancy)
- Cart state divergence from inventory (by validating at checkout)

**Research Flag:** **REQUIRES RESEARCH** — CoCart API cart merge behavior, token expiration handling, race condition handling for concurrent updates. Need to research best practices for cart recovery flow.

---

### Phase 5: Frontend UI Components
**Rationale:** With API routes and cart working, can now build UI safely. UI is purely presentational, no risky integrations.

**Delivers:**
- Product listing page (`/[locale]/shop`)
- Product detail pages (`/[locale]/shop/[slug]`)
- Cart page (`/[locale]/cart`)
- Checkout form (`/[locale]/checkout`)
- Order confirmation page (`/[locale]/order-complete`)
- Mobile responsive design
- Korean/English/Chinese/Japanese i18n (next-intl)

**Addresses Features:**
- Product Listing via API (table stakes)
- Frontend Performance Gains (competitive advantage)
- Multi-language support (table stakes)

**Implements Architecture:**
- Next.js App Router with i18n
- React Server Components for product pages
- Incremental Static Regeneration (ISR)

**Avoids Pitfalls:**
- No UX pitfalls (optimistic updates for cart, inline validation, clear error messages)

**Research Flag:** Standard Next.js patterns, skip research-phase

---

### Phase 6: Payment Gateway Integration
**Rationale:** Payment is most critical and risky integration. Must be tested exhaustively before production launch. Webhooks must be verified to prevent order loss.

**Delivers:**
- PortOne SDK integration (Korean payment gateway)
- Eximbay SDK integration (international payment gateway)
- Payment initiation API routes (`/api/payment/initiate`)
- Payment webhook endpoints (`/api/webhooks/portone`, `/api/webhooks/woocommerce`)
- Webhook signature verification (prevent fake webhooks)
- Order status update flow (pending → processing → completed)
- Test orders in staging with each payment method

**Addresses Features:**
- Payment Webhook Handler (table stakes)
- Order Status Retrieval (table stakes)

**Avoids Pitfalls:**
- Payment gateway webhook routing failures (by keeping webhooks on WordPress domain, testing thoroughly)
- Webhook async timing issues (by verifying timestamps, handling retries)

**Research Flag:** **REQUIRES RESEARCH** — PortOne and Eximbay webhook behavior, signature verification algorithms, retry logic, webhook delivery guarantees. Payment gateways are critical path, need deep dive.

---

### Phase 7: Testing, Gradual Cutover, Stabilization
**Rationale:** Final phase ensures production readiness. Zero downtime cutover requires parallel run, gradual traffic shift, monitoring, and quick rollback capability.

**Delivers:**
- Comprehensive test suite (Playwright e2e tests for full checkout flow)
- Staging deployment with full feature parity check
- Subdomain parallel run (`www.82mobile.com` old, `new.82mobile.com` headless)
- DNS cutover plan (www first, then apex)
- Post-deployment verification checklist (all critical paths)
- Monitoring dashboards (Vercel Analytics, Sentry error tracking)
- 72-hour stabilization period (old site remains accessible)
- Order reconciliation system (detect duplicates during cutover)

**Addresses Features:**
- All table stakes features verified
- Zero downtime requirement met

**Avoids Pitfalls:**
- Zero downtime assumption (by implementing parallel run, gradual cutover, rollback plan)
- Underestimating complexity (by allocating 2-3 weeks for testing and stabilization)

**Research Flag:** Standard deployment patterns, skip research-phase

---

### Phase Ordering Rationale

**Why this order:**
1. **Backend first** (Phase 1): Changes to WordPress don't affect live site. Safe to configure while site runs normally.
2. **Infrastructure second** (Phase 2): Must understand caching constraints before building anything that depends on fresh data.
3. **API layer third** (Phase 3): Establishes secure data access pattern before UI needs it.
4. **Cart before UI** (Phase 4): Cart state management is complex and UI depends on it working correctly.
5. **UI fifth** (Phase 5): With backend solid, UI is lowest-risk work.
6. **Payments sixth** (Phase 6): Most critical integration, test last when everything else works.
7. **Cutover last** (Phase 7): Only switch DNS when fully confident in new system.

**Dependency chain:**
- Phase 3 (API routes) depends on Phase 1 (WordPress API ready)
- Phase 4 (Cart) depends on Phase 3 (API routes for CoCart)
- Phase 5 (UI) depends on Phase 4 (cart state working)
- Phase 6 (Payments) depends on Phase 5 (checkout UI) and Phase 3 (order API)
- Phase 7 (Cutover) depends on all previous phases complete

**How this avoids pitfalls:**
- CORS configured before frontend built (prevents Phase 5 blockage)
- Caching strategy established before data flows (prevents stale data issues)
- Cart sessions tested before checkout (prevents session loss)
- Webhooks tested before production (prevents payment failures)
- Parallel run before cutover (prevents order loss during DNS propagation)

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (Infrastructure)**: Gabia-specific caching behavior undocumented. Need to test cache control methods, verify .htaccess rules work on shared hosting, confirm Redis socket availability. May discover limitations requiring hosting upgrade.
- **Phase 4 (Cart)**: CoCart API behavior for edge cases (concurrent updates, token expiration, cart merge on login). Need to research cart recovery patterns, race condition handling.
- **Phase 6 (Payments)**: PortOne and Eximbay webhook specifications, signature verification algorithms, retry logic, webhook delivery guarantees. Critical path, can't afford failures.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (WordPress API Setup)**: Well-documented WordPress plugin configuration, official WooCommerce docs cover all steps.
- **Phase 3 (Next.js API Routes)**: Standard Next.js patterns, extensive documentation and examples available.
- **Phase 5 (Frontend UI)**: Next.js App Router patterns, Tailwind CSS, next-intl all well-documented.
- **Phase 7 (Testing & Cutover)**: Standard deployment practices, Vercel deployment guides comprehensive.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommended technologies verified with official documentation from 2025-2026. Plugin versions confirmed active and maintained. WooCommerce REST API v3 and CoCart 4.2+ are stable and production-ready. |
| Features | HIGH | Feature requirements derived from WooCommerce headless best practices and official documentation. Table stakes features well-established in industry. Competitive features validated by headless WordPress case studies. |
| Architecture | HIGH | Backend-for-Frontend pattern is industry standard for headless CMS. Component boundaries well-defined by Next.js App Router and WordPress REST API. Zero downtime migration strategy verified by Vercel and Cloudways guides. |
| Pitfalls | HIGH | All critical pitfalls sourced from 2025-2026 production incidents, GitHub issues, and WordPress community forums. CORS, cart session loss, webhook failures, and caching issues are documented extensively with proven solutions. |

**Overall confidence:** HIGH

Research is based on:
- 50+ verified sources from 2025-2026 (official docs, maintained plugins, production case studies)
- WordPress.org plugin documentation (verified install counts and update dates)
- WooCommerce official developer documentation
- Vercel deployment guides and community troubleshooting
- GitHub issues from WooCommerce repository showing recent pitfall resolutions
- Headless WordPress case studies from WP Engine, Kinsta, Cloudways

### Gaps to Address

**Gabia Hosting Capabilities (MEDIUM confidence gap):**
- **Gap**: Gabia's shared hosting cache behavior not fully documented. Unknown whether .htaccess cache exclusion rules will work, or if Redis socket is available.
- **Impact**: Could require hosting migration mid-project if cache cannot be controlled, adding 1-2 weeks and $200-500/year hosting cost.
- **How to handle**: Phase 2 includes Gabia capability testing. If limitations discovered, escalate decision to migrate to AWS/DigitalOcean before Phase 3 begins. Budget contingency for hosting migration.

**PortOne/Eximbay Webhook Specifications (MEDIUM confidence gap):**
- **Gap**: Webhook signature verification algorithms not fully documented in research (payment gateway docs needed).
- **Impact**: Could fail webhook validation, causing order status update failures.
- **How to handle**: Phase 6 planning includes deep dive into PortOne and Eximbay developer documentation. Contact payment gateway support for webhook testing sandbox. Implement webhook signature verification before staging tests.

**CoCart Cart Merge Behavior (LOW confidence gap):**
- **Gap**: Guest→logged-in cart merge behavior not extensively documented for CoCart 4.2+.
- **Impact**: Cart items could duplicate or disappear when user logs in after adding items as guest (only affects if user auth implemented in v1.x).
- **How to handle**: Since v1.0 is guest checkout only, defer this validation to v1.x when user auth added. Document as known limitation in Phase 4. Can implement workaround by clearing guest cart on login if merge fails.

**Timeline Estimation Accuracy (MEDIUM confidence gap):**
- **Gap**: 3-5 month estimate assumes no major blockers. Gabia hosting limitations or payment gateway integration issues could extend timeline.
- **Impact**: Budget overrun, stakeholder expectation management.
- **How to handle**: Establish 40% contingency buffer (3-5 months becomes 4-7 months worst case). Set stakeholder expectations for "no feature additions during migration" rule. Plan for parallel run period to allow extended testing if issues found.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [WooCommerce REST API Documentation](https://developer.woocommerce.com/docs/apis/rest-api/) — Product/Order endpoints, authentication
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/) — Core WordPress API patterns
- [CoCart Plugin Documentation](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/) — Cart session management, verified 50k+ installs
- [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) — Token-based auth, verified 200k+ installs
- [Vercel WordPress Integration Guide](https://vercel.com/guides/wordpress-with-vercel) — Zero downtime migration strategy

**Verified Plugin Sources:**
- Headless Mode plugin (WordPress.org)
- CoCart 4.2+ (verified 2025 updates)
- Redis Object Cache plugin (WordPress.org)

### Secondary (MEDIUM confidence)

**Community Resources & Case Studies:**
- [Building Headless WooCommerce using REST API (Hippoo Auth)](https://hippoo.app/2025/07/22/building-a-headless-woocommerce-store-using-the-rest-api-and-hippoo-auth/) — 2025 implementation guide
- [WooCommerce REST API Integration Guide 2026 (Cloudways)](https://www.cloudways.com/blog/woocommerce-rest-api/) — Production hosting considerations
- [WordPress as Headless CMS 2026 Guide (Ecommerce Launcher)](https://ecommercelauncher.com/woocommerce/wordpress-as-headless-cms) — Architecture patterns
- [Headless WooCommerce Migration Without Breaking Store (Wooninjas)](https://wooninjas.com/headless-woocommerce-migration/) — Zero downtime strategy
- [WordPress REST API CORS Issues Solved (Rob Marshall)](https://robertmarshall.dev/blog/wordpress-rest-api-cors-issues/) — CORS configuration patterns

**GitHub Issues (Production Pitfalls):**
- [WooCommerce REST API Cart Session Issue #27160](https://github.com/woocommerce/woocommerce/issues/27160) — Cart session solutions
- [WooCommerce Webhook Status Issues #26356](https://github.com/woocommerce/woocommerce/issues/26356) — Webhook async timing problems
- [WordPress Application Password CORS Error #62232](https://core.trac.wordpress.org/ticket/62232) — Authentication CORS fixes

### Tertiary (LOW confidence — requires validation)

**Gabia-Specific:**
- Gabia shared hosting cache behavior (no official documentation found) — needs testing in Phase 2
- Gabia PHP configuration and limits (not publicly documented) — requires support ticket to verify

**Payment Gateways:**
- PortOne webhook signature verification (needs official PortOne developer docs) — research in Phase 6
- Eximbay webhook retry behavior (needs official Eximbay API docs) — research in Phase 6

---

*Research completed: 2026-01-27*
*Ready for roadmap: YES*
*Recommended approach: 7-phase migration with zero downtime, 3-5 month timeline*
*Critical success factor: Gabia caching workaround + CoCart session management + webhook stability*
