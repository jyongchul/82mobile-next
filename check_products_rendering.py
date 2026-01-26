#!/usr/bin/env python3
"""Deep diagnostic of why products aren't rendering"""

from playwright.sync_api import sync_playwright
import json

URL = "https://82mobile-next.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    console_logs = []
    def handle_console(msg):
        console_logs.append({
            'type': msg.type,
            'text': msg.text
        })
        if msg.type in ['error', 'warning']:
            print(f"[{msg.type.upper()}] {msg.text}")

    page.on('console', handle_console)

    print(f"Loading: {URL}\n")
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(5000)  # Wait 5 seconds for React to render

    print("=" * 60)
    print("DETAILED COMPONENT STATE ANALYSIS")
    print("=" * 60)

    # Check if ProductsSection element exists
    products_section = page.query_selector('#products')
    print(f"\n1. ProductsSection (#products) exists: {products_section is not None}")

    if products_section:
        # Get the HTML content
        section_html = products_section.inner_html()
        print(f"\n2. Section HTML length: {len(section_html)} characters")

        # Check for loading state
        loading_skeleton = page.query_selector('#products .animate-pulse')
        print(f"3. Loading skeleton visible: {loading_skeleton is not None}")

        # Check for error state
        error_message = page.query_selector('#products .text-red-600')
        print(f"4. Error message visible: {error_message is not None}")

        # Check for product grid
        product_grid = page.query_selector('#products .grid')
        print(f"5. Product grid exists: {product_grid is not None}")

        if product_grid:
            grid_children = page.query_selector_all('#products .grid > div')
            print(f"6. Grid children count: {len(grid_children)}")

        # Check for "Showing X of Y products" text
        showing_text = page.query_selector('#products .text-center.mt-8')
        if showing_text:
            print(f"7. Results text: {showing_text.inner_text()}")

    # Check ProductFilter
    filter_section = page.query_selector_all('[class*="filter"]')
    print(f"\n8. Filter elements found: {len(filter_section)}")

    # Get all text content from products section
    if products_section:
        all_text = products_section.inner_text()
        print(f"\n9. Products section visible text:\n{all_text[:500]}")

    # Check React Query state in browser console
    react_state = page.evaluate("""() => {
        // Try to access window to see what's available
        const keys = Object.keys(window).filter(k => k.includes('react') || k.includes('query'));
        return {
            reactKeys: keys,
            hasReact: typeof window.React !== 'undefined',
            hasReactDOM: typeof window.ReactDOM !== 'undefined'
        };
    }""")
    print(f"\n10. Browser window state: {json.dumps(react_state, indent=2)}")

    # Take screenshot
    page.screenshot(path='products_rendering_debug.png', full_page=True)
    print(f"\n📸 Screenshot saved: products_rendering_debug.png")

    # Save console logs
    with open('products_rendering_console.json', 'w') as f:
        json.dump(console_logs, f, indent=2)
    print(f"📁 Console logs saved: products_rendering_console.json")

    print(f"\n⏸️  Browser open for 30s inspection...")
    page.wait_for_timeout(30000)
    browser.close()

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
