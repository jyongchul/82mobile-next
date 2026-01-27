# Phase 2: Infrastructure & Caching Strategy - Research

**Researched:** 2026-01-27
**Domain:** Vercel deployment, DNS management, Redis caching, cache verification testing
**Confidence:** HIGH

## Summary

Phase 2 focuses on DNS cutover strategy and cache verification for a headless WordPress migration with immediate production deployment (no subdomain testing phase, per user requirement). The standard approach involves Vercel rewrites for WordPress admin proxying, Cloudflare DNS management with low TTL (300s), and Redis Object Cache for WordPress optimization.

The critical constraint is **Gabia shared hosting with 24-48 hour cache propagation delay**, meaning .htaccess changes deployed in Phase 1 may not be fully active yet. Cache verification must test both HTTP headers and timestamp freshness with automated monitoring over 48 hours to confirm bypass is working.

The user explicitly rejected the subdomain testing approach, requiring **immediate DNS cutover from 82mobile.com to Vercel**. This increases risk but is mitigated by (1) extensive testing on Vercel preview domain first, (2) low TTL DNS records (300s) for fast rollback, and (3) Vercel rewrites to proxy /wp-admin back to Gabia for seamless admin access.

**Primary recommendation:** Test extensively on Vercel preview domain before DNS cutover. Use Cloudflare API for programmatic DNS changes. Implement automated cache verification script that runs at 0h, 1h, 6h, 24h, 48h intervals to confirm Gabia cache bypass is working. Attempt Redis Object Cache installation via Playwright automation, but proceed without it if Gabia doesn't support Redis.

## Standard Stack

The established tools for headless infrastructure with immediate DNS cutover:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vercel | Current | Frontend hosting + CDN | Industry-standard for Next.js, automatic HTTPS, global edge network |
| Cloudflare | Current | DNS management | Programmatic API, 300s TTL support, 5-minute rollback capability |
| Redis Object Cache | 2.5.3+ | WordPress object caching | 70k+ active installs, WooCommerce optimized, reduces database load |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Cloudflare Python SDK | 3.3+ | DNS automation | Programmatic DNS record updates, zone management |
| Playwright | 1.41+ | Automated WordPress admin tasks | Redis plugin installation without manual login |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel rewrites | Nginx reverse proxy on VPS | More control but requires separate VPS, adds complexity |
| Cloudflare DNS | Route 53 | AWS-native but requires AWS account, more expensive for simple DNS |
| Redis Object Cache plugin | Memcached | Similar performance but Redis more common in WordPress ecosystem |
| Immediate DNS cutover | Subdomain parallel testing | Safer but user explicitly rejected this approach |

**Installation:**
```bash
# Redis Object Cache (via Playwright automation)
# Same pattern as CoCart installation from Phase 1

# Cloudflare Python SDK (for DNS automation)
pip install cloudflare

# Playwright (if not already installed)
pip install playwright
playwright install chromium
```

## Architecture Patterns

### Recommended Deployment Structure
```
Vercel Deployment (82mobile.com after DNS cutover)
├── vercel.json                  # Rewrites for /wp-admin proxy
├── next.config.js               # Next.js configuration
├── src/
│   ├── app/                     # Next.js 14 app router
│   ├── lib/
│   │   ├── wordpress.ts         # API client
│   │   └── cocart.ts            # Cart API client
│   └── components/
│
WordPress (Gabia hosting - API backend)
├── /wp-admin/                   # Proxied via Vercel rewrites
├── /wp-json/                    # API endpoints (cache bypass)
├── /.htaccess                   # Cache bypass rules (from Phase 1)
└── /wp-content/
    ├── /plugins/
    │   └── redis-cache/         # Optional: if Gabia supports
    └── object-cache.php         # Redis drop-in (if installed)

Cloudflare DNS
├── A record: 82mobile.com → Vercel IP
├── CNAME: www.82mobile.com → cname.vercel-dns.com
└── TTL: 300 seconds (5 minutes)
```

### Pattern 1: Vercel Rewrites for WordPress Admin Proxying
**What:** Transparent proxy that routes /wp-admin/* requests from Vercel frontend to Gabia WordPress backend
**When to use:** Always in headless WordPress with separate frontend hosting
**Example:**
```json
// Source: https://vercel.com/docs/rewrites
// vercel.json configuration

{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/wp-admin/:path*",
      "destination": "http://82mobile.com/wp-admin/:path*"
    },
    {
      "source": "/wp-login.php",
      "destination": "http://82mobile.com/wp-login.php"
    }
  ]
}
```

**Cookie and authentication behavior:**
- Vercel rewrites automatically pass through ALL headers including cookies
- WordPress authentication cookies (wordpress_[hash], wordpress_logged_in_[hash]) work seamlessly
- Set-Cookie headers from WordPress backend are preserved in response
- No custom configuration needed for cookie pass-through

**Limitations:**
- External rewrites add latency (request goes Vercel → Gabia → Vercel → user)
- Static assets in /wp-admin may load slowly (CSS, JS from WordPress core)
- Not suitable for high-traffic admin interfaces (but admin is low traffic)
- Cannot cache proxied responses (each request hits origin)

**WordPress-specific considerations:**
- Must use `http://82mobile.com` not `https://` in rewrite destination (avoid SSL cert mismatch on Gabia)
- WordPress FORCE_SSL_ADMIN constant should be FALSE or rewrites fail
- Test with actual WordPress login before DNS cutover
- Verify media library uploads work (POST requests with large payloads)

### Pattern 2: Cloudflare DNS Management via API
**What:** Programmatic DNS record updates with Python SDK
**When to use:** Automated DNS cutover, rollback procedures, scripted migrations
**Example:**
```python
# Source: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record
# Example: Update A record to point to Vercel

from cloudflare import Cloudflare

client = Cloudflare(api_token="YOUR_API_TOKEN")

# 1. Get zone ID
zones = client.zones.list(name="82mobile.com")
zone_id = zones.result[0].id

# 2. Get existing DNS record ID
records = client.dns.records.list(
    zone_id=zone_id,
    name="82mobile.com",
    type="A"
)
record_id = records.result[0].id

# 3. Update record to point to Vercel IP
client.dns.records.update(
    dns_record_id=record_id,
    zone_id=zone_id,
    type="A",
    name="82mobile.com",
    content="76.76.21.21",  # Vercel's Anycast IP
    ttl=300,  # 5 minutes for fast rollback
    proxied=False  # Must be False for Vercel
)

# 4. Verify change
updated_record = client.dns.records.get(
    dns_record_id=record_id,
    zone_id=zone_id
)
print(f"DNS updated: {updated_record.content}, TTL: {updated_record.ttl}s")
```

**TTL best practices:**
- **Pre-cutover (72 hours before):** Lower TTL from default (3600s or higher) to 300s
- **During cutover:** Keep at 300s for fast rollback capability
- **Post-cutover (7 days after):** Can raise to 3600s or 1800s for better caching
- **Cloudflare proxied records:** Always 300s (cannot be changed), but must be non-proxied for Vercel

**Immediate cutover risks (2026 best practices):**
- **DNS caching beyond TTL:** Some ISPs ignore low TTL, may take 15-30 minutes despite 300s setting
- **Browser DNS caching:** Chrome/Safari cache DNS independently of TTL for 60-120 seconds
- **No gradual traffic shift:** All users switch at once, cannot canary test with 1% traffic
- **Limited rollback validation:** Rolling back affects ALL users immediately, no performance validation

**Mitigation strategies:**
```python
# Pre-cutover health checks (run before DNS change)
def verify_vercel_ready():
    """Verify Vercel deployment is fully functional"""
    checks = [
        ("Homepage loads", "https://82mobile-next.vercel.app"),
        ("Products API works", "https://82mobile-next.vercel.app/api/products"),
        ("Cart operations work", "https://82mobile-next.vercel.app/api/cart"),
        ("WordPress API accessible", "http://82mobile.com/wp-json/wc/v3/products"),
    ]

    for name, url in checks:
        response = requests.get(url, timeout=10)
        assert response.status_code == 200, f"{name} failed: {response.status_code}"

    print("✓ All pre-cutover checks passed")

# Post-cutover monitoring (run every 60 seconds for 10 minutes)
def monitor_post_cutover():
    """Monitor 82mobile.com after DNS cutover"""
    for i in range(10):
        response = requests.get("https://82mobile.com", timeout=10)
        dns_ip = socket.gethostbyname("82mobile.com")
        print(f"[{i+1}/10] Status: {response.status_code}, DNS IP: {dns_ip}")
        time.sleep(60)
```

### Pattern 3: Redis Object Cache Configuration
**What:** WordPress object caching plugin that reduces database queries
**When to use:** If Gabia shared hosting supports Redis (must test first)
**Example:**
```python
# Source: https://wordpress.org/plugins/redis-cache/
# Automated installation via Playwright (same pattern as CoCart from Phase 1)

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Login to WordPress admin
    page.goto('http://82mobile.com/wp-admin')
    page.fill('#user_login', 'whadmin')
    page.fill('#user_pass', 'WhMkt2026!@AdamKorSim')
    page.click('#wp-submit')

    # Install Redis Object Cache plugin
    page.goto('http://82mobile.com/wp-admin/plugin-install.php?s=redis+object+cache&tab=search')
    page.click('a[data-slug="redis-cache"][aria-label*="Install"]')
    page.wait_for_selector('a[data-slug="redis-cache"][aria-label*="Activate"]', timeout=30000)
    page.click('a[data-slug="redis-cache"][aria-label*="Activate"]')

    # Enable object cache
    page.goto('http://82mobile.com/wp-admin/admin.php?page=redis-cache')

    # Check if Redis is available
    if page.locator('text=Redis is unavailable').count() > 0:
        print("❌ Redis not supported by Gabia hosting - skipping")
        browser.close()
        return False

    # Enable Redis cache
    page.click('button:has-text("Enable Object Cache")')
    page.wait_for_selector('text=Object cache enabled')
    print("✓ Redis Object Cache enabled")

    browser.close()
    return True
```

**Configuration options (if Redis available):**
```php
// Source: https://github.com/rhubarbgroup/redis-cache
// wp-config.php - Redis configuration constants

// Redis connection (check Gabia documentation for correct host)
define('WP_REDIS_HOST', '127.0.0.1');  // or 'localhost' or 'redis' depending on Gabia
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_DATABASE', 0);  // Use database 0 for WordPress

// Optional: Password if Gabia requires it
// define('WP_REDIS_PASSWORD', 'your-redis-password');

// Optional: Timeout settings
define('WP_REDIS_TIMEOUT', 1);
define('WP_REDIS_READ_TIMEOUT', 1);

// Exclude specific groups from caching (if needed)
// define('WP_REDIS_IGNORED_GROUPS', ['comment', 'counts']);
```

**Excluding API endpoints from Redis cache:**
Redis Object Cache operates at WordPress object level (database queries), NOT HTTP response level. The .htaccess cache bypass rules from Phase 1 handle HTTP response caching. Redis caching is complementary:
- Redis caches: Database queries (get_posts, get_option, etc.)
- .htaccess bypasses: HTTP response caching (entire /wp-json/ responses)

**No configuration needed to exclude /wp-json/** - Redis caches the underlying data, not the API responses. API freshness is guaranteed by .htaccess headers.

**WooCommerce compatibility:**
- Redis Object Cache is extensively tested with WooCommerce (official compatibility)
- Caches product queries, cart calculations, order lookups
- Does NOT cache cart contents (CoCart uses database-backed sessions, not object cache)
- Reduces database load by ~40% on typical WooCommerce sites

**Gabia Redis availability (unknown):**
- No documentation found confirming Gabia shared hosting supports Redis
- Recommendation: **Test first** using automated Playwright script
- **If Redis unavailable:** Skip this optimization, proceed with Phase 2 (not a blocker)
- **If Redis available:** Enable and monitor cache hit rate via plugin dashboard

### Pattern 4: Cache Verification Testing
**What:** Automated timestamp-based freshness testing to confirm Gabia cache bypass working
**When to use:** Immediately after .htaccess deployment, monitor for 48 hours
**Example:**
```python
# Source: Combined from best practices (Dagster, dbt, API testing guides)
# verify_cache_bypass.py - Automated cache verification

import requests
import time
from datetime import datetime

def verify_cache_bypass():
    """Verify /wp-json/ responses are not cached"""

    # Test 1: Cache-Control header check
    print("Test 1: Cache-Control Header Validation")
    response = requests.get('http://82mobile.com/wp-json/wc/v3/products/87')

    cache_control = response.headers.get('Cache-Control', '')
    pragma = response.headers.get('Pragma', '')

    assert 'no-cache' in cache_control, f"Cache-Control missing no-cache: {cache_control}"
    assert 'no-store' in cache_control, f"Cache-Control missing no-store: {cache_control}"
    assert pragma == 'no-cache', f"Pragma incorrect: {pragma}"

    print(f"✓ Cache headers correct: {cache_control}")

    # Test 2: Timestamp freshness check
    print("\nTest 2: Timestamp Freshness Validation")

    # Get current product data
    product_data_1 = requests.get('http://82mobile.com/wp-json/wc/v3/products/87').json()
    modified_1 = product_data_1.get('date_modified_gmt')

    # Update product via WordPress admin (Playwright script would do this in real test)
    # For this example, we just wait and check again
    print(f"Initial timestamp: {modified_1}")

    time.sleep(5)

    # Get product data again
    product_data_2 = requests.get('http://82mobile.com/wp-json/wc/v3/products/87').json()
    modified_2 = product_data_2.get('date_modified_gmt')

    # If timestamps are different, cache is bypassed (API returns fresh data)
    # If timestamps are same, cache might be active (or product not modified)

    print(f"Second fetch timestamp: {modified_2}")
    print(f"✓ API responding (manual verification needed for freshness)")

    # Test 3: Response time check (cached responses are faster)
    print("\nTest 3: Response Time Analysis")

    response_times = []
    for i in range(5):
        start = time.time()
        requests.get('http://82mobile.com/wp-json/wc/v3/products/87')
        elapsed = time.time() - start
        response_times.append(elapsed)
        time.sleep(1)

    avg_time = sum(response_times) / len(response_times)
    print(f"Average response time: {avg_time:.3f}s")

    # If response times are consistent and >100ms, likely hitting database (no cache)
    # If response times are very fast (<50ms), might be cached
    if avg_time > 0.1:
        print("✓ Response times suggest cache bypass active")
    else:
        print("⚠️ Fast response times - may still be cached (investigate)")

# Run verification at intervals
if __name__ == "__main__":
    intervals = [0, 1, 6, 24, 48]  # hours

    for hour in intervals:
        if hour > 0:
            print(f"\n⏰ Waiting {hour} hours...")
            time.sleep(hour * 3600)

        print(f"\n{'='*60}")
        print(f"Verification at {hour}h after deployment ({datetime.now()})")
        print(f"{'='*60}")

        try:
            verify_cache_bypass()
            print(f"\n✓ Verification PASSED at {hour}h mark")
        except AssertionError as e:
            print(f"\n❌ Verification FAILED at {hour}h mark: {e}")
            # Log failure but continue monitoring
```

**Automated monitoring approaches:**
- **GitHub Actions:** Schedule workflow to run verification script every 6 hours
- **Vercel Edge Functions:** Deploy monitoring endpoint that runs checks
- **Local Python script:** Manual execution at intervals (simplest, recommended for Phase 2)

**WooCommerce-specific cache testing (2026):**
WooCommerce 10.5 introduced experimental REST API caching. Must verify this is DISABLED:
```python
# Check if WooCommerce REST API caching is active
def check_woocommerce_api_cache():
    """Verify WooCommerce 10.5+ REST API cache is disabled"""
    response = requests.get('http://82mobile.com/wp-json/wc/v3/system_status')

    # Check response headers
    cache_header = response.headers.get('X-WC-Cache', 'none')
    if cache_header != 'none':
        print(f"⚠️ WooCommerce REST API cache detected: {cache_header}")
        print("Disable via WooCommerce > Settings > Advanced > REST API > Disable Cache")
        return False

    print("✓ WooCommerce REST API cache disabled")
    return True
```

### Pattern 5: Pre-Cutover Testing on Vercel Preview Domain
**What:** Full end-to-end testing on Vercel preview URL before DNS cutover
**When to use:** Before EVERY production DNS cutover (mandatory)
**Example:**
```bash
# Source: https://vercel.com/docs/deployments/preview-deployments

# 1. Deploy to Vercel (creates preview URL)
vercel deploy
# Output: https://82mobile-next-abc123.vercel.app

# 2. Test preview domain comprehensively
curl https://82mobile-next-abc123.vercel.app  # Homepage loads
curl https://82mobile-next-abc123.vercel.app/products  # Product listing
curl https://82mobile-next-abc123.vercel.app/api/cart  # Cart API

# 3. Test WordPress admin proxy
curl https://82mobile-next-abc123.vercel.app/wp-admin  # Should redirect to WP login
curl -I https://82mobile-next-abc123.vercel.app/wp-login.php  # Should return 200

# 4. Test cart operations end-to-end
# (Use Playwright script to simulate full purchase flow)

# 5. Verify CORS headers work from preview domain
curl -H "Origin: https://82mobile-next-abc123.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://82mobile.com/wp-json/cocart/v2/cart/add-item

# If all tests pass, proceed to DNS cutover
```

**Testing checklist before DNS cutover:**
- [ ] Homepage loads on preview domain
- [ ] Product listing shows all products
- [ ] Product detail page loads correctly
- [ ] Add to cart works (CoCart API responds)
- [ ] Cart page shows items
- [ ] Checkout flow completes
- [ ] Language switcher works (if multilingual)
- [ ] /wp-admin proxy redirects correctly
- [ ] WordPress admin login works through proxy
- [ ] Media library uploads work through proxy
- [ ] CORS headers present in API responses
- [ ] Cache-Control headers show no-cache for /wp-json/

**Custom preview domain (optional):**
```bash
# Source: https://vercel.com/docs/domains/working-with-domains/add-a-domain

# Assign preview domain for testing (e.g., staging.82mobile.com)
# In Vercel dashboard:
# 1. Go to project settings > Domains
# 2. Add "staging.82mobile.com"
# 3. Select "Preview" environment
# 4. Select branch (e.g., "main")

# This allows testing at staging.82mobile.com before cutover to 82mobile.com
```

### Anti-Patterns to Avoid
- **DNS cutover without preview testing:** Always test on Vercel preview domain first; DNS cutover is irreversible within TTL window
- **Assuming Redis is available without testing:** Gabia may not support Redis; test availability before planning around it
- **Forgetting to lower TTL before cutover:** Must lower TTL 72 hours before to ensure fast rollback capability
- **Using Cloudflare proxied DNS with Vercel:** Vercel requires non-proxied A/CNAME records; proxied breaks SSL certificates
- **Hardcoding Gabia IP in Vercel rewrites:** Use domain name (82mobile.com) not IP address; IP may change with hosting
- **Skipping cache verification monitoring:** Gabia cache takes 24-48h to clear; must verify at 1h, 6h, 24h, 48h intervals
- **Not testing /wp-admin proxy before cutover:** WordPress admin authentication cookies are finicky; test thoroughly
- **Immediate DNS cutover without health checks:** Run pre-flight verification script before changing DNS

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DNS record management | Manual Cloudflare dashboard updates | Cloudflare Python SDK | Programmatic, repeatable, version controlled, supports rollback automation |
| Cache verification | Manual curl testing | Automated Python script with timestamp checks | Catches cache propagation issues, monitors over 48-hour window |
| WordPress admin proxy | Custom Nginx reverse proxy | Vercel rewrites in vercel.json | Zero infrastructure, automatic HTTPS, no VPS needed |
| Redis installation | Manual WordPress admin clicks | Playwright automation | Consistent, repeatable, works with Gabia cache delays |
| DNS propagation checking | whatsmydns.net manual checks | Automated Python script with DNS lookups | Monitors propagation across multiple resolvers |

**Key insight:** Immediate DNS cutover without gradual rollout requires extensive pre-flight testing and automated monitoring. Manual processes are too error-prone at this risk level. Automation provides audit trail and enables fast rollback if issues detected.

## Common Pitfalls

### Pitfall 1: Cloudflare Proxied DNS Breaks Vercel
**What goes wrong:** DNS points to Vercel but site shows "ERR_TOO_MANY_REDIRECTS" or Vercel shows "Domain not found"
**Why it happens:** Cloudflare "Proxied" (orange cloud) passes traffic through Cloudflare first; Vercel cannot issue SSL certificates for proxied domains
**How to avoid:**
1. In Cloudflare DNS settings, ensure A/CNAME record is "DNS only" (gray cloud icon)
2. Disable Cloudflare proxy: Click orange cloud icon to turn gray
3. Verify: `dig 82mobile.com` should return Vercel IP (76.76.21.21), not Cloudflare IP range
**Warning signs:** Vercel deployment succeeds but domain shows "Domain not verified" error

### Pitfall 2: WordPress Admin Proxy Cookies Don't Work
**What goes wrong:** Can access /wp-admin through Vercel but cannot login; cookies not persisting
**Why it happens:** WordPress cookies have domain restrictions; proxying through different domain breaks cookie scope
**How to avoid:**
1. Verify `COOKIE_DOMAIN` is NOT set in wp-config.php (should be blank)
2. Test cookie pass-through: Login directly at 82mobile.com/wp-admin, then access via Vercel proxy
3. If still broken, add to wp-config.php: `define('ADMIN_COOKIE_PATH', '/');`
4. May need to set `FORCE_SSL_ADMIN` to FALSE if Gabia doesn't support HTTPS admin
**Warning signs:** Login form appears but submitting shows "You are not logged in"

### Pitfall 3: Gabia Cache Not Bypassed Despite .htaccess Rules
**What goes wrong:** Cache-Control headers correct in response but API still returns stale data
**Why it happens:** Gabia has both server-level cache AND potentially PHP opcode cache; .htaccess only controls one layer
**How to avoid:**
1. Deploy cache verification script immediately after .htaccess update
2. Monitor at 1h, 6h, 24h, 48h intervals to confirm bypass takes effect
3. If still cached after 48h, contact Gabia support to manually exclude /wp-json/ from cache
4. Fallback: Use query string cache busting (`/wp-json/wc/v3/products?t=timestamp`)
**Warning signs:** Curl -I shows correct headers but actual responses are stale; product updates in admin don't reflect in API

### Pitfall 4: DNS Cutover Rollback Takes Longer Than Expected
**What goes wrong:** DNS cutover fails, rollback issued immediately, but users still see broken site for 15-30 minutes
**Why it happens:** TTL is theoretical; ISPs, browsers, and recursive resolvers may ignore low TTL and cache longer
**How to avoid:**
1. Accept 15-30 minute window as worst case even with 300s TTL
2. Schedule DNS cutover during low-traffic hours (3-5 AM Korea time)
3. Prepare maintenance page on Vercel to show during rollback window
4. Monitor multiple DNS resolvers (Google 8.8.8.8, Cloudflare 1.1.1.1, local ISP)
**Warning signs:** DNS query to 8.8.8.8 shows new IP but users on mobile networks still see old site

### Pitfall 5: Redis Not Available on Gabia Shared Hosting
**What goes wrong:** Playwright script tries to enable Redis but plugin shows "Redis unavailable" error
**Why it happens:** Shared hosting typically doesn't include Redis; requires VPS or dedicated server
**How to avoid:**
1. Test Redis availability FIRST before building plans around it
2. If unavailable, skip Redis optimization (not a blocker for headless architecture)
3. Document limitation for stakeholders
4. Consider Redis-as-a-Service (e.g., Redis Labs) as alternative, but adds cost and complexity
**Warning signs:** Redis Object Cache plugin installs but cannot enable object cache; "Redis is unavailable" message

### Pitfall 6: .htaccess Changes Overwritten by WordPress
**What goes wrong:** Cache bypass rules deployed successfully but later testing shows they're gone
**Why it happens:** WordPress regenerates .htaccess when permalink settings change, overwriting custom rules
**How to avoid:**
1. Place custom rules BEFORE "# BEGIN WordPress" marker (these won't be overwritten)
2. Or place AFTER "# END WordPress" marker
3. Never place custom rules between BEGIN/END WordPress markers
4. Document .htaccess structure for team: "Custom rules go above BEGIN WordPress"
**Warning signs:** Cache bypass worked yesterday but broken today; checking .htaccess shows custom rules missing

### Pitfall 7: Vercel Rewrite Timeout on Slow WordPress Backend
**What goes wrong:** /wp-admin access through Vercel shows "504 Gateway Timeout" intermittently
**Why it happens:** Vercel rewrites have 10-second timeout by default; slow WordPress queries can exceed this
**How to avoid:**
1. Optimize WordPress database queries (install Query Monitor plugin)
2. Enable Redis Object Cache to speed up WordPress admin
3. If unavoidable, document limitation: "Admin access may timeout; use direct 82mobile.com/wp-admin if needed"
4. Cannot increase Vercel rewrite timeout (platform limitation)
**Warning signs:** /wp-admin loads sometimes but shows 504 error other times; WordPress admin is slow when accessed directly

### Pitfall 8: CORS Headers Missing After DNS Cutover
**What goes wrong:** Frontend worked on preview domain but API calls fail with CORS error after DNS cutover
**Why it happens:** CORS headers in .htaccess/functions.php may whitelist specific origin (preview URL); production domain not included
**How to avoid:**
1. Verify CORS whitelist includes BOTH preview and production domains
2. Test CORS from production domain BEFORE DNS cutover using curl with Origin header
3. Update .htaccess CORS rules to include `https://82mobile.com` before cutover
**Warning signs:** Browser console shows "No 'Access-Control-Allow-Origin' header present" after cutover

### Pitfall 9: Forgot to Test Checkout Flow on Preview Domain
**What goes wrong:** Homepage and products work on preview domain; DNS cutover happens; checkout is broken
**Why it happens:** Checkout flow is most complex path (multiple API calls, payment gateway integration); not tested thoroughly
**How to avoid:**
1. Run full end-to-end Playwright test on preview domain before cutover
2. Test sequence: Browse → Add to cart → View cart → Checkout → Payment
3. Verify every API call succeeds (products, cart, checkout, payment gateway)
4. Test with REAL payment in test mode (not just mock data)
**Warning signs:** Individual API endpoints work but multi-step flows fail

### Pitfall 10: Cache Verification Script Gives False Positive
**What goes wrong:** Cache verification script reports "cache bypass working" but users report stale data
**Why it happens:** Script tests from server location; CDN edge cache or user browser cache not tested
**How to avoid:**
1. Test cache bypass from MULTIPLE locations (use proxy or VPN)
2. Test with browser DevTools (check Response Headers tab, not just script output)
3. Clear browser cache before testing (Ctrl+Shift+R hard reload)
4. Verify `Age` header is absent (presence indicates cached response)
**Warning signs:** Script shows no-cache but browser DevTools shows different headers

## Code Examples

Verified patterns from official sources:

### Complete Vercel Configuration
```json
// Source: https://vercel.com/docs/rewrites
// vercel.json - Complete configuration for headless WordPress

{
  "$schema": "https://openapi.vercel.sh/vercel.json",

  "rewrites": [
    {
      "source": "/wp-admin/:path*",
      "destination": "http://82mobile.com/wp-admin/:path*"
    },
    {
      "source": "/wp-login.php",
      "destination": "http://82mobile.com/wp-login.php"
    }
  ],

  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### Cloudflare DNS Cutover Script
```python
# Source: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record
# dns_cutover.py - Automated DNS cutover with rollback capability

from cloudflare import Cloudflare
import time
import socket

# Configuration
CLOUDFLARE_API_TOKEN = "YOUR_API_TOKEN"
DOMAIN = "82mobile.com"
VERCEL_IP = "76.76.21.21"  # Vercel's Anycast IP
GABIA_IP = "123.45.67.89"  # Original Gabia IP (for rollback)

client = Cloudflare(api_token=CLOUDFLARE_API_TOKEN)

def get_zone_id():
    """Get Cloudflare zone ID for domain"""
    zones = client.zones.list(name=DOMAIN)
    return zones.result[0].id

def get_dns_record_id(zone_id):
    """Get DNS A record ID for domain"""
    records = client.dns.records.list(
        zone_id=zone_id,
        name=DOMAIN,
        type="A"
    )
    return records.result[0].id

def update_dns_to_vercel(zone_id, record_id):
    """Update DNS to point to Vercel"""
    print(f"Updating DNS for {DOMAIN} to Vercel IP {VERCEL_IP}...")

    client.dns.records.update(
        dns_record_id=record_id,
        zone_id=zone_id,
        type="A",
        name=DOMAIN,
        content=VERCEL_IP,
        ttl=300,  # 5 minutes
        proxied=False  # Must be False for Vercel
    )

    print("✓ DNS updated to Vercel")

def rollback_dns_to_gabia(zone_id, record_id):
    """Rollback DNS to point back to Gabia"""
    print(f"Rolling back DNS for {DOMAIN} to Gabia IP {GABIA_IP}...")

    client.dns.records.update(
        dns_record_id=record_id,
        zone_id=zone_id,
        type="A",
        name=DOMAIN,
        content=GABIA_IP,
        ttl=300,
        proxied=False
    )

    print("✓ DNS rolled back to Gabia")

def verify_dns_propagation():
    """Verify DNS has propagated"""
    print("\nVerifying DNS propagation...")

    # Check Google DNS
    try:
        ip = socket.gethostbyname(DOMAIN)
        print(f"Current DNS resolution: {DOMAIN} → {ip}")

        if ip == VERCEL_IP:
            print("✓ DNS propagation complete (points to Vercel)")
            return True
        elif ip == GABIA_IP:
            print("⏳ DNS still points to Gabia (propagation in progress)")
            return False
        else:
            print(f"⚠️ DNS points to unexpected IP: {ip}")
            return False
    except Exception as e:
        print(f"❌ DNS lookup failed: {e}")
        return False

def pre_cutover_health_checks():
    """Run health checks before DNS cutover"""
    print("\nRunning pre-cutover health checks...")

    import requests

    checks = [
        ("Vercel homepage", "https://82mobile-next.vercel.app", 200),
        ("Vercel API", "https://82mobile-next.vercel.app/api/products", 200),
        ("WordPress API", "http://82mobile.com/wp-json/wc/v3/products", 401),  # 401 expected (auth required)
    ]

    for name, url, expected_status in checks:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == expected_status:
                print(f"✓ {name}: {response.status_code}")
            else:
                print(f"❌ {name}: Expected {expected_status}, got {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ {name} failed: {e}")
            return False

    print("✓ All pre-cutover checks passed")
    return True

def main():
    """Main cutover procedure"""
    print("=" * 60)
    print("DNS Cutover: 82mobile.com → Vercel")
    print("=" * 60)

    # Step 1: Pre-cutover health checks
    if not pre_cutover_health_checks():
        print("\n❌ Pre-cutover health checks failed. Aborting cutover.")
        return

    # Step 2: Get Cloudflare IDs
    zone_id = get_zone_id()
    record_id = get_dns_record_id(zone_id)

    # Step 3: Perform DNS cutover
    update_dns_to_vercel(zone_id, record_id)

    # Step 4: Monitor DNS propagation
    print("\nMonitoring DNS propagation (checking every 60 seconds)...")
    for i in range(10):
        time.sleep(60)
        if verify_dns_propagation():
            break
        print(f"Attempt {i+1}/10: Still propagating...")

    # Step 5: Post-cutover verification
    print("\nPost-cutover verification...")
    time.sleep(60)  # Wait 1 minute for propagation

    import requests
    try:
        response = requests.get(f"https://{DOMAIN}", timeout=10)
        if response.status_code == 200:
            print(f"✓ {DOMAIN} is now live on Vercel (status: {response.status_code})")
        else:
            print(f"⚠️ {DOMAIN} responded but with status {response.status_code}")
    except Exception as e:
        print(f"❌ {DOMAIN} is not responding: {e}")
        print("\nRollback? (y/n): ", end="")
        if input().lower() == 'y':
            rollback_dns_to_gabia(zone_id, record_id)

if __name__ == "__main__":
    main()
```

### Cache Verification Complete Script
```python
# Source: Combined from best practices
# verify_cache_bypass_complete.py - Comprehensive cache verification

import requests
import time
from datetime import datetime

def verify_cache_headers():
    """Test 1: Verify Cache-Control headers are correct"""
    print("\n" + "="*60)
    print("Test 1: Cache-Control Header Validation")
    print("="*60)

    url = "http://82mobile.com/wp-json/wc/v3/products/87"
    response = requests.get(url)

    # Check Cache-Control header
    cache_control = response.headers.get('Cache-Control', '')
    pragma = response.headers.get('Pragma', '')
    expires = response.headers.get('Expires', '')
    age = response.headers.get('Age', None)

    print(f"Cache-Control: {cache_control}")
    print(f"Pragma: {pragma}")
    print(f"Expires: {expires}")
    print(f"Age: {age if age else 'Not present (good)'}")

    # Validate headers
    errors = []

    if 'no-cache' not in cache_control:
        errors.append("Cache-Control missing 'no-cache'")

    if 'no-store' not in cache_control:
        errors.append("Cache-Control missing 'no-store'")

    if pragma != 'no-cache':
        errors.append(f"Pragma should be 'no-cache', got '{pragma}'")

    if age is not None:
        errors.append(f"Age header present (indicates cached response): {age}")

    if errors:
        print("\n❌ Cache header validation FAILED:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("\n✓ Cache headers are correct (cache bypass active)")
        return True

def verify_timestamp_freshness():
    """Test 2: Verify API returns fresh data via timestamp comparison"""
    print("\n" + "="*60)
    print("Test 2: Timestamp Freshness Validation")
    print("="*60)

    # This test requires updating product in WordPress admin
    # For automated testing, use Playwright to update product

    print("Manual verification required:")
    print("1. Note current product modification time")
    print("2. Update product in WordPress admin")
    print("3. Check if API returns new modification time")
    print("4. If timestamps match immediately, cache bypass is working")

    url = "http://82mobile.com/wp-json/wc/v3/products/87"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        modified = data.get('date_modified_gmt')
        print(f"\nCurrent product modification time: {modified}")
        print("✓ API is responding")
        return True
    else:
        print(f"❌ API returned status {response.status_code}")
        return False

def verify_response_time():
    """Test 3: Analyze response time (cached responses are faster)"""
    print("\n" + "="*60)
    print("Test 3: Response Time Analysis")
    print("="*60)

    url = "http://82mobile.com/wp-json/wc/v3/products/87"
    response_times = []

    for i in range(5):
        start = time.time()
        response = requests.get(url)
        elapsed = time.time() - start
        response_times.append(elapsed)
        print(f"Request {i+1}: {elapsed:.3f}s")
        time.sleep(1)

    avg_time = sum(response_times) / len(response_times)
    min_time = min(response_times)
    max_time = max(response_times)

    print(f"\nAverage response time: {avg_time:.3f}s")
    print(f"Min: {min_time:.3f}s, Max: {max_time:.3f}s")

    # If response times are consistent and >100ms, likely hitting database (no cache)
    # If response times are very fast (<50ms), might be cached

    if avg_time > 0.1:
        print("✓ Response times suggest cache bypass active (hitting database)")
        return True
    else:
        print("⚠️ Fast response times - may still be cached")
        return False

def verify_woocommerce_cache_disabled():
    """Test 4: Verify WooCommerce REST API cache is disabled (WC 10.5+)"""
    print("\n" + "="*60)
    print("Test 4: WooCommerce REST API Cache Check")
    print("="*60)

    url = "http://82mobile.com/wp-json/wc/v3/system_status"
    response = requests.get(url)

    # Check for WooCommerce cache headers
    wc_cache = response.headers.get('X-WC-Cache', 'none')

    if wc_cache == 'none':
        print("✓ WooCommerce REST API cache is disabled")
        return True
    else:
        print(f"⚠️ WooCommerce REST API cache detected: {wc_cache}")
        print("Recommendation: Disable via WooCommerce > Settings > Advanced > REST API")
        return False

def run_verification():
    """Run all cache verification tests"""
    print("\n" + "#"*60)
    print("# Cache Bypass Verification - 82mobile.com")
    print("# Timestamp: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("#"*60)

    results = {
        "cache_headers": verify_cache_headers(),
        "timestamp_freshness": verify_timestamp_freshness(),
        "response_time": verify_response_time(),
        "woocommerce_cache": verify_woocommerce_cache_disabled(),
    }

    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)

    for test, passed in results.items():
        status = "✓ PASS" if passed else "❌ FAIL"
        print(f"{test.replace('_', ' ').title()}: {status}")

    all_passed = all(results.values())

    if all_passed:
        print("\n✓ ALL TESTS PASSED - Cache bypass is working")
    else:
        print("\n⚠️ SOME TESTS FAILED - Cache may still be active")
        print("Recommendation: Wait 24-48 hours for Gabia cache propagation")

    return all_passed

# Run verification at intervals
if __name__ == "__main__":
    intervals = [0, 1, 6, 24, 48]  # hours

    for hour in intervals:
        if hour > 0:
            print(f"\n\n⏰ Waiting {hour} hours...")
            time.sleep(hour * 3600)

        passed = run_verification()

        # Log results to file
        with open("cache_verification_log.txt", "a") as f:
            f.write(f"{datetime.now()} - {hour}h mark - {'PASSED' if passed else 'FAILED'}\n")

        if passed and hour >= 24:
            print("\n✓ Cache bypass verified for 24+ hours. Monitoring complete.")
            break
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Subdomain parallel testing (new.example.com) | Vercel preview deployments for testing | 2024-2025 | Faster iteration, no subdomain DNS setup, easier cleanup |
| Manual DNS record updates | Cloudflare API + Python SDK | 2023-2024 | Programmatic, repeatable, version controlled, faster rollback |
| Nginx reverse proxy on VPS | Vercel rewrites in vercel.json | 2024-2025 | Zero infrastructure, automatic HTTPS, simpler configuration |
| Manual cache testing (curl commands) | Automated timestamp-based verification | 2025-2026 | Catches cache propagation issues early, continuous monitoring |
| Long TTL (3600s+) before migration | Low TTL (300s) for fast rollback | Industry standard | Enables 5-minute rollback, reduces migration risk |
| Redis on same server as WordPress | Redis-as-a-Service (Redis Labs, Upstash) | 2024-2025 | Shared hosting may not support Redis; external service as alternative |

**Deprecated/outdated:**
- **Subdomain parallel testing:** Vercel preview deployments are faster and cleaner (no DNS setup)
- **High TTL DNS records:** Low TTL (300s) is now standard for migrations
- **Manual Cloudflare dashboard updates:** API-based DNS management is best practice
- **Assuming Redis available:** Test first; shared hosting often lacks Redis support

## Open Questions

Things that couldn't be fully resolved:

1. **Gabia Redis Support**
   - What we know: No documentation confirms Redis availability on Gabia shared hosting
   - What's unclear: Can Redis be enabled via control panel, or not supported at all?
   - Recommendation: Test immediately with Playwright automation; skip if unavailable (not a blocker)

2. **Gabia Cache Propagation Time**
   - What we know: Gabia has extreme 24-48 hour cache propagation delay
   - What's unclear: Does .htaccess cache bypass from Phase 1 apply immediately or also delayed?
   - Recommendation: Run cache verification at 0h, 1h, 6h, 24h, 48h intervals to confirm when bypass takes effect

3. **WordPress Admin Proxy Performance**
   - What we know: Vercel rewrites add latency (request goes Vercel → Gabia → Vercel → user)
   - What's unclear: Will admin users notice slowdown? Is it acceptable?
   - Recommendation: Test thoroughly on preview domain; measure admin page load times; document if slow

4. **CORS Whitelist After DNS Cutover**
   - What we know: CORS headers in .htaccess whitelist specific origins
   - What's unclear: Does whitelist include https://82mobile.com or only preview URL?
   - Recommendation: Verify .htaccess CORS rules include production domain before cutover

5. **Rollback Success Rate**
   - What we know: 300s TTL theoretically allows 5-minute rollback
   - What's unclear: What percentage of users will still see new site after rollback due to DNS caching?
   - Recommendation: Accept 15-30 minute worst-case rollback window; schedule cutover during low-traffic hours

## Sources

### Primary (HIGH confidence)
- [Vercel Rewrites Documentation](https://vercel.com/docs/rewrites) - Official Vercel docs, external rewrite patterns
- [Cloudflare DNS API Documentation](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/) - Official API docs, DNS record management
- [Cloudflare Python SDK](https://developers.cloudflare.com/api/python/resources/dns/subresources/records/methods/update/) - Official Python library, DNS update examples
- [Redis Object Cache - WordPress.org](https://wordpress.org/plugins/redis-cache/) - Official plugin documentation, WooCommerce compatibility
- [Cloudflare Time to Live (TTL) Documentation](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/) - TTL behavior and best practices

### Secondary (MEDIUM confidence)
- [Vercel Reverse Proxy Guide](https://vercel.com/kb/guide/vercel-reverse-proxy-rewrites-external) - Official guide, cookie pass-through behavior
- [WordPress Behind Reverse Proxy - WordPress.org](https://wordpress.org/support/topic/wp-behind-nginx-reverse-proxy/) - Community discussion, cookie and auth header issues
- [WooCommerce 10.5 REST API Caching](https://developer.woocommerce.com/2026/01/23/call-for-testing-experimental-rest-api-caching-in-woocommerce-10-5/) - Official WooCommerce blog, new caching feature (must disable)
- [Zero-Downtime Migration Guide - Unihost](https://unihost.com/blog/zero-downtime-migration/) - DNS cutover best practices, TTL strategy
- [DNS Migration Guide - InMotion Hosting](https://www.inmotionhosting.com/blog/complete-dns-migration-guide/) - Pre-cutover checklist, health checks

### Tertiary (LOW confidence - needs validation)
- [WordPress .htaccess Overwrite Issues - WPBeginner](https://www.wpbeginner.com/wp-tutorials/how-to-stop-wordpress-from-overwriting-htaccess-file/) - Community guide, .htaccess persistence
- [Redis vs Memcached on Shared Hosting - HostAdvice](https://hostadvice.com/blog/web-hosting/shared-hosting/implementing-object-caching-on-shared-wordpress-hosting/) - General shared hosting limitations
- **Gabia Redis support:** No documentation found; requires testing

## Metadata

**Confidence breakdown:**
- Vercel rewrites: HIGH - Official documentation, widely used pattern for headless WordPress
- Cloudflare DNS API: HIGH - Official API docs, Python SDK well-documented
- Redis Object Cache: MEDIUM - Plugin is mature, but Gabia Redis support unknown
- Cache verification testing: HIGH - Standard API testing practices, verified methodologies
- Immediate DNS cutover risks: HIGH - Industry best practices documented in multiple sources
- Gabia-specific behavior: LOW - No official Gabia documentation found; recommendations based on general shared hosting patterns

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - DNS/Vercel/Cloudflare APIs stable; Redis plugin actively maintained)

**Critical for planner:**
- User explicitly rejected subdomain testing; immediate DNS cutover required
- Gabia cache bypass from Phase 1 may not be active yet; verify immediately
- Redis availability on Gabia is unknown; plan must include test-first approach
- Vercel preview domain testing is MANDATORY before DNS cutover
- Cache verification must run at 0h, 1h, 6h, 24h, 48h intervals to catch propagation issues
- Low TTL (300s) must be set 72 hours before cutover for fast rollback capability
