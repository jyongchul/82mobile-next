#!/usr/bin/env python3
"""
Install CoCart plugin via Playwright browser automation
"""
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
import time

def install_cocart():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # Login to WordPress admin
            print("Navigating to WordPress admin...")
            page.goto('http://82mobile.com/wp-admin', timeout=30000)

            print("Logging in...")
            page.fill('#user_login', 'whadmin')
            page.fill('#user_pass', 'WhMkt2026!@AdamKorSim')
            page.click('#wp-submit')
            page.wait_for_load_state('networkidle', timeout=15000)

            # Navigate to Plugins > Add New
            print("Navigating to Plugins > Add New...")
            page.goto('http://82mobile.com/wp-admin/plugin-install.php', timeout=30000)

            # Search for CoCart
            print("Searching for CoCart...")
            page.fill('#search-plugins', 'CoCart')
            page.press('#search-plugins', 'Enter')
            page.wait_for_load_state('networkidle', timeout=15000)

            # Wait for search results
            time.sleep(3)

            # Look for CoCart plugin (either not installed or already installed)
            try:
                # Check if already installed
                if page.locator('text=CoCart').count() > 0:
                    print("Checking installation status...")

                    # Try to find "Activate" button (means installed but not active)
                    if page.locator('a.button:has-text("Activate")').count() > 0:
                        print("CoCart is installed but not activated. Activating...")
                        page.locator('a.button:has-text("Activate")').first.click()
                        page.wait_for_load_state('networkidle', timeout=15000)
                        print("✓ CoCart activated successfully")
                        return True

                    # Check if already active
                    elif page.locator('text=Active').count() > 0 or page.locator('button:has-text("Deactivate")').count() > 0:
                        print("✓ CoCart is already installed and activated")
                        return True

                    # Try to install
                    else:
                        print("Installing CoCart...")
                        install_btn = page.locator('a.install-now:has-text("Install Now")').first
                        if install_btn.count() > 0:
                            install_btn.click()
                            print("Waiting for installation...")
                            page.wait_for_selector('a.activate-now', timeout=30000)

                            print("Activating CoCart...")
                            page.click('a.activate-now')
                            page.wait_for_load_state('networkidle', timeout=15000)
                            print("✓ CoCart installed and activated successfully")
                            return True
                else:
                    print("❌ CoCart not found in search results")
                    return False

            except PlaywrightTimeoutError as e:
                print(f"Timeout waiting for plugin action: {e}")
                # Try to check if it's already active anyway
                page.goto('http://82mobile.com/wp-admin/plugins.php', timeout=30000)
                if page.locator('text=CoCart').count() > 0:
                    print("✓ CoCart appears to be installed (found on plugins page)")
                    return True
                return False

        except Exception as e:
            print(f"❌ Error: {e}")
            print(f"Current URL: {page.url}")

            # Take screenshot for debugging
            page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_install_error.png')
            print("Screenshot saved to: /mnt/c/82Mobile/82mobile-next/cocart_install_error.png")
            return False

        finally:
            input("Press Enter to close browser...")
            browser.close()

if __name__ == '__main__':
    success = install_cocart()
    if success:
        print("\n✓ CoCart installation complete")
        exit(0)
    else:
        print("\n❌ CoCart installation failed")
        exit(1)
