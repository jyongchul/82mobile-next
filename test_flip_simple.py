#!/usr/bin/env python3
"""간단한 Product Card Flip 테스트 - 스크린샷으로 확인"""

from playwright.sync_api import sync_playwright
import time

def test_simple():
    print("\n" + "="*60)
    print("📸 Product Card Flip 시각적 테스트")
    print("="*60)

    with sync_playwright() as p:
        # Headless=False로 브라우저를 보면서 테스트
        browser = p.chromium.launch(headless=False, slow_mo=1000)

        print("\n🖥️  Desktop 테스트...")
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            print("1. Shop 페이지 로딩...")
            page.goto('http://localhost:3000/en/shop', timeout=60000)
            page.wait_for_timeout(5000)  # 5초 대기

            print("2. 제품 카드 찾기...")
            # 더 구체적인 selector 사용
            cards = page.locator('a[href*="/shop/"]').first

            if cards:
                print("   ✅ 카드 발견!")

                print("3. 초기 상태 스크린샷...")
                page.screenshot(path='/mnt/c/82Mobile/test_1_initial.png', full_page=True)

                print("4. 카드 hover...")
                cards.hover()
                page.wait_for_timeout(1500)

                print("5. Hover 상태 스크린샷...")
                page.screenshot(path='/mnt/c/82Mobile/test_2_hover.png', full_page=True)

                print("\n✅ Desktop 테스트 완료!")
                print(f"   스크린샷 저장:")
                print(f"   - /mnt/c/82Mobile/test_1_initial.png")
                print(f"   - /mnt/c/82Mobile/test_2_hover.png")

        except Exception as e:
            print(f"❌ 오류: {str(e)}")
            page.screenshot(path='/mnt/c/82Mobile/test_error.png')

        finally:
            time.sleep(3)

        print("\n📱 Mobile 테스트...")
        mobile_context = browser.new_context(
            **p.devices['iPhone 12 Pro']
        )
        mobile_page = mobile_context.new_page()

        try:
            print("1. Shop 페이지 로딩...")
            mobile_page.goto('http://localhost:3000/en/shop', timeout=60000)
            mobile_page.wait_for_timeout(5000)

            print("2. 초기 상태 스크린샷...")
            mobile_page.screenshot(path='/mnt/c/82Mobile/test_3_mobile_initial.png', full_page=True)

            print("3. 카드 탭...")
            cards_mobile = mobile_page.locator('a[href*="/shop/"]').first
            if cards_mobile:
                cards_mobile.click()
                mobile_page.wait_for_timeout(1500)

                print("4. 첫 탭 후 스크린샷...")
                mobile_page.screenshot(path='/mnt/c/82Mobile/test_4_mobile_tap.png', full_page=True)

                print("\n✅ Mobile 테스트 완료!")
                print(f"   스크린샷 저장:")
                print(f"   - /mnt/c/82Mobile/test_3_mobile_initial.png")
                print(f"   - /mnt/c/82Mobile/test_4_mobile_tap.png")

        except Exception as e:
            print(f"❌ 오류: {str(e)}")
            mobile_page.screenshot(path='/mnt/c/82Mobile/test_mobile_error.png')

        finally:
            print("\n브라우저를 10초 후 닫습니다...")
            time.sleep(10)
            browser.close()

        print("\n" + "="*60)
        print("✅ 테스트 완료! 스크린샷을 확인하세요.")
        print("="*60)

if __name__ == '__main__':
    test_simple()
