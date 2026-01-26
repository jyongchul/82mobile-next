#!/usr/bin/env python3
"""
Send customer progress update email for 82Mobile project
Date: 2026-01-26
Recipient: 권아담 (adamwoohaha@naver.com)
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from datetime import datetime
import os

# Email configuration
SENDER_EMAIL = "jyongchul@gmail.com"
SENDER_PASSWORD = "yhuejeulam hvuwno".replace(" ", "")  # App password (spaces removed)
RECIPIENT_EMAIL = "adamwoohaha@naver.com"
CC_EMAIL = "jyongchul@naver.com"

# Company logo path
LOGO_PATH = "/mnt/c/하얀모자마케팅-로고 251021.png"

def create_email_html():
    """Create HTML email with inline CSS"""
    html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: white; border-radius: 8px;">
        <img src="cid:logo" alt="하얀모자마케팅" style="max-width: 200px; height: auto;">
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #c8102e; font-size: 28px; margin-bottom: 10px; border-bottom: 3px solid #c8102e; padding-bottom: 10px;">
            82Mobile 웹사이트 개발 진행상황 보고
        </h1>

        <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            <strong>날짜:</strong> 2026년 1월 26일<br>
            <strong>수신:</strong> 권아담 고객님 (Adam Korea Simcard)<br>
            <strong>발신:</strong> 이종철 (하얀모자마케팅)
        </p>

        <!-- Progress Section -->
        <div style="background-color: #f0f8ff; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #0047ba;">
            <h2 style="color: #0047ba; font-size: 22px; margin-top: 0;">📊 현재 진행상황</h2>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <p style="font-size: 20px; font-weight: bold; color: #c8102e; margin: 0;">
                    전체 진행률: 43% 완료 (13/30 계획 완료)
                </p>
                <div style="background-color: #e0e0e0; height: 30px; border-radius: 15px; margin-top: 15px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: 43%; border-radius: 15px; transition: width 0.3s;"></div>
                </div>
            </div>

            <h3 style="color: #00a896; font-size: 18px; margin-bottom: 15px;">✅ 완료된 단계 (Phases 1-3)</h3>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #667eea; color: white;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">단계</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">명칭</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">상태</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">완료 계획</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">1단계</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">기본 구조 및 네비게이션</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">✅ 완료</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">4/4</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">2단계</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">상품 탐색 기능</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">✅ 완료</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">6/6</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">3단계</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">장바구니 및 사이드 드로어</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">✅ 완료</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">3/3</td>
                    </tr>
                </tbody>
            </table>

            <div style="background-color: white; padding: 20px; border-radius: 6px; border-left: 4px solid #00a896;">
                <h4 style="color: #00a896; margin-top: 0;">오늘 완료된 작업 (1월 26일)</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">✅ 장바구니 슬라이드 드로어 완성 (데스크탑: 오른쪽에서, 모바일: 하단에서 슬라이드)</li>
                    <li style="margin-bottom: 10px;">✅ 장바구니/결제 화면 전환 기능 추가</li>
                    <li style="margin-bottom: 10px;">✅ 헤더 통합 및 자동 열림 기능 구현</li>
                    <li style="margin-bottom: 10px;">✅ 상품 추가 시 장바구니 자동 표시</li>
                    <li style="margin-bottom: 10px;">✅ 반응형 애니메이션 완성</li>
                </ul>

                <p style="margin-top: 20px; font-size: 16px;">
                    <strong>실제 동작 확인 가능:</strong>
                    <a href="https://82mobile-next.vercel.app" style="color: #0047ba; text-decoration: none; font-weight: bold;">
                        https://82mobile-next.vercel.app
                    </a>
                </p>
            </div>
        </div>

        <!-- Timeline Section -->
        <div style="background-color: #fff3e0; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ff9800;">
            <h2 style="color: #ff9800; font-size: 22px; margin-top: 0;">📅 일정 안내</h2>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #c8102e; font-size: 20px; margin-top: 0;">
                    웹사이트 기본 기능 완성: 이번 주 일요일 (2026년 2월 2일)
                </h3>

                <p style="font-size: 16px; margin-bottom: 15px;"><strong>남은 단계 (4-7단계):</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;"><strong>4단계:</strong> 결제 플로우 구현 (~5개 계획)</li>
                    <li style="margin-bottom: 10px;"><strong>5단계:</strong> 모바일 최적화 (~4개 계획)</li>
                    <li style="margin-bottom: 10px;"><strong>6단계:</strong> 성능 및 분석 (~5개 계획)</li>
                    <li style="margin-bottom: 10px;"><strong>7단계:</strong> 다국어 정리 (~3개 계획)</li>
                </ul>

                <div style="background-color: #f0f8ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
                    <p style="margin: 0; font-size: 16px;"><strong>예상 완료:</strong></p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">기본 웹사이트 기능: <strong style="color: #c8102e;">2026년 2월 2일 (일요일)</strong> 목표</li>
                        <li>결제 게이트웨이 연동: <strong style="color: #ff9800;">2026년 2월 7일</strong> 까지 (고객님 작업 필요)</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Action Items Section -->
        <div style="background-color: #ffebee; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #c8102e;">
            <h2 style="color: #c8102e; font-size: 22px; margin-top: 0;">⚠️ 고객님께서 준비하셔야 할 사항</h2>

            <!-- Eximbay -->
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #0047ba; font-size: 18px; margin-top: 0;">1. 🏦 Eximbay 결제 게이트웨이 가입</h3>

                <p><strong>Eximbay를 선택한 이유:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">외국인 관광객 타겟 사업에 최적화된 해외카드 전문 결제 시스템</li>
                    <li style="margin-bottom: 8px;">Visa, Mastercard, UnionPay, JCB, AMEX 등 주요 해외카드 지원</li>
                    <li style="margin-bottom: 8px;">다국적 통화 지원 (USD, CNY, JPY 등)</li>
                </ul>

                <p><strong>준비 서류:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>사업자등록증</li>
                    <li>통장사본</li>
                    <li>대표자 신분증</li>
                    <li>심사 기간: 약 3-5영업일</li>
                </ul>

                <p><strong>가입 후 필요한 정보:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace; margin: 10px 0;">
                    EXIMBAY_MID (Merchant ID)<br>
                    EXIMBAY_SECRET_KEY (API Secret Key)
                </div>
                <p style="color: #c8102e; font-weight: bold;">→ 이 정보를 받으시면 이종철에게 전달 부탁드립니다.</p>

                <p style="margin-top: 15px;">
                    <strong>Eximbay 가입 링크:</strong>
                    <a href="https://www.eximbay.com/" style="color: #0047ba; text-decoration: none; font-weight: bold;">
                        https://www.eximbay.com/
                    </a>
                </p>
            </div>

            <!-- Gabia DNS -->
            <div style="background-color: white; padding: 20px; border-radius: 6px;">
                <h3 style="color: #0047ba; font-size: 18px; margin-top: 0;">2. 🌐 가비아 도메인 네임서버 설정 변경</h3>

                <p><strong>현재 상태:</strong> 가비아 호스팅 사용 중<br>
                <strong>변경 필요:</strong> Vercel로 배포하기 위해 네임서버 변경 필요</p>

                <h4 style="color: #00a896; font-size: 16px; margin-top: 20px;">📋 가비아 도메인 네임서버 설정 가이드</h4>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="font-weight: bold; margin-top: 0;">1단계: 가비아 로그인</p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>https://www.gabia.com 접속</li>
                        <li>로그인 후 "My가비아" 클릭</li>
                    </ul>
                </div>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="font-weight: bold; margin-top: 0;">2단계: 도메인 관리</p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>"서비스 관리" → "도메인" 클릭</li>
                        <li>82mobile.com 도메인 선택</li>
                        <li>"관리" 버튼 클릭</li>
                    </ul>
                </div>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="font-weight: bold; margin-top: 0;">3단계: 네임서버 변경</p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>"네임서버 설정" 메뉴 선택</li>
                        <li>"다른 네임서버 사용" 선택</li>
                        <li>아래 네임서버 정보 입력:</li>
                    </ul>
                    <div style="background-color: #fff; padding: 15px; border-radius: 4px; font-family: monospace; margin-top: 10px; border: 2px solid #c8102e;">
                        <strong>Primary 네임서버:</strong> ns1.vercel-dns.com<br>
                        <strong>Secondary 네임서버:</strong> ns2.vercel-dns.com
                    </div>
                </div>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="font-weight: bold; margin-top: 0;">4단계: 저장 및 적용</p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>"적용" 버튼 클릭</li>
                        <li>DNS 전파 시간: 24-48시간 (보통 1-2시간 내 완료)</li>
                    </ul>
                </div>

                <div style="background-color: #fff3e0; padding: 15px; border-radius: 6px; margin-top: 15px;">
                    <p style="margin: 0; font-weight: bold; color: #ff9800;">⚠️ 주의사항:</p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">네임서버 변경 시 일시적으로 이메일이 중단될 수 있습니다</li>
                        <li style="margin-bottom: 8px;">이메일 서비스를 가비아에서 사용 중이시면 먼저 상담 부탁드립니다</li>
                        <li>변경 후 확인이 필요하시면 연락주세요</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Action Items Table -->
        <div style="background-color: #f0f8ff; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #0047ba;">
            <h2 style="color: #0047ba; font-size: 22px; margin-top: 0;">✅ 요청드리는 액션 아이템</h2>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #667eea; color: white;">
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd; width: 15%;">우선순위</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 40%;">작업</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd; width: 20%;">담당</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd; width: 25%;">기한</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background-color: #ffebee;">
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #c8102e;">🔴 긴급</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">Eximbay 가입 및 자격증명 전달</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">고객님</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold;">2월 3일까지</td>
                    </tr>
                    <tr style="background-color: #ffebee;">
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #c8102e;">🔴 긴급</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">가비아 네임서버 변경</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">고객님</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold;">2월 3일까지</td>
                    </tr>
                    <tr style="background-color: #fff9c4;">
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #ff9800;">🟡 중요</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">현재 사이트 테스트 및 피드백</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">고객님</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">가능하시면</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Preview Section -->
        <div style="background-color: #e8f5e9; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #4caf50;">
            <h2 style="color: #4caf50; font-size: 22px; margin-top: 0;">📸 현재 완성된 기능 미리보기</h2>

            <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">
                <strong>확인 가능한 사이트:</strong>
                <a href="https://82mobile-next.vercel.app" style="color: #0047ba; text-decoration: none; font-weight: bold;">
                    https://82mobile-next.vercel.app
                </a>
            </p>

            <p><strong>완성된 기능:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">✅ 메인 페이지 (Hero, 상품 미리보기, 매장 안내, FAQ)</li>
                <li style="margin-bottom: 10px;">✅ 상품 목록 페이지 (필터, 카테고리, 정렬)</li>
                <li style="margin-bottom: 10px;">✅ 상품 상세 페이지 (3D 카드 플립, 상세 정보)</li>
                <li style="margin-bottom: 10px;">✅ 장바구니 드로어 (추가/삭제/수량 변경)</li>
                <li style="margin-bottom: 10px;">✅ 반응형 디자인 (데스크탑/모바일 최적화)</li>
                <li style="margin-bottom: 10px;">✅ WooCommerce API 연동 (실제 상품 데이터 10개)</li>
            </ul>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; font-weight: bold; margin-bottom: 10px;">테스트 방법:</p>
                <ol style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">사이트 접속: https://82mobile-next.vercel.app</li>
                    <li style="margin-bottom: 8px;">"Shop" 버튼 클릭하여 상품 목록 확인</li>
                    <li style="margin-bottom: 8px;">상품 카드 클릭하여 상세 페이지 확인</li>
                    <li style="margin-bottom: 8px;">"Add to Cart" 버튼으로 장바구니 추가 테스트</li>
                    <li>우측 상단 장바구니 아이콘 클릭하여 드로어 확인</li>
                </ol>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="background-color: white; padding: 30px; border-radius: 8px; margin-top: 30px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #0047ba; font-size: 20px; margin-top: 0;">💬 연락처</h3>
        <p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
            <strong style="font-size: 18px;">개발자: 이종철 (하얀모자마케팅)</strong><br>
            📧 이메일: <a href="mailto:jyongchul@naver.com" style="color: #0047ba; text-decoration: none;">jyongchul@naver.com</a><br>
            📱 전화: <a href="tel:010-9333-2028" style="color: #0047ba; text-decoration: none;">010-9333-2028</a><br>
            💬 카카오톡: jyongchul<br>
            🌐 웹사이트: <a href="http://whmarketing.org" style="color: #0047ba; text-decoration: none;">whmarketing.org</a>
        </p>
        <p style="font-size: 16px; color: #666; margin-top: 20px;">
            <strong>질문이나 확인 필요하신 사항이 있으시면 언제든지 연락 주세요!</strong>
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 14px; color: #999; margin: 0;">
                Powered by <a href="http://whmarketing.org" target="_blank" style="color: #0047ba; text-decoration: none;">Whitehat Marketing</a>
            </p>
        </div>
    </div>
</body>
</html>
    """
    return html

def send_email():
    """Send the customer update email"""
    try:
        # Create message
        msg = MIMEMultipart('related')
        msg['Subject'] = '82Mobile 웹사이트 개발 진행상황 보고 (43% 완료 - 2026.01.26)'
        msg['From'] = f'이종철 (하얀모자마케팅) <{SENDER_EMAIL}>'
        msg['To'] = RECIPIENT_EMAIL
        msg['Cc'] = CC_EMAIL

        # Attach HTML body
        html = create_email_html()
        msg.attach(MIMEText(html, 'html', 'utf-8'))

        # Attach logo image
        if os.path.exists(LOGO_PATH):
            with open(LOGO_PATH, 'rb') as f:
                logo_data = f.read()
            logo = MIMEImage(logo_data)
            logo.add_header('Content-ID', '<logo>')
            msg.attach(logo)
            print(f"✅ Logo attached from: {LOGO_PATH}")
        else:
            print(f"⚠️ Warning: Logo not found at {LOGO_PATH}")

        # Send via Gmail SMTP
        print(f"📧 Connecting to Gmail SMTP...")
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)

            # Send to both recipient and CC
            recipients = [RECIPIENT_EMAIL, CC_EMAIL]
            server.send_message(msg, to_addrs=recipients)

        print("✅ Email sent successfully!")
        print(f"   To: {RECIPIENT_EMAIL}")
        print(f"   Cc: {CC_EMAIL}")
        print(f"   Subject: 82Mobile 웹사이트 개발 진행상황 보고 (43% 완료 - 2026.01.26)")

        return True

    except Exception as e:
        print(f"❌ Error sending email: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*60)
    print("82Mobile Customer Update Email Sender")
    print("="*60)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Recipient: {RECIPIENT_EMAIL}")
    print(f"CC: {CC_EMAIL}")
    print("="*60)

    success = send_email()

    if success:
        print("\n" + "="*60)
        print("✅ Email sent successfully!")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ Failed to send email")
        print("="*60)
