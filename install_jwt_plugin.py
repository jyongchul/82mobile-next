#!/usr/bin/env python3
"""
Install and activate JWT Authentication plugin via WordPress admin
Uses Playwright browser automation to bypass FTP caching issues
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
    page.goto(WP_ADMIN_URL, wait_until="networkidle")

    # Check if already logged in
    if "wp-admin/index.php" in page.url or "dashboard" in page.url.lower():
        print("[LOGIN] Already logged in")
        return True

    print("[LOGIN] Filling login form...")
    page.fill("#user_login", WP_USERNAME)
    page.fill("#user_pass", WP_PASSWORD)
    page.click("#wp-submit")

    # Wait for dashboard
    page.wait_for_load_state("networkidle")

    if "wp-admin" in page.url and "wp-login" not in page.url:
        print("[LOGIN] Successfully logged in")
        return True
    else:
        print("[LOGIN] Login failed!")
        return False

def check_plugin_status(page, plugin_slug):
    """Check if plugin is installed and/or activated"""
    print(f"[CHECK] Checking status of {plugin_slug}...")
    page.goto(f"{WP_ADMIN_URL}/plugins.php", wait_until="networkidle")

    content = page.content()

    # Check if plugin is active
    if f"data-slug=\"{plugin_slug}\"" in content or plugin_slug in content:
        if "plugin-status-active" in content or "deactivate" in content.lower():
            print(f"[CHECK] Plugin {plugin_slug} is ACTIVE")
            return "active"
        else:
            print(f"[CHECK] Plugin {plugin_slug} is INSTALLED but inactive")
            return "installed"
    else:
        print(f"[CHECK] Plugin {plugin_slug} is NOT installed")
        return "not_installed"

def install_plugin(page, search_term):
    """Install plugin from WordPress repository"""
    print(f"[INSTALL] Installing plugin: {search_term}")

    # Navigate to Add Plugins page
    page.goto(f"{WP_ADMIN_URL}/plugin-install.php", wait_until="networkidle")

    # Search for plugin
    print(f"[INSTALL] Searching for '{search_term}'...")
    page.fill("#search-plugins", search_term)
    page.press("#search-plugins", "Enter")

    # Wait for search results
    time.sleep(2)
    page.wait_for_load_state("networkidle")

    # Find and click Install button
    try:
        # Look for the install button for JWT Authentication plugin
        install_button = page.locator("a.install-now").first

        if install_button.is_visible():
            plugin_name = page.locator(".plugin-card-top h3").first.inner_text()
            print(f"[INSTALL] Found plugin: {plugin_name}")
            print(f"[INSTALL] Clicking install button...")

            install_button.click()

            # Wait for installation to complete
            print("[INSTALL] Waiting for installation...")
            page.wait_for_selector("a.activate-now", timeout=30000)
            print("[INSTALL] Installation complete!")
            return True
        else:
            print("[INSTALL] Install button not found")
            return False

    except PlaywrightTimeout:
        print("[INSTALL] Installation timed out")
        return False
    except Exception as e:
        print(f"[INSTALL] Installation error: {e}")
        return False

def activate_plugin(page, plugin_slug):
    """Activate an installed plugin"""
    print(f"[ACTIVATE] Activating plugin: {plugin_slug}")

    page.goto(f"{WP_ADMIN_URL}/plugins.php", wait_until="networkidle")

    try:
        # Find activate link by plugin slug or text
        activate_link = page.locator(f"tr[data-slug=\"{plugin_slug}\"] .activate a")

        if activate_link.count() > 0:
            activate_link.first.click()
            page.wait_for_load_state("networkidle")
            print("[ACTIVATE] Plugin activated successfully")
            return True
        else:
            # Try alternative method - find by text
            activate_links = page.locator("a:has-text('Activate')")
            if activate_links.count() > 0:
                # Find the one in the JWT plugin row
                for i in range(activate_links.count()):
                    link = activate_links.nth(i)
                    parent = link.locator("xpath=ancestor::tr")
                    if "jwt" in parent.inner_text().lower():
                        link.click()
                        page.wait_for_load_state("networkidle")
                        print("[ACTIVATE] Plugin activated successfully")
                        return True

            print("[ACTIVATE] Activate link not found - plugin may already be active")
            return False

    except Exception as e:
        print(f"[ACTIVATE] Activation error: {e}")
        return False

def main():
    print("=" * 60)
    print("JWT Authentication Plugin Installation")
    print("=" * 60)
    print()

    with sync_playwright() as p:
        # Launch browser (headless for production, visible for debugging)
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # Login to WordPress
            if not login_to_wordpress(page):
                print("[ERROR] Could not login to WordPress")
                return 1

            print()

            # Check JWT Authentication plugin
            jwt_slug = "jwt-authentication-for-wp-rest-api"
            status = check_plugin_status(page, jwt_slug)

            if status == "active":
                print("[SUCCESS] JWT Authentication plugin is already active")
            elif status == "installed":
                print("[ACTION] Plugin installed, activating...")
                if activate_plugin(page, jwt_slug):
                    print("[SUCCESS] JWT Authentication plugin activated")
                else:
                    print("[ERROR] Could not activate plugin")
                    return 1
            else:
                print("[ACTION] Plugin not installed, installing...")
                if install_plugin(page, "JWT Authentication for WP REST API"):
                    print("[ACTION] Plugin installed, now activating...")
                    time.sleep(2)

                    # Click activate button that appears after install
                    try:
                        activate_button = page.locator("a.activate-now").first
                        if activate_button.is_visible():
                            activate_button.click()
                            page.wait_for_load_state("networkidle")
                            print("[SUCCESS] JWT Authentication plugin activated")
                        else:
                            # Navigate to plugins page and activate
                            if activate_plugin(page, jwt_slug):
                                print("[SUCCESS] JWT Authentication plugin activated")
                    except Exception as e:
                        print(f"[ERROR] Activation failed: {e}")
                        return 1
                else:
                    print("[ERROR] Could not install plugin")
                    return 1

            print()

            # Optional: Check Disable WP Frontend plugin
            print("--- Optional: Disable WP Frontend Plugin ---")
            frontend_slug = "disable-wp-frontend"
            status = check_plugin_status(page, frontend_slug)

            if status == "active":
                print("[INFO] Disable WP Frontend plugin is already active")
            else:
                print("[INFO] Disable WP Frontend plugin not needed (MU-plugin handles this)")

            print()
            print("=" * 60)
            print("PLUGIN INSTALLATION COMPLETE")
            print("=" * 60)
            print()
            print("Next steps:")
            print("1. Test JWT token generation")
            print("2. Run checkpoint verification")

            # Keep browser open for a moment to verify
            print()
            print("Browser will close in 5 seconds...")
            time.sleep(5)

            return 0

        except Exception as e:
            print(f"[FATAL ERROR] {e}")
            import traceback
            traceback.print_exc()
            return 1
        finally:
            browser.close()

if __name__ == "__main__":
    sys.exit(main())
