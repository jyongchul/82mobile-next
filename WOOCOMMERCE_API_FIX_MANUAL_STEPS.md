# WooCommerce REST API 404 Error - Manual Fix Guide

## Problem Summary

WooCommerce REST API (`/wp-json/wc/v3/*`) returns 404 error despite:
- WooCommerce 10.4.3 being installed and active
- Pretty permalinks enabled (`/%postname%/`)
- `woocommerce_api_enabled` database option set to 'yes'

**Root Cause**: WooCommerce REST API controllers are not initializing/registering with WordPress REST API.

---

## Investigation Results

### What We Checked ✅
- ✅ WooCommerce is active (version 10.4.3)
- ✅ 14 WooCommerce database tables exist
- ✅ Permalink structure is `/%postname%/` (correct)
- ✅ WordPress core REST API works (`/wp-json/wp/v2/*`)
- ✅ `woocommerce_api_enabled` = 'yes' in database

### What's Missing ❌
- ❌ WooCommerce namespace (`wc/v3`) not in `/wp-json/` response
- ❌ No WooCommerce routes registered (checked 132 routes, 0 WooCommerce)
- ❌ All WooCommerce endpoints return 404

---

## Manual Fix Options

### Option 1: WordPress Admin Dashboard (Recommended)

**Access WordPress Admin:**

Since DNS points to Vercel, you need to access WordPress via IP:

```bash
# Add to /etc/hosts or C:\Windows\System32\drivers\etc\hosts
182.162.142.102 82mobile.com
```

Then visit: http://82mobile.com/wp-admin

**Login credentials:**
- Username: `whadmin`
- Password: `WhMkt2026!@AdamKorSim`

**Steps:**

1. **Enable WooCommerce REST API:**
   - Go to: WooCommerce > Settings > Advanced > REST API
   - Check if "Legacy API" toggle exists - enable it if present
   - Click "Save changes"

2. **Flush Permalinks:**
   - Go to: Settings > Permalinks
   - Don't change anything, just click "Save Changes"
   - This regenerates rewrite rules

3. **Verify:**
   - Visit: http://182.162.142.102/wp-json/
   - Check if `wc/v3` appears in `namespaces` array
   - Test: http://182.162.142.102/wp-json/wc/v3/products
   - Should return 401 (auth required) instead of 404

---

### Option 2: Plugin Deactivation/Reactivation

If Option 1 doesn't work:

1. **Via WordPress Admin:**
   - Go to: Plugins > Installed Plugins
   - Find "WooCommerce" 
   - Click "Deactivate"
   - Wait 5 seconds
   - Click "Activate"
   - Visit Settings > Permalinks and click "Save Changes"

2. **Via Database** (if admin inaccessible):
   ```sql
   -- Already attempted, but can retry:
   -- Deactivate
   UPDATE wp_options 
   SET option_value = 'a:7:{i:0;s:30:"polylang_disabled/polylang.php";i:1;s:63:"cart-rest-api-for-woocommerce/cart-rest-api-for-woocommerce.php";i:2;s:33:"classic-editor/classic-editor.php";i:3;s:36:"contact-form-7/wp-contact-form-7.php";i:4;s:47:"jwt-authentication-for-wp-rest-api/jwt-auth.php";i:5;s:24:"wordpress-seo/wp-seo.php";i:6;s:39:"wp-file-manager/file_folder_manager.php";}'
   WHERE option_name = 'active_plugins';
   
   -- Then reactivate by adding back WooCommerce
   ```

---

### Option 3: Check for WooCommerce Legacy REST API Plugin

**Background:** In WooCommerce 9.0+, the legacy REST API was removed and moved to a separate plugin.

However, `/wp-json/wc/v3` is the **modern** REST API (not legacy), so this shouldn't be the issue. But worth checking:

1. Go to: Plugins > Add New
2. Search for: "WooCommerce Legacy REST API"
3. If found and not installed, install and activate it
4. Flush permalinks

**Note:** Based on official documentation, `/wp-json/wc/v3` should work without the legacy plugin in WooCommerce 10.4.3.

---

### Option 4: WooCommerce Reinstall (Last Resort)

1. **Backup first!** (Database and files)
2. Deactivate WooCommerce
3. Delete WooCommerce plugin files
4. Reinstall WooCommerce from WordPress.org
5. Activate and reconfigure

---

## Testing After Fix

**Test 1: Check Namespaces**
```bash
curl -s http://182.162.142.102/wp-json/ -H "Host: 82mobile.com" | grep namespaces
```

Should include: `"wc/v3"` or `"wc/store/v1"`

**Test 2: Check Products Endpoint**
```bash
curl -I http://182.162.142.102/wp-json/wc/v3/products \
  -H "Host: 82mobile.com"
```

Expected: `HTTP/1.1 401 Unauthorized` (not 404)

**Test 3: With Authentication**
```bash
curl http://182.162.142.102/wp-json/wc/v3/products \
  -H "Host: 82mobile.com" \
  -u "ck_cd3965181a66868b9f094f8df4d3abacaeec6652:cs_cc74b52dc817261af251b1fe234e672e1dafd297"
```

Expected: `HTTP/1.1 200 OK` with products JSON

---

## Additional Investigation Needed

If none of the above work, check:

1. **PHP Error Logs:**
   - Check `/wp-content/debug.log` (if WP_DEBUG enabled)
   - Check server error logs via Gabia control panel

2. **WooCommerce System Status:**
   - WooCommerce > Status > System Status
   - Look for REST API section errors

3. **File Permissions:**
   - Ensure `wp-content/plugins/woocommerce/` is readable
   - Check REST API controller files exist in `woocommerce/includes/rest-api/`

4. **Conflicts:**
   - Temporarily deactivate other plugins (keep only WooCommerce)
   - Test if REST API appears
   - Reactivate plugins one by one to find culprit

---

## Database Changes Already Made

✅ `woocommerce_api_enabled` changed from 'no' to 'yes'
✅ Attempted rewrite rules flush (deleted rewrite_rules option)
✅ Attempted WooCommerce deactivate/reactivate via database

These changes are persistent and don't need to be repeated.

---

## Support Resources

- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WooCommerce REST API GitHub Issues](https://github.com/woocommerce/woocommerce/issues?q=is%3Aissue+rest+api+404)
- [WooCommerce Legacy REST API Plugin](https://github.com/woocommerce/woocommerce-legacy-rest-api)

---

**Last Updated:** 2026-01-29
**Debug Session:** .planning/debug/wordpress-api-404-products.md
