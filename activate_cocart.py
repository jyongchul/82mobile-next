#!/usr/bin/env python3
"""
Activate CoCart plugin via Playwright
"""
from playwright.sync_api import sync_playwright
import time

def activate_cocart():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # Login to WordPress admin
            print("Logging in to WordPress...")
            page.goto('http://82mobile.com/wp-admin', timeout=30000)
            page.fill('#user_login', 'whadmin')
            page.fill('#user_pass', 'WhMkt2026!@AdamKorSim')
            page.click('#wp-submit')
            page.wait_for_load_state('networkidle', timeout=15000)

            # Go to plugins page
            print("Navigating to Plugins page...")
            page.goto('http://82mobile.com/wp-admin/plugins.php', timeout=30000)
            page.wait_for_load_state('networkidle')

            # Look for CoCart plugin row
            print("Looking for CoCart plugin...")
            page_content = page.content()

            if 'cart-rest-api-for-woocommerce' in page_content.lower() or 'cocart' in page_content.lower():
                print("✓ Found CoCart plugin")

                # Check if it needs activation
                activate_link = page.locator('tr[data-slug="cart-rest-api-for-woocommerce"] .activate a, tr:has-text("CoCart") .activate a')

                if activate_link.count() > 0:
                    print("Activating CoCart...")
                    activate_link.first.click()
                    page.wait_for_load_state('networkidle', timeout=15000)
                    time.sleep(2)
                    print("✓ CoCart activated successfully")
                    browser.close()
                    return True
                else:
                    # Check if already active
                    if 'deactivate' in page.content().lower() and 'cocart' in page.content().lower():
                        print("✓ CoCart is already active")
                        browser.close()
                        return True
                    else:
                        print("❌ Could not find activate link")
                        page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_activate_error.png')
                        browser.close()
                        return False
            else:
                print("❌ CoCart plugin not found on plugins page")
                page.screenshot(path='/mnt/c/82Mobile/82mobile-next/plugins_page.png')
                browser.close()
                return False

        except Exception as e:
            print(f"❌ Error: {e}")
            try:
                page.screenshot(path='/mnt/c/82Mobile/82mobile-next/activation_error.png')
            except:
                pass
            browser.close()
            return False

if __name__ == '__main__':
    success = activate_cocart()
    if success:
        print("\n✓ CoCart plugin activated")
        exit(0)
    else:
        print("\n❌ CoCart activation failed")
        exit(1)
