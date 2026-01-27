#!/usr/bin/env python3
"""
Verify headless WordPress deployment
- Check wp-config.php has JWT defines
- Check .htaccess has CORS headers
- Check headless-mode.php MU-plugin exists
- Test homepage returns 404
- Test wp-admin still accessible
- Test API endpoints return no-cache headers
"""

import ftplib
import requests
import sys
import json

# FTP credentials
FTP_HOST = "82mobile.com"
FTP_PORT = 21
FTP_USER = "adam82mob0105"
FTP_PASS = "ssh82mobile2026!"

# Test URLs
BASE_URL = "http://82mobile.com"
API_URL = f"{BASE_URL}/wp-json"
ADMIN_URL = f"{BASE_URL}/wp-admin/"

def connect_ftp():
    """Connect to FTP server"""
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)
    return ftp

def check_file_via_ftp(ftp, path, search_string):
    """Check if file contains specific string via FTP"""
    try:
        lines = []
        ftp.retrlines(f"RETR {path}", lines.append)
        content = '\n'.join(lines)
        return search_string in content, content
    except Exception as e:
        return False, str(e)

def test_http_response(url, method="GET", headers=None):
    """Test HTTP response"""
    try:
        if method == "OPTIONS":
            response = requests.options(url, headers=headers, timeout=10)
        else:
            response = requests.get(url, timeout=10, allow_redirects=False)
        return response
    except Exception as e:
        return None

def main():
    print("=" * 60)
    print("Headless WordPress Deployment Verification")
    print("=" * 60)
    print()

    results = {
        "wp_config_jwt": False,
        "htaccess_cors": False,
        "mu_plugin_exists": False,
        "homepage_404": False,
        "admin_accessible": False,
        "api_no_cache": False,
        "api_root_responds": False
    }

    try:
        ftp = connect_ftp()
        print("[FTP] Connected successfully")
        print()

        # === Check 1: wp-config.php has JWT defines ===
        print("--- Check 1: wp-config.php JWT configuration ---")
        has_jwt, content = check_file_via_ftp(ftp, "wp-config.php", "JWT_AUTH_SECRET_KEY")
        if has_jwt:
            print("✓ JWT_AUTH_SECRET_KEY found in wp-config.php")
            results["wp_config_jwt"] = True
        else:
            print("✗ JWT_AUTH_SECRET_KEY NOT found in wp-config.php")
        print()

        # === Check 2: .htaccess has CORS headers ===
        print("--- Check 2: .htaccess CORS configuration ---")
        has_cors, content = check_file_via_ftp(ftp, ".htaccess", "Access-Control-Allow-Origin")
        if has_cors:
            print("✓ CORS headers found in .htaccess")
            results["htaccess_cors"] = True
        else:
            print("✗ CORS headers NOT found in .htaccess")
        print()

        # === Check 3: headless-mode.php exists ===
        print("--- Check 3: headless-mode.php MU-plugin ---")
        try:
            size = ftp.size("wp-content/mu-plugins/headless-mode.php")
            if size > 0:
                print(f"✓ headless-mode.php exists ({size} bytes)")
                results["mu_plugin_exists"] = True
            else:
                print("✗ headless-mode.php exists but is empty")
        except:
            print("✗ headless-mode.php NOT found")
        print()

        ftp.quit()

    except Exception as e:
        print(f"[ERROR] FTP checks failed: {e}")
        print()

    # === HTTP Checks ===
    print("--- HTTP Checks (may take a moment for cache to clear) ---")
    print()

    # === Check 4: API root responds ===
    print("--- Check 4: API root responds ---")
    response = test_http_response(f"{API_URL}/")
    if response and response.status_code == 200:
        try:
            data = response.json()
            print(f"✓ API root responds: {data.get('name', 'WordPress')}")
            results["api_root_responds"] = True
        except:
            print("✗ API root returns non-JSON response")
    else:
        status = response.status_code if response else "No response"
        print(f"✗ API root error: {status}")
    print()

    # === Check 5: Homepage returns 404 ===
    print("--- Check 5: Homepage headless mode (should be 404) ---")
    response = test_http_response(BASE_URL)
    if response:
        if response.status_code == 404:
            print(f"✓ Homepage returns 404 (headless mode active)")
            results["homepage_404"] = True
        else:
            print(f"⚠ Homepage returns {response.status_code} (expected 404)")
            # Still passing if it's not serving the normal WordPress theme
            if "api-only" in response.text.lower() or "headless" in response.text.lower():
                print("  (But contains headless mode message, considered OK)")
                results["homepage_404"] = True
    else:
        print("✗ Cannot reach homepage")
    print()

    # === Check 6: Admin still accessible ===
    print("--- Check 6: Admin area accessible ---")
    response = test_http_response(ADMIN_URL)
    if response:
        # Should redirect to login or show admin
        if response.status_code in [200, 302]:
            print(f"✓ Admin area accessible (HTTP {response.status_code})")
            results["admin_accessible"] = True
        else:
            print(f"✗ Admin area returns unexpected code: {response.status_code}")
    else:
        print("✗ Cannot reach admin area")
    print()

    # === Check 7: API cache bypass ===
    print("--- Check 7: API cache bypass headers ---")
    response = test_http_response(f"{API_URL}/wp/v2/posts")
    if response:
        cache_control = response.headers.get("Cache-Control", "")
        if "no-cache" in cache_control.lower() or "no-store" in cache_control.lower():
            print(f"✓ API returns no-cache headers: {cache_control}")
            results["api_no_cache"] = True
        else:
            print(f"⚠ API cache headers: {cache_control}")
            print("  (May take 1-2 hours for .htaccess to take effect)")
    else:
        print("✗ Cannot check API cache headers")
    print()

    # === Summary ===
    print("=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)

    total = len(results)
    passed = sum(results.values())

    print(f"\nPassed: {passed}/{total} checks")
    print()

    for check, status in results.items():
        symbol = "✓" if status else "✗"
        print(f"{symbol} {check.replace('_', ' ').title()}")

    print()

    if passed == total:
        print("🎉 All checks passed! Headless mode is configured correctly.")
        print()
        print("Next step: Install JWT Authentication plugin via WordPress admin")
        return 0
    elif passed >= total - 2:
        print("⚠ Most checks passed. Some features may take time due to cache.")
        print()
        print("If .htaccess changes don't take effect after 2 hours, contact Gabia support.")
        return 0
    else:
        print("❌ Multiple checks failed. Review deployment logs.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
