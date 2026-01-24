# 82Mobile DNS 설정 가이드

**목표**: 82mobile.com 도메인을 Vercel에 연결하기

**소요 시간**: 약 10-15분

---

## 🎯 1단계: Cloudflare 로그인

1. https://dash.cloudflare.com/ 접속
2. 82mobile.com 도메인 선택
3. 왼쪽 메뉴에서 **DNS** → **Records** 클릭

---

## 🎯 2단계: 기존 A 레코드 확인

현재 설정을 확인하고 백업합니다:

```
Type: A
Name: @
Content: (현재 IP 주소) ← 메모해두세요
```

**⚠️ 중요**: 현재 IP 주소를 반드시 메모하세요! 문제 발생 시 복원에 필요합니다.

---

## 🎯 3단계: Vercel용 A 레코드 추가/수정

### 옵션 A: 기존 레코드 수정 (권장)

기존 A 레코드의 **Edit** 버튼 클릭 후:

```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: DNS only (회색 구름 ☁️)
TTL: Auto
```

### 옵션 B: 새 레코드 추가

**Add record** 버튼 클릭 후:

```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: DNS only
TTL: Auto
```

**⚠️ 매우 중요**:
- **Proxy status를 반드시 "DNS only"로 설정** (회색 구름)
- 주황색 구름으로 설정하면 Vercel SSL 인증서가 작동하지 않습니다!

---

## 🎯 4단계: www 서브도메인 설정 (선택)

www.82mobile.com도 연결하려면:

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only
TTL: Auto
```

---

## 🎯 5단계: 저장 및 확인

1. **Save** 버튼 클릭
2. Cloudflare에서 자동으로 DNS 전파 시작

---

## ✅ 6단계: DNS 전파 확인 (5-10분 소요)

### Windows PowerShell에서:

```powershell
nslookup 82mobile.com
```

**성공 시 결과**:
```
Server:  UnKnown
Address:  ...

Non-authoritative answer:
Name:    82mobile.com
Address:  76.76.21.21
```

### Linux/WSL에서:

```bash
dig 82mobile.com +short
```

**성공 시 결과**:
```
76.76.21.21
```

**⏳ 전파 중**: 위 IP가 나오지 않으면 5분 후 다시 확인

---

## ✅ 7단계: Vercel SSL 인증서 발급 확인

DNS 전파 완료 후:

1. https://vercel.com/870829s-projects/82mobile-next/settings/domains 접속
2. `82mobile.com` 옆에 다음 상태 확인:
   - ✅ **Valid Configuration** (녹색 체크)
   - 🔒 **SSL Certificate: Active**

**⏳ 발급 중**: "Pending" 상태면 5분 후 페이지 새로고침

---

## 🎉 완료!

DNS 설정이 완료되면:

- **https://82mobile.com** 접속 가능
- **SSL 인증서 자동 활성화** (🔒 자물쇠 표시)
- **전세계 CDN 배포** (빠른 로딩 속도)

---

## 🆘 트러블슈팅

### 문제: "This site can't be reached" 오류

**원인**: DNS 전파 미완료

**해결**:
1. `nslookup 82mobile.com` 재확인
2. 5-10분 추가 대기
3. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

### 문제: "Your connection is not private" SSL 경고

**원인**: Vercel SSL 인증서 발급 중

**해결**:
1. Vercel Dashboard에서 상태 확인
2. "Refresh" 버튼 클릭
3. 5분 대기 후 재시도

### 문제: Cloudflare에서 "DNS Record already exists"

**원인**: 기존 A 레코드가 이미 존재

**해결**:
1. 기존 레코드 **Edit** (삭제 X)
2. Content를 `76.76.21.21`로 변경
3. Proxy status를 **DNS only**로 변경

---

## 📞 문의

**DNS 설정 문의**: 이종철 (010-9333-2028)
**Cloudflare 계정 문제**: Cloudflare Support (support@cloudflare.com)

---

**작성일**: 2026-01-25
**버전**: 1.0
