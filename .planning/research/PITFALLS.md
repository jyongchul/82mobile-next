# Pitfalls Research: Headless WordPress for E-commerce

**Domain:** Headless WordPress + WooCommerce migration for live e-commerce site
**Researched:** 2026-01-27
**Confidence:** HIGH (verified with 2026-specific sources)

## Critical Pitfalls

### Pitfall 1: Zero Downtime Assumption with DNS Cutover

**What goes wrong:**
Migrating to headless WordPress requires dual hosting (WordPress backend + Next.js frontend). During DNS cutover to point domain to new frontend, there's a propagation window (15 minutes to 48 hours) where some users hit old site, others hit new site. Orders placed during this window can be lost or duplicated, payment webhooks may route to wrong endpoints, and customer cart sessions break mid-checkout.

**Why it happens:**
Teams assume DNS changes are instant or that "zero downtime" means "no visible downtime." In reality, DNS propagation is distributed and unpredictable. Adding complexity: 82mobile.com domain is already assigned to another Vercel project, requiring domain removal before reassignment, creating additional conflict risks.

**How to avoid:**
- **Phase 0 (Pre-migration):** Implement parallel run architecture where both old monolithic site and new headless frontend run simultaneously on different subdomains (e.g., `www.82mobile.com` = old, `new.82mobile.com` = headless)
- **Phase 1 (Testing):** Route small percentage of traffic to new frontend using Cloudflare load balancing or A/B testing
- **Phase 2 (Gradual cutover):** Use low TTL DNS records (300 seconds) during cutover window to speed propagation
- **Phase 3 (Post-cutover):** Keep old frontend running read-only for 72 hours to catch straggler sessions
- **Critical:** Implement order reconciliation system that detects duplicate orders across both systems during cutover window

**Warning signs:**
- Domain shows "Domain already in use" error on Vercel
- DNS records point to multiple A records simultaneously
- Webhook delivery logs show 404 errors increasing during cutover
- Customer support receives "site looks different" or "cart disappeared" complaints
- Analytics show traffic split between two different page structures

**Phase to address:**
Phase 2 (Infrastructure Setup) - Before any frontend work begins. Document DNS cutover strategy, set up subdomain testing environment, configure webhook failover, establish order reconciliation process.

**Gabia-specific considerations:**
Gabia shared hosting has extreme caching (24-48h TTL). During cutover, Gabia's server may continue serving cached WordPress theme pages even after DNS points to Vercel. Solution: Clear all Gabia caches 48 hours before cutover, disable caching plugins temporarily during migration window.

**Sources:**
- [Migrate to Headless WooCommerce Without Breaking Your Store](https://wooninjas.com/headless-woocommerce-migration/)
- [Zero Downtime Migration for WordPress Sites](https://www.cloudways.com/blog/zero-downtime-migration-for-wordpress-sites/)
- [Vercel Domain DNS Conflicts](https://community.vercel.com/t/told-to-remove-the-following-conflicting-dns-records-from-dns-provider/30762)

---

### Pitfall 2: CORS Misconfiguration Blocking Critical API Requests

**What goes wrong:**
Frontend on `82mobile.com` (Vercel) makes API requests to WordPress backend on same domain or subdomain. Browser blocks requests due to missing `Access-Control-Allow-Origin` headers. Preflight OPTIONS requests fail because WordPress doesn't handle them. Errors appear as: "Request header field content-type is not allowed by Access-Control-Allow-Headers" or "No Access-Control-Allow-Origin header present." Critical functionality breaks: product fetches, cart operations, checkout flow, order submission.

**Why it happens:**
WordPress wasn't designed for cross-origin API access. Default REST API and WooCommerce Store API don't include CORS headers. Developers discover CORS issues only after deploying to production because local development (`localhost:3000` → `localhost:8888`) appears to work due to browser CORS exceptions for localhost.

**How to avoid:**
1. **Before writing any frontend code (Phase 1):** Configure WordPress CORS headers via `functions.php` or `.htaccess`
2. **Never use wildcard (`*`) for `Access-Control-Allow-Origin`** when sending credentials (cookies, JWT tokens) - browsers reject this. Use explicit origin: `https://82mobile.com`
3. **Handle preflight OPTIONS requests** - WordPress must respond to OPTIONS with 200 status and proper headers before browser sends actual GET/POST
4. **Required headers:**
   ```php
   add_action('init', function() {
       if (isset($_SERVER['HTTP_ORIGIN'])) {
           header("Access-Control-Allow-Origin: https://82mobile.com");
           header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
           header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Cart-Token");
           header("Access-Control-Allow-Credentials: true");
       }
       if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
           status_header(200);
           exit;
       }
   });
   ```
5. **Test CORS from actual deployed domain** - not just localhost

**Warning signs:**
- Browser console shows "CORS policy" or "Access-Control-Allow-Origin" errors
- Network tab shows requests with red status codes (0 or CORS error)
- OPTIONS requests return 404 or don't include proper headers
- API works in Postman/curl but fails in browser
- Login/authentication works but subsequent authenticated requests fail
- Cart operations fail silently

**Phase to address:**
Phase 1 (API Setup) - Configure CORS on WordPress backend before building any frontend features. Create WordPress MU-plugin for CORS headers to ensure it loads before other plugins.

**Gabia-specific considerations:**
Gabia shared hosting may have server-level security rules that strip or override CORS headers. Test CORS headers using `curl -I` from external server to verify headers actually reach client. If server strips headers, may need to escalate to Gabia support to whitelist domain or use `.htaccess` approach instead of PHP headers.

**Sources:**
- [Fix CORS Issues in Headless WordPress with Simple Steps](https://juanma.codes/2025/10/09/enabling-cors-in-a-headless-wordpress-setup/)
- [WordPress REST API CORS Issues Solved](https://robertmarshall.dev/blog/wordpress-rest-api-cors-issues/)
- [WordPress Application Password CORS error when URLs differ](https://core.trac.wordpress.org/ticket/62232)
- [Login Security for Headless WordPress (2026 Guide)](https://loginpress.pro/login-security-for-headless-wordpress/)

---

### Pitfall 3: Authentication Token Exposure in Client-Side Code

**What goes wrong:**
Developer stores JWT tokens or WordPress Application Passwords in browser localStorage or exposes them in Next.js client components. Tokens are vulnerable to XSS attacks. Attackers inject malicious JavaScript that reads tokens from localStorage and exfiltrates them. Compromised tokens allow attackers to make authenticated requests on behalf of users, access admin endpoints, modify orders, steal customer data.

**Why it happens:**
JWT token storage is confusing - documentation says "store tokens client-side" but doesn't explain secure storage. localStorage seems convenient. Developers don't realize Next.js client components expose all variables to browser. WordPress Application Passwords look "safe" because they're not real passwords.

**How to avoid:**
1. **NEVER store tokens in localStorage** - accessible via JavaScript, vulnerable to XSS
2. **Use HTTP-only cookies for tokens** - inaccessible to JavaScript, automatically sent with requests:
   ```javascript
   // WordPress sets cookie with HttpOnly flag
   // Next.js receives cookie automatically on subsequent requests
   // No JavaScript access needed
   ```
3. **For public API keys (like WooCommerce consumer key):**
   - NEVER expose in client components
   - Use Next.js API routes as proxy: `app/api/products/route.ts` calls WordPress with keys stored in `.env.local`
   - Client calls your API route, API route calls WordPress with keys
4. **Verify token scope** - WordPress Application Passwords often created with full admin access. Create passwords with minimum required scope.
5. **Rotate tokens regularly** - implement 90-day rotation policy

**Warning signs:**
- Search project files for `localStorage.setItem.*token` or `localStorage.getItem.*token`
- `.env.local` values imported in files under `app/` directory (client components)
- Console.log shows token values in browser DevTools
- Git history contains committed `.env` files with tokens
- API keys visible in browser Network tab request headers

**Phase to address:**
Phase 1 (Authentication Setup) - Before implementing any login or API authentication. Establish authentication architecture using HTTP-only cookies. Create API route pattern for protected WordPress calls. Configure environment variables properly.

**Gabia-specific considerations:**
WordPress on Gabia may not support HTTP-only cookie setting if PHP configuration is restricted. Test cookie flags using browser DevTools (Application → Cookies → check HttpOnly column). If not supported, consider using session-based authentication stored in WordPress database instead of cookies.

**Sources:**
- [Login Security for Headless WordPress (2026 Guide)](https://loginpress.pro/login-security-for-headless-wordpress/)
- [Securing Headless WordPress with JWT, OAuth, and SSO](https://formidable-masterminds.com/building-the-bridge-authentication-sso-and-secure-api-gateways/)
- [WordPress REST API Authentication: Complete Security Implementation Guide 2025](https://oddjar.com/wordpress-rest-api-authentication-guide-2025/)
- [Headless WordPress Authentication with Native Cookies](https://developers.wpengine.com/blog/headless-wordpress-authentication-native-cookies)

---

### Pitfall 4: Cart Session State Loss Between Page Navigations

**What goes wrong:**
User adds product to cart, navigates to another page, cart becomes empty. Or cart shows correct items but quantity resets. Or cart merges incorrectly when user logs in after adding items as guest. Cart session is lost on browser refresh. Checkout fails with "cart is empty" error despite items showing in cart UI.

**Why it happens:**
WordPress/WooCommerce uses PHP sessions stored server-side, tracked via cookies. Headless frontend uses React state that doesn't persist across page loads. Session cookies don't transmit properly due to CORS/credentials issues. WooCommerce's native session management assumes same-origin requests. Cart hash cookies don't synchronize between guest and logged-in states. CoCart or similar plugins required but not configured properly.

**How to avoid:**
1. **Use CoCart plugin** - specifically designed for headless WooCommerce cart management:
   - Provides RESTful cart API with proper session handling
   - Returns cart key in response headers and body
   - Supports cookie-less sessions stored in database
   - Version 4.2+ has improved session and compatibility features
2. **Store cart key in multiple places** (redundancy):
   - HTTP-only cookie (primary)
   - React Context (for current session)
   - localStorage (backup, despite XSS risk - cart keys less sensitive than auth tokens)
3. **Send cart key with every request** via headers:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'Cart-Key': cartKey, // From cookie or state
     'X-Cart-Token': cartToken, // If using tokens
   }
   ```
4. **Implement cart recovery logic**:
   ```javascript
   useEffect(() => {
     const savedCartKey = localStorage.getItem('cart_key');
     if (savedCartKey) {
       // Fetch cart from API using saved key
       fetchCart(savedCartKey);
     }
   }, []);
   ```
5. **Handle guest→logged-in cart merge explicitly**:
   - Before login: save guest cart key
   - After login: call merge endpoint with both guest and user cart keys
   - Verify merge succeeded before clearing guest cart
6. **Enable `Access-Control-Allow-Credentials: true`** in CORS headers so cookies transmit

**Warning signs:**
- Cart items persist in WooCommerce admin but not frontend
- Browser DevTools shows no `woocommerce_cart_hash` cookie being set
- Network tab shows cart API responses but items don't persist
- Cart works on first page load but empties on subsequent pages
- Cart-Key header missing from requests
- "Session has expired" errors in cart operations
- Duplicate items appear in cart after login

**Phase to address:**
Phase 3 (Cart Implementation) - Before building checkout. Install and configure CoCart plugin on WordPress. Test cart persistence across page navigations, browser refreshes, guest→logged-in transitions.

**Gabia-specific considerations:**
Gabia's 24-48h caching may cache cart responses, serving stale cart data. CoCart's database session storage bypasses this, but must ensure cart API endpoints excluded from caching. Add to `.htaccess`: `SetEnvIf Request_URI "^/wp-json/cocart/v2/" no-cache`.

**Sources:**
- [Headless eCommerce API for Developers - CoCart](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/)
- [CoCart 4.2 Released: Session and Compatibility Improvements](https://cocartapi.com/cocart-4-2-released-session-and-compatibility-improvements/)
- [WooCommerce REST API Cart Session Issue with Subdomains](https://wordpress.org/support/topic/woocommerce-rest-api-cart-session-issue-with-subdomains-cookies-cors/)
- [Cart and Session not working in REST API - GitHub Issue #27160](https://github.com/woocommerce/woocommerce/issues/27160)
- [Headless WooCommerce & Next.js: Create a Cart](https://medium.com/geekculture/headless-woocommerce-next-js-create-a-cart-8a3e49b90076)

---

### Pitfall 5: Payment Gateway Webhook Routing Failures

**What goes wrong:**
Customer completes payment, payment gateway (Stripe, PayPal, etc.) sends webhook to notify WordPress of successful payment, webhook fails (404, 500, timeout), order remains in "Pending Payment" status forever, customer charged but order never fulfilled, no inventory reduction, no confirmation email sent. Even worse: webhook succeeds but sends old order data (wrong status, wrong amount) due to async timing issues.

**Why it happens:**
Webhooks are server-to-server communications that bypass frontend entirely. Payment gateways don't know about your headless architecture - they still try to send webhooks to WordPress URLs. During migration, webhook URLs change or become unreachable. Gabia's aggressive caching may cause webhooks to hit cached endpoints that don't process properly. WooCommerce disables webhooks after 5 consecutive failures. Async webhook processing can send stale data.

**How to avoid:**
1. **Before migration, audit all webhook URLs:**
   - WooCommerce → Settings → Advanced → Webhooks (list all active webhooks)
   - Each payment gateway settings page (Stripe webhook URL, PayPal IPN URL, etc.)
   - Document current webhook endpoints
2. **Webhook URLs must remain on WordPress domain** - don't point webhooks to Vercel:
   - ❌ Wrong: `https://82mobile.com/api/webhooks/stripe` (Next.js route)
   - ✅ Correct: `https://82mobile.com/wp-json/wc/v3/webhooks` (WordPress endpoint)
3. **Ensure WordPress backend remains accessible** at same domain or subdomain:
   - If frontend moves to `82mobile.com`, WordPress must stay at `api.82mobile.com` or `82mobile.com/wp-json`
   - Test webhook accessibility: `curl -X POST https://82mobile.com/wp-json/wc/v3/webhooks/stripe`
4. **Disable webhook caching on Gabia**:
   - Add to `.htaccess`: `SetEnvIf Request_URI "^/wp-json/wc/v3/" no-cache`
   - Or Cloudflare Page Rule: Cache Level = Bypass for `/wp-json/*`
5. **Require HTTPS for webhooks** - Stripe and most gateways reject HTTP webhook URLs
6. **Monitor webhook health**:
   - WooCommerce logs webhook deliveries at WooCommerce → Status → Logs
   - Check for 4xx/5xx errors
   - Webhooks disabled after 5 failures - re-enable manually if needed
7. **Handle async timing issues:**
   - Disable async webhooks if experiencing stale data: `add_filter('woocommerce_webhook_deliver_async', '__return_false');`
   - Verify webhook payload timestamp matches current order state
8. **Test webhooks in staging** before production cutover:
   - Use webhook testing tools (Stripe CLI, ngrok for local testing)
   - Simulate payment completions and verify order status updates

**Warning signs:**
- Orders stuck in "Pending Payment" despite successful charges in payment gateway dashboard
- WooCommerce logs show webhook delivery failures or 404 errors
- Payment gateway dashboard shows "webhook not responding" warnings
- Customer receives charge but no order confirmation email
- Inventory not reduced after successful payments
- WooCommerce webhooks page shows webhooks with "Disabled" status
- Webhook response times > 5 seconds (timeout threshold)

**Phase to address:**
Phase 4 (Payment Integration Testing) - After cart implementation, before production launch. Test each payment gateway's webhooks thoroughly in staging. Document webhook configuration. Create monitoring alerts for webhook failures.

**Gabia-specific considerations:**
Gabia shared hosting may have request rate limits or timeout limits (30 seconds common) that cause webhook failures for slow payment gateways. If webhooks timing out, increase PHP `max_execution_time` to 60 seconds. If rate limited, whitelist payment gateway IP addresses with Gabia support.

**Sources:**
- [Working with webhooks in WooCommerce (Official Docs)](https://developer.woocommerce.com/docs/best-practices/urls-and-routing/webhooks/)
- [Power of Webhooks in payment gateway integration](https://blog.poriyaalar.com/power-of-webhooks-in-payment-gateway-integration)
- [Webhook for order.updated with processing status not fired - GitHub Issue #40013](https://github.com/woocommerce/woocommerce/issues/40013)
- [WooCommerce Webhook order.update sending incorrect status - GitHub Issue #26356](https://github.com/woocommerce/woocommerce/issues/26356)

---

### Pitfall 6: Aggressive Server Caching Serving Stale Frontend

**What goes wrong:**
Deploy new Next.js build to Vercel with critical bug fix or updated product prices. Some users immediately see changes, others see old version for 24-48 hours. Or worse: users see mix of old cached product listings with new checkout flow, causing price mismatches or broken cart operations. Gabia's extreme 24-48h server caching serves old WordPress API responses. Users report "site says item in stock but checkout says out of stock" inconsistencies.

**Why it happens:**
Multiple caching layers not coordinated: Gabia server cache (24-48h TTL), Cloudflare CDN cache (browser cache), Vercel Edge cache, Next.js build cache, WooCommerce object cache. WordPress API responses get cached at server level. Deploying new frontend doesn't clear WordPress backend caches. No cache invalidation strategy in place.

**How to avoid:**
1. **Map all cache layers:**
   ```
   Client → Browser Cache (max-age)
   Client → Cloudflare CDN (TTL)
   Vercel → Edge Cache (s-maxage)
   Vercel → WordPress API call → Gabia Server Cache (24-48h!)
   WordPress → Object Cache (Redis/Memcached if enabled)
   WordPress → Page Cache (plugins like WP Super Cache)
   ```
2. **Exclude API endpoints from aggressive caching:**
   - WordPress `.htaccess`: `SetEnvIf Request_URI "^/wp-json/" no-cache`
   - Cloudflare Page Rules: Cache Level = Bypass for `/wp-json/*` and `/wp-content/*`
   - WordPress plugins: Disable page caching for REST API (usually automatic)
3. **Use short TTLs for dynamic content:**
   - Product listings: 5-10 minutes (frequent stock changes)
   - Static pages (About, FAQ): 1 hour
   - Media files (images): 7 days
4. **Implement cache busting headers in WordPress:**
   ```php
   add_filter('rest_post_dispatch', function($result, $server, $request) {
       $result->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
       $result->header('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
       return $result;
   }, 10, 3);
   ```
5. **Use Vercel's `revalidate` for ISR (Incremental Static Regeneration):**
   ```javascript
   export const revalidate = 300; // Revalidate every 5 minutes
   ```
6. **Clear all caches during deployment:**
   ```bash
   # Clear Cloudflare cache via API
   curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
     -H "Authorization: Bearer {api_token}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'

   # Clear WordPress cache (if plugin installed)
   wp cache flush
   ```
7. **Implement stale-while-revalidate (SWR) strategy:**
   - Serve cached version immediately
   - Fetch fresh data in background
   - Update cache with new data
   - Next request gets fresh data
8. **Monitor cache hit rates** to detect over-caching:
   - Cloudflare Analytics → Caching → Cache Hit Rate (should be 60-80%, not 95%+)
   - If hit rate too high, dynamic content being over-cached

**Warning signs:**
- Different users report seeing different product prices at same time
- Frontend shows old hero image after deploying new one
- API responses have timestamps older than deploy time
- Cloudflare cache hit rate > 95%
- Response headers show `X-Cache: HIT` for dynamic endpoints
- "Last modified" dates in CMS don't match displayed content
- Clearing browser cache doesn't show updates (indicates server-side caching issue)
- WooCommerce stock status out of sync with what frontend displays

**Phase to address:**
Phase 2 (Infrastructure Setup) - Before deploying any frontend code. Configure caching layers properly. Document cache TTLs for each content type. Set up cache invalidation webhook (WordPress plugin that calls Cloudflare purge API when content updates). Test cache behavior before building features that depend on fresh data.

**Gabia-specific considerations:**
**CRITICAL:** This is THE biggest risk for 82mobile.com. Gabia's 24-48h server cache cannot be disabled via .htaccess or PHP headers in shared hosting. Only solutions: (1) Contact Gabia support to exclude specific paths from caching (may require upgrade to VPS), (2) Move WordPress backend to different host (AWS, DigitalOcean) that gives cache control, keeping only frontend on Vercel, or (3) Accept 24-48h staleness for non-critical content and use direct database queries for critical real-time data (stock levels, prices).

**Sources:**
- [Solving WordPress Problems with Cache for Good](https://divimode.com/problems-with-cache/)
- [A look at WordPress page caching with a CDN](https://blog.ymirapp.com/wordpress-page-caching-cdn/)
- [Granular Cache Invalidation for Headless CMS](https://focusreactive.com/granular-cache-invalidation-for-headless-cms/)
- [How to Clear Cache in WordPress: 9 Simple Methods (2026)](https://elementor.com/blog/how-to-clear-cache-in-wordpress-9-simple-methods-year/)

---

### Pitfall 7: Underestimating Migration Complexity and Timeline

**What goes wrong:**
Team estimates "2-4 weeks for headless migration" based on tutorials. Three months later, still debugging session management, webhook failures, cache inconsistencies. Budget exhausted. Customer facing broken features. Pressure mounts to "just launch it" despite known bugs. Launch happens, orders fail, emergency rollback required.

**Why it happens:**
Blog posts make headless WordPress look simple: "Install WPGraphQL, create Next.js app, done!" They don't cover production reality: CORS configuration, session management, webhook routing, cache invalidation, zero-downtime cutover, testing at scale, handling edge cases (guest checkout, international shipping, coupons, refunds), maintaining two systems in parallel during migration.

**How to avoid:**
1. **Realistic timeline estimation for 82mobile.com:**
   - Phase 1 (API Setup & CORS): 1-2 weeks
   - Phase 2 (Infrastructure & Caching): 2-3 weeks
   - Phase 3 (Cart Implementation): 2-3 weeks
   - Phase 4 (Checkout & Payments): 3-4 weeks
   - Phase 5 (Testing & QA): 2-3 weeks
   - Phase 6 (Gradual Cutover): 1-2 weeks
   - Phase 7 (Stabilization): 2-4 weeks
   - **Total: 13-21 weeks (3-5 months)** for production-ready headless migration
2. **Build parallel, don't replace:**
   - Keep old WordPress theme running
   - Build headless frontend on subdomain (`new.82mobile.com`)
   - Test thoroughly before cutover
   - Have rollback plan (change DNS back to old theme)
3. **Feature parity checklist** - ensure new headless site matches old site:
   - [ ] All products display correctly
   - [ ] Product categories and filtering work
   - [ ] Cart operations (add, remove, update quantity)
   - [ ] Guest checkout flow
   - [ ] User login and registration
   - [ ] Order history for logged-in users
   - [ ] Payment gateway integrations (all methods)
   - [ ] Shipping calculation
   - [ ] Tax calculation
   - [ ] Coupon codes
   - [ ] Multi-language support (Korean, English, Chinese, Japanese)
   - [ ] Mobile responsive design
   - [ ] SEO (meta tags, structured data, sitemaps)
   - [ ] Email notifications (order confirmation, shipping updates)
   - [ ] Admin order management (no disruption to existing workflow)
4. **Budget for unknowns:** Add 40% contingency time for issues not in tutorials
5. **Staffing requirements:**
   - Need both WordPress expert AND Next.js expert
   - Don't assume one full-stack developer can handle both
   - Plan for overlapping availability during integration phases
6. **Testing requirements:**
   - Manual testing insufficient for e-commerce
   - Need automated tests for cart, checkout, payment flows
   - Load testing for traffic spikes
   - Security testing for authentication and payment handling

**Warning signs:**
- Timeline shows migration completing in < 8 weeks
- Budget doesn't include contingency buffer
- Single developer responsible for both WordPress and Next.js work
- Testing phase allocated < 20% of total timeline
- No rollback plan documented
- Phrases like "we'll figure it out as we go" or "the tutorial makes it look easy"
- Stakeholders expecting feature additions during migration (scope creep)

**Phase to address:**
Phase 0 (Planning) - Before starting any development. Create realistic project plan with detailed timeline, budget, staffing plan, risk mitigation strategies. Get stakeholder buy-in on 3-5 month timeline. Establish "no feature additions during migration" rule.

**Gabia-specific considerations:**
Gabia's shared hosting limitations will add complexity and time:
- May need to upgrade hosting tier or migrate to VPS for necessary control
- Budget time for Gabia support tickets (response time typically 1-2 business days in Korean)
- May discover limitations mid-migration that require hosting changes, adding 2-4 weeks

**Sources:**
- [Common Pitfalls Migrating to Headless CMS - Power Shifter Digital](https://www.powershifter.com/blog/common-pitfalls-in-migrating-to-headless-cms)
- [Migrate from WordPress to Headless CMS](https://www.webstacks.com/blog/migrate-wordpress-to-headless-cms)
- [Headless CMS vs WordPress - Hygraph](https://hygraph.com/blog/problems-of-using-wordpress-as-a-headless-cms)
- [Headless WooCommerce: Revolutionizing E-commerce](https://wisdmlabs.com/blog/headless-woocommerce-revolutionizing-e-commerce/)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `localStorage` for JWT tokens | Easy to implement, works instantly | Vulnerable to XSS attacks, security breach risk | **Never acceptable for e-commerce** |
| Wildcard CORS (`Access-Control-Allow-Origin: *`) | Fixes CORS errors quickly | Exposes API to any origin, can't send credentials | Only for truly public read-only endpoints |
| Skipping webhook testing in staging | Faster deployment | Payment failures in production, lost revenue | **Never** - webhooks are critical for order processing |
| Disabling HTTPS for local webhook testing | Easier local development | Habit of using HTTP, security issues | Only if you enable HTTPS before staging deployment |
| Using same cart key for all users | Simpler cart implementation | Cart conflicts, data leakage between users | **Never** - privacy and security violation |
| Clearing all caches on every content update | Ensures fresh content | Performance degradation, server load | Acceptable during migration/testing, must optimize for production |
| Single DNS cutover without parallel run | Faster migration | No rollback option, all-or-nothing risk | Only for low-traffic non-critical sites (not e-commerce) |
| Skipping cart session persistence | Faster initial implementation | Poor user experience, abandoned carts, lost revenue | Never for e-commerce - causes immediate customer complaints |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **WooCommerce REST API** | Using unauthenticated requests, hitting rate limits | Use consumer key/secret stored server-side in Next.js API routes, implement request caching |
| **CoCart API** | Not storing cart key, losing cart on page refresh | Store cart key in cookie + localStorage + React Context (triple redundancy) |
| **Payment Gateways (Stripe, PayPal)** | Webhook URLs pointing to Next.js routes instead of WordPress | Keep webhooks pointing to WordPress backend, let WooCommerce handle them |
| **Cloudflare CDN** | Caching all requests equally | Configure cache rules per content type, bypass cache for `/wp-json/` endpoints |
| **WordPress Authentication** | Storing passwords in frontend code | Use WordPress Application Passwords with minimum scope, store in HTTP-only cookies |
| **Polylang (Multi-language)** | REST API not returning translated content | Use `?lang=ko` query parameter, install Polylang REST API plugin |
| **Product Images** | Hardcoding WordPress URL in image paths | Use environment variable for backend URL, use Next.js Image component with loader |
| **Vercel Deployment** | Committing `.env.local` with API keys | Use Vercel environment variables dashboard, never commit secrets |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Fetching all products on homepage** | 100 products load fine, 1000+ products cause timeout | Implement pagination, load 20 products at a time with infinite scroll | > 500 products |
| **No API response caching** | Every page load hits WordPress API | Use Next.js ISR (Incremental Static Regeneration), cache responses 5-10 minutes | > 100 concurrent users |
| **Synchronous cart operations** | Cart updates block UI | Implement optimistic updates (update UI immediately, sync with server in background) | Any amount of user interaction feels slow |
| **Loading all product images at full resolution** | Homepage becomes 50MB download | Use Next.js Image optimization, lazy loading, WebP format | > 10 images on page |
| **No database indexing on cart queries** | Cart loads fast with 10 items | Add indexes to WooCommerce cart tables | > 100 concurrent carts |
| **REST API returning full product objects for listings** | Unnecessary data transfer (product descriptions, metadata) | Use `_fields` parameter to limit response fields: `?_fields=id,name,price,image` | > 50 products per page |
| **Multiple API calls per page (waterfall)** | Each component fetches its own data separately | Batch API calls, use GraphQL (WPGraphQL plugin), or server components to fetch data once | > 5 API calls per page |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| **WordPress admin panel accessible on production domain** | Brute force attacks, security vulnerability scanning | Move WordPress to subdomain (`api.82mobile.com`), restrict `/wp-admin` to specific IP addresses |
| **CORS allowing all origins with credentials** | Any website can make authenticated requests on behalf of users | Explicitly whitelist only your frontend domain: `Access-Control-Allow-Origin: https://82mobile.com` |
| **Application Passwords with admin scope** | Compromised password gives full site control | Create Application Passwords with minimum required scope (e.g., `read` only for product fetching) |
| **Customer data exposed in API responses** | Email addresses, phone numbers visible in product reviews or order endpoints | Sanitize API responses, remove PII from public endpoints |
| **No rate limiting on API endpoints** | API abuse, DDoS attacks | Implement rate limiting plugin (e.g., WP REST API Controller), limit to 60 requests/minute per IP |
| **Webhook endpoints without signature verification** | Fake webhook attacks, fraudulent order updates | Verify webhook signatures (Stripe signature, PayPal IPN verification) |
| **Sensitive environment variables in Git history** | API keys, database credentials exposed | Use `.gitignore` for `.env*` files, rotate all keys if accidentally committed |
| **No HTTPS for WordPress backend** | Man-in-the-middle attacks, credentials intercepted | Enforce HTTPS for all WordPress URLs, set `FORCE_SSL_ADMIN` in `wp-config.php` |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **Cart shows loading spinner during persistence** | User unsure if item added, clicks multiple times, duplicates | Optimistic updates - show item in cart immediately, sync in background |
| **No feedback during checkout form validation** | User submits form, waits, nothing happens (async validation) | Inline validation with clear error messages, disable submit until valid |
| **Product images load slowly or show layout shift** | Janky scrolling, poor perceived performance | Next.js Image component with proper width/height, placeholder blur effect |
| **Language switching clears cart** | User loses items when switching Korean ↔ English | Persist cart across language changes, store cart key independent of locale |
| **Mobile checkout form requires pinch-zoom** | Frustrating mobile experience, abandoned checkouts | Use appropriate input types (`type="tel"`, `inputmode="numeric"`), large touch targets (min 44px) |
| **No indication that session expired** | User fills out form, submits, "session expired" error, loses all form data | Check session before form submission, show warning with option to refresh |
| **Generic error messages ("Something went wrong")** | User can't fix problem, contacts support | Specific error messages: "Item out of stock", "Payment failed - please check card details" |
| **No order confirmation on success page** | User unsure if order placed, tries again, duplicate orders | Clear order confirmation with order number, email confirmation sent immediately |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Cart works in dev but not production:** Missing `Access-Control-Allow-Credentials` header, cookies not transmitting cross-origin
- [ ] **Products display but checkout fails:** WooCommerce webhooks not configured, payment gateway webhook URLs invalid
- [ ] **Authentication works for admin but not customers:** Application Password scope too restrictive, doesn't allow customer login
- [ ] **English site works but Korean is broken:** Polylang not configured for REST API, `?lang=ko` parameter missing
- [ ] **Localhost works but Vercel deployment fails:** Environment variables not set in Vercel dashboard, `.env.local` not committed (correctly), Vercel ENV vars not synced
- [ ] **Desktop works but mobile checkout broken:** CORS headers missing for mobile user agent, touch events not handled, form inputs too small
- [ ] **First order works but subsequent orders fail:** Webhook handling doesn't clear previous state, order ID conflicts in cart session
- [ ] **Guest checkout works but logged-in checkout fails:** Cart merge not implemented, session cookies conflict between guest and authenticated states
- [ ] **Single product works but product listing fails:** Pagination not implemented, API returns 100-product limit, performance degradation
- [ ] **New deployment works but old cached version persists:** Cache invalidation not triggered on deploy, Cloudflare still serving old version

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **CORS misconfiguration blocking production** | LOW | Add CORS headers to WordPress via MU-plugin or .htaccess, clear Cloudflare cache (< 1 hour fix) |
| **DNS cutover caused order loss** | HIGH | Rollback DNS to old site immediately, reconcile orders manually from payment gateway records, contact affected customers (1-2 days + customer trust damage) |
| **Authentication tokens exposed in Git** | MEDIUM | Rotate all tokens immediately, audit access logs for unauthorized use, notify customers if data breach detected (4-8 hours + potential PR damage) |
| **Cart session loss in production** | MEDIUM | Install CoCart plugin, implement cart key persistence, clear explanation to customers about cart reset (2-4 hours + lost sales during issue) |
| **Payment webhooks failing** | HIGH | Contact payment gateway support to re-enable webhooks, manually process pending orders, verify webhook URLs correct (4-8 hours + manual order processing) |
| **Aggressive caching serving stale data** | MEDIUM | Purge all cache layers (Cloudflare, Gabia, WordPress), configure cache exclusions, document cache TTLs (1-2 hours + potential lost sales) |
| **Underestimated timeline causing budget overrun** | HIGH | Secure additional budget approval, prioritize MVP features, defer non-critical features to post-launch (weeks to months + stakeholder trust damage) |
| **Gabia hosting limitations discovered mid-migration** | HIGH | Migrate WordPress to new host (AWS, DigitalOcean) or upgrade Gabia to VPS tier, update all configurations (1-2 weeks + migration cost) |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification Method |
|---------|------------------|---------------------|
| **Zero downtime DNS cutover** | Phase 2 (Infrastructure) | Parallel run test on subdomain, DNS TTL = 300s, rollback plan documented |
| **CORS misconfiguration** | Phase 1 (API Setup) | CORS test suite, verify from deployed Vercel preview |
| **Token exposure** | Phase 1 (Authentication) | Code review for `localStorage` use, git history scan for `.env` commits |
| **Cart session loss** | Phase 3 (Cart Implementation) | Test cart persistence across page refreshes, browser sessions, login transitions |
| **Payment webhook failures** | Phase 4 (Payment Testing) | Webhook delivery logs, test orders in staging with each payment method |
| **Aggressive caching** | Phase 2 (Infrastructure) | Cache hit rate monitoring, verify API responses have correct timestamps |
| **Underestimated complexity** | Phase 0 (Planning) | Detailed project plan reviewed by both WordPress and Next.js experts |
| **Gabia limitations** | Phase 1 (Assessment) | Test Gabia API accessibility, cache control, rate limits, PHP configuration |

---

## Sources

### Primary Sources (2026 Content)

#### Migration Strategy
- [Migrate to Headless WooCommerce Without Breaking Your Store - Wooninjas](https://wooninjas.com/headless-woocommerce-migration/)
- [Zero Downtime Migration for WordPress Sites - Cloudways 2026](https://www.cloudways.com/blog/zero-downtime-migration-for-wordpress-sites/)
- [Common Pitfalls Migrating to Headless CMS - Power Shifter Digital](https://www.powershifter.com/blog/common-pitfalls-in-migrating-to-headless-cms)
- [Migrate from WordPress to Headless CMS - Webstacks](https://www.webstacks.com/blog/migrate-wordpress-to-headless-cms)

#### CORS Configuration
- [Fix CORS Issues in Headless WordPress with Simple Steps - Juanma Codes 2025](https://juanma.codes/2025/10/09/enabling-cors-in-a-headless-wordpress-setup/)
- [WordPress REST API CORS Issues Solved - Rob Marshall](https://robertmarshall.dev/blog/wordpress-rest-api-cors-issues/)
- [WordPress Application Password CORS error - WordPress Trac #62232](https://core.trac.wordpress.org/ticket/62232)

#### Authentication Security
- [Login Security for Headless WordPress (2026 Guide) - LoginPress](https://loginpress.pro/login-security-for-headless-wordpress/)
- [Securing Headless WordPress with JWT, OAuth, and SSO - Formidable Masterminds](https://formidable-masterminds.com/building-the-bridge-authentication-sso-and-secure-api-gateways/)
- [WordPress REST API Authentication: Complete Security Implementation Guide 2025 - Odd Jar](https://oddjar.com/wordpress-rest-api-authentication-guide-2025/)
- [Headless WordPress Authentication with Native Cookies - WP Engine](https://developers.wpengine.com/blog/headless-wordpress-authentication-native-cookies)

#### Cart Session Management
- [Headless eCommerce API for Developers - CoCart](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/)
- [CoCart 4.2 Released: Session and Compatibility Improvements](https://cocartapi.com/cocart-4-2-released-session-and-compatibility-improvements/)
- [WooCommerce REST API Cart Session Issue with Subdomains](https://wordpress.org/support/topic/woocommerce-rest-api-cart-session-issue-with-subdomains-cookies-cors/)
- [Cart and Session not working in REST API - GitHub Issue #27160](https://github.com/woocommerce/woocommerce/issues/27160)
- [Headless WooCommerce & Next.js: Create a Cart - Medium](https://medium.com/geekculture/headless-woocommerce-next-js-create-a-cart-8a3e49b90076)

#### Payment Webhooks
- [Working with webhooks in WooCommerce (Official Docs)](https://developer.woocommerce.com/docs/best-practices/urls-and-routing/webhooks/)
- [Power of Webhooks in payment gateway integration](https://blog.poriyaalar.com/power-of-webhooks-in-payment-gateway-integration)
- [Webhook for order.updated with processing status not fired - GitHub Issue #40013](https://github.com/woocommerce/woocommerce/issues/40013)
- [WooCommerce Webhook order.update sending incorrect status - GitHub Issue #26356](https://github.com/woocommerce/woocommerce/issues/26356)

#### Caching Issues
- [Solving WordPress Problems with Cache for Good - Divimode](https://divimode.com/problems-with-cache/)
- [A look at WordPress page caching with a CDN - Ymir Blog](https://blog.ymirapp.com/wordpress-page-caching-cdn/)
- [Granular Cache Invalidation for Headless CMS - Focus Reactive](https://focusreactive.com/granular-cache-invalidation-for-headless-cms/)
- [How to Clear Cache in WordPress: 9 Simple Methods (2026) - Elementor](https://elementor.com/blog/how-to-clear-cache-in-wordpress-9-simple-methods-year/)

#### Deployment & Infrastructure
- [Using Headless WordPress with Next.js and Vercel - Vercel Guide](https://vercel.com/guides/wordpress-with-vercel)
- [Vercel Domain DNS Conflicts - Vercel Community](https://community.vercel.com/t/told-to-remove-the-following-conflicting-dns-records-from-dns-provider/30762)
- [Headless WordPress in 2026: A Complete Guide - Elementor](https://elementor.com/blog/headless-wordpress/)

#### Shared Hosting Limitations
- [Troubleshoot WordPress Headless CMS API Rate Limits](https://troubleshoothub.com/blog/troubleshoot-wordpress-headless-cms-api-rate-limits)
- [Headless WordPress examples: Limitations - The BCMS](https://thebcms.com/blog/headless-wordpress-examples)

---

*Pitfalls research for: Headless WordPress + WooCommerce migration for live e-commerce site*
*Researched: 2026-01-27*
*Context: 82mobile.com - zero downtime requirement, Gabia shared hosting with extreme caching, production e-commerce site serving international tourists*
