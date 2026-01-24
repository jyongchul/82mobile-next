# 82Mobile Next.js Deployment Guide

**GitHub Repository**: https://github.com/jyongchul/82mobile-next

## 📋 프로젝트 상태

✅ **완료된 작업**:
- Next.js 14 App Router 구조 구축
- 다국어 지원 (한국어, 영어, 중국어, 일본어)
- WooCommerce REST API 연동
- Eximbay 결제 게이트웨이 통합
- Zustand 상태 관리 (장바구니)
- Tailwind CSS 스타일링
- 한국 문화 디자인 시스템 적용

✅ **구현된 페이지**:
- Homepage (Hero, ProductPreview, WhyChooseUs, FaqPreview)
- About, Contact, FAQ
- Shop (Product Grid + Product Detail)
- Cart, Checkout, Order Complete

✅ **빌드 테스트**: 성공 (40 페이지 생성)

---

## 🔧 배포 전 필수 작업

### 1. 환경변수 설정

현재 `.env` 파일에 더미 자격증명이 있습니다. 실제 값으로 교체하세요:

```bash
# WordPress & WooCommerce Configuration
WORDPRESS_URL=https://82mobile.com
WC_CONSUMER_KEY=ck_xxxxx  # ← 실제 키로 교체
WC_CONSUMER_SECRET=cs_xxxxx  # ← 실제 시크릿으로 교체

# Eximbay Payment Gateway
EXIMBAY_MID=xxxxx  # ← 실제 Merchant ID
EXIMBAY_SECRET_KEY=xxxxx  # ← 실제 Secret Key
EXIMBAY_API_URL=https://api.eximbay.com  # ← Production URL (또는 https://api-test.eximbay.com for testing)
NEXT_PUBLIC_APP_URL=https://82mobile.com  # ← 앱 URL (webhook callback용)

# Next.js Configuration
NEXT_PUBLIC_URL=https://82mobile.com
```

#### WooCommerce API 키 생성 방법

1. WordPress Admin 로그인: https://82mobile.com/wp-admin
   - Username: `whadmin`
   - Password: `WhMkt2026!@AdamKorSim`

2. WooCommerce → Settings → Advanced → REST API

3. "Add Key" 클릭:
   - Description: "Next.js Frontend"
   - User: whadmin
   - Permissions: Read/Write
   - Generate API Key

4. Consumer Key와 Secret을 `.env` 파일에 복사

#### Eximbay 계정 확인

1. Eximbay 가맹점 계정 준비
2. Contact: https://www.eximbay.com/ 또는 한국 지사
3. Merchant ID (MID), Secret Key 발급 받기
4. 테스트 계정 vs Production 계정 확인

---

## 🚀 Vercel 배포

### Option 1: Vercel CLI (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서
cd /mnt/c/82Mobile/82mobile-next

# 배포
vercel

# Production 배포
vercel --prod
```

### Option 2: Vercel Dashboard (권장)

**GitHub 레포지토리**: https://github.com/jyongchul/82mobile-next

1. https://vercel.com 로그인

2. "Import Project" 클릭

3. GitHub 레포지토리 연결
   - 레포지토리 선택: `jyongchul/82mobile-next`
   - 또는 URL 직접 입력: https://github.com/jyongchul/82mobile-next

4. **Build Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Environment Variables** 설정:
   - `.env` 파일의 모든 변수를 Vercel Dashboard에 추가
   - **IMPORTANT**: `NEXT_PUBLIC_*` 변수는 반드시 추가

6. "Deploy" 클릭

---

## 🌐 DNS 설정

### Vercel에서 도메인 추가

1. Vercel Dashboard → 프로젝트 → Settings → Domains

2. "Add Domain" 클릭: `82mobile.com`

3. Vercel이 제공하는 DNS 레코드를 도메인 관리 패널에 추가:

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

4. SSL 인증서는 Vercel이 자동으로 발급 (Let's Encrypt)

---

## 📝 배포 후 확인 사항

### 1. 기능 테스트

- [ ] 다국어 전환 작동 (한국어, 영어, 중국어, 일본어)
- [ ] WooCommerce 제품 불러오기 작동
- [ ] 장바구니 추가/제거/수량 변경
- [ ] 결제 프로세스 (Eximbay)
- [ ] 주문 완료 페이지
- [ ] 이메일 알림 (주문 확인)

### 2. 성능 최적화

```bash
# Lighthouse 점수 확인
npm run build
npm run start

# 크롬 개발자 도구 → Lighthouse 실행
```

### 3. SEO 확인

- [ ] 각 페이지 메타 태그 확인
- [ ] 사이트맵 생성 (next-sitemap)
- [ ] robots.txt 설정
- [ ] Open Graph 이미지

---

## 🐛 알려진 문제 및 해결

### Static Generation 경고

일부 페이지에서 `unstable_setRequestLocale` 누락 경고:
- FAQ, Cart, Checkout, Order Complete, Shop 페이지

**해결 방법** (선택사항, 배포에는 영향 없음):

각 페이지 컴포넌트에 추가:

```typescript
import { unstable_setRequestLocale } from 'next-intl/server';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  // ... rest of component
}
```

### npm 취약점

3개의 high severity 취약점 발견:

```bash
npm audit fix
# 또는
npm audit fix --force  # Breaking changes 포함
```

---

## 📊 프로젝트 구조

```
82mobile-next/
├── app/
│   ├── [locale]/           # 다국어 라우팅
│   │   ├── page.tsx        # Homepage
│   │   ├── about/
│   │   ├── contact/
│   │   ├── faq/
│   │   ├── shop/
│   │   │   ├── page.tsx    # Product Grid
│   │   │   └── [slug]/     # Product Detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── order-complete/
│   ├── api/                # API Routes
│   │   ├── products/
│   │   ├── orders/
│   │   └── payment/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── home/               # Homepage 섹션
│   ├── shop/               # Shop 컴포넌트
│   ├── cart/               # Cart 컴포넌트
│   ├── checkout/           # Checkout 컴포넌트
│   ├── layout/             # Header, Footer
│   └── ui/                 # 재사용 가능한 UI
├── lib/
│   ├── woocommerce.ts      # WooCommerce API
│   └── eximbay.ts          # Eximbay 결제 연동
├── stores/
│   └── cart.ts             # Zustand 장바구니 상태
├── messages/               # 다국어 번역 파일
│   ├── en.json
│   ├── ko.json
│   ├── zh.json
│   └── ja.json
├── public/
│   └── images/
├── .env                    # 환경 변수
├── next.config.js
├── tailwind.config.ts
├── i18n.ts
└── middleware.ts           # 다국어 미들웨어
```

---

## 🔐 보안 고려사항

1. **환경 변수 보호**:
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - Vercel Dashboard에서만 설정

2. **API 키 보안**:
   - WooCommerce API는 HTTPS only
   - Eximbay Webhook은 IP 화이트리스트 설정 권장

3. **CORS 설정**:
   - WordPress에서 Next.js 도메인 허용
   - WooCommerce REST API CORS 헤더 확인

---

## 📞 지원 및 문의

**개발자**: 이종철 (Whitehat Marketing)
**Email**: jyongchul@naver.com
**Phone**: 010-9333-2028

**문제 발생 시**:
1. Vercel 로그 확인: Dashboard → Deployments → 배포 선택 → Runtime Logs
2. 브라우저 콘솔 에러 확인
3. Network 탭에서 API 요청 실패 확인

---

## 🎯 다음 단계 (선택사항)

1. **정적 페이지 최적화**:
   - 모든 페이지에 `unstable_setRequestLocale` 추가
   - ISR (Incremental Static Regeneration) 설정

2. **이미지 최적화**:
   - Next.js Image 최적화 설정
   - WebP 포맷 사용

3. **성능 모니터링**:
   - Vercel Analytics 활성화
   - Google Analytics 연동 (GA_ID 설정)

4. **추가 기능**:
   - 제품 검색 기능
   - 사용자 리뷰 시스템
   - 위시리스트
   - 소셜 로그인 (Google, KakaoTalk, Naver)

---

**마지막 업데이트**: 2026-01-24
**빌드 버전**: Next.js 14.2.35
**배포 준비 상태**: ✅ 준비 완료 (환경변수 설정 필요)
