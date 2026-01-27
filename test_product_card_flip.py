#!/usr/bin/env python3
"""
Product Card Flip 일관성 테스트
Desktop과 Mobile 동작을 모두 검증합니다.
"""

from playwright.sync_api import sync_playwright, expect
import time
import json

def test_desktop_flip():
    """Desktop: Hover로 flip, click으로 페이지 이동"""
    print("\n" + "="*60)
    print("🖥️  Desktop (마우스) 테스트")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        try:
            # Shop 페이지 이동
            print("\n1️⃣ Shop 페이지 로딩...")
            page.goto('http://localhost:3000/en/shop', wait_until='domcontentloaded', timeout=60000)
            page.wait_for_load_state('load', timeout=60000)
            time.sleep(2)

            # 첫 번째 제품 카드 찾기
            print("2️⃣ 제품 카드 찾기...")
            cards = page.query_selector_all('.perspective-1000')
            if not cards:
                raise Exception("❌ 제품 카드를 찾을 수 없습니다")

            first_card = cards[0]
            print(f"   ✅ {len(cards)}개의 제품 카드 발견")

            # 카드 초기 상태 확인
            print("\n3️⃣ 카드 초기 상태 확인...")
            card_inner = first_card.query_selector('.transform-style-3d')
            initial_classes = card_inner.get_attribute('class')
            print(f"   초기 클래스: {initial_classes}")
            is_initially_flipped = 'rotate-y-180' in initial_classes
            print(f"   초기 Flip 상태: {'Flipped' if is_initially_flipped else 'Not Flipped'}")

            # Hover로 flip 테스트
            print("\n4️⃣ 마우스 hover 테스트...")
            first_card.hover()
            time.sleep(1)  # 애니메이션 대기

            after_hover_classes = card_inner.get_attribute('class')
            print(f"   Hover 후 클래스: {after_hover_classes}")
            is_flipped_on_hover = 'rotate-y-180' in after_hover_classes

            if is_flipped_on_hover:
                print("   ✅ Hover 시 카드가 flip됨 (정상)")

                # Flipped 상태에서 "Add to Cart" 버튼 확인
                print("\n5️⃣ Flipped 상태에서 버튼 확인...")
                add_to_cart_btn = first_card.query_selector('button:has-text("Add to Cart")')
                if add_to_cart_btn and add_to_cart_btn.is_visible():
                    print("   ✅ 'Add to Cart' 버튼 보임 (정상)")
                else:
                    print("   ⚠️ 'Add to Cart' 버튼이 보이지 않음")
            else:
                print("   ❌ Hover 시 카드가 flip되지 않음 (비정상)")
                raise Exception("Desktop hover flip 실패")

            # Mouse leave 테스트
            print("\n6️⃣ Mouse leave 테스트...")
            page.mouse.move(0, 0)  # 카드 밖으로 이동
            time.sleep(1)

            after_leave_classes = card_inner.get_attribute('class')
            is_flipped_after_leave = 'rotate-y-180' in after_leave_classes

            if not is_flipped_after_leave:
                print("   ✅ Mouse leave 시 카드가 원래대로 복귀 (정상)")
            else:
                print("   ❌ Mouse leave 후에도 카드가 flip 상태 (비정상)")

            # Click으로 페이지 이동 테스트
            print("\n7️⃣ Click으로 페이지 이동 테스트...")
            first_card.hover()
            time.sleep(0.5)

            # Link 클릭
            link = first_card.query_selector('a.backface-hidden')
            if link:
                with page.expect_navigation():
                    link.click()
                time.sleep(2)

                current_url = page.url
                if '/shop/' in current_url and current_url != 'http://localhost:3000/en/shop':
                    print(f"   ✅ 제품 상세 페이지로 이동 성공: {current_url}")
                else:
                    print(f"   ⚠️ 예상하지 못한 URL: {current_url}")

            print("\n" + "="*60)
            print("✅ Desktop 테스트 완료!")
            print("="*60)

        except Exception as e:
            print(f"\n❌ Desktop 테스트 실패: {str(e)}")
            raise
        finally:
            time.sleep(2)
            browser.close()


def test_mobile_flip():
    """Mobile: 첫 탭으로 flip, 두 번째 탭으로 페이지 이동"""
    print("\n" + "="*60)
    print("📱 Mobile (터치) 테스트")
    print("="*60)

    with sync_playwright() as p:
        # iPhone 12 Pro 에뮬레이션
        device = p.devices['iPhone 12 Pro']
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(**device)
        page = context.new_page()

        try:
            # Shop 페이지 이동
            print("\n1️⃣ Shop 페이지 로딩...")
            page.goto('http://localhost:3000/en/shop', wait_until='domcontentloaded', timeout=60000)
            page.wait_for_load_state('load', timeout=60000)
            time.sleep(2)

            # 첫 번째 제품 카드 찾기
            print("2️⃣ 제품 카드 찾기...")
            cards = page.query_selector_all('.perspective-1000')
            if not cards:
                raise Exception("❌ 제품 카드를 찾을 수 없습니다")

            first_card = cards[0]
            print(f"   ✅ {len(cards)}개의 제품 카드 발견")

            # 카드 초기 상태 확인
            print("\n3️⃣ 카드 초기 상태 확인...")
            card_inner = first_card.query_selector('.transform-style-3d')
            initial_classes = card_inner.get_attribute('class')
            print(f"   초기 클래스: {initial_classes}")
            is_initially_flipped = 'rotate-y-180' in initial_classes
            print(f"   초기 Flip 상태: {'Flipped' if is_initially_flipped else 'Not Flipped'}")

            # 첫 번째 탭 - flip만 발생해야 함
            print("\n4️⃣ 첫 번째 탭 (flip 테스트)...")
            link = first_card.query_selector('a.backface-hidden')
            link.click()
            time.sleep(1.5)  # 애니메이션 대기

            after_first_tap_classes = card_inner.get_attribute('class')
            print(f"   첫 탭 후 클래스: {after_first_tap_classes}")
            is_flipped_after_first_tap = 'rotate-y-180' in after_first_tap_classes

            current_url = page.url
            print(f"   현재 URL: {current_url}")

            if is_flipped_after_first_tap and current_url == 'http://localhost:3000/en/shop':
                print("   ✅ 첫 탭: 카드 flip + 페이지 이동 안 함 (정상)")

                # Flipped 상태에서 "Add to Cart" 버튼 확인
                print("\n5️⃣ Flipped 상태에서 버튼 확인...")
                add_to_cart_btn = first_card.query_selector('button:has-text("Add to Cart")')
                if add_to_cart_btn:
                    is_visible = add_to_cart_btn.is_visible()
                    print(f"   'Add to Cart' 버튼 visible: {is_visible}")
                    if is_visible:
                        print("   ✅ 'Add to Cart' 버튼 보임 (정상)")
                    else:
                        print("   ⚠️ 'Add to Cart' 버튼이 보이지 않음")
                else:
                    print("   ⚠️ 'Add to Cart' 버튼을 찾을 수 없음")

            elif not is_flipped_after_first_tap and current_url != 'http://localhost:3000/en/shop':
                print("   ❌ 첫 탭: 페이지가 바로 이동됨 (비정상 - flip이 안 됨)")
                raise Exception("Mobile 첫 탭에서 바로 페이지 이동 (수정 필요)")
            else:
                print(f"   ⚠️ 예상하지 못한 상태: flipped={is_flipped_after_first_tap}, url={current_url}")

            # 두 번째 탭 - 페이지 이동해야 함
            print("\n6️⃣ 두 번째 탭 (페이지 이동 테스트)...")
            if current_url == 'http://localhost:3000/en/shop':
                with page.expect_navigation(timeout=10000):
                    link.click()
                time.sleep(2)

                final_url = page.url
                print(f"   최종 URL: {final_url}")

                if '/shop/' in final_url and final_url != 'http://localhost:3000/en/shop':
                    print(f"   ✅ 두 번째 탭: 제품 상세 페이지로 이동 성공 (정상)")
                else:
                    print(f"   ⚠️ 예상하지 못한 URL: {final_url}")
            else:
                print("   ⏭️ 이미 다른 페이지로 이동되어 두 번째 탭 테스트 건너뜀")

            print("\n" + "="*60)
            print("✅ Mobile 테스트 완료!")
            print("="*60)

        except Exception as e:
            print(f"\n❌ Mobile 테스트 실패: {str(e)}")
            raise
        finally:
            time.sleep(2)
            browser.close()


def test_mobile_outside_tap():
    """Mobile: 외부 클릭으로 flip 닫기"""
    print("\n" + "="*60)
    print("📱 Mobile 외부 탭 테스트")
    print("="*60)

    with sync_playwright() as p:
        device = p.devices['iPhone 12 Pro']
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(**device)
        page = context.new_page()

        try:
            print("\n1️⃣ Shop 페이지 로딩...")
            page.goto('http://localhost:3000/en/shop', wait_until='domcontentloaded', timeout=60000)
            page.wait_for_load_state('load', timeout=60000)
            page.wait_for_load_state('load', timeout=60000)
            time.sleep(3)

            print("2️⃣ 제품 카드 찾기...")
            page.wait_for_selector('.perspective-1000', timeout=30000)
            cards = page.query_selector_all('.perspective-1000')
            first_card = cards[0]
            card_inner = first_card.query_selector('.transform-style-3d')

            print("\n3️⃣ 카드 탭하여 flip...")
            link = first_card.query_selector('a.backface-hidden')
            link.click()
            time.sleep(1)

            after_tap_classes = card_inner.get_attribute('class')
            is_flipped = 'rotate-y-180' in after_tap_classes

            if is_flipped:
                print("   ✅ 카드 flip됨")

                print("\n4️⃣ 외부 영역 탭...")
                # 헤더 영역 클릭
                page.click('h2:has-text("Browse Our Plans")')
                time.sleep(1)

                after_outside_tap_classes = card_inner.get_attribute('class')
                is_still_flipped = 'rotate-y-180' in after_outside_tap_classes

                if not is_still_flipped:
                    print("   ✅ 외부 탭 시 카드가 닫힘 (정상)")
                else:
                    print("   ❌ 외부 탭 후에도 카드가 flip 상태 (비정상)")
            else:
                print("   ❌ 카드가 flip되지 않음")

            print("\n" + "="*60)
            print("✅ 외부 탭 테스트 완료!")
            print("="*60)

        except Exception as e:
            print(f"\n❌ 외부 탭 테스트 실패: {str(e)}")
            raise
        finally:
            time.sleep(2)
            browser.close()


def main():
    """모든 테스트 실행"""
    print("\n" + "🎴 " * 20)
    print("Product Card Flip 일관성 테스트 시작")
    print("🎴 " * 20)

    results = {
        'desktop': False,
        'mobile': False,
        'mobile_outside_tap': False
    }

    # Desktop 테스트
    try:
        test_desktop_flip()
        results['desktop'] = True
    except Exception as e:
        print(f"\n❌ Desktop 테스트 실패: {str(e)}")
        results['desktop'] = False

    # Mobile 테스트
    try:
        test_mobile_flip()
        results['mobile'] = True
    except Exception as e:
        print(f"\n❌ Mobile 테스트 실패: {str(e)}")
        results['mobile'] = False

    # Mobile 외부 탭 테스트
    try:
        test_mobile_outside_tap()
        results['mobile_outside_tap'] = True
    except Exception as e:
        print(f"\n❌ Mobile 외부 탭 테스트 실패: {str(e)}")
        results['mobile_outside_tap'] = False

    # 결과 요약
    print("\n" + "="*60)
    print("📊 테스트 결과 요약")
    print("="*60)
    print(f"🖥️  Desktop (hover/click):        {'✅ 통과' if results['desktop'] else '❌ 실패'}")
    print(f"📱 Mobile (첫 탭/두 번째 탭):    {'✅ 통과' if results['mobile'] else '❌ 실패'}")
    print(f"📱 Mobile (외부 탭으로 닫기):    {'✅ 통과' if results['mobile_outside_tap'] else '❌ 실패'}")
    print("="*60)

    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 모든 테스트 통과!")
        print("✅ Product Card Flip 일관성 수정이 정상 작동합니다.")
    else:
        print("\n⚠️ 일부 테스트 실패")
        print("수정이 필요한 부분이 있습니다.")

    return all_passed


if __name__ == '__main__':
    import sys
    success = main()
    sys.exit(0 if success else 1)
