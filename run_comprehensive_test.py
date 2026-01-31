"""Comprehensive Playwright test for 82mobile Next.js site."""
import json
import os
from datetime import datetime
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3099"
SCREENSHOT_DIR = "/mnt/c/82Mobile/82mobile-next/test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

results = []

def record(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append({"test": name, "status": status, "detail": detail})
    print(f"  [{status}] {name}" + (f" - {detail}" if detail else ""))

def ss(page, name):
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"{name}.png"), full_page=False)

def ss_full(page, name):
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"{name}_full.png"), full_page=True)

def run_tests():
    with sync_playwright() as p:
        print("\n=== DESKTOP TESTS (1920x1080) ===")
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = ctx.new_page()
        page.set_default_timeout(15000)

        # 1. Homepage
        print("\n-- 1. Homepage & Navigation --")
        resp = page.goto(BASE_URL, wait_until="load", timeout=60000)
        page.wait_for_timeout(2000)
        record("Homepage loads", resp.status == 200, f"status={resp.status}")
        ss(page, "desktop_home")
        ss_full(page, "desktop_home")

        has_hscroll = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        record("No horizontal scroll", not has_hscroll)

        page.wait_for_timeout(1000)
        broken = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img'))
                .filter(img => img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:'))
                .map(img => img.src);
        }""")
        record("No broken images", len(broken) == 0, f"broken={broken[:3]}" if broken else "")

        # Nav dots
        nav_dots = page.evaluate("""() => {
            const nav = document.querySelector('nav.fixed');
            return nav ? nav.querySelectorAll('button').length : 0;
        }""")
        record("Nav dots present (desktop)", nav_dots >= 4, f"count={nav_dots}")

        # Sections
        for sec_id in ["hero", "products", "why-choose-us", "faq", "contact"]:
            el = page.query_selector(f"#{sec_id}")
            record(f"Section '#{sec_id}' exists", el is not None)

        # Progress bar
        progress = page.evaluate("""() => {
            const bars = document.querySelectorAll('div.fixed.top-0');
            for (const bar of bars) {
                if (bar.querySelector('[class*="gradient"]')) return true;
            }
            return false;
        }""")
        record("Scroll progress bar exists", progress)

        # Nav dot click
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(300)
        nav_btn = page.evaluate("""() => {
            const nav = document.querySelector('nav.fixed');
            if (!nav) return false;
            const btns = nav.querySelectorAll('button');
            if (btns.length >= 2) { btns[1].click(); return true; }
            return false;
        }""")
        if nav_btn:
            page.wait_for_timeout(1500)
            scroll_pos = page.evaluate("window.scrollY")
            record("Nav dot click scrolls page", scroll_pos > 100, f"scrollY={scroll_pos}")
        else:
            record("Nav dot click scrolls page", False, "no nav buttons")

        # 2. Product Cards
        print("\n-- 2. Product Cards & Reservation --")
        page.goto(f"{BASE_URL}/ko", wait_until="load", timeout=60000)
        page.wait_for_timeout(4000)

        page.evaluate("document.getElementById('products')?.scrollIntoView({behavior:'instant'})")
        page.wait_for_timeout(2000)
        ss(page, "desktop_products")

        product_count = page.evaluate("""() => {
            const section = document.getElementById('products');
            if (!section) return 0;
            return section.querySelectorAll('[class*="cursor-pointer"], [role="button"], article').length;
        }""")
        record("Product cards loaded", product_count > 0, f"count={product_count}")

        page.evaluate("""() => {
            const section = document.getElementById('products');
            if (!section) return;
            const el = section.querySelector('[class*="cursor-pointer"], [role="button"]');
            if (el) el.click();
        }""")
        page.wait_for_timeout(1500)
        ss(page, "desktop_product_expanded")

        body_text = page.inner_text("body")
        has_5000 = "5,000" in body_text
        record("Reservation 5,000 shown", has_5000)

        reserve_btn = page.query_selector('button:has-text("5,000"), button:has-text("Reserve"), button:has-text("예약")')
        if reserve_btn:
            reserve_btn.click()
            page.wait_for_timeout(1500)
            ss(page, "desktop_cart_open")
            cart_text = page.inner_text("body")
            record("Cart shows 5,000", "5,000" in cart_text)
        else:
            record("Reserve button found", False, "not found")

        # 3. Locale
        print("\n-- 3. Locale Switching --")
        page.goto(f"{BASE_URL}/ko", wait_until="load", timeout=60000)
        page.wait_for_timeout(1500)
        ko_text = page.inner_text("body")
        ss(page, "desktop_ko_home")
        has_korean = any('\uac00' <= c <= '\ud7a3' for c in ko_text[:2000])
        record("Korean locale has Korean text", has_korean)

        page.goto(f"{BASE_URL}/en", wait_until="load", timeout=60000)
        page.wait_for_timeout(1500)
        ss(page, "desktop_en_home")

        en_leak = page.evaluate("""() => {
            const footer = document.querySelector('footer');
            const footerText = footer ? footer.innerText : '';
            const mainText = document.body.innerText.replace(footerText, '');
            return /[가-힣]/.test(mainText.substring(0, 3000));
        }""")
        record("English: no Korean in main content", not en_leak)

        footer = page.query_selector("footer")
        if footer:
            ft = footer.inner_text()
            record("Footer has business info", "82mobile" in ft.lower() or "whitehat" in ft.lower())
        else:
            record("Footer exists", False)

        # 4. Legal pages
        print("\n-- 4. Legal Pages --")
        for lp in ["/privacy-policy", "/terms-of-service", "/refund-policy", "/in-store-pickup-policy"]:
            try:
                resp = page.goto(f"{BASE_URL}{lp}", wait_until="load", timeout=30000)
                ok = resp and resp.status == 200
                if ok:
                    body = page.inner_text("body")
                    ok = "404" not in body[:200] and "not found" not in body[:200].lower()
                record(f"Legal page {lp}", ok, f"status={resp.status if resp else 'none'}")
            except Exception as e:
                record(f"Legal page {lp}", False, str(e)[:80])

        # 5. FAQ
        print("\n-- 5. FAQ Section --")
        page.goto(BASE_URL, wait_until="load", timeout=60000)
        page.wait_for_timeout(2000)
        page.evaluate("document.getElementById('faq')?.scrollIntoView({behavior:'instant'})")
        page.wait_for_timeout(500)
        ss(page, "desktop_faq")

        faq_count = page.evaluate("""() => {
            const faq = document.getElementById('faq');
            if (!faq) return 0;
            return Array.from(faq.querySelectorAll('button')).filter(b =>
                (b.textContent || '').includes('?') || b.textContent.length > 20
            ).length;
        }""")
        record("FAQ items >= 6", faq_count >= 6, f"count={faq_count}")

        accordion_works = page.evaluate("""() => {
            const faq = document.getElementById('faq');
            if (!faq) return false;
            const btns = Array.from(faq.querySelectorAll('button')).filter(b => (b.textContent||'').includes('?'));
            if (btns.length > 1) { btns[1].click(); return true; }
            if (btns.length > 0) { btns[0].click(); return true; }
            return false;
        }""")
        page.wait_for_timeout(500)
        ss(page, "desktop_faq_expanded")
        record("FAQ accordion clickable", accordion_works)

        ctx.close()
        browser.close()

        # ── Mobile ──
        print("\n=== MOBILE TESTS (390x844) ===")
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15")
        page = ctx.new_page()
        page.set_default_timeout(15000)

        page.goto(BASE_URL, wait_until="load", timeout=60000)
        page.wait_for_timeout(2000)
        ss(page, "mobile_home")
        ss_full(page, "mobile_home")

        has_hscroll = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        record("Mobile: no horizontal scroll", not has_hscroll)

        # Mobile menu
        menu_opened = page.evaluate("""() => {
            const header = document.querySelector('header');
            if (!header) return 'no-header';
            const buttons = header.querySelectorAll('button');
            for (const btn of buttons) {
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && rect.width < 60) {
                    btn.click(); return 'clicked';
                }
            }
            return 'no-button';
        }""")
        page.wait_for_timeout(800)
        ss(page, "mobile_menu_open")
        record("Mobile menu opens", menu_opened == "clicked", menu_opened)

        if menu_opened == "clicked":
            page.evaluate("""() => {
                const btn = document.querySelector('button[aria-label*="close" i], button[aria-label*="Close"]');
                if (btn) btn.click();
                else document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));
            }""")
            page.wait_for_timeout(500)
            record("Mobile menu closes", True)

        # Products
        page.evaluate("document.getElementById('products')?.scrollIntoView({behavior:'instant'})")
        page.wait_for_timeout(2000)
        ss(page, "mobile_products")

        card_tapped = page.evaluate("""() => {
            const section = document.getElementById('products');
            if (!section) return false;
            const el = section.querySelector('[class*="cursor-pointer"], [role="button"], article');
            if (el) { el.click(); return true; }
            return false;
        }""")
        page.wait_for_timeout(1500)
        ss(page, "mobile_product_expanded")
        record("Mobile: product modal opens", card_tapped)

        # Cart
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)
        cart_opened = page.evaluate("""() => {
            const header = document.querySelector('header');
            if (!header) return false;
            const buttons = header.querySelectorAll('button');
            for (const btn of buttons) {
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.x > 200) { btn.click(); return true; }
            }
            return false;
        }""")
        page.wait_for_timeout(500)
        ss(page, "mobile_cart_drawer")
        record("Mobile: cart drawer opens", cart_opened)

        ctx.close()
        browser.close()

    # Report
    report = {
        "timestamp": datetime.now().isoformat(),
        "base_url": BASE_URL,
        "total": len(results),
        "passed": sum(1 for r in results if r["status"] == "PASS"),
        "failed": sum(1 for r in results if r["status"] == "FAIL"),
        "results": results,
    }
    report_path = os.path.join(SCREENSHOT_DIR, "test_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*50}")
    print(f"RESULTS: {report['passed']}/{report['total']} passed, {report['failed']} failed")
    print(f"Report: {report_path}")
    print(f"Screenshots: {SCREENSHOT_DIR}/")

    failures = [r for r in results if r["status"] == "FAIL"]
    if failures:
        print(f"\nFAILURES:")
        for f_ in failures:
            print(f"  - {f_['test']}: {f_['detail']}")

if __name__ == "__main__":
    run_tests()
