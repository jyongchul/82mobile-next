#!/usr/bin/env python3
"""Test new deployment with QueryProvider fix"""

from playwright.sync_api import sync_playwright

# New deployment URL
URL = "https://82mobile-next-e6qwumf9u-870829s-projects.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    errors = []
    def handle_console(msg):
        if msg.type == 'error':
            errors.append(msg.text)
            print(f"[ERROR] {msg.text}")

    page.on('console', handle_console)

    print(f"Testing: {URL}")
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(3000)

    # Check for QueryClient error
    has_queryclient_error = any('QueryClient' in err for err in errors)
    print(f"\nQueryClient error: {'❌ YES' if has_queryclient_error else '✅ NO'}")

    # Check for products
    try:
        page.wait_for_selector('.product-card', timeout=10000)
        product_count = page.locator('.product-card').count()
        print(f"Products found: ✅ {product_count} products")
    except Exception as e:
        print(f"Products: ❌ Not found - {e}")

    # Take screenshot
    page.screenshot(path='new_deployment_test.png', full_page=True)

    print("\n⏸️  Pausing for 20s inspection...")
    page.wait_for_timeout(20000)
    browser.close()

print("\n✅ Test complete!")
