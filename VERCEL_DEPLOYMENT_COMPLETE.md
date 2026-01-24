# 82Mobile Next.js Vercel 배포 완료 보고서

**Date**: 2026-01-25
**Project**: 82Mobile Headless WordPress + Next.js
**Developer**: 하얀모자마케팅 이종철

---

## ✅ 배포 완료

### Production URL
**현재 접속 가능**: https://82mobile-next-66ituon2h-870829s-projects.vercel.app

**최종 도메인** (DNS 설정 후): https://82mobile.com

---

## 🚀 완료된 작업

### 1. Next.js 빌드 오류 수정 ✅
- Client Component에서 Server 전용 함수 사용 오류 해결
- next-intl API 최신 버전 (3.22+)으로 업데이트
- 일본어/중국어 번역 누락 부분 완성
- 모든 4개 언어 (ko, en, zh, ja) 정상 빌드 확인

### 2. Vercel 배포 ✅
- GitHub 저장소 연동 완료
- Production 배포 성공
- 빌드 시간: 38초
- 모든 페이지 정상 생성 (39개 routes)

### 3. 환경 변수 설정 ✅
다음 환경 변수가 Vercel Production에 설정되었습니다:

```
✅ WORDPRESS_URL              = http://82mobile.com
✅ WC_CONSUMER_KEY            = ck_1945303b049dea6117b19274d536c84a7b0bf94d
✅ WC_CONSUMER_SECRET         = cs_dc2d6477e6bbcd048de5c6de931f8e8f0b567386
✅ EXIMBAY_API_URL            = https://api-test.eximbay.com
✅ NEXT_PUBLIC_APP_URL        = https://82mobile.com
⏳ EXIMBAY_MID                = PENDING_MERCHANT_ACCOUNT (교체 필요)
⏳ EXIMBAY_SECRET_KEY         = PENDING_SECRET_KEY (교체 필요)
```

### 4. 도메인 추가 ✅
- `82mobile.com` 도메인이 Vercel 프로젝트에 추가됨
- DNS 설정 대기 중

---

## 🔧 다음 단계 (필수)

### Step 1: Cloudflare DNS 설정 (필수)

**Cloudflare 대시보드** → **DNS** → **Records**에서 다음 레코드 추가:

```
Type: A
Name: @
Content: 76.76.21.21
Proxy status: DNS only (회색 구름)
TTL: Auto
```

**또는** (권장):

```
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy status: DNS only
```

그리고:

```
Type: A
Name: @
Content: 76.76.21.21
Proxy status: DNS only
```

**⚠️ 중요**: Cloudflare Proxy를 반드시 **비활성화** (회색 구름)로 설정해야 Vercel SSL 인증서가 정상 작동합니다.

### Step 2: DNS 전파 확인 (5-10분 소요)

DNS 설정 후 다음 명령어로 확인:

```bash
# Windows PowerShell
nslookup 82mobile.com

# 또는 Linux/WSL
dig 82mobile.com
```

결과에 `76.76.21.21`이 표시되면 성공입니다.

### Step 3: Vercel SSL 인증서 자동 발급 확인

DNS 전파 후 Vercel이 자동으로 SSL 인증서를 발급합니다 (약 5분 소요).

Vercel Dashboard에서 확인:
- https://vercel.com/870829s-projects/82mobile-next/settings/domains
- `82mobile.com` 옆에 **Valid Configuration** 표시 확인

---

## 📋 추가 작업 필요 (선택)

### 1. Eximbay 결제 연동 (고객측 작업)

**Eximbay 가입**: https://www.eximbay.com/

**필요 서류**:
- 사업자등록증
- 통장 사본
- 대표자 신분증

**심사 기간**: 약 3-5 영업일

**발급 후 환경 변수 업데이트**:

```bash
cd /mnt/c/82Mobile/82mobile-next

# Vercel CLI로 환경 변수 업데이트
echo "YOUR_ACTUAL_MID" | vercel env add EXIMBAY_MID production
echo "YOUR_ACTUAL_SECRET" | vercel env add EXIMBAY_SECRET_KEY production

# 재배포
vercel --prod
```

### 2. WooCommerce 실제 데이터 연동

현재는 Mock 데이터를 사용하고 있습니다. WooCommerce API 연동 활성화:

**파일**: `app/[locale]/shop/page.tsx`

```typescript
// TODO 주석 제거하고 실제 API 호출 활성화
useEffect(() => {
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchProducts();
}, []);
```

### 3. SSL 인증서 문제 해결 (Gabia 서버)

**현재 상황**:
- 82mobile.com의 SSL 인증서가 `*.gabia.io`용으로 발급됨
- 실제 도메인과 불일치하여 HTTPS 접속 시 경고 발생

**해결 방법**:
1. Gabia 호스팅 관리자에 문의하여 `82mobile.com`용 SSL 인증서 재발급 요청
2. 또는 Let's Encrypt 무료 인증서 설치
3. 완료 후 `.env` 파일의 `WORDPRESS_URL`을 `https://82mobile.com`으로 변경

---

## 📊 배포 현황

### Vercel 프로젝트 정보
- **Project Name**: 82mobile-next
- **Production URL**: https://82mobile-next-66ituon2h-870829s-projects.vercel.app
- **GitHub Repository**: https://github.com/jyongchul/82mobile-next
- **Framework**: Next.js 14.2.35
- **Region**: Washington D.C. (iad1)

### 페이지 목록 (39 routes)
```
✅ Homepage               - 4 locales (ko, en, zh, ja)
✅ Shop                   - Product grid with filters
✅ Product Detail         - Dynamic routing by slug
✅ Cart                   - Shopping cart with Zustand state
✅ Checkout               - Billing form + payment methods
✅ Order Complete         - eSIM QR code display
✅ About                  - Company info + store locations
✅ Contact                - Contact form + KakaoTalk link
✅ FAQ                    - Accordion UI with 6 categories
✅ API Routes             - /api/products, /api/orders, /api/payment/*
```

### 성능 메트릭
- **Build Time**: 38초
- **First Load JS (Homepage)**: 120 kB
- **Middleware**: 39.3 kB
- **Static Pages**: 35개
- **Dynamic Pages**: 4개

---

## 🎯 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Internationalization**: next-intl (ko, en, zh, ja)
- **Image Optimization**: Next.js Image Component

### Backend
- **CMS**: Headless WordPress
- **E-commerce**: WooCommerce REST API
- **Payment**: Eximbay (국제 카드 결제)

### Deployment
- **Platform**: Vercel
- **DNS**: Cloudflare
- **SSL**: Vercel (자동 발급)
- **CDN**: Vercel Edge Network (전세계 배포)

---

## 🔗 중요 링크

### 배포 관련
- **Production Site**: https://82mobile-next-66ituon2h-870829s-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/870829s-projects/82mobile-next
- **GitHub Repository**: https://github.com/jyongchul/82mobile-next

### WordPress 관련
- **WordPress Admin**: http://82mobile.com/wp-admin
- **WooCommerce Products**: http://82mobile.com/wp-admin/edit.php?post_type=product
- **WooCommerce API Keys**: http://82mobile.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys

### 결제 관련
- **Eximbay Website**: https://www.eximbay.com/
- **Eximbay 가입 문의**: support@eximbay.com

---

## 🆘 트러블슈팅

### 1. "This domain is not configured properly" 메시지

**원인**: Cloudflare DNS 레코드가 아직 설정되지 않았거나 전파 중

**해결**:
1. Cloudflare에서 A 레코드 (`76.76.21.21`) 추가 확인
2. `nslookup 82mobile.com` 명령어로 DNS 전파 확인
3. 5-10분 대기 후 Vercel Dashboard에서 자동 재검증

### 2. "SSL Certificate Error" 발생

**원인**: Vercel SSL 인증서 발급 중이거나 DNS 미전파

**해결**:
1. DNS 전파 완료 확인 (`nslookup 82mobile.com` → `76.76.21.21`)
2. Vercel Dashboard → Domains → `82mobile.com` 상태 확인
3. "Refresh" 버튼 클릭하여 재검증
4. 5분 후 자동 발급 완료

### 3. WooCommerce API "Connection Refused"

**원인**:
- SSL 인증서 불일치 (현재 `*.gabia.io` 인증서 사용 중)
- HTTP로 임시 우회 중

**해결**:
1. Gabia에서 `82mobile.com`용 SSL 인증서 재발급
2. `.env` 파일에서 `WORDPRESS_URL=https://82mobile.com` 변경
3. Vercel 환경 변수도 동일하게 업데이트
4. `vercel --prod` 재배포

### 4. 결제 테스트 실패

**원인**: Eximbay 계정 미생성 (환경 변수 placeholder 사용 중)

**해결**:
1. Eximbay 가입 및 Merchant ID 발급
2. 환경 변수 업데이트:
   ```bash
   echo "YOUR_MID" | vercel env add EXIMBAY_MID production
   echo "YOUR_SECRET" | vercel env add EXIMBAY_SECRET_KEY production
   ```
3. `vercel --prod` 재배포

---

## 📞 문의

**개발자**: 이종철 (하얀모자마케팅)
**이메일**: jyongchul@naver.com
**전화**: 010-9333-2028
**카카오톡**: jyongchul

---

**Generated**: 2026-01-25 01:15 KST
**Report Version**: 1.0
