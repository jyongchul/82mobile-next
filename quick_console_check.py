#!/usr/bin/env python3
"""Quick check for QueryClient error in production"""

from playwright.sync_api import sync_playwright

URL = "https://82mobile-next.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    errors = []
    def handle_console(msg):
        if msg.type == 'error':
            errors.append(msg.text)
            print(f"[ERROR] {msg.text}")

    page.on('console', handle_console)

    print(f"Loading {URL}...")
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(3000)

    print(f"\nTotal errors: {len(errors)}")
    if any('QueryClient' in err for err in errors):
        print("❌ QueryClient error still present")
    else:
        print("✅ No QueryClient error!")

    # Check for products
    try:
        page.wait_for_selector('.product-card', timeout=5000)
        print("✅ Products found!")
    except:
        print("❌ Products not found")

    # Take screenshot
    page.screenshot(path='quick_check.png', full_page=True)

    print("\n⏸️  Pausing for inspection (30s)...")
    page.wait_for_timeout(30000)
    browser.close()
