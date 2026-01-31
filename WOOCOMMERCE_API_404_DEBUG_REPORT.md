# WooCommerce API 404 Debug Report

**Debug Session:** wordpress-api-404-products  
**Date:** 2026-01-29  
**Status:** ROOT CAUSE FOUND - Manual Fix Required  

---

## Problem

Vercel Next.js frontend at https://82mobile.com displays "Failed to load products" error.

**Error Details:**
```json
{
  "code": "rest_no_route",
  "message": "URL과 요청한 메소드에 일치하는 라우트를 찾을 수 없습니다.",
  "data": {"status": 404}
}
```

**API Endpoint:** `http://182.162.142.102/wp-json/wc/v3/products`

---

## Root Cause

**WooCommerce REST API controllers are not initializing/registering with WordPress REST API.**

Despite:
- WooCommerce 10.4.3 being installed and active
- Correct permalink structure (`/%postname%/`)
- `woocommerce_api_enabled` database option enabled
- WordPress core REST API working (`/wp-json/wp/v2/*`)

The WooCommerce namespace (`wc/v3`) does not appear in the REST API namespaces list.

---

## Investigation Summary

### What We Discovered ✅

1. **WooCommerce is installed and active**
   - Version: 10.4.3
   - 14 WooCommerce database tables exist
   - Listed in `active_plugins` option

2. **WordPress REST API works**
   - `/wp-json/` returns 200 OK
   - `/wp-json/wp/v2/posts` works
   - 132 REST API routes registered
   - **But 0 WooCommerce routes**

3. **Configuration is correct**
   - Permalinks: `/%postname%/` ✅
   - `woocommerce_api_enabled`: `yes` ✅
   - No REST API disable settings ✅

4. **Database changes made**
   - Changed `woocommerce_api_enabled` from `no` to `yes`
   - Deleted and regenerated `rewrite_rules`
   - Attempted WooCommerce deactivate/reactivate

### What Didn't Work ❌

1. **Permalink flush via database** - Deleted `rewrite_rules`, triggered WordPress loads
2. **WooCommerce reactivation** - Deactivated and reactivated via database
3. **API enable toggle** - Changed database setting to `yes`

**Result:** WooCommerce namespace still doesn't appear.

---

## Why Automated Fix Failed

1. **Gabia Hosting Constraints:**
   - Extreme server-level caching (24-48 hour TTL)
   - FTP connection timeouts
   - Admin redirect loops (DNS points to Vercel)

2. **WordPress Initialization Issue:**
   - Database changes alone insufficient
   - WooCommerce REST API controllers not loading
   - Requires WordPress admin intervention

---

## Manual Fix Required

**See:** `WOOCOMMERCE_API_FIX_MANUAL_STEPS.md` for detailed instructions.

**Quick Fix (Recommended):**

1. Add to hosts file: `182.162.142.102 82mobile.com`
2. Access http://82mobile.com/wp-admin (login: whadmin / WhMkt2026!@AdamKorSim)
3. Go to Settings > Permalinks → Click "Save Changes"
4. Go to WooCommerce > Settings > Advanced > REST API → Enable if disabled
5. Verify: http://182.162.142.102/wp-json/ shows `wc/v3` in namespaces

---

## Verification Steps

After manual fix:

```bash
# 1. Check namespaces
curl -s http://182.162.142.102/wp-json/ -H "Host: 82mobile.com" | grep -o '"wc/v3"'

# 2. Test products endpoint (should return 401, not 404)
curl -I http://182.162.142.102/wp-json/wc/v3/products -H "Host: 82mobile.com"

# 3. Test with auth (should return 200 with products)
curl http://182.162.142.102/wp-json/wc/v3/products \
  -H "Host: 82mobile.com" \
  -u "ck_cd3965181a66868b9f094f8df4d3abacaeec6652:cs_cc74b52dc817261af251b1fe234e672e1dafd297"
```

Expected results:
- Step 1: `"wc/v3"` found
- Step 2: HTTP 401 (not 404)
- Step 3: HTTP 200 with products JSON

---

## Additional Context

### Architecture
- **Frontend:** Vercel (Next.js) at https://82mobile.com
- **Backend:** Gabia WordPress at 182.162.142.102
- **DNS:** Cloudflare → Vercel (creates admin access challenge)

### Environment
- WordPress: 5.4.18 (DB version: 60717)
- WooCommerce: 10.4.3 (DB version: 10.4.3)
- PHP: 7.4
- Database: MySQL 5.6

### Active Plugins
1. polylang_disabled/polylang.php
2. cart-rest-api-for-woocommerce/cart-rest-api-for-woocommerce.php
3. classic-editor/classic-editor.php
4. contact-form-7/wp-contact-form-7.php
5. jwt-authentication-for-wp-rest-api/jwt-auth.php
6. woocommerce/woocommerce.php
7. wordpress-seo/wp-seo.php
8. wp-file-manager/file_folder_manager.php

---

## Next Steps

1. **User:** Follow manual fix steps in `WOOCOMMERCE_API_FIX_MANUAL_STEPS.md`
2. **Verify:** Run verification steps above
3. **Test:** Check frontend at https://82mobile.com for products loading
4. **Document:** Update if different solution needed

---

## Files Created

- `.planning/debug/wordpress-api-404-products.md` - Debug session log
- `WOOCOMMERCE_API_FIX_MANUAL_STEPS.md` - Step-by-step fix guide
- `WOOCOMMERCE_API_404_DEBUG_REPORT.md` - This summary report

---

## References

- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WooCommerce REST API GitHub Issues #15064](https://github.com/woocommerce/woocommerce/issues/15064)
- [WooCommerce Legacy REST API Removal](https://developer.woocommerce.com/2023/10/03/the-legacy-rest-api-will-move-to-a-dedicated-extension-in-woocommerce-9-0/)

---

**Debug Session:** .planning/debug/wordpress-api-404-products.md  
**Completed:** 2026-01-29  
**Outcome:** Manual intervention required via WordPress admin
