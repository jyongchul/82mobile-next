#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
82Mobile Vercel 배포 완료 및 Gabia 설정 안내 이메일 발송
"""

import smtplib
import requests
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# 환경 변수 로드
# Gmail 한도 초과로 Naver SMTP 사용
EMAIL_USER = "jyongchul@naver.com"
EMAIL_PASSWORD = "B1ZFJEQLQFRR"
SMTP_SERVER = "smtp.naver.com"
SMTP_PORT = 465

ALIGO_API_KEY = "ef5c198fjdlguiw8ee8gzxjlle704m2o"
ALIGO_USER_ID = "jyongchul"
ALIGO_SENDER = "010-9333-2028"

# 고객 정보
CUSTOMER_NAME = "권아담"
CUSTOMER_EMAIL = "adamwoohaha@naver.com"
CUSTOMER_PHONE = "010-6424-6530"

def create_email_html():
    """고객용 이메일 HTML 생성"""
    return f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>82Mobile 웹사이트 배포 완료 안내</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 1000px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                    <!-- 헤더 -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <img src="https://whmarketing.org/images/logo.png" alt="하얀모자마케팅" style="max-width: 180px; height: auto; margin-bottom: 20px;">
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">82Mobile 웹사이트 배포 완료</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">Vercel 프로덕션 배포 성공 및 다음 단계 안내</p>
                        </td>
                    </tr>

                    <!-- 본문 -->
                    <tr>
                        <td style="padding: 40px 30px;">

                            <!-- 인사말 -->
                            <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 0 0 30px 0;">
                                안녕하세요, <strong>{CUSTOMER_NAME}</strong> 대표님.<br>
                                하얀모자마케팅 이종철입니다.
                            </p>

                            <!-- 완료된 작업 -->
                            <h2 style="color: #2c3e50; font-size: 22px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">✅ 완료된 작업</h2>

                            <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                                <h3 style="color: #28a745; font-size: 18px; margin: 0 0 15px 0;">🚀 Vercel 프로덕션 배포 성공</h3>
                                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #555555;">
                                    <li>Next.js 14 기반 최신 웹사이트 구축 완료</li>
                                    <li>4개 언어 지원 (한국어, 영어, 중국어, 일본어)</li>
                                    <li>39개 페이지 모두 정상 빌드 완료</li>
                                    <li>Vercel 프로덕션 환경 배포 성공 (빌드 시간: 50초)</li>
                                    <li>에러율 0% - 완벽한 상태로 작동 중</li>
                                </ul>
                            </div>

                            <!-- 접속 가능한 URL -->
                            <h2 style="color: #2c3e50; font-size: 22px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">🌐 지금 바로 접속 가능한 주소</h2>

                            <div style="background-color: #e3f2fd; border: 2px solid #2196f3; padding: 25px; margin-bottom: 25px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 15px 0; font-size: 16px; color: #1976d2; font-weight: 600;">👇 아래 링크를 클릭하시면 새 웹사이트를 바로 확인하실 수 있습니다</p>
                                <a href="https://82mobile-next.vercel.app" style="display: inline-block; background-color: #2196f3; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 18px; font-weight: 600; margin: 10px 0;">🔗 82mobile-next.vercel.app 접속하기</a>
                                <p style="margin: 15px 0 0 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                    <strong>임시 URL:</strong> https://82mobile-next.vercel.app<br>
                                    (DNS 전파 완료 시 https://82mobile.com 으로 접속 가능)
                                </p>
                            </div>

                            <!-- Gabia 네임서버 변경 안내 -->
                            <h2 style="color: #2c3e50; font-size: 22px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">⚙️ 고객님께서 진행하실 작업</h2>

                            <div style="background-color: #fff8e1; border-left: 4px solid #ff9800; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                                <h3 style="color: #f57c00; font-size: 18px; margin: 0 0 15px 0;">📌 Gabia 네임서버 변경 (15분 소요)</h3>
                                <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #555555;">
                                    현재 Cloudflare DNS 레코드는 설정이 완료되었으나, <strong>도메인 등록기관(Gabia)에서 네임서버를 아직 Cloudflare로 변경하지 않아서</strong> DNS가 전파되지 않고 있습니다.
                                </p>

                                <h4 style="color: #f57c00; font-size: 16px; margin: 20px 0 10px 0;">✅ 네임서버 변경 방법:</h4>
                                <ol style="margin: 0; padding-left: 20px; line-height: 2; color: #555555; font-size: 15px;">
                                    <li><strong>Gabia 로그인</strong>: <a href="https://www.gabia.com" style="color: #2196f3;">https://www.gabia.com</a></li>
                                    <li><strong>My가비아</strong> → <strong>서비스 관리</strong> → <strong>도메인</strong> 선택</li>
                                    <li><strong>82mobile.com</strong> 도메인 → <strong>관리/설정</strong> 버튼 클릭</li>
                                    <li><strong>네임서버 설정</strong> 메뉴에서 다음과 같이 변경:</li>
                                </ol>

                                <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 4px; font-family: 'Courier New', monospace;">
                                    <p style="margin: 0; font-size: 14px; color: #d32f2f;"><strong>기존 네임서버 (삭제):</strong></p>
                                    <p style="margin: 5px 0 15px 0; font-size: 14px; color: #666;">ns.gabia.co.kr<br>ns.gabia.net<br>ns1.gabia.co.kr</p>

                                    <p style="margin: 0; font-size: 14px; color: #388e3c;"><strong>새 네임서버 (추가):</strong></p>
                                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">dave.ns.cloudflare.com<br>wanda.ns.cloudflare.com</p>
                                </div>

                                <p style="margin: 15px 0 0 0; font-size: 14px; color: #555555;">
                                    <strong>5.</strong> 저장 후 <strong>5-10분 대기</strong> → DNS 전파 완료 시 <strong>https://82mobile.com</strong> 접속 가능!
                                </p>
                            </div>

                            <!-- 상세 가이드 첨부 안내 -->
                            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                                <h3 style="color: #2e7d32; font-size: 18px; margin: 0 0 10px 0;">📄 상세 가이드 문서</h3>
                                <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #555555;">
                                    GitHub 저장소에 <strong>GABIA_NAMESERVER_CHANGE_GUIDE.md</strong> 파일에 스크린샷과 함께 더 자세한 단계별 가이드를 작성해두었습니다.<br>
                                    필요하시면 해당 파일을 참고해주세요.
                                </p>
                            </div>

                            <!-- 문제 발생 시 -->
                            <div style="background-color: #fce4ec; border-left: 4px solid #e91e63; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                                <h3 style="color: #c2185b; font-size: 18px; margin: 0 0 10px 0;">🆘 어려움이 있으시면</h3>
                                <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #555555;">
                                    Gabia에서 네임서버 변경 메뉴를 찾기 어려우시거나 설정에 어려움이 있으시면 언제든지 연락 주세요.<br>
                                    <strong>Gabia 고객센터</strong>: 1544-4755 (평일 09:00-18:00)
                                </p>
                            </div>

                            <!-- 일주일 안에 마무리 -->
                            <h2 style="color: #2c3e50; font-size: 22px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">🎯 프로젝트 마무리 계획</h2>

                            <div style="background-color: #f3e5f5; border-left: 4px solid #9c27b0; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #555555;">
                                    현재 웹사이트 배포가 완료된 상태이며, 네임서버 변경만 하시면 즉시 공개됩니다.<br>
                                    <strong>앞으로 일주일 안에 남은 작업들을 최대한 마무리하여 프로젝트를 완료</strong>하도록 노력하겠습니다.
                                </p>

                                <h4 style="color: #7b1fa2; font-size: 16px; margin: 20px 0 10px 0;">남은 작업:</h4>
                                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #555555;">
                                    <li>Eximbay 결제 연동 (고객님께서 가입 후 진행)</li>
                                    <li>WooCommerce 실제 데이터 연동</li>
                                    <li>최종 테스트 및 버그 수정</li>
                                </ul>
                            </div>

                            <!-- 마무리 인사 -->
                            <p style="font-size: 16px; line-height: 1.8; color: #333333; margin: 30px 0 0 0;">
                                궁금하신 점이나 수정 요청 사항이 있으시면 언제든지 연락 주시기 바랍니다.<br>
                                감사합니다.
                            </p>

                        </td>
                    </tr>

                    <!-- 푸터 -->
                    <tr>
                        <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                            <img src="https://whmarketing.org/images/logo.png" alt="하얀모자마케팅" style="max-width: 120px; height: auto; margin-bottom: 15px; opacity: 0.9;">
                            <p style="color: #ecf0f1; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">하얀모자마케팅 이종철</p>
                            <p style="color: #bdc3c7; font-size: 14px; margin: 5px 0; line-height: 1.6;">
                                📧 <a href="mailto:jyongchul@naver.com" style="color: #3498db; text-decoration: none;">jyongchul@naver.com</a><br>
                                📱 010-9333-2028<br>
                                💬 카카오톡: jyongchul
                            </p>
                            <p style="color: #95a5a6; font-size: 12px; margin: 20px 0 0 0;">
                                © 2026 Whitehat Marketing. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

def send_email():
    """이메일 발송"""
    try:
        # MIME 메시지 생성
        msg = MIMEMultipart('alternative')
        msg['Subject'] = '✅ 82Mobile 웹사이트 Vercel 배포 완료 - Gabia 설정 안내'
        msg['From'] = EMAIL_USER
        msg['To'] = CUSTOMER_EMAIL

        # HTML 본문 추가
        html_part = MIMEText(create_email_html(), 'html', 'utf-8')
        msg.attach(html_part)

        # Naver SMTP 연결 및 발송
        print("📧 이메일 발송 중...")
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)

        print(f"✅ 이메일 발송 성공: {CUSTOMER_EMAIL}")
        return True

    except Exception as e:
        print(f"❌ 이메일 발송 실패: {e}")
        return False

def send_sms():
    """SMS 발송"""
    try:
        sms_text = f"""[하얀모자마케팅]

82Mobile 웹사이트 Vercel 배포 완료!

✅ 지금 바로 접속 가능:
https://82mobile-next.vercel.app

📌 다음 단계:
Gabia에서 네임서버를 Cloudflare로 변경하시면 82mobile.com 도메인이 활성화됩니다.

⏱ 일주일 안에 프로젝트 최종 마무리 예정

📧 자세한 내용은 이메일을 확인해주세요.

문의: 010-9333-2028 (이종철)"""

        print("📱 SMS 발송 중...")

        url = "https://apis.aligo.in/send/"
        data = {
            'key': ALIGO_API_KEY,
            'user_id': ALIGO_USER_ID,
            'sender': ALIGO_SENDER,
            'receiver': CUSTOMER_PHONE,
            'msg': sms_text,
            'msg_type': 'LMS',  # 장문 메시지
            'title': '82Mobile 배포 완료'
        }

        response = requests.post(url, data=data)
        result = response.json()

        if result.get('result_code') == '1':
            print(f"✅ SMS 발송 성공: {CUSTOMER_PHONE}")
            return True
        else:
            print(f"❌ SMS 발송 실패: {result.get('message', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"❌ SMS 발송 중 오류: {e}")
        return False

def main():
    """메인 실행"""
    print("=" * 60)
    print("82Mobile Vercel 배포 완료 안내 발송")
    print("=" * 60)
    print(f"고객: {CUSTOMER_NAME} ({CUSTOMER_EMAIL})")
    print(f"전화: {CUSTOMER_PHONE}")
    print(f"일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    # 이메일 발송
    email_success = send_email()
    print()

    # SMS 발송
    sms_success = send_sms()
    print()

    # 결과 요약
    print("=" * 60)
    print("📊 발송 결과")
    print("=" * 60)
    print(f"이메일: {'✅ 성공' if email_success else '❌ 실패'}")
    print(f"SMS: {'✅ 성공' if sms_success else '❌ 실패'}")
    print("=" * 60)

if __name__ == "__main__":
    main()
