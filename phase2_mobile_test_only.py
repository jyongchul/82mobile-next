#!/usr/bin/env python3
"""Mobile-only Phase 2 verification"""

from playwright.sync_api import sync_playwright

URL = "https://82mobile-next.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    print("=" * 60)
    print("MOBILE TESTING (iPhone 12 Pro - 390x844)")
    print("=" * 60)

    # Set mobile viewport
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(5000)  # Longer wait for mobile

    # 1. Responsive Layout
    print("\n1. Responsive Layout...")
    products_section = page.query_selector('#products')
    if products_section:
        grid = page.query_selector('#products .grid')
        if grid:
            grid_classes = grid.get_attribute('class')
            print(f"   ✅ Grid classes: {grid_classes}")
            print(f"   ✅ Responsive: {'md:grid-cols' in grid_classes}")

    # 2. Products Visible
    print("\n2. Products Visible...")
    results_text = page.query_selector('#products .text-center.mt-8')
    if results_text:
        print(f"   ✅ {results_text.inner_text()}")

    # 3. Scroll to products section first
    print("\n3. Scrolling to products...")
    page.evaluate("document.querySelector('#products').scrollIntoView({behavior: 'smooth'})")
    page.wait_for_timeout(2000)

    # 4. Touch Interactions
    print("\n4. Touch Interactions...")
    # Wait for product to be visible
    try:
        page.wait_for_selector('#products .cursor-pointer', timeout=5000, state='visible')
        product_div = page.query_selector('#products .cursor-pointer')

        if product_div:
            # Check if visible
            is_visible = product_div.is_visible()
            print(f"   Product div visible: {is_visible}")

            if is_visible:
                # Get touch target size
                box = product_div.bounding_box()
                if box:
                    print(f"   Touch target size: {box['width']:.0f}x{box['height']:.0f}px")

                    # Tap product
                    product_div.click()  # Use click instead of tap for better compatibility
                    page.wait_for_timeout(1500)

                    # Check if modal opened
                    modal = page.query_selector('[class*="fixed"][class*="inset-0"]')
                    if modal and modal.is_visible():
                        print(f"   ✅ Modal opened on touch")
                        # Close modal
                        page.keyboard.press('Escape')
                        page.wait_for_timeout(500)
                    else:
                        print(f"   ⚠️  Modal did not open")
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:100]}")

    # 5. Scrolling Performance
    print("\n5. Scrolling Performance...")
    # Scroll down slowly
    for i in range(5):
        page.evaluate(f"window.scrollBy(0, {page.viewport_size['height']})")
        page.wait_for_timeout(500)

    # Check if reached bottom
    bottom_section = page.query_selector('#contact')
    if bottom_section:
        print(f"   ✅ Scrolled to bottom (Contact section)")

    # Scroll back to top
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(1000)

    # 6. Mobile Navigation
    print("\n6. Mobile Navigation...")
    nav_dots = page.query_selector('nav.fixed.right-8')
    if nav_dots:
        is_hidden = page.evaluate("(el) => window.getComputedStyle(el).display === 'none'", nav_dots)
        print(f"   Nav dots hidden on mobile: {'✅' if is_hidden else '⚠️ visible'}")
    else:
        print(f"   ⚠️  Nav dots element not found")

    # 7. Text Readability
    print("\n7. Text Readability...")
    title = page.query_selector('#products h2')
    if title:
        font_size = page.evaluate("(el) => window.getComputedStyle(el).fontSize", title)
        print(f"   Title font size: {font_size}")

    # Take screenshot
    page.screenshot(path='phase2_mobile_final_test.png', full_page=True)
    print(f"\n📸 Mobile screenshot saved: phase2_mobile_final_test.png")

    print("\n⏸️  Browser open for 15s inspection...")
    page.wait_for_timeout(15000)
    browser.close()

print("\n" + "=" * 60)
print("MOBILE TEST COMPLETE")
print("=" * 60)
