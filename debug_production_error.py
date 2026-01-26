#!/usr/bin/env python3
"""
Debug production client-side error by capturing browser console logs.
"""

from playwright.sync_api import sync_playwright
import json
from datetime import datetime

PRODUCTION_URL = "https://82mobile-next.vercel.app"

def capture_console_errors(page):
    """Capture all console messages"""
    console_logs = []
    errors = []

    def handle_console(msg):
        log_entry = {
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        }
        console_logs.append(log_entry)
        if msg.type == 'error':
            errors.append(log_entry)
            print(f"[CONSOLE ERROR] {msg.text}")

    def handle_page_error(error):
        error_info = {
            'message': str(error),
            'timestamp': datetime.now().isoformat()
        }
        errors.append(error_info)
        print(f"[PAGE ERROR] {error}")

    page.on('console', handle_console)
    page.on('pageerror', handle_page_error)

    return console_logs, errors

def main():
    print("=" * 80)
    print("DEBUGGING PRODUCTION CLIENT-SIDE ERROR")
    print("=" * 80)

    with sync_playwright() as p:
        # Launch browser with devtools open
        browser = p.chromium.launch(
            headless=False,
            args=['--auto-open-devtools-for-tabs']
        )

        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        page = context.new_page()

        # Set up console and error capturing
        console_logs, errors = capture_console_errors(page)

        print(f"\n🔍 Loading: {PRODUCTION_URL}")
        print("Waiting for errors to appear...\n")

        try:
            # Navigate and wait for network idle
            page.goto(PRODUCTION_URL, wait_until='networkidle', timeout=30000)

            # Wait a bit to ensure all errors are captured
            page.wait_for_timeout(5000)

            # Try to check if React hydrated
            page.wait_for_timeout(2000)

            # Get HTML content
            html_content = page.content()

            # Save results
            results = {
                'timestamp': datetime.now().isoformat(),
                'url': PRODUCTION_URL,
                'console_logs': console_logs,
                'errors': errors,
                'page_title': page.title(),
                'has_error_message': 'Application error' in html_content
            }

            with open('production_error_debug.json', 'w') as f:
                json.dump(results, f, indent=2)

            # Take screenshot
            page.screenshot(path='production_error_screenshot.png', full_page=True)

            print("\n" + "=" * 80)
            print("RESULTS")
            print("=" * 80)
            print(f"Total console logs: {len(console_logs)}")
            print(f"Total errors: {len(errors)}")
            print(f"Page title: {page.title()}")
            print(f"Has 'Application error' message: {results['has_error_message']}")

            if errors:
                print("\n🚨 ERRORS CAPTURED:")
                for i, error in enumerate(errors, 1):
                    print(f"\n[{i}] {json.dumps(error, indent=2)}")
            else:
                print("\n✅ No errors captured (unexpected)")

            print("\n📁 Saved to: production_error_debug.json")
            print("📸 Screenshot: production_error_screenshot.png")

            # Keep browser open for manual inspection
            print("\n⏸️  Browser will stay open for 60 seconds for manual inspection...")
            page.wait_for_timeout(60000)

        except Exception as e:
            print(f"\n❌ Error during debugging: {e}")
            page.screenshot(path='production_error_exception.png', full_page=True)

        finally:
            browser.close()

if __name__ == "__main__":
    main()
