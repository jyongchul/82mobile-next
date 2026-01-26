# Integrations

## External Services & APIs

### 1. WooCommerce REST API

**Purpose**: Product catalog and order management backend

**Configuration**:
```typescript
// lib/woocommerce.ts
const wooCommerceConfig = {
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY!,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET!,
  version: 'wc/v3'
}
```

**Authentication**: OAuth 1.0a (consumer key + secret)

**Endpoints Used**:
- `GET /wp-json/wc/v3/products` - Product listing with pagination and filtering
- `GET /wp-json/wc/v3/products/{id}` - Single product details
- `POST /wp-json/wc/v3/orders` - Create new orders
- `GET /wp-json/wc/v3/orders/{id}` - Order status checking

**Data Transformations**:
```typescript
// lib/woocommerce.ts - transformWooCommerceProduct()
- Maps WooCommerce product schema to app ProductData type
- Extracts metadata (eSIM type, duration, coverage)
- Processes image URLs and pricing
- Handles product variations (plan durations)
```

**Error Handling**: Try-catch with fallback to empty arrays, NextResponse with appropriate status codes

**Rate Limiting**: None explicitly configured (relies on WooCommerce defaults)

---

### 2. Payment Gateways

#### PortOne (아임포트) - Domestic Payments

**Purpose**: Korean domestic payment processing (credit cards, bank transfers)

**Integration Method**: Browser-based SDK (script injection)

**Configuration**:
```typescript
// lib/portone.ts
IMP.init(process.env.NEXT_PUBLIC_PORTONE_STORE_ID)
```

**Payment Flow**:
1. Frontend calls `IMP.request_pay()` with order details
2. PortOne modal opens for payment
3. Callback returns `{ success: boolean, imp_uid: string, merchant_uid: string }`
4. Backend webhook receives payment confirmation at `/api/payment/webhook`

**Webhook Handler**: `app/api/payment/webhook/route.ts`
- Verifies payment signature
- Updates WooCommerce order status
- Sends confirmation email

**Environment Variables**:
- `NEXT_PUBLIC_PORTONE_STORE_ID`
- `PORTONE_API_SECRET`

#### Eximbay - International Payments

**Purpose**: Cross-border payments for foreign tourists (Visa, Mastercard, UnionPay, JCB)

**Configuration**: Similar webhook-based flow as PortOne

**Status**: Infrastructure ready, credentials pending from customer

---

### 3. Internationalization (i18n)

**Library**: `next-intl`

**Configuration**:
```typescript
// i18n.ts
export const locales = ['ko', 'en'] as const
export const defaultLocale = 'ko'
```

**Middleware**: `middleware.ts` handles locale detection and routing

**Message Files**:
- `messages/ko.json` - Korean translations
- `messages/en.json` - English translations

**Usage Pattern**:
```typescript
const t = useTranslations('namespace')
<h1>{t('key')}</h1>
```

**Locale Switching**: `components/ui/LanguageSwitcher.tsx` provides UI toggle

---

### 4. Analytics & Monitoring

#### Google Analytics 4

**Purpose**: User behavior tracking and e-commerce funnel analysis

**Implementation**: `components/analytics/GoogleAnalytics.tsx`

**Events Tracked**:
- `page_view` - Page navigation
- `view_item` - Product detail views
- `add_to_cart` - Cart additions
- `begin_checkout` - Checkout start
- `purchase` - Order completion

**Configuration**:
```typescript
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Lighthouse CI

**Purpose**: Performance budgeting and Core Web Vitals monitoring

**Configuration**: `.github/workflows/lighthouse-ci.yml`

**Metrics Tracked**:
- Performance score (target: >85)
- Accessibility score (target: >90)
- TBT (Total Blocking Time, target: <300ms)
- First Load JS (target: <220KB)

**Runs On**: Every pull request

---

### 5. Animation & UX Libraries

#### Framer Motion

**Purpose**: React animations and transitions

**Usage**:
- Product card flip animations (3D transforms)
- Cart drawer slide-in/out
- Page transitions
- Loading state animations

**Key Patterns**:
```typescript
import { motion, AnimatePresence } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
/>
```

#### Lenis (Smooth Scroll)

**Purpose**: 60fps smooth scrolling with momentum

**Implementation**: `hooks/useHashNavigation.ts`

**Configuration**:
```typescript
new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
})
```

**Integration**: RAF loop for smooth updates, hash-based navigation support

---

### 6. Security

#### DOMPurify

**Purpose**: XSS prevention for HTML content from WooCommerce

**Usage**: Sanitizes product descriptions before rendering

```typescript
import DOMPurify from 'isomorphic-dompurify'

const cleanHTML = DOMPurify.sanitize(product.description)
```

**Why Needed**: WooCommerce allows HTML in product descriptions, must sanitize to prevent XSS

---

### 7. State Management

#### Zustand

**Purpose**: Client-side state management (cart, UI state)

**Stores**:

**Cart Store** (`stores/cart.ts`):
```typescript
interface CartState {
  items: CartItem[]
  addItem: (item) => void
  removeItem: (id) => void
  updateQuantity: (id, quantity) => void
  clearCart: () => void
}
```

**Persistence**: Uses `zustand/middleware` persist with localStorage key `'cart-storage'`

**UI Store** (`stores/ui.ts`):
```typescript
interface UIState {
  isCartDrawerOpen: boolean
  setCartDrawerOpen: (open) => void
}
```

---

### 8. Data Fetching

#### React Query (TanStack Query)

**Purpose**: Server state management, caching, and background refetching

**Configuration**: `components/providers/QueryProvider.tsx`

**Usage Pattern**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['products', category],
  queryFn: () => fetch('/api/products?category=' + category)
})
```

**Cache Configuration**:
- `staleTime: 1000 * 60 * 5` (5 minutes)
- `gcTime: 1000 * 60 * 10` (10 minutes)
- Automatic refetch on window focus

**Endpoints Wrapped**:
- `/api/products` - Product listing
- `/api/products/[slug]` - Product details (TODO)
- `/api/orders` - Order creation and retrieval

---

## Integration Points Summary

| Service | Type | Status | Environment Variables |
|---------|------|--------|----------------------|
| WooCommerce | REST API | ✅ Active | `WOOCOMMERCE_URL`, `_CONSUMER_KEY`, `_CONSUMER_SECRET` |
| PortOne | Payment | ✅ Active | `PORTONE_STORE_ID`, `_API_SECRET` |
| Eximbay | Payment | ⏳ Pending | `EXIMBAY_MID`, `_SECRET_KEY` |
| Google Analytics | Analytics | ✅ Active | `GA_MEASUREMENT_ID` |
| next-intl | i18n | ✅ Active | None (config-based) |
| Framer Motion | Animation | ✅ Active | None |
| Lenis | Smooth Scroll | ✅ Active | None |
| React Query | Data Fetching | ✅ Active | None |
| Zustand | State | ✅ Active | None |
| DOMPurify | Security | ✅ Active | None |

---

## Missing Integrations (Future Considerations)

- Email service (Resend, SendGrid, or AWS SES) for order confirmations
- SMS service (Twilio or Aligo) for order notifications
- Error monitoring (Sentry or LogRocket)
- A/B testing platform
- Customer support chat (Intercom, Drift, or Zendesk)

---

*Last analyzed: 2026-01-27*
