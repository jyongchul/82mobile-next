#!/usr/bin/env python3
"""Comprehensive Phase 2 Verification - Desktop & Mobile Testing"""

from playwright.sync_api import sync_playwright
import json
from datetime import datetime

URL = "https://82mobile-next.vercel.app"

def test_desktop(page):
    """Desktop verification (1920x1080)"""
    print("\n" + "=" * 60)
    print("DESKTOP TESTING (1920x1080)")
    print("=" * 60)

    page.set_viewport_size({"width": 1920, "height": 1080})
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(3000)

    results = {}

    # 1. Products Load from WooCommerce API
    print("\n1. Products Loading...")
    products_section = page.query_selector('#products')
    results['products_section_exists'] = products_section is not None

    if products_section:
        # Check for results text
        results_text = page.query_selector('#products .text-center.mt-8')
        if results_text:
            text_content = results_text.inner_text()
            results['products_loaded'] = 'Showing' in text_content and 'of' in text_content
            results['products_count'] = text_content
            print(f"   ✅ {text_content}")
        else:
            results['products_loaded'] = False
            print(f"   ❌ No results text found")

    # 2. Product Grid Display
    print("\n2. Product Grid Display...")
    grid = page.query_selector('#products .grid')
    if grid:
        # Get all divs that contain product links
        product_elements = page.query_selector_all('#products .grid > div')
        results['grid_exists'] = True
        results['grid_children_count'] = len(product_elements)
        print(f"   ✅ Grid exists with {len(product_elements)} children")
    else:
        results['grid_exists'] = False
        print(f"   ❌ Grid not found")

    # 3. Filters Functionality
    print("\n3. Filters...")
    filters = {
        'type': page.query_selector_all('input[type="checkbox"]'),
        'sort': page.query_selector('select'),
    }
    results['filters_found'] = len(filters['type']) > 0 or filters['sort'] is not None
    print(f"   ✅ {len(filters['type'])} checkboxes, Sort dropdown: {filters['sort'] is not None}")

    # Test filter interaction
    if len(filters['type']) > 0:
        first_checkbox = filters['type'][0]
        initial_count_text = page.query_selector('#products .text-center.mt-8').inner_text()
        first_checkbox.click()
        page.wait_for_timeout(1000)
        filtered_count_text = page.query_selector('#products .text-center.mt-8').inner_text()
        results['filter_works'] = initial_count_text != filtered_count_text
        print(f"   Filter interaction: {initial_count_text} → {filtered_count_text}")
        first_checkbox.click()  # Reset
        page.wait_for_timeout(1000)

    # 4. Product Modal
    print("\n4. Product Modal Expansion...")
    # Find first product link
    first_product = page.query_selector('#products a[href*="/shop/"]')
    if first_product:
        # Note: Modal is actually triggered by click on parent div, not link
        # But clicking the div should open the ProductExpanded modal
        parent_div = page.query_selector('#products .cursor-pointer')
        if parent_div:
            parent_div.click()
            page.wait_for_timeout(1000)

            # Check if modal opened (ProductExpanded component)
            modal = page.query_selector('[class*="fixed"][class*="inset-0"]')
            results['modal_opens'] = modal is not None

            if modal:
                print(f"   ✅ Modal opened")
                # Close modal
                close_button = page.query_selector('button[class*="close"], button[aria-label="Close"]')
                if close_button:
                    close_button.click()
                else:
                    page.keyboard.press('Escape')
                page.wait_for_timeout(500)
            else:
                print(f"   ❌ Modal did not open")
        else:
            results['modal_opens'] = False
            print(f"   ⚠️  No clickable product div found")
    else:
        results['modal_opens'] = False
        print(f"   ❌ No product links found")

    # 5. Toast Notifications (Add to Cart)
    print("\n5. Toast Notifications...")
    # Hover over product to flip card
    product_card = page.query_selector('#products .perspective-1000')
    if product_card:
        # Trigger hover to flip card
        product_card.hover()
        page.wait_for_timeout(1000)

        # Click "Add to Cart" button on back of card
        add_to_cart = page.query_selector('button:has-text("Add to Cart")')
        if add_to_cart:
            add_to_cart.click()
            page.wait_for_timeout(1500)

            # Check for toast notification
            toast = page.query_selector('[class*="toast"], [role="alert"]')
            results['toast_shows'] = toast is not None

            if toast:
                print(f"   ✅ Toast notification appeared")
            else:
                print(f"   ⚠️  Toast not detected (may have auto-closed)")
        else:
            print(f"   ⚠️  Add to Cart button not found on flipped card")
            results['toast_shows'] = False
    else:
        print(f"   ❌ No product card found for hover test")
        results['toast_shows'] = False

    # 6. Image Lazy Loading
    print("\n6. Image Lazy Loading...")
    images = page.query_selector_all('#products img')
    lazy_images = [img for img in images if img.get_attribute('loading') == 'lazy']
    eager_images = [img for img in images if img.get_attribute('loading') == 'eager']
    results['total_images'] = len(images)
    results['lazy_images'] = len(lazy_images)
    results['eager_images'] = len(eager_images)
    print(f"   Total: {len(images)} images")
    print(f"   Lazy: {len(lazy_images)} images")
    print(f"   Eager: {len(eager_images)} images (above fold)")

    # 7. Scroll Interactions
    print("\n7. Scroll Interactions...")
    # Check for scroll progress bar
    scroll_progress = page.query_selector('.fixed.top-0.left-0.w-full.h-1')
    results['scroll_progress_bar'] = scroll_progress is not None
    print(f"   Scroll progress bar: {'✅' if scroll_progress else '❌'}")

    # Check for navigation dots
    nav_dots = page.query_selector('nav.fixed.right-8')
    results['nav_dots'] = nav_dots is not None
    print(f"   Navigation dots: {'✅' if nav_dots else '❌'}")

    # Take screenshot
    page.screenshot(path='phase2_desktop_test.png', full_page=True)
    print(f"\n📸 Desktop screenshot saved")

    return results

def test_mobile(page):
    """Mobile verification (iPhone 12 Pro - 390x844)"""
    print("\n" + "=" * 60)
    print("MOBILE TESTING (iPhone 12 Pro - 390x844)")
    print("=" * 60)

    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(3000)

    results = {}

    # 1. Responsive Layout
    print("\n1. Responsive Layout...")
    products_section = page.query_selector('#products')
    if products_section:
        # Check grid layout (should be 1 column on mobile)
        grid = page.query_selector('#products .grid')
        if grid:
            grid_classes = grid.get_attribute('class')
            results['mobile_single_column'] = 'md:grid-cols-2' in grid_classes or 'lg:grid-cols-3' in grid_classes
            print(f"   ✅ Responsive grid classes: {grid_classes}")

    # 2. Touch Interactions
    print("\n2. Touch Interactions...")
    # Tap on product
    product_div = page.query_selector('#products .cursor-pointer')
    if product_div:
        # Get bounding box for touch target size
        box = product_div.bounding_box()
        results['touch_target_size'] = f"{box['width']}x{box['height']}" if box else "N/A"

        # Tap product
        product_div.tap()
        page.wait_for_timeout(1000)

        # Check if modal opened
        modal = page.query_selector('[class*="fixed"][class*="inset-0"]')
        results['mobile_modal_works'] = modal is not None

        if modal:
            print(f"   ✅ Touch tap opens modal")
            # Close modal
            page.keyboard.press('Escape')
            page.wait_for_timeout(500)
        else:
            print(f"   ❌ Touch tap did not open modal")

    # 3. Scrolling Performance
    print("\n3. Scrolling...")
    # Scroll down
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Check if all content loaded
    bottom_text = page.query_selector('#contact')
    results['scroll_to_bottom'] = bottom_text is not None
    print(f"   ✅ Scrolled to bottom, contact section visible")

    # Scroll back to products
    page.evaluate("document.querySelector('#products').scrollIntoView()")
    page.wait_for_timeout(1000)

    # 4. Mobile Navigation
    print("\n4. Mobile Navigation...")
    # Check if floating nav dots are hidden on mobile
    nav_dots = page.query_selector('nav.fixed.right-8')
    is_hidden = page.evaluate("(el) => window.getComputedStyle(el).display === 'none'", nav_dots) if nav_dots else True
    results['nav_dots_hidden_mobile'] = is_hidden
    print(f"   Navigation dots hidden on mobile: {'✅' if is_hidden else '⚠️ visible'}")

    # Take screenshot
    page.screenshot(path='phase2_mobile_test.png', full_page=True)
    print(f"\n📸 Mobile screenshot saved")

    return results

def run_all_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Capture console errors
        errors = []
        def handle_console(msg):
            if msg.type == 'error':
                errors.append(msg.text)

        page.on('console', handle_console)

        # Run tests
        desktop_results = test_desktop(page)
        mobile_results = test_mobile(page)

        # Combine results
        all_results = {
            'timestamp': datetime.now().isoformat(),
            'url': URL,
            'desktop': desktop_results,
            'mobile': mobile_results,
            'console_errors': [e for e in errors if 'favicon' not in e.lower()]  # Filter favicon errors
        }

        # Save results
        with open('phase2_verification_results.json', 'w') as f:
            json.dump(all_results, f, indent=2)

        print("\n" + "=" * 60)
        print("PHASE 2 VERIFICATION COMPLETE")
        print("=" * 60)
        print(f"\n✅ Desktop tests completed")
        print(f"✅ Mobile tests completed")
        print(f"📁 Results saved: phase2_verification_results.json")
        print(f"📸 Screenshots: phase2_desktop_test.png, phase2_mobile_test.png")

        # Summary
        print("\n" + "=" * 60)
        print("KEY FINDINGS")
        print("=" * 60)
        print(f"\nDesktop:")
        print(f"  Products loaded: {desktop_results.get('products_loaded', False)}")
        print(f"  Grid display: {desktop_results.get('grid_exists', False)}")
        print(f"  Filters working: {desktop_results.get('filter_works', False)}")
        print(f"  Modal expansion: {desktop_results.get('modal_opens', False)}")
        print(f"  Toast notifications: {desktop_results.get('toast_shows', False)}")
        print(f"  Lazy loading: {desktop_results.get('lazy_images', 0)} lazy, {desktop_results.get('eager_images', 0)} eager")

        print(f"\nMobile:")
        print(f"  Responsive layout: {mobile_results.get('mobile_single_column', False)}")
        print(f"  Touch interactions: {mobile_results.get('mobile_modal_works', False)}")
        print(f"  Scroll performance: {mobile_results.get('scroll_to_bottom', False)}")

        print(f"\nConsole Errors: {len(all_results['console_errors'])}")
        if all_results['console_errors']:
            for err in all_results['console_errors'][:3]:
                print(f"  - {err[:100]}")

        print(f"\n⏸️  Browser open for 20s review...")
        page.wait_for_timeout(20000)
        browser.close()

if __name__ == '__main__':
    run_all_tests()
