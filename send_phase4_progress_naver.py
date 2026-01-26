#!/usr/bin/env python3
"""
Send Phase 4 completion progress update via Naver email
Fallback when Gmail daily limit is exceeded
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Naver credentials
NAVER_EMAIL = 'jyongchul@naver.com'
NAVER_APP_PASSWORD = 'B1ZFJEQLQFRR'
CUSTOMER_EMAIL = 'jyongchul@gmail.com'  # Same recipient

def send_naver_email():
    """Send HTML email progress update via Naver SMTP"""

    # Create HTML email with INLINE CSS (standing order requirement)
    html_content = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Malgun Gothic', Arial, sans-serif; background-color: #f5f5f5;">
    <table style="width: 100%; max-width: 1000px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <img src="https://whmarketing.org/images/logo.png" alt="Whitehat Marketing" style="height: 60px; margin-bottom: 20px;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">82Mobile 프로젝트 진행 상황</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 0 0 20px 0;">
                    안녕하세요, 하얀모자마케팅 이종철입니다.
                </p>

                <h2 style="font-size: 22px; color: #c8102e; margin: 30px 0 20px 0; border-bottom: 2px solid #c8102e; padding-bottom: 10px;">
                    ✅ Phase 4 완료: 체크아웃 플로우
                </h2>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="font-size: 18px; color: #0047ba; margin: 0 0 15px 0;">구현 완료 기능</h3>
                    <ul style="font-size: 16px; line-height: 2; color: #333333; margin: 0; padding-left: 25px;">
                        <li><strong>게스트 체크아웃</strong>: 회원가입 없이 주문 가능 (customer_id: 0)</li>
                        <li><strong>폼 검증</strong>: Zod + react-hook-form 통합</li>
                        <li><strong>결제 연동</strong>: PortOne/Eximbay 인프라 구축 완료</li>
                        <li><strong>주문 확인 페이지</strong>: eSIM QR 코드 표시 기능</li>
                    </ul>
                </div>

                <h2 style="font-size: 22px; color: #00a896; margin: 30px 0 20px 0; border-bottom: 2px solid #00a896; padding-bottom: 10px;">
                    📊 전체 진행 상황
                </h2>

                <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; font-size: 16px; color: #333333; border-bottom: 1px solid #e0e0e0;">
                                <strong>완료된 Phase</strong>
                            </td>
                            <td style="padding: 10px; font-size: 16px; color: #333333; text-align: right; border-bottom: 1px solid #e0e0e0;">
                                4 / 7 (57%)
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-size: 16px; color: #333333; border-bottom: 1px solid #e0e0e0;">
                                <strong>완료된 계획</strong>
                            </td>
                            <td style="padding: 10px; font-size: 16px; color: #333333; text-align: right; border-bottom: 1px solid #e0e0e0;">
                                17 / 30
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-size: 16px; color: #333333;">
                                <strong>진행률</strong>
                            </td>
                            <td style="padding: 10px; font-size: 16px; color: #333333; text-align: right;">
                                <div style="background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); width: 57%; height: 100%;"></div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <h2 style="font-size: 22px; color: #c8102e; margin: 30px 0 20px 0; border-bottom: 2px solid #c8102e; padding-bottom: 10px;">
                    📅 일정 현황
                </h2>

                <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
                    <ul style="font-size: 16px; line-height: 2; color: #333333; margin: 0; padding-left: 25px;">
                        <li><strong>2월 2일 (일)</strong>: 웹사이트 런칭 (결제 없이 주문 생성 가능)</li>
                        <li><strong>2월 7일 (금)</strong>: 결제 게이트웨이 활성화 (PortOne 연동)</li>
                    </ul>
                </div>

                <h2 style="font-size: 22px; color: #0047ba; margin: 30px 0 20px 0; border-bottom: 2px solid #0047ba; padding-bottom: 10px;">
                    ⚠️ 필요 조치 사항
                </h2>

                <div style="background-color: #ffe5e5; padding: 20px; border-radius: 8px; border-left: 4px solid #c8102e; margin-bottom: 25px;">
                    <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 0 0 15px 0;">
                        <strong>PortOne 계정 가입이 필요합니다</strong>
                    </p>
                    <ol style="font-size: 16px; line-height: 2; color: #333333; margin: 0; padding-left: 25px;">
                        <li>PortOne 가입: <a href="https://portone.io/korea/en" style="color: #0047ba; text-decoration: none;">https://portone.io/korea/en</a></li>
                        <li>인증 정보 받기: STORE_ID, CHANNEL_KEY, API_SECRET</li>
                        <li>2월 7일까지 제공 (결제 게이트웨이 활성화 위해)</li>
                    </ol>
                </div>

                <h2 style="font-size: 22px; color: #00a896; margin: 30px 0 20px 0; border-bottom: 2px solid #00a896; padding-bottom: 10px;">
                    🚀 다음 단계
                </h2>

                <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 0;">
                        <strong>Phase 5: 모바일 최적화</strong><br>
                        - Sticky CTA 버튼<br>
                        - 성능 튜닝 (LCP < 3초)<br>
                        - 애니메이션 최적화<br>
                        - 터치 타겟 최적화
                    </p>
                </div>

                <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 30px 0 0 0;">
                    문의 사항이 있으시면 언제든 연락 주세요.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
                <img src="https://whmarketing.org/images/logo.png" alt="Whitehat Marketing" style="height: 40px; margin-bottom: 15px;">
                <p style="font-size: 16px; color: #333333; margin: 0 0 5px 0; font-weight: 600;">
                    이종철 (Lee Jyong Chul)
                </p>
                <p style="font-size: 14px; color: #666666; margin: 0 0 15px 0;">
                    (주)하얀모자마케팅 대표
                </p>
                <p style="font-size: 14px; line-height: 1.8; color: #666666; margin: 0;">
                    📧 <a href="mailto:jyongchul@naver.com" style="color: #0047ba; text-decoration: none;">jyongchul@naver.com</a><br>
                    📞 010-9333-2028<br>
                    💬 카카오톡: jyongchul<br>
                    🌐 <a href="https://whmarketing.org" style="color: #0047ba; text-decoration: none;">https://whmarketing.org</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    msg = MIMEMultipart('alternative')
    msg['Subject'] = '[82Mobile] Phase 4 완료 - 체크아웃 플로우 구현 완료'
    msg['From'] = NAVER_EMAIL
    msg['To'] = CUSTOMER_EMAIL
    msg['Date'] = datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0900')

    html_part = MIMEText(html_content, 'html', 'utf-8')
    msg.attach(html_part)

    try:
        # Naver uses SMTP_SSL (port 465), not STARTTLS
        print("📧 네이버 SMTP 서버 연결 중...")
        with smtplib.SMTP_SSL('smtp.naver.com', 465) as server:
            print(f"🔐 로그인 중... ({NAVER_EMAIL})")
            server.login(NAVER_EMAIL, NAVER_APP_PASSWORD)

            print(f"📤 이메일 전송 중...")
            server.send_message(msg)

        print("\n✅ 이메일 발송 성공!")
        return True
    except smtplib.SMTPAuthenticationError:
        print("\n❌ 인증 실패!")
        print("\n💡 해결 방법:")
        print("   1. 네이버 메일 → 환경설정 → POP3/IMAP 설정")
        print("   2. 'IMAP/SMTP 사용' 체크")
        print("   3. 앱 비밀번호 확인: B1ZFJEQLQFRR")
        return False
    except Exception as e:
        print(f"\n❌ 이메일 발송 실패: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("82Mobile Phase 4 진행 상황 알림 (네이버 이메일)")
    print("=" * 60)
    print("\n네이버 SMTP를 통해 이메일 발송 중...")

    result = send_naver_email()

    print("\n" + "=" * 60)
    print(f"이메일 발송 결과: {'✓ 성공' if result else '✗ 실패'}")
    print("=" * 60)
