# Phase 1: WordPress Backend API Setup - Research

**Researched:** 2026-01-27
**Domain:** WordPress Headless CMS, WooCommerce REST API, JWT Authentication
**Confidence:** HIGH

## Summary

WordPress headless configuration as an API-only backend is a well-established pattern with mature tooling (2026). The standard approach involves disabling the WordPress frontend theme while preserving wp-admin access, configuring CORS headers for cross-domain API requests, implementing JWT authentication for stateless sessions, and using CoCart for headless cart management.

For the 82mobile.com migration, the critical constraint is **Gabia shared hosting with extreme server-level caching (24-48 hour TTL)**. This means traditional file-based configuration changes (functions.php, .htaccess) may be cached and not take immediate effect. The recommended approach prioritizes database-stored configurations (WordPress options, Customizer settings) over file modifications, with wp-json/ endpoints explicitly excluded from cache via .htaccess rules.

The zero-downtime parallel deployment strategy on a subdomain is well-supported, with established DNS cutover patterns involving TTL reduction (60-300 seconds) 48-72 hours before cutover and staged traffic routing.

**Primary recommendation:** Use plugin-based solutions (Disable WP Frontend, JWT Authentication for WP REST API, CoCart) over custom code for faster deployment and easier rollback on cached hosting environments. Configure CORS via both plugin settings and .htaccess for redundancy.

## Standard Stack

The established libraries/tools for headless WordPress with WooCommerce:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| WordPress | 6.3+ | CMS backend | Core requirement, well-established headless API since v4.7 |
| WooCommerce | 9.0+ | E-commerce backend | Built-in REST API v3, mature headless support |
| JWT Authentication for WP REST API | Latest | Stateless authentication | Official WordPress.org plugin, 70k+ active installs, maintained 2026 |
| CoCart | 4.8.3 | Headless cart sessions | Purpose-built for headless WooCommerce, database-backed sessions, updated Jan 2026 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Disable WP Frontend | Latest | Block frontend rendering | Prevents accidental public access to WordPress theme pages |
| CoCart CORS | Latest | Cross-origin headers | Simplifies CORS configuration for multi-domain setup |
| CoCart JWT Authentication | Latest | JWT integration with CoCart | Seamless authentication between JWT tokens and cart sessions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JWT Authentication for WP REST API | JWT Auth (usefulteam) | More features (refresh tokens, rate limiting) but overkill for basic use case |
| CoCart | Custom WooCommerce REST API implementation | CoCart handles edge cases (concurrent requests, session persistence) that custom code misses |
| Plugin-based frontend disable | Custom functions.php code | Functions.php changes cached 24-48 hours on Gabia hosting; plugin uses database options |

**Installation:**
```bash
# Via WordPress admin (WP-Admin > Plugins > Add New):
# 1. JWT Authentication for WP REST API
# 2. CoCart (Headless eCommerce API for Developers)
# 3. Disable WP Frontend
# 4. CoCart CORS (optional, for multi-domain)
# 5. CoCart JWT Authentication (optional, for token-cart integration)

# Or via WP-CLI:
wp plugin install jwt-authentication-for-wp-rest-api --activate
wp plugin install cart-rest-api-for-woocommerce --activate
wp plugin install disable-wp-frontend --activate
wp plugin install cocart-cors --activate
wp plugin install cocart-jwt-authentication --activate
```

## Architecture Patterns

### Recommended Project Structure
```
WordPress Installation (82mobile.com - Gabia hosting)
├── /wp-admin/                  # Preserved - admin dashboard access
├── /wp-json/                   # API endpoints - MUST exclude from cache
│   ├── /wc/v3/                # WooCommerce REST API
│   ├── /cocart/v2/            # CoCart headless cart API
│   └── /jwt-auth/v1/          # JWT authentication endpoints
├── /wp-config.php             # JWT secret key configuration
├── /.htaccess                 # CORS + JWT Authorization header + cache bypass
└── /wp-content/
    ├── /plugins/
    │   ├── jwt-authentication-for-wp-rest-api/
    │   ├── cart-rest-api-for-woocommerce/
    │   └── disable-wp-frontend/
    └── /themes/                # Minimal theme (required by WordPress but unused)
```

### Pattern 1: Frontend Disabling with Whitelist
**What:** Block all frontend requests while preserving API and admin access
**When to use:** Always for headless WordPress
**Example:**
```php
// Source: https://github.com/fabiancdng/disable-wp-frontend
// Plugin approach (recommended for Gabia cached hosting)

// Install "Disable WP Frontend" plugin, configure via:
// Settings > Disable WP Frontend > Path Whitelist

// Add to whitelist:
// - /wp-admin/*
// - /wp-json/*
// - /wp-login.php

// Alternative: functions.php approach (WARNING: cached 24-48h on Gabia)
function disable_wp_frontend() {
    // Allow API and admin
    if (is_admin() || strpos($_SERVER['REQUEST_URI'], '/wp-json/') === 0) {
        return;
    }
    // Return 404 for all other requests
    wp_redirect(home_url('/404'), 404);
    exit;
}
add_action('template_redirect', 'disable_wp_frontend');
```

### Pattern 2: JWT Authentication Flow
**What:** Token-based authentication for stateless API requests
**When to use:** All frontend API calls requiring user authentication
**Example:**
```javascript
// Source: https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

// 1. Generate token
const response = await fetch('https://82mobile.com/wp-json/jwt-auth/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user',
    password: 'pass'
  })
});

const { token, user_email, user_display_name } = await response.json();

// 2. Use token in subsequent requests
const products = await fetch('https://82mobile.com/wp-json/wc/v3/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 3. Validate token
const valid = await fetch('https://82mobile.com/wp-json/jwt-auth/v1/token/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Pattern 3: CoCart Session Management
**What:** Database-backed cart sessions with unique tokens
**When to use:** All cart operations in headless frontend
**Example:**
```javascript
// Source: https://cocartapi.com/

// 1. Add item to cart (generates cart token)
const response = await fetch('https://82mobile.com/wp-json/cocart/v2/cart/add-item', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: '87',        // Product ID
    quantity: '1'
  })
});

const data = await response.json();
const cartToken = response.headers.get('CoCart-API-Cart-Key');

// 2. Use cart token in subsequent requests
const cart = await fetch('https://82mobile.com/wp-json/cocart/v2/cart', {
  headers: {
    'CoCart-API-Cart-Key': cartToken
  }
});

// 3. Cart persists in database, survives page reloads
// Token expires based on WooCommerce session settings
```

### Pattern 4: CORS Configuration (Multi-Layer)
**What:** Cross-origin headers via plugin + .htaccess for redundancy
**When to use:** Always when frontend is on different domain (e.g., Vercel)
**Example:**
```php
// Source: https://litzdigital.com/blog/how-to-configure-cors-for-the-wordpress-rest-api/

// Layer 1: wp-config.php (JWT plugin CORS)
define('JWT_AUTH_CORS_ENABLE', true);

// Layer 2: functions.php (custom CORS headers)
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed_origins = [
            'https://82mobile-next.vercel.app',
            'https://82mobile.com'
        ];

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, CoCart-API-Cart-Key');
        }

        if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }

        return $value;
    });
}, 15);
```

```apache
# Layer 3: .htaccess (server-level headers)
# Source: https://github.com/Tobeworks/WORDPRESS-REST-API-CORS

<IfModule mod_headers.c>
    # Enable CORS for API endpoints
    <FilesMatch "\.(json)$">
        Header set Access-Control-Allow-Origin "https://82mobile-next.vercel.app"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Authorization, Content-Type, CoCart-API-Cart-Key"
        Header set Access-Control-Allow-Credentials "true"
    </FilesMatch>

    # JWT Authorization header fix for shared hosting
    RewriteEngine On
    RewriteCond %{HTTP:Authorization} ^(.*)
    RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
    SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
</IfModule>
```

### Pattern 5: Cache Bypass for API Endpoints
**What:** Exclude /wp-json/ from server-level caching
**When to use:** Always on cached hosting (critical for Gabia)
**Example:**
```apache
# Source: https://wordpress.org/support/topic/disable-rest-api-cache/

<IfModule mod_headers.c>
    # Disable cache for API endpoints
    <If "%{REQUEST_URI} =~ m#^/wp-json/#">
        Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </If>
</IfModule>

# Alternative: Exclude wp-json from caching rules
<IfModule mod_rewrite.c>
    RewriteCond %{REQUEST_URI} !^/wp-json/
    # ... existing cache rules only apply to non-API requests
</IfModule>
```

### Anti-Patterns to Avoid
- **Wildcard CORS (*) in production:** Security risk; always specify exact allowed origins
- **Functions.php-only configuration on Gabia:** Changes cached 24-48h; use plugins + .htaccess
- **Disabling CORS locally, enabling in production:** Always test with CORS enabled to catch issues early
- **Long-lived JWT tokens (>24 hours):** Security risk; use short-lived tokens (10 minutes) with refresh tokens
- **Sharing cart tokens across users:** CoCart tokens are per-session; never cache or share
- **Assuming WooCommerce REST API works without Consumer Key/Secret:** Requires key generation even with JWT
- **Forgetting OPTIONS preflight:** CORS requires OPTIONS method support for preflight requests

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cart session persistence | Custom localStorage + API calls | CoCart plugin | Handles concurrent requests, database persistence, session expiration, cart token generation, guest users |
| JWT token generation/validation | Custom JWT library integration | JWT Authentication for WP REST API plugin | Handles WordPress user integration, secret key management, token expiration, refresh tokens |
| CORS header management | Manual header() calls in functions.php | CoCart CORS plugin + .htaccess | Handles OPTIONS preflight, multiple origin support, credential handling, header whitelisting |
| Frontend disabling | Custom template_redirect hooks | Disable WP Frontend plugin | Provides admin UI for whitelist, handles edge cases (feeds, sitemaps), easy rollback |
| WooCommerce authentication | Custom OAuth implementation | WooCommerce Consumer Key/Secret | Official method, handles permissions, works with all WooCommerce endpoints |

**Key insight:** WordPress headless architecture has mature solutions for every common problem. Custom code introduces maintenance burden and misses edge cases that production traffic will expose. Plugins provide admin UIs for configuration, making troubleshooting easier on cached hosting where file changes are slow to propagate.

## Common Pitfalls

### Pitfall 1: HTTP Authorization Header Not Passing Through
**What goes wrong:** JWT tokens fail with "Authorization header missing" despite correct frontend implementation
**Why it happens:** Most shared hosting providers (including Gabia) disable HTTP Authorization header by default for security
**How to avoid:**
1. Add to .htaccess: `RewriteCond %{HTTP:Authorization} ^(.*)\nRewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]`
2. Alternative for WPEngine: `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1`
3. Test with: `curl -H "Authorization: Bearer test" https://82mobile.com/wp-json/jwt-auth/v1/token/validate`
**Warning signs:** JWT plugin installed but token validation always returns 403

### Pitfall 2: CORS Preflight (OPTIONS) Not Handled
**What goes wrong:** Browser shows CORS error despite Access-Control-Allow-Origin header present on GET/POST
**Why it happens:** Browsers send OPTIONS preflight before actual request; WordPress doesn't handle OPTIONS by default
**How to avoid:**
1. Add OPTIONS handling in functions.php or use CoCart CORS plugin
2. .htaccess must set headers for OPTIONS method specifically
3. Return 200 status code immediately for OPTIONS, don't process WordPress routing
**Warning signs:** CORS works with curl but fails in browser; "Method OPTIONS not allowed" error

### Pitfall 3: Server Cache Breaks API Real-Time Updates
**What goes wrong:** Cart updates succeed but frontend shows stale data; product stock doesn't update immediately
**Why it happens:** Gabia caches /wp-json/ responses for 24-48 hours by default
**How to avoid:**
1. Add Cache-Control headers to .htaccess for /wp-json/ paths
2. Test with: `curl -I https://82mobile.com/wp-json/cocart/v2/cart` (check Cache-Control header)
3. If cache headers still wrong, contact Gabia support to exclude /wp-json/ from server-level cache
**Warning signs:** API changes work in Postman but not in browser; cache-related headers in curl -I output

### Pitfall 4: Preview Functionality Broken
**What goes wrong:** Marketing team can't preview posts; "Preview" button shows 404
**Why it happens:** Frontend disabled means preview URLs (WordPress theme) are blocked
**How to avoid:**
1. Add preview URLs to Disable WP Frontend whitelist: `/?p=*&preview=true`
2. Or build custom preview system: WordPress webhook → trigger Vercel preview build
3. Document limitation for content team
**Warning signs:** "Why can't I see my draft posts?" support requests

### Pitfall 5: Plugin Compatibility Issues
**What goes wrong:** Existing WordPress plugins break or behave unexpectedly
**Why it happens:** Many plugins assume frontend theme exists, hook into template rendering
**How to avoid:**
1. Audit existing plugins before disabling frontend
2. Test each plugin's API functionality (if they provide one)
3. Replace frontend-dependent plugins with API-friendly alternatives
4. Document which plugins stop working
**Warning signs:** Plugin settings save but nothing happens; "This plugin requires a theme" errors

### Pitfall 6: WordPress Still Requires Active Theme
**What goes wrong:** WordPress shows error or won't load without active theme
**Why it happens:** WordPress core requires theme even if unused
**How to avoid:**
1. Keep Astra child theme active (already exists in project)
2. Or create minimal blank theme (style.css + index.php only)
3. Theme files can be empty but must exist
**Warning signs:** White screen of death; "Error: The theme directory does not exist"

### Pitfall 7: Forgot Pretty Permalinks Requirement
**What goes wrong:** WooCommerce REST API returns 404 for all endpoints
**Why it happens:** WooCommerce API requires pretty permalinks (e.g., /sample-post/ not /?p=123)
**How to avoid:**
1. Verify Settings > Permalinks is NOT set to "Plain"
2. Use "Post name" or custom structure
3. Test: `curl https://82mobile.com/wp-json/wc/v3/products` should return data, not 404
**Warning signs:** API worked in local development but not on production; all /wp-json/wc/* endpoints return 404

### Pitfall 8: CoCart Cart Token Not Persisted
**What goes wrong:** Cart empties on page reload; items added but not saved
**Why it happens:** Frontend not storing CoCart-API-Cart-Key from response headers
**How to avoid:**
1. Extract `CoCart-API-Cart-Key` header from first API response
2. Store in localStorage/cookies
3. Include in all subsequent cart requests
4. Test: Add item, reload page, check cart - should still have item
**Warning signs:** "Why does my cart keep emptying?" user reports

### Pitfall 9: JWT Secret Key Collision
**What goes wrong:** JWT tokens randomly invalid; work then stop working
**Why it happens:** Multiple JWT plugins or WordPress salts used as secret
**How to avoid:**
1. Use dedicated strong secret: `define('JWT_AUTH_SECRET_KEY', 'unique-64-char-string');`
2. Generate from: https://api.wordpress.org/secret-key/1.1/salt/
3. Do NOT reuse WordPress AUTH_KEY or other salts
4. Never commit secret to git
**Warning signs:** JWT validation intermittently fails; works in development but not staging

### Pitfall 10: Zero-Downtime Migration Fails Due to Session Mismatch
**What goes wrong:** Users lose cart items during DNS cutover from old to new frontend
**Why it happens:** Cart sessions tied to domain/cookies; switching domains breaks session
**How to avoid:**
1. Use CoCart token-based sessions (not cookie-based)
2. Test migration: Add item on old domain, verify token works on new domain
3. Migrate cart data via API before DNS switch
4. Or accept short downtime (maintenance mode) during cutover
**Warning signs:** "I had items in my cart but they're gone now" after migration

## Code Examples

Verified patterns from official sources:

### JWT Authentication Setup
```php
// Source: https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

// 1. wp-config.php - Add secret key
define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key-from-wordpress-salt-generator');
define('JWT_AUTH_CORS_ENABLE', true);

// 2. .htaccess - Enable Authorization header
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]

// 3. Test token generation
// POST /wp-json/jwt-auth/v1/token
// Body: { "username": "admin", "password": "password" }
// Response: { "token": "eyJ0eXAiOiJKV1QiLCJ...", "user_email": "...", "user_display_name": "..." }
```

### WooCommerce API Authentication
```javascript
// Source: https://woocommerce.github.io/woocommerce-rest-api-docs/

// Generate Consumer Key/Secret in WP-Admin:
// WooCommerce > Settings > Advanced > REST API > Add Key

// Use Basic Auth over HTTPS
const response = await fetch('https://82mobile.com/wp-json/wc/v3/products', {
  headers: {
    'Authorization': 'Basic ' + btoa('ck_CONSUMER_KEY:cs_CONSUMER_SECRET')
  }
});

// Or query string (if Authorization header blocked)
const url = 'https://82mobile.com/wp-json/wc/v3/products?' +
  'consumer_key=ck_CONSUMER_KEY&consumer_secret=cs_CONSUMER_SECRET';
const response = await fetch(url);
```

### CoCart Cart Operations
```javascript
// Source: https://cocartapi.com/

// Add item to cart
const addResponse = await fetch('https://82mobile.com/wp-json/cocart/v2/cart/add-item', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: '87',
    quantity: '1'
  })
});

// Extract cart token from response headers
const cartToken = addResponse.headers.get('CoCart-API-Cart-Key');
localStorage.setItem('cocart_token', cartToken);

// Get cart contents
const cartResponse = await fetch('https://82mobile.com/wp-json/cocart/v2/cart', {
  headers: {
    'CoCart-API-Cart-Key': localStorage.getItem('cocart_token')
  }
});

// Update item quantity
const updateResponse = await fetch('https://82mobile.com/wp-json/cocart/v2/cart/item/ITEM_KEY', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'CoCart-API-Cart-Key': localStorage.getItem('cocart_token')
  },
  body: JSON.stringify({
    quantity: '3'
  })
});

// Remove item
await fetch('https://82mobile.com/wp-json/cocart/v2/cart/item/ITEM_KEY', {
  method: 'DELETE',
  headers: {
    'CoCart-API-Cart-Key': localStorage.getItem('cocart_token')
  }
});
```

### Complete CORS Configuration
```php
// Source: https://litzdigital.com/blog/how-to-configure-cors-for-the-wordpress-rest-api/

// functions.php - Custom CORS with multiple origins
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed_origins = [
            'https://82mobile-next.vercel.app',
            'https://82mobile.com',
            'http://localhost:3000' // Development
        ];

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, CoCart-API-Cart-Key, X-Requested-With');
        }

        // Handle OPTIONS preflight
        if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }

        return $value;
    });
}, 15);
```

```apache
# .htaccess - Complete configuration
# Source: Combined from multiple sources

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # JWT Authorization header fix
    RewriteCond %{HTTP:Authorization} ^(.*)
    RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]

    # WordPress routing
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>

<IfModule mod_headers.c>
    # CORS headers for API
    <If "%{REQUEST_URI} =~ m#^/wp-json/#">
        Header set Access-Control-Allow-Origin "https://82mobile-next.vercel.app"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Authorization, Content-Type, CoCart-API-Cart-Key"
        Header set Access-Control-Allow-Credentials "true"

        # Disable cache for API endpoints (CRITICAL for Gabia)
        Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </If>

    # Authorization header environment variable
    SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
</IfModule>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OAuth 1.0a for all API requests | JWT tokens for authenticated users, Consumer Key/Secret for server-to-server | ~2019-2020 | Simpler frontend auth, stateless sessions |
| Cookie-based cart sessions | CoCart token-based database sessions | CoCart v4.0 (2024) | Works with headless, handles concurrent requests |
| Manual CORS header() in functions.php | Plugin-based CORS (CoCart CORS, JWT CORS) | ~2021-2022 | Easier configuration, handles edge cases |
| GraphQL (WPGraphQL) for headless | REST API preferred for WooCommerce | 2023-2024 | WooCommerce REST API more mature, better cart support |
| Custom frontend disabling code | Plugin-based frontend disabling | 2024-2025 | Admin UI for whitelist, easier debugging |
| localStorage-only cart | Database-backed cart with token | CoCart v4.0 (2024) | Cart persists across devices, survives browser close |

**Deprecated/outdated:**
- **WooCommerce API v1/v2**: Use v3 (current standard, better documentation)
- **WordPress Application Passwords for API**: JWT tokens preferred for headless (stateless, shorter-lived)
- **Custom session tables**: CoCart provides this; don't build your own
- **Hardcoded CORS origins in code**: Use environment variables or plugin UI for flexibility

## Open Questions

Things that couldn't be fully resolved:

1. **Gabia Server-Level Cache Configuration**
   - What we know: Gabia has extreme 24-48 hour server-level caching
   - What's unclear: Can /wp-json/ be excluded via control panel, or requires support ticket?
   - Recommendation: Test cache bypass via .htaccess first; if insufficient, open Gabia support ticket before Phase 1 starts

2. **Subdomain DNS Configuration on Gabia**
   - What we know: Zero-downtime requires parallel deployment on subdomain (e.g., api.82mobile.com)
   - What's unclear: Does Gabia control panel support subdomain creation, or requires manual DNS records?
   - Recommendation: Verify Gabia subdomain process in Phase 0 (preparation); may need control panel access

3. **JWT Token Expiration Strategy**
   - What we know: Short-lived tokens (10 min) more secure; long-lived (7 days) more convenient
   - What's unclear: Does 82mobile.com user flow support frequent re-authentication?
   - Recommendation: Start with 24-hour tokens (balance security/UX); add refresh tokens in Phase 2 if needed

4. **CoCart + JWT Integration Required?**
   - What we know: CoCart works standalone; optional JWT integration plugin available
   - What's unclear: Does binding cart to authenticated user require JWT integration, or can use consumer key?
   - Recommendation: Test guest cart flow first (no JWT); add CoCart JWT plugin only if authenticated cart needed

5. **Existing WordPress Plugins Compatibility**
   - What we know: 82mobile.com has Polylang, Astra theme, custom phases
   - What's unclear: Which existing plugins depend on frontend theme rendering?
   - Recommendation: Audit plugin list in Phase 1 Task 1; test each plugin's API functionality before disabling frontend

## Sources

### Primary (HIGH confidence)
- [JWT Authentication for WP REST API - WordPress.org](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) - Official plugin documentation, installation/configuration
- [CoCart - WordPress.org](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/) - Official plugin documentation, v4.8.3 (Jan 2026)
- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/) - Official WooCommerce API docs, authentication methods
- [Disable WP Frontend - GitHub](https://github.com/fabiancdng/disable-wp-frontend) - Official plugin repository, whitelist implementation

### Secondary (MEDIUM confidence)
- [How to Configure CORS for WordPress REST API - Litz Digital](https://litzdigital.com/blog/how-to-configure-cors-for-the-wordpress-rest-api/) - Multi-origin CORS implementation
- [WordPress Headless CMS 2026 Guide - Ecommerce Launcher](https://ecommercelauncher.com/woocommerce/wordpress-as-headless-cms) - Current best practices
- [WooCommerce REST API Developer Guide 2026 - Brainspate](https://brainspate.com/blog/woocommerce-rest-api-developer-guide/) - API key setup process
- [Scheduling DNS Cutover - Pagely](https://pagely.com/kb/en/scheduling-wordpress-dns-cutover/) - TTL and DNS migration strategy

### Tertiary (LOW confidence - needs validation)
- [Headless WooCommerce Migration - Wooninjas](https://wooninjas.com/headless-woocommerce-migration/) - Common pitfalls, stage cutover patterns
- [WordPress REST API CORS Issues Solved - Rob Marshall](https://robertmarshall.dev/blog/wordpress-rest-api-cors-issues/) - CORS troubleshooting patterns
- [CoCart Blog](https://cocartapi.com/) - Session improvements in v4.2, but details sparse

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All plugins actively maintained, WordPress.org official, 2026 updates verified
- Architecture patterns: HIGH - JWT/CoCart/CORS patterns well-documented in official sources
- Pitfalls: MEDIUM-HIGH - Common issues documented in multiple sources, but Gabia-specific caching needs validation
- Gabia-specific configuration: LOW - No official Gabia documentation found; recommendations based on general shared hosting patterns

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - WordPress/WooCommerce ecosystem stable, plugins receive regular updates)

**Critical for planner:**
- Gabia server cache is the highest risk factor - prioritize cache bypass testing in first task
- Plugin-based approach (vs. code) significantly faster on cached hosting
- CORS must be tested with actual Vercel domain, not localhost (different origin behavior)
- CoCart cart tokens must be persisted in frontend localStorage/cookies
- Zero-downtime migration requires subdomain DNS setup before Phase 1 starts
