#!/usr/bin/env python3
"""Diagnose why products aren't displaying"""

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

    page.on('console', handle_console)

    print(f"Loading: {URL}\n")
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(3000)

    # Scroll to products section
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(2000)

    # Check network requests
    print("="*60)
    print("DIAGNOSTICS")
    print("="*60)

    # Check if products API was called
    api_called = page.evaluate("""() => {
        return performance.getEntriesByType('resource')
            .filter(r => r.name.includes('/api/products'))
            .map(r => ({
                url: r.name,
                duration: r.duration,
                size: r.transferSize
            }));
    }""")

    print(f"\n1. API Calls to /api/products:")
    if api_called:
        for call in api_called:
            print(f"   ✅ {call['url']}")
            print(f"      Duration: {call['duration']}ms, Size: {call['size']} bytes")
    else:
        print("   ❌ NO API calls found")

    # Check for product cards in DOM
    product_cards = page.locator('.product-card').count()
    print(f"\n2. Product Cards in DOM: {product_cards}")

    # Check for ProductsSection component
    products_section = page.locator('[class*="product"]').count()
    print(f"3. Elements with 'product' class: {products_section}")

    # Check page HTML structure
    html_snippet = page.evaluate("""() => {
        const section = document.querySelector('main') || document.body;
        return section.innerHTML.substring(0, 500);
    }""")
    print(f"\n4. Main HTML structure (first 500 chars):")
    print(html_snippet)

    # Check React Query devtools data
    react_query_data = page.evaluate("""() => {
        try {
            // Try to access React Query cache
            const queryClient = window.__REACT_QUERY_CLIENT__;
            if (queryClient) {
                return 'React Query client found';
            }
            return 'React Query client not found in window';
        } catch (e) {
            return 'Error accessing React Query: ' + e.message;
        }
    }""")
    print(f"\n5. React Query status: {react_query_data}")

    # Save console logs
    with open('console_logs.json', 'w') as f:
        json.dump(console_logs, f, indent=2)

    print(f"\n📁 Console logs saved to: console_logs.json")

    print(f"\n⏸️  Pausing for 20s...")
    page.wait_for_timeout(20000)
    browser.close()
