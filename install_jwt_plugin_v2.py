#!/usr/bin/env python3
"""
Install and activate JWT Authentication plugin via WordPress admin
Uses Playwright browser automation - improved version
"""

import sys
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# WordPress admin credentials
WP_ADMIN_URL = "http://82mobile.com/wp-admin"
WP_USERNAME = "whadmin"
WP_PASSWORD = "WhMkt2026!@AdamKorSim"

def login_to_wordpress(page):
    """Login to WordPress admin"""
    print("[LOGIN] Navigating to WordPress admin...")
    page.goto(WP_ADMIN_URL, wait_until="networkidle", timeout=30000)

    # Check if already logged in
    if "wp-admin/index.php" in page.url or "dashboard" in page.url.lower():
        print("[LOGIN] Already logged in")
        return True

    print("[LOGIN] Filling login form...")
    page.fill("#user_login", WP_USERNAME)
    page.fill("#user_pass", WP_PASSWORD)
    page.click("#wp-submit")

    # Wait for dashboard
    page.wait_for_load_state("networkidle", timeout=30000)

    if "wp-admin" in page.url and "wp-login" not in page.url:
        print("[LOGIN] Successfully logged in")
        return True
    else:
        print("[LOGIN] Login failed!")
        return False

def check_plugin_installed(page):
    """Check if JWT plugin is already installed"""
    print("[CHECK] Checking plugin status...")
    page.goto(f"{WP_ADMIN_URL}/plugins.php", wait_until="networkidle", timeout=30000)

    content = page.content().lower()

    if "jwt" in content and "authentication" in content:
        if "deactivate" in content:
            print("[CHECK] JWT plugin is ACTIVE")
            return "active"
        elif "activate" in content:
            print("[CHECK] JWT plugin is INSTALLED but inactive")
            return "inactive"

    print("[CHECK] JWT plugin NOT found")
    return "not_installed"

def install_and_activate_jwt(page):
    """Install JWT Authentication plugin"""
    print("[INSTALL] Navigating to Add Plugins page...")
    page.goto(f"{WP_ADMIN_URL}/plugin-install.php?s=jwt%20authentication%20for%20wp%20rest%20api&tab=search&type=term",
              wait_until="networkidle", timeout=30000)

    time.sleep(2)

    try:
        # Take screenshot for debugging
        page.screenshot(path="plugin_search.png")
        print("[DEBUG] Screenshot saved: plugin_search.png")

        # Look for plugin cards
        plugin_cards = page.locator(".plugin-card")
        print(f"[INSTALL] Found {plugin_cards.count()} plugin cards")

        # Find the JWT Authentication plugin
        for i in range(plugin_cards.count()):
            card = plugin_cards.nth(i)
            card_text = card.inner_text().lower()

            if "jwt authentication" in card_text and "wp rest api" in card_text:
                print(f"[INSTALL] Found JWT Authentication plugin (card {i})")

                # Check if install button exists
                install_button = card.locator("a.install-now")
                if install_button.count() > 0 and install_button.is_visible():
                    print("[INSTALL] Clicking install button...")
                    install_button.click()

                    # Wait for activation button to appear
                    try:
                        activate_button = card.locator("a.activate-now")
                        activate_button.wait_for(state="visible", timeout=30000)
                        print("[INSTALL] Installation complete, clicking activate...")

                        activate_button.click()
                        page.wait_for_load_state("networkidle", timeout=30000)

                        print("[SUCCESS] JWT Authentication plugin installed and activated!")
                        return True

                    except PlaywrightTimeout:
                        print("[ERROR] Activation button did not appear")
                        return False

                # Check if already installed
                elif card.locator("a.activate-now").count() > 0:
                    print("[INSTALL] Plugin already installed, clicking activate...")
                    activate_button = card.locator("a.activate-now")
                    activate_button.click()
                    page.wait_for_load_state("networkidle", timeout=30000)
                    print("[SUCCESS] JWT Authentication plugin activated!")
                    return True

                else:
                    print("[INFO] Plugin may already be active")
                    return False

        print("[ERROR] JWT Authentication plugin not found in search results")
        return False

    except Exception as e:
        print(f"[ERROR] Installation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def activate_from_plugins_page(page):
    """Activate plugin from plugins page"""
    print("[ACTIVATE] Navigating to plugins page...")
    page.goto(f"{WP_ADMIN_URL}/plugins.php", wait_until="networkidle", timeout=30000)

    time.sleep(1)

    # Look for JWT plugin activation link
    try:
        # Find all activate links
        rows = page.locator("tr.inactive")

        for i in range(rows.count()):
            row = rows.nth(i)
            row_text = row.inner_text().lower()

            if "jwt" in row_text and "authentication" in row_text:
                print("[ACTIVATE] Found JWT plugin row")
                activate_link = row.locator("a:has-text('Activate')")

                if activate_link.count() > 0:
                    print("[ACTIVATE] Clicking activate link...")
                    activate_link.click()
                    page.wait_for_load_state("networkidle", timeout=30000)
                    print("[SUCCESS] Plugin activated!")
                    return True

        print("[ACTIVATE] No activation link found - may already be active")
        return False

    except Exception as e:
        print(f"[ACTIVATE] Error: {e}")
        return False

def verify_jwt_endpoint(page):
    """Verify JWT endpoint is accessible"""
    print("[VERIFY] Testing JWT endpoint...")

    try:
        import requests
        response = requests.get("http://82mobile.com/wp-json/jwt-auth/v1", timeout=10)

        if response.status_code == 200:
            data = response.json()
            print(f"[VERIFY] ✓ JWT endpoint responds: {data.get('namespace', 'jwt-auth/v1')}")
            return True
        else:
            print(f"[VERIFY] ✗ JWT endpoint returned {response.status_code}")
            return False

    except Exception as e:
        print(f"[VERIFY] ✗ JWT endpoint error: {e}")
        return False

def main():
    print("=" * 60)
    print("JWT Authentication Plugin Installation")
    print("=" * 60)
    print()

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # Login
            if not login_to_wordpress(page):
                print("[ERROR] Login failed")
                return 1

            print()

            # Check current status
            status = check_plugin_installed(page)

            if status == "active":
                print("[SUCCESS] JWT plugin already active!")
                print()
                verify_jwt_endpoint(page)
                print()
                print("Browser will close in 3 seconds...")
                time.sleep(3)
                return 0

            elif status == "inactive":
                print("[ACTION] Activating plugin...")
                if activate_from_plugins_page(page):
                    print()
                    verify_jwt_endpoint(page)
                    print()
                    print("Browser will close in 3 seconds...")
                    time.sleep(3)
                    return 0
                else:
                    print("[ERROR] Activation failed")
                    time.sleep(5)
                    return 1

            else:
                print("[ACTION] Installing plugin...")
                if install_and_activate_jwt(page):
                    print()
                    verify_jwt_endpoint(page)
                    print()
                    print("Browser will close in 3 seconds...")
                    time.sleep(3)
                    return 0
                else:
                    print("[ERROR] Installation failed")
                    print("[INFO] Check plugin_search.png for details")
                    time.sleep(10)
                    return 1

        except Exception as e:
            print(f"[FATAL ERROR] {e}")
            import traceback
            traceback.print_exc()
            time.sleep(10)
            return 1

        finally:
            browser.close()

if __name__ == "__main__":
    sys.exit(main())
