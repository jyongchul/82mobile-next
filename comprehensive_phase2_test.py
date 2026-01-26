"""
Comprehensive Phase 2 Testing - Desktop & Mobile
Tests all Phase 2 features on production: https://82mobile.com
"""
import json
import time
from playwright.sync_api import sync_playwright, expect
from datetime import datetime

PRODUCTION_URL = "https://82mobile-next.vercel.app"
RESULTS = {
    "timestamp": datetime.now().isoformat(),
    "url": PRODUCTION_URL,
    "desktop": {},
    "mobile": {},
    "issues": []
}

def log_issue(severity, component, description, screenshot=None):
    """Log an issue found during testing"""
    issue = {
        "severity": severity,  # "critical", "major", "minor"
        "component": component,
        "description": description,
        "screenshot": screenshot
    }
    RESULTS["issues"].append(issue)
    print(f"[{severity.upper()}] {component}: {description}")

def test_desktop(page):
    """Desktop testing at 1920x1080"""
    print("\n━━━ DESKTOP TESTING (1920x1080) ━━━")

    page.set_viewport_size({"width": 1920, "height": 1080})

    # Navigate to homepage
    print("1. Loading homepage...")
    try:
        page.goto(PRODUCTION_URL, wait_until="networkidle", timeout=30000)
        page.screenshot(path="test_desktop_homepage.png", full_page=True)
        RESULTS["desktop"]["homepage_loaded"] = True
    except Exception as e:
        log_issue("critical", "Homepage", f"Failed to load: {str(e)}")
        RESULTS["desktop"]["homepage_loaded"] = False
        return

    # Scroll to products section
    print("2. Scrolling to products section...")
    try:
        page.evaluate("window.lenis?.scrollTo('#products', { offset: 0, duration: 1 })")
        time.sleep(2)
        page.screenshot(path="test_desktop_products_section.png")
        RESULTS["desktop"]["products_section_visible"] = True
    except Exception as e:
        log_issue("major", "Products Section", f"Scroll failed: {str(e)}")
        RESULTS["desktop"]["products_section_visible"] = False

    # Check if products loaded (real WooCommerce data)
    print("3. Checking if real products loaded...")
    try:
        # Wait for products to appear
        page.wait_for_selector('.product-card, [class*="product"]', timeout=10000)

        # Count products
        product_cards = page.query_selector_all('.product-card, [class*="product"][class*="card"]')
        product_count = len(product_cards)

        if product_count == 0:
            log_issue("critical", "Products", "No products displayed")
            RESULTS["desktop"]["products_loaded"] = False
        else:
            print(f"   ✓ Found {product_count} products")
            RESULTS["desktop"]["products_loaded"] = True
            RESULTS["desktop"]["product_count"] = product_count

            # Check if showing real data (not "Loading..." or "Mock")
            first_product_text = product_cards[0].text_content() if product_cards else ""
            if "loading" in first_product_text.lower() or "mock" in first_product_text.lower():
                log_issue("major", "Products", "Products still showing loading/mock data")
    except Exception as e:
        log_issue("critical", "Products", f"Failed to find products: {str(e)}")
        RESULTS["desktop"]["products_loaded"] = False

    # Test product filtering
    print("4. Testing product filters...")
    try:
        # Try to find filter controls
        type_filters = page.query_selector_all('input[type="checkbox"][value="eSIM"], input[type="checkbox"][value="Physical"]')

        if len(type_filters) > 0:
            print("   ✓ Found type filters")
            RESULTS["desktop"]["type_filter_exists"] = True

            # Try clicking a filter
            type_filters[0].click()
            time.sleep(1)

            # Check if results updated
            results_text = page.text_content('body')
            if "showing" in results_text.lower() or "products" in results_text.lower():
                print("   ✓ Filter appears to work")
                RESULTS["desktop"]["filter_works"] = True

            # Reset filter
            type_filters[0].click()
            time.sleep(1)
        else:
            log_issue("major", "Filters", "No filter controls found")
            RESULTS["desktop"]["type_filter_exists"] = False

    except Exception as e:
        log_issue("minor", "Filters", f"Filter test failed: {str(e)}")
        RESULTS["desktop"]["filter_works"] = False

    # Test product modal expansion
    print("5. Testing product modal...")
    try:
        # Click first product
        product_cards = page.query_selector_all('.product-card, [class*="product"][class*="card"]')
        if product_cards and len(product_cards) > 0:
            product_cards[0].click()
            time.sleep(1)

            # Check if modal opened
            modal = page.query_selector('[role="dialog"], .modal, [class*="modal"]')
            if modal:
                print("   ✓ Modal opened")
                page.screenshot(path="test_desktop_modal_open.png")
                RESULTS["desktop"]["modal_opens"] = True

                # Check modal contents
                modal_text = modal.text_content()
                if "add to cart" in modal_text.lower():
                    print("   ✓ Modal shows Add to Cart button")
                    RESULTS["desktop"]["modal_has_cta"] = True

                # Try closing with Escape
                page.keyboard.press("Escape")
                time.sleep(0.5)

                # Check if modal closed
                modal_after = page.query_selector('[role="dialog"], .modal, [class*="modal"]')
                if not modal_after or not modal_after.is_visible():
                    print("   ✓ Modal closes with Escape")
                    RESULTS["desktop"]["modal_escape_works"] = True
                else:
                    log_issue("minor", "Modal", "Escape key doesn't close modal")
                    RESULTS["desktop"]["modal_escape_works"] = False
            else:
                log_issue("major", "Modal", "Modal didn't open on product click")
                RESULTS["desktop"]["modal_opens"] = False
        else:
            log_issue("major", "Modal", "No products to click")

    except Exception as e:
        log_issue("major", "Modal", f"Modal test failed: {str(e)}")
        RESULTS["desktop"]["modal_opens"] = False

    # Test Add to Cart and Toast
    print("6. Testing Add to Cart and toast notification...")
    try:
        # Click first product again
        product_cards = page.query_selector_all('.product-card, [class*="product"][class*="card"]')
        if product_cards and len(product_cards) > 0:
            product_cards[0].click()
            time.sleep(0.5)

            # Find and click Add to Cart button
            add_to_cart = page.query_selector('button:has-text("Add to Cart"), button:has-text("장바구니")')
            if add_to_cart:
                add_to_cart.click()
                time.sleep(1)

                # Check for toast notification
                toast = page.query_selector('[class*="toast"], [role="alert"], [class*="notification"]')
                if toast and toast.is_visible():
                    print("   ✓ Toast notification appeared")
                    page.screenshot(path="test_desktop_toast.png")
                    RESULTS["desktop"]["toast_works"] = True
                else:
                    log_issue("minor", "Toast", "No toast notification after Add to Cart")
                    RESULTS["desktop"]["toast_works"] = False

                # Check cart count updated
                cart_count = page.query_selector('[class*="cart"] span, [class*="badge"]')
                if cart_count and cart_count.text_content().strip() != "0":
                    print("   ✓ Cart count updated")
                    RESULTS["desktop"]["cart_count_updates"] = True
            else:
                log_issue("major", "Add to Cart", "Add to Cart button not found in modal")
                RESULTS["desktop"]["toast_works"] = False

    except Exception as e:
        log_issue("minor", "Add to Cart", f"Add to cart test failed: {str(e)}")
        RESULTS["desktop"]["toast_works"] = False

    # Test image lazy loading
    print("7. Testing image lazy loading...")
    try:
        # Scroll back to top
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        # Count images
        images = page.query_selector_all('img')
        total_images = len(images)

        # Check loading attribute
        priority_images = [img for img in images if img.get_attribute('loading') == 'eager']
        lazy_images = [img for img in images if img.get_attribute('loading') == 'lazy']

        print(f"   Images: {total_images} total, {len(priority_images)} priority, {len(lazy_images)} lazy")
        RESULTS["desktop"]["image_optimization"] = {
            "total": total_images,
            "priority": len(priority_images),
            "lazy": len(lazy_images)
        }

        if len(lazy_images) > 0:
            print("   ✓ Lazy loading implemented")
            RESULTS["desktop"]["lazy_loading_works"] = True
        else:
            log_issue("minor", "Images", "No lazy loading detected")
            RESULTS["desktop"]["lazy_loading_works"] = False

    except Exception as e:
        log_issue("minor", "Images", f"Image test failed: {str(e)}")

    # Check for visual issues
    print("8. Checking for visual issues...")
    try:
        # Check for horizontal scroll
        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        client_width = page.evaluate("document.documentElement.clientWidth")

        if scroll_width > client_width + 10:  # 10px tolerance
            log_issue("major", "Layout", f"Horizontal scroll detected: {scroll_width}px > {client_width}px")
            RESULTS["desktop"]["horizontal_scroll"] = True
        else:
            print("   ✓ No horizontal scroll")
            RESULTS["desktop"]["horizontal_scroll"] = False

        # Check for console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        if console_errors:
            log_issue("minor", "Console", f"Console errors: {console_errors[:3]}")
            RESULTS["desktop"]["console_errors"] = console_errors[:5]
        else:
            RESULTS["desktop"]["console_errors"] = []

    except Exception as e:
        log_issue("minor", "Visual", f"Visual check failed: {str(e)}")

    print("✓ Desktop testing complete")


def test_mobile(page):
    """Mobile testing (iPhone 12 Pro)"""
    print("\n━━━ MOBILE TESTING (iPhone 12 Pro) ━━━")

    # Set mobile viewport
    page.set_viewport_size({"width": 390, "height": 844})
    page.evaluate("window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'")

    # Navigate to homepage
    print("1. Loading homepage on mobile...")
    try:
        page.goto(PRODUCTION_URL, wait_until="networkidle", timeout=30000)
        page.screenshot(path="test_mobile_homepage.png", full_page=True)
        RESULTS["mobile"]["homepage_loaded"] = True
    except Exception as e:
        log_issue("critical", "Mobile Homepage", f"Failed to load: {str(e)}")
        RESULTS["mobile"]["homepage_loaded"] = False
        return

    # Check responsive layout
    print("2. Checking responsive layout...")
    try:
        # Scroll to products
        page.evaluate("window.lenis?.scrollTo('#products', { offset: 0, duration: 1 })")
        time.sleep(2)

        # Check if products are in single column
        product_cards = page.query_selector_all('.product-card, [class*="product"][class*="card"]')
        if len(product_cards) > 1:
            first_rect = product_cards[0].bounding_box()
            second_rect = product_cards[1].bounding_box()

            # If Y positions are significantly different, they're stacked (single column)
            if abs(second_rect['y'] - first_rect['y']) > 50:
                print("   ✓ Products in single column layout")
                RESULTS["mobile"]["single_column"] = True
            else:
                log_issue("minor", "Mobile Layout", "Products not in single column")
                RESULTS["mobile"]["single_column"] = False

        page.screenshot(path="test_mobile_products.png")

    except Exception as e:
        log_issue("major", "Mobile Layout", f"Layout check failed: {str(e)}")
        RESULTS["mobile"]["single_column"] = False

    # Test touch interactions
    print("3. Testing touch interactions...")
    try:
        # Tap on first product
        product_cards = page.query_selector_all('.product-card, [class*="product"][class*="card"]')
        if product_cards and len(product_cards) > 0:
            product_cards[0].click()
            time.sleep(1)

            # Check if modal opened
            modal = page.query_selector('[role="dialog"], .modal, [class*="modal"]')
            if modal and modal.is_visible():
                print("   ✓ Modal opens on tap")
                page.screenshot(path="test_mobile_modal.png", full_page=True)
                RESULTS["mobile"]["modal_opens"] = True

                # Check if modal is full-screen
                modal_rect = modal.bounding_box()
                viewport_width = 390

                if modal_rect and modal_rect['width'] >= viewport_width * 0.9:
                    print("   ✓ Modal is full-screen on mobile")
                    RESULTS["mobile"]["modal_fullscreen"] = True
                else:
                    log_issue("minor", "Mobile Modal", "Modal not full-screen")
                    RESULTS["mobile"]["modal_fullscreen"] = False

                # Tap backdrop to close
                page.click('body', position={"x": 10, "y": 100})
                time.sleep(0.5)

                modal_after = page.query_selector('[role="dialog"], .modal, [class*="modal"]')
                if not modal_after or not modal_after.is_visible():
                    print("   ✓ Modal closes on backdrop tap")
                    RESULTS["mobile"]["modal_backdrop_works"] = True
                else:
                    log_issue("minor", "Mobile Modal", "Backdrop tap doesn't close modal")
                    RESULTS["mobile"]["modal_backdrop_works"] = False
            else:
                log_issue("major", "Mobile Modal", "Modal doesn't open on tap")
                RESULTS["mobile"]["modal_opens"] = False

    except Exception as e:
        log_issue("major", "Mobile Touch", f"Touch test failed: {str(e)}")
        RESULTS["mobile"]["modal_opens"] = False

    # Check tap target sizes
    print("4. Checking tap target sizes...")
    try:
        buttons = page.query_selector_all('button, a[role="button"]')
        small_targets = []

        for button in buttons[:10]:  # Check first 10 buttons
            rect = button.bounding_box()
            if rect and (rect['width'] < 44 or rect['height'] < 44):
                small_targets.append({
                    "text": button.text_content()[:30],
                    "size": f"{rect['width']}x{rect['height']}"
                })

        if small_targets:
            log_issue("minor", "Mobile Touch", f"Small tap targets found: {small_targets[:3]}")
            RESULTS["mobile"]["small_tap_targets"] = small_targets
        else:
            print("   ✓ Tap targets meet 44x44px minimum")
            RESULTS["mobile"]["small_tap_targets"] = []

    except Exception as e:
        log_issue("minor", "Mobile Touch", f"Tap target check failed: {str(e)}")

    # Check for mobile-specific issues
    print("5. Checking mobile-specific issues...")
    try:
        # Check for horizontal scroll
        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        client_width = page.evaluate("document.documentElement.clientWidth")

        if scroll_width > client_width + 10:
            log_issue("major", "Mobile Layout", f"Horizontal scroll on mobile: {scroll_width}px > {client_width}px")
            RESULTS["mobile"]["horizontal_scroll"] = True
        else:
            print("   ✓ No horizontal scroll on mobile")
            RESULTS["mobile"]["horizontal_scroll"] = False

    except Exception as e:
        log_issue("minor", "Mobile Visual", f"Mobile check failed: {str(e)}")

    print("✓ Mobile testing complete")


def run_tests():
    """Run all tests"""
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  COMPREHENSIVE PHASE 2 TESTING")
    print("  URL:", PRODUCTION_URL)
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Run desktop tests
            test_desktop(page)

            # Run mobile tests
            test_mobile(page)

        except Exception as e:
            log_issue("critical", "Test Suite", f"Test suite crashed: {str(e)}")

        finally:
            browser.close()

    # Save results
    with open("test_results_phase2.json", "w") as f:
        json.dump(RESULTS, f, indent=2)

    # Print summary
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  TEST SUMMARY")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"\nDesktop Results: {len([k for k, v in RESULTS['desktop'].items() if v is True])} passed")
    print(f"Mobile Results: {len([k for k, v in RESULTS['mobile'].items() if v is True])} passed")
    print(f"\nIssues Found: {len(RESULTS['issues'])}")

    if RESULTS["issues"]:
        print("\n━━━ ISSUES ━━━")
        for issue in RESULTS["issues"]:
            print(f"[{issue['severity'].upper()}] {issue['component']}: {issue['description']}")
    else:
        print("\n✓ No issues found!")

    print(f"\nFull results saved to: test_results_phase2.json")
    print("Screenshots saved to current directory")

    return RESULTS


if __name__ == "__main__":
    results = run_tests()
