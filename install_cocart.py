#!/usr/bin/env python3
"""
Install CoCart plugin via WordPress admin using Playwright automation.
Plan: 01-02 Task 1
"""

from playwright.sync_api import sync_playwright
import time

# WordPress admin credentials
WP_ADMIN_URL = "http://82mobile.com/wp-admin"
WP_USERNAME = "whadmin"
WP_PASSWORD = "WhMkt2026!@AdamKorSim"

def install_cocart_plugin():
    """Install and activate CoCart plugin via WordPress admin."""

    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # Login to WordPress admin
            print(f"Logging in to {WP_ADMIN_URL}...")
            page.goto(WP_ADMIN_URL)
            page.wait_for_selector('#user_login', timeout=10000)

            page.fill('#user_login', WP_USERNAME)
            page.fill('#user_pass', WP_PASSWORD)
            page.click('#wp-submit')

            # Wait for dashboard to load
            page.wait_for_selector('#wpadminbar', timeout=10000)
            print("✓ Logged in successfully")

            # Try direct plugin page URL approach first
            # CoCart plugin slug is "cart-rest-api-for-woocommerce"
            print("Navigating directly to CoCart plugin page...")
            plugin_slug = "cart-rest-api-for-woocommerce"
            page.goto(f"{WP_ADMIN_URL}/plugin-install.php?tab=plugin-information&plugin={plugin_slug}")

            # Wait for page to load
            page.wait_for_load_state('networkidle')
            time.sleep(2)

            # Check if we're on the plugin details page
            if "CoCart" in page.content():
                print("✓ Found CoCart plugin details page")

                # Look for install button
                install_button = page.locator('a.button:has-text("Install Now")')

                if install_button.is_visible():
                    print("Installing CoCart plugin...")
                    install_button.click()

                    # Wait for installation
                    page.wait_for_selector('a.button:has-text("Activate")', timeout=30000)
                    print("✓ CoCart installed successfully")

                    # Activate
                    print("Activating CoCart...")
                    activate_button = page.locator('a.button:has-text("Activate")')
                    activate_button.click()

                    # Wait for redirect to plugins page
                    page.wait_for_url('**/plugins.php**', timeout=10000)
                    print("✓ CoCart activated successfully")

                elif page.locator('text=Activate Plugin').is_visible():
                    print("CoCart already installed, activating...")
                    page.locator('text=Activate Plugin').click()
                    page.wait_for_url('**/plugins.php**', timeout=10000)
                    print("✓ CoCart activated successfully")

                else:
                    # Might already be active - check plugins page
                    print("Plugin might already be installed/active, checking plugins page...")
                    page.goto(f"{WP_ADMIN_URL}/plugins.php")
                    time.sleep(2)

                    if page.locator(f'tr[data-slug="{plugin_slug}"]').is_visible():
                        deactivate_link = page.locator(f'tr[data-slug="{plugin_slug}"] .deactivate a')

                        if deactivate_link.is_visible():
                            print("✓ CoCart already installed and active")
                        else:
                            # Try to activate it
                            activate_link = page.locator(f'tr[data-slug="{plugin_slug}"] .activate a')
                            if activate_link.is_visible():
                                print("Activating CoCart...")
                                activate_link.click()
                                page.wait_for_selector('.notice-success', timeout=10000)
                                print("✓ CoCart activated successfully")
                    else:
                        print("ERROR: Could not find or install CoCart plugin")
                        page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_not_found.png')
                        return False
            else:
                print("ERROR: Could not access CoCart plugin page")
                page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_page_error.png')
                return False

            # Verify plugin is active
            print("\nVerifying CoCart is active...")
            page.goto(f"{WP_ADMIN_URL}/plugins.php")
            page.wait_for_selector('.plugins', timeout=10000)

            if page.locator('tr[data-slug="cart-rest-api-for-woocommerce"]').is_visible():
                print("✓ CoCart plugin confirmed in plugins list")

                # Take screenshot of plugins page
                page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_active.png', full_page=True)
                return True
            else:
                print("WARNING: CoCart not found in plugins list")
                return False

        except Exception as e:
            print(f"ERROR: {e}")
            print("Taking screenshot for debugging...")
            page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_error.png')
            return False

        finally:
            browser.close()

if __name__ == "__main__":
    print("=" * 60)
    print("CoCart Plugin Installation Script")
    print("=" * 60)

    success = install_cocart_plugin()

    if success:
        print("\n" + "=" * 60)
        print("✓ CoCart installation complete!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("✗ CoCart installation failed - check screenshots")
        print("=" * 60)
        exit(1)
