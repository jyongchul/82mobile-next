# Gabia 네임서버 변경 가이드

**목표**: 82mobile.com의 네임서버를 Gabia에서 Cloudflare로 변경

**소요 시간**: 10분 (전파 시간 5-10분 추가)

---

## ⚠️ 왜 네임서버 변경이 필요한가?

현재 상황:
- ✅ Cloudflare에서 DNS 레코드 수정 완료 (A 레코드, CNAME)
- ❌ 하지만 도메인의 네임서버가 여전히 Gabia를 가리킴
- ❌ 따라서 Cloudflare DNS 설정이 적용되지 않음

**해결**: Gabia에서 네임서버를 Cloudflare로 변경해야 Cloudflare DNS 설정이 활성화됩니다.

---

## 🎯 1단계: Gabia 로그인

1. https://www.gabia.com/ 접속
2. 우측 상단 **로그인** 클릭
3. 도메인 관리자 계정으로 로그인

---

## 🎯 2단계: 도메인 관리 페이지 이동

1. 로그인 후 **My가비아** 클릭
2. 좌측 메뉴에서 **서비스 관리** → **도메인** 선택
3. **82mobile.com** 도메인 찾기
4. 도메인 우측의 **관리** 또는 **설정** 버튼 클릭

---

## 🎯 3단계: 네임서버 설정 변경

### 현재 네임서버 (Gabia)
```
ns.gabia.co.kr
ns.gabia.net
ns1.gabia.co.kr
```

### 새 네임서버 (Cloudflare)
```
dave.ns.cloudflare.com
wanda.ns.cloudflare.com
```

### 변경 방법

1. 도메인 관리 페이지에서 **네임서버 설정** 또는 **DNS 설정** 찾기
2. **네임서버 변경** 또는 **Custom Nameserver** 선택
3. 기존 네임서버 삭제
4. 새 네임서버 추가:
   ```
   Primary:   dave.ns.cloudflare.com
   Secondary: wanda.ns.cloudflare.com
   ```
5. **저장** 또는 **적용** 버튼 클릭

---

## 🎯 4단계: 변경 확인

### Gabia에서 확인

도메인 관리 페이지에서 네임서버가 다음과 같이 표시되어야 합니다:
```
✅ dave.ns.cloudflare.com
✅ wanda.ns.cloudflare.com
```

### Cloudflare에서 확인

1. https://dash.cloudflare.com 접속
2. `82mobile.com` 도메인 선택
3. 상단에 다음 메시지 확인:
   - ❌ **"Pending"** → 전파 대기 중
   - ✅ **"Active"** → 전파 완료!

---

## ⏳ 5단계: DNS 전파 대기 (5-10분)

네임서버 변경 후 약 5-10분 정도 기다려야 전세계에 전파됩니다.

### 전파 확인 방법

**Windows PowerShell**:
```powershell
nslookup 82mobile.com
```

**성공 시 결과**:
```
Name:    82mobile.com
Address:  76.76.21.21    ← Vercel IP가 나와야 함
```

**아직 전파 중**:
```
Address:  182.162.142.102    ← Gabia IP (이전)
```

---

## ✅ 6단계: Vercel 도메인 확인

DNS 전파 완료 후:

1. https://vercel.com/870829s-projects/82mobile-next/settings/domains 접속
2. `82mobile.com` 상태 확인:
   - ✅ **Valid Configuration** (녹색 체크)
   - 🔒 **SSL Certificate: Active**
3. **www.82mobile.com** 상태도 동일하게 확인

---

## 🎉 완료 확인

모든 설정이 완료되면:

1. **https://82mobile.com** 접속 → 새 웹사이트 표시
2. **https://www.82mobile.com** 접속 → 새 웹사이트 표시
3. **SSL 인증서 활성화** → 주소창에 🔒 자물쇠 표시
4. **Cloudflare 대시보드** → "Active" 상태 표시

---

## 🆘 문제 해결

### 문제: Gabia에서 네임서버 변경 메뉴를 못 찾겠어요

**해결**:
1. Gabia 고객센터 전화: **1544-4755**
2. "도메인 네임서버를 Cloudflare로 변경하고 싶습니다" 요청
3. 다음 정보 전달:
   ```
   Primary Nameserver:   dave.ns.cloudflare.com
   Secondary Nameserver: wanda.ns.cloudflare.com
   ```

### 문제: 10분 이상 지났는데 여전히 Gabia IP가 나옵니다

**원인**: 로컬 DNS 캐시

**해결**:
```powershell
# Windows PowerShell (관리자 권한)
ipconfig /flushdns

# WSL/Linux
sudo systemd-resolve --flush-caches
```

### 문제: Cloudflare가 여전히 "Pending" 상태입니다

**원인**: 네임서버 전파 진행 중

**해결**:
1. 10-15분 추가 대기
2. Cloudflare 페이지 새로고침
3. "Re-check now" 버튼이 있다면 클릭

---

## ⚠️ 주의사항

### 네임서버 변경 시 영향

네임서버를 Cloudflare로 변경하면:

✅ **장점**:
- Cloudflare CDN 사용 가능
- DDoS 보호 활성화
- 무료 SSL 인증서
- 빠른 DNS 응답 속도
- Vercel 연동 가능

⚠️ **주의**:
- Gabia DNS 관리 페이지에서는 더 이상 DNS 레코드 수정 불가
- **모든 DNS 설정은 Cloudflare에서만 관리**해야 함
- 이메일 MX 레코드, 서브도메인 등 기존 설정이 있다면 Cloudflare로 이전 필요

### 이메일이 있는 경우

만약 `@82mobile.com` 이메일을 사용 중이라면:

1. Gabia DNS에서 현재 MX 레코드 확인
2. Cloudflare DNS에 동일한 MX 레코드 추가
3. 네임서버 변경 전에 MX 레코드 설정 완료 필수!

---

## 📞 지원

### Gabia 고객센터
- **전화**: 1544-4755
- **평일**: 09:00 - 18:00
- **웹**: https://customer.gabia.com/

### 개발사
- **담당자**: 이종철 (하얀모자마케팅)
- **전화**: 010-9333-2028
- **이메일**: jyongchul@naver.com

---

**작성일**: 2026-01-25
**버전**: 1.0
