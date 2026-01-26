#!/usr/bin/env python3
"""Final test of production deployment"""

from playwright.sync_api import sync_playwright

URL = "https://82mobile-next.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    errors = []
    def handle_console(msg):
        if msg.type == 'error':
            errors.append(msg.text)
            if 'QueryClient' not in msg.text and 'favicon' not in msg.text:
                print(f"[ERROR] {msg.text}")

    page.on('console', handle_console)

    print(f"Testing PRODUCTION: {URL}\n")
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(3000)

    # Check for QueryClient error
    query_errors = [e for e in errors if 'QueryClient' in e]
    print(f"1. QueryClient status: {'❌ ERROR' if query_errors else '✅ NO ERRORS'}")

    # Scroll to products
    try:
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        page.wait_for_timeout(2000)
    except:
        pass

    # Check for products
    try:
        page.wait_for_selector('.product-card', timeout=10000)
        product_count = page.locator('.product-card').count()
        print(f"2. Products loaded: ✅ {product_count} products found")
    except Exception as e:
        print(f"2. Products loaded: ❌ NOT FOUND")
        print(f"   Error: {str(e)[:100]}")

    # Check for filters
    try:
        filter_selectors = [
            'input[type="checkbox"]',
            '[class*="filter"]',
            '[class*="Filter"]'
        ]
        filter_found = False
        for selector in filter_selectors:
            if page.locator(selector).count() > 0:
                filter_found = True
                break
        if filter_found:
            print(f"3. Filters found: ✅")
        else:
            print(f"3. Filters found: ❌")
    except:
        print(f"3. Filters found: ❌")

    # Take screenshots
    page.screenshot(path='production_homepage.png', full_page=True)
    print(f"\n📸 Screenshot saved: production_homepage.png")

    print(f"\n⏸️  Browser open for 15s inspection...")
    page.wait_for_timeout(15000)
    browser.close()

print("\n" + "="*60)
print("PRODUCTION TEST COMPLETE")
print("="*60)
