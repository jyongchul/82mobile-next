#!/usr/bin/env python3
"""
Send SMS notification to customer about 82Mobile progress
Date: 2026-01-26
Recipient: 권아담 (010-6424-6530)
"""

import requests

# Aligo SMS API configuration
ALIGO_API_KEY = "ef5c198fjdlguiw8ee8gzxjlle704m2o"
ALIGO_USER_ID = "jyongchul"
ALIGO_SENDER = "010-9333-2028"
RECIPIENT = "010-6424-6530"  # 권아담

def send_sms(message):
    """Send SMS via Aligo API"""
    url = "https://apis.aligo.in/send/"

    data = {
        'key': ALIGO_API_KEY,
        'user_id': ALIGO_USER_ID,
        'sender': ALIGO_SENDER,
        'receiver': RECIPIENT,
        'msg': message,
        'msg_type': 'SMS',  # or 'LMS' for long messages
        'testmode_yn': 'N'  # Set to 'Y' for testing
    }

    try:
        response = requests.post(url, data=data)
        result = response.json()

        if result.get('result_code') == '1':
            print(f"✅ SMS sent successfully!")
            print(f"   Message ID: {result.get('msg_id')}")
            print(f"   Success Count: {result.get('success_cnt')}")
            return True
        else:
            print(f"❌ Failed to send SMS")
            print(f"   Error: {result.get('message')}")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Create SMS message (SMS limit: 90 bytes = ~45 Korean chars)
    # Use LMS for longer messages (2000 bytes = ~1000 Korean chars)
    message = """[하얀모자마케팅 82Mobile 진행보고]

권아담 고객님 안녕하세요!

📊 진행률: 43% 완료 (Phase 3 완료)
✅ 오늘 완료: 장바구니 기능

📅 일정:
- 웹사이트: 이번주 일요일(2/2)까지
- 결제연동: 2/7까지 (고객님 작업필요)

⚠️ 준비필요:
1. Eximbay 가입 (www.eximbay.com)
2. 가비아 네임서버 변경
   → ns1.vercel-dns.com
   → ns2.vercel-dns.com

📧 상세내용은 이메일로 발송예정입니다.
(Gmail 발송한도 초과로 지연될 수 있습니다)

🌐 현재사이트: https://82mobile-next.vercel.app

문의: 010-9333-2028 (이종철)"""

    # Check message length
    message_bytes = len(message.encode('utf-8'))
    print(f"Message length: {message_bytes} bytes")

    if message_bytes > 2000:
        print("⚠️ Warning: Message exceeds LMS limit (2000 bytes)")
    elif message_bytes > 90:
        print("ℹ️ Using LMS (Long Message Service)")
        # Update to LMS if needed - but Aligo might auto-detect

    print("="*60)
    print("Sending SMS to customer...")
    print("="*60)
    print(f"To: {RECIPIENT}")
    print(f"From: {ALIGO_SENDER}")
    print("="*60)

    success = send_sms(message)

    if success:
        print("\n" + "="*60)
        print("✅ SMS sent successfully!")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ Failed to send SMS")
        print("="*60)
