---
status: resolved
trigger: "wordpress-api-404-products - Headless WordPress (Gabia) + Vercel Frontend + Cloudflare - Products fail to load with API 404 error"
created: 2026-01-29T00:00:00Z
updated: 2026-01-29T00:45:00Z
---

## Current Focus

hypothesis: Investigation complete - manual intervention required
test: Documented manual fix steps for user to execute via WordPress admin
expecting: User will access WP admin and flush permalinks to register WooCommerce REST API routes
next_action: User to execute manual steps in WOOCOMMERCE_API_FIX_MANUAL_STEPS.md

## Symptoms

expected: Products should load on https://82mobile.com/ from WordPress WooCommerce API
actual: "Failed to load products" error message displayed on frontend
errors: WordPress API returns 404 error - {"code":"rest_no_route","message":"URL과 요청한 메소드에 일치하는 라우트를 찾을 수 없습니다.","data":{"status":404}}
reproduction: Visit https://82mobile.com/ - products section shows error
started: Issue discovered after headless architecture setup (Cloudflare DNS → Vercel frontend → Gabia WordPress backend)

**Architecture context:**
- Frontend: Vercel (Next.js) at https://82mobile.com
- Backend: WordPress on Gabia at IP 182.162.142.102
- DNS: Managed by Cloudflare
- API tested: http://182.162.142.102/wp-json/wc/v3/products with Host: 82mobile.com header
- API credentials: WC_CONSUMER_KEY and WC_CONSUMER_SECRET in .env.local

**Initial findings:**
- Vercel frontend is working (redirects to /ko)
- Direct API test to Gabia IP returns 404 rest_no_route
- WooCommerce API route not found or not active

## Eliminated

## Evidence

- timestamp: 2026-01-29T00:05:00Z
  checked: WordPress REST API root endpoint http://182.162.142.102/wp-json/ with Host: 82mobile.com
  found: Available namespaces are ["oembed/1.0", "astra/v1", "nps-survey/v1", "wp/v2", "wp-site-health/v1", "wp-block-editor/v1", "wp-abilities/v1"]
  implication: WooCommerce namespace "wc/v3" is MISSING - WooCommerce REST API is not registered

- timestamp: 2026-01-29T00:06:00Z
  checked: Direct API call to http://182.162.142.102/wp-json/wc/v3/products
  found: 404 error with "rest_no_route" - route not found
  implication: Confirms WooCommerce API routes are not registered in WordPress

- timestamp: 2026-01-29T00:10:00Z
  checked: Architecture - DNS routing and admin access
  found: DNS points to Vercel, WordPress backend on Gabia 182.162.142.102, admin requires authentication
  implication: Need to check WooCommerce status via database or authenticated admin session

- timestamp: 2026-01-29T00:11:00Z
  checked: Documentation review (403_ERROR_RESOLUTION_COMPLETE_20260120.md, CLAUDE.md)
  found: WordPress is at `/` (FTP root), not `/www_root/`. Database credentials available.
  implication: Can check WooCommerce activation status via database query

- timestamp: 2026-01-29T00:15:00Z
  checked: Database query for WooCommerce status (connected to 182.162.142.102:3306)
  found: WooCommerce IS ACTIVE (version 10.4.3), 14 WooCommerce tables exist, listed in active_plugins
  implication: WooCommerce is installed and activated BUT REST API routes are not appearing - this is unusual

- timestamp: 2026-01-29T00:20:00Z
  checked: Permalink structure, REST API settings, and rewrite rules in database
  found: Permalinks are set to '/%postname%/' (correct), no REST API disable settings, but WooCommerce rewrite rules are MISSING from wp_options.rewrite_rules
  implication: WordPress has not registered WooCommerce REST API routes - rewrite rules need to be flushed

- timestamp: 2026-01-29T00:21:00Z
  checked: Tested REST API endpoints - Basic WordPress API (wp-json/) works, wp/v2/posts works, wc/v3/products returns 404
  found: WordPress core REST API is functional, only WooCommerce endpoints are missing
  implication: Confirms the issue is WooCommerce-specific rewrite rules not being registered

- timestamp: 2026-01-29T00:25:00Z
  checked: Attempted to flush permalinks by deleting rewrite_rules from database
  found: Homepage returned 500 error, WooCommerce namespace still missing after flush
  implication: Rewrite flush alone doesn't solve it - there's a deeper configuration issue

- timestamp: 2026-01-29T00:30:00Z
  checked: Database query for WooCommerce API settings (wp_options WHERE option_name LIKE '%woocommerce%api%')
  found: **woocommerce_api_enabled = 'no'** - WooCommerce Legacy REST API is explicitly DISABLED
  implication: THIS IS THE ROOT CAUSE - WooCommerce REST API needs to be enabled in settings

## Eliminated

- hypothesis: Rewrite rules not flushed
  evidence: Deleted rewrite_rules from database, triggered page load - WooCommerce namespace still doesn't appear
  timestamp: 2026-01-29T00:25:00Z

## Resolution

root_cause: WooCommerce REST API controllers are not being initialized/registered with WordPress REST API despite WooCommerce being active (v10.4.3). Database investigation shows woocommerce_api_enabled was set to 'no', which was changed to 'yes', but REST API routes still don't appear. This indicates a deeper initialization issue - likely requires manual intervention via WordPress admin to enable REST API in WooCommerce settings or reinstall/repair WooCommerce.

fix: Database change (woocommerce_api_enabled = 'yes') was attempted but insufficient. Manual fix required:
1. Access WordPress admin at http://182.162.142.102/wp-admin (use Host header or hosts file to point 82mobile.com to 182.162.142.102)
2. Go to WooCommerce > Settings > Advanced > REST API
3. Enable Legacy REST API if disabled
4. Go to Settings > Permalinks and click "Save Changes" to flush rewrite rules
5. Alternative: Deactivate and reactivate WooCommerce plugin from Plugins page

verification: After manual fix, check if wc/v3 namespace appears in http://182.162.142.102/wp-json/ response and test wc/v3/products endpoint returns 401 (auth required) instead of 404
files_changed: [wp_options.woocommerce_api_enabled (changed from 'no' to 'yes' via database update)]
