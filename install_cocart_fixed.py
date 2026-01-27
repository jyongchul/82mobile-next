#!/usr/bin/env python3
"""
Install CoCart plugin via Playwright browser automation - Fixed version
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

            # First, check if CoCart is already installed
            print("Checking if CoCart is already installed...")
            page.goto('http://82mobile.com/wp-admin/plugins.php', timeout=30000)
            page.wait_for_load_state('networkidle')

            page_content = page.content()

            if 'CoCart' in page_content or 'cocart' in page_content.lower():
                print("✓ CoCart found on plugins page")

                # Check if active
                if page.locator('tr[data-plugin*="cocart"] .deactivate').count() > 0:
                    print("✓ CoCart is already active")
                    browser.close()
                    return True
                elif page.locator('tr[data-plugin*="cocart"] .activate').count() > 0:
                    print("CoCart installed but not active. Activating...")
                    page.locator('tr[data-plugin*="cocart"] .activate a').first.click()
                    page.wait_for_load_state('networkidle', timeout=15000)
                    print("✓ CoCart activated")
                    browser.close()
                    return True

            # Navigate to Plugins > Add New
            print("CoCart not found. Installing from repository...")
            page.goto('http://82mobile.com/wp-admin/plugin-install.php', timeout=30000)
            page.wait_for_load_state('networkidle')

            # Search for CoCart using different search terms
            search_terms = ['cart-rest-api-for-woocommerce', 'CoCart', 'cart rest api']

            for search_term in search_terms:
                print(f"Searching for '{search_term}'...")
                page.fill('#search-plugins', search_term)
                page.press('#search-plugins', 'Enter')
                page.wait_for_load_state('networkidle', timeout=15000)
                time.sleep(2)

                # Look for any card with CoCart
                cards = page.locator('.plugin-card')
                for i in range(cards.count()):
                    card = cards.nth(i)
                    card_text = card.inner_text().lower()

                    if 'cocart' in card_text or 'cart rest api' in card_text:
                        print(f"✓ Found CoCart plugin (search term: {search_term})")

                        # Try to install
                        install_btn = card.locator('a.install-now')
                        if install_btn.count() > 0:
                            print("Installing CoCart...")
                            install_btn.click()

                            # Wait for activation button
                            page.wait_for_selector('a.activate-now', timeout=30000)
                            print("Activating CoCart...")
                            page.click('a.activate-now')
                            page.wait_for_load_state('networkidle', timeout=15000)
                            print("✓ CoCart installed and activated")
                            browser.close()
                            return True

                        elif card.locator('button:has-text("Active")').count() > 0:
                            print("✓ CoCart is already active")
                            browser.close()
                            return True

            print("❌ CoCart plugin not found with any search term")

            # Take screenshot
            page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_search_results.png')
            print("Screenshot saved: /mnt/c/82Mobile/82mobile-next/cocart_search_results.png")

            browser.close()
            return False

        except Exception as e:
            print(f"❌ Error: {e}")
            try:
                page.screenshot(path='/mnt/c/82Mobile/82mobile-next/cocart_error.png')
                print("Error screenshot saved: /mnt/c/82Mobile/82mobile-next/cocart_error.png")
            except:
                pass
            browser.close()
            return False

if __name__ == '__main__':
    success = install_cocart()
    if success:
        print("\n✓ CoCart installation complete")
        exit(0)
    else:
        print("\n❌ CoCart installation failed - may need manual installation")
        exit(1)
