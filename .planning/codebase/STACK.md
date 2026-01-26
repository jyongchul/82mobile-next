# Tech Stack

## Core Framework & Runtime

### Next.js 14.2.0
**Purpose**: React framework with App Router for SSR, SSG, and API routes

**Key Features Used**:
- App Router (file-based routing)
- Server Components (React Server Components)
- API Routes (serverless functions)
- Image Optimization (`next/image`)
- Font Optimization (`next/font`)
- Middleware (locale detection)

**Configuration**: `next.config.js`
```javascript
{
  reactStrictMode: true,
  images: { domains: ['82mobile.com'] },
  i18n: { locales: ['ko', 'en'], defaultLocale: 'ko' }
}
```

**Build Output**:
- Static pages (prerendered at build time)
- Server functions (API routes as serverless functions)
- Edge middleware (locale detection at edge)

---

### React 18.3.0
**Purpose**: UI library with concurrent features

**Features Used**:
- Server Components (default in App Router)
- Client Components (`'use client'` directive)
- Suspense boundaries (loading states)
- useTransition (state transitions)
- Concurrent rendering

**Rendering Modes**:
- Server-side rendering (SSR) for initial page loads
- Client-side rendering (CSR) for interactive features
- Hydration for seamless transition

---

### TypeScript 5.x
**Purpose**: Type-safe JavaScript with static analysis

**Configuration**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

**Type Safety**:
- All components strictly typed
- API responses typed with interfaces
- Zustand stores typed with generics
- Form validation with Zod schemas

---

## Styling & UI

### Tailwind CSS 3.4.0
**Purpose**: Utility-first CSS framework

**Configuration**: `tailwind.config.ts`
```typescript
{
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dancheong-red': '#CD2E3A',
        'hanbok-blue': '#0047AB',
        'jade-green': '#00A896'
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif']
      }
    }
  }
}
```

**Custom Design System**:
- Korean cultural color palette (Dancheong theme)
- Consistent spacing scale (4px base unit)
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- Dark mode support (class-based)

**Plugins Used**:
- `@tailwindcss/forms` (not installed - using default styles)
- `@tailwindcss/typography` (not installed)

---

### PostCSS 8.x
**Purpose**: CSS post-processing

**Plugins**:
```javascript
// postcss.config.js
{
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

**Autoprefixer**: Adds vendor prefixes for browser compatibility

---

## Animation & Interactions

### Framer Motion 11.5.0
**Purpose**: React animation library with declarative API

**Usage Patterns**:
```typescript
import { motion, AnimatePresence } from 'framer-motion'

// Entrance animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// Exit animations
<AnimatePresence>
  {isOpen && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>

// Layout animations (cart items reordering)
<motion.div layout />
```

**Performance Optimizations**:
- GPU acceleration (`transform`, `opacity`)
- `will-change` hints for animations
- Reduced motion media query support

**Key Animations**:
- Product card 3D flip (180° rotation on hover)
- Cart drawer slide-in/out
- Page transitions (fade + slide)
- Loading state animations

---

### Lenis 1.3.17
**Purpose**: Smooth scrolling library with momentum physics

**Integration**: `hooks/useHashNavigation.ts`
```typescript
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

**Benefits**:
- 60fps smooth scrolling with requestAnimationFrame
- Momentum-based physics
- Hash-based navigation support
- Cross-browser compatibility

---

### Lucide React 0.563.0
**Purpose**: Icon library (Feather icons fork)

**Usage**:
```typescript
import { ShoppingCart, Menu, X, Check } from 'lucide-react'

<ShoppingCart className="w-6 h-6" />
```

**Benefits**:
- Tree-shakeable (only used icons bundled)
- Consistent 24px grid design
- Customizable with className and style props
- TypeScript support

---

## State Management

### Zustand 4.5.0
**Purpose**: Lightweight state management with hooks API

**Stores**:

**Cart Store** (`stores/cart.ts`):
```typescript
interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({ ... }),
    { name: 'cart-storage' }
  )
)
```

**Middleware**:
- `persist` - localStorage synchronization
- Custom devtools integration (optional)

**Benefits**:
- No boilerplate (no actions/reducers)
- TypeScript-first API
- React hooks integration
- Small bundle size (~1KB)

---

### TanStack Query 5.56.0 (React Query)
**Purpose**: Server state management with caching and background refetching

**Configuration**: `components/providers/QueryProvider.tsx`
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true
    }
  }
})
```

**Usage Pattern**:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['products', category],
  queryFn: () => fetch('/api/products?category=' + category)
})
```

**Features Used**:
- Automatic caching
- Background refetching
- Request deduplication
- Optimistic updates (cart operations)
- Infinite queries (future: pagination)

---

## Data Fetching & Backend Integration

### WooCommerce REST API Client 1.0.1
**Purpose**: Official WooCommerce API client for Node.js

**Configuration**: `lib/woocommerce.ts`
```typescript
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'

const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY!,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET!,
  version: 'wc/v3',
  queryStringAuth: true
})
```

**Authentication**: OAuth 1.0a (consumer key + secret)

**Endpoints Used**:
- `GET /products` - Product listing
- `GET /products/{id}` - Product details
- `POST /orders` - Create order
- `GET /orders/{id}` - Order status

---

### Native Fetch API
**Purpose**: HTTP client for API routes and external APIs

**Usage**:
```typescript
// Client-side
const response = await fetch('/api/products')
const data = await response.json()

// Server-side (API routes)
const response = await fetch('https://external-api.com/data', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**Benefits**:
- Native browser API (no extra dependencies)
- Works in both client and server components
- Supports streaming responses

---

## Form Management & Validation

### React Hook Form 7.53.0
**Purpose**: Performant form library with minimal re-renders

**Integration**: Checkout form
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<CheckoutFormData>({
  resolver: zodResolver(checkoutSchema),
  mode: 'onBlur'
})
```

**Benefits**:
- Uncontrolled components (better performance)
- Built-in validation
- TypeScript support
- Small bundle size (~9KB)

---

### Zod 3.23.0
**Purpose**: TypeScript-first schema validation

**Usage**:
```typescript
import { z } from 'zod'

const checkoutSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
  phone: z.string().regex(/^\d{10,11}$/, 'Invalid phone')
})

type CheckoutFormData = z.infer<typeof checkoutSchema>
```

**Benefits**:
- Type inference (no duplicate type definitions)
- Runtime validation
- Composable schemas
- Error message customization

---

### @hookform/resolvers 5.2.2
**Purpose**: Adapters for integrating validation libraries with React Hook Form

**Integration**: Connects Zod schemas to React Hook Form

---

## Internationalization

### next-intl 3.20.0
**Purpose**: Next.js i18n library with App Router support

**Configuration**:
```typescript
// i18n.ts
export const locales = ['ko', 'en'] as const
export const defaultLocale = 'ko'

// middleware.ts
export function middleware(request: NextRequest) {
  // Locale detection and routing
}
```

**Message Files**:
- `messages/ko.json` - Korean translations
- `messages/en.json` - English translations

**Usage**:
```typescript
import { useTranslations } from 'next-intl'

const t = useTranslations('namespace')
<h1>{t('key')}</h1>
```

**Features**:
- File-based routing (`/ko/shop`, `/en/shop`)
- Type-safe translations (TypeScript integration)
- Locale detection (Accept-Language header)
- SEO-friendly (separate URLs per locale)

---

## Payment Integration

### @portone/browser-sdk 0.0.7
**Purpose**: PortOne (아임포트) payment SDK for browser

**Integration**: `lib/portone.ts`
```typescript
const IMP = window.IMP
IMP.init(process.env.NEXT_PUBLIC_PORTONE_STORE_ID)

IMP.request_pay({
  pg: 'html5_inicis',
  pay_method: 'card',
  merchant_uid: orderId,
  amount: total,
  name: productName
}, (response) => {
  if (response.success) {
    // Payment success
  }
})
```

**Payment Methods Supported**:
- Credit/debit cards
- Bank transfers (실시간 계좌이체)
- Virtual accounts (가상계좌)
- Mobile payments (카카오페이, 네이버페이)

---

## Security

### DOMPurify 3.3.1
**Purpose**: XSS protection for HTML sanitization

**Usage**: `lib/utils.ts` or inline in components
```typescript
import DOMPurify from 'isomorphic-dompurify'

const cleanHTML = DOMPurify.sanitize(product.description, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: []
})
```

**Why Needed**: WooCommerce allows HTML in product descriptions (admin control), must sanitize before rendering

**Isomorphic**: Works in both Node.js (SSR) and browser

---

## Performance Monitoring

### Web Vitals 5.1.0
**Purpose**: Google Core Web Vitals tracking

**Integration**: `app/layout.tsx`
```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)
```

**Metrics Tracked**:
- LCP (Largest Contentful Paint) - target: <2.5s
- FID (First Input Delay) - target: <100ms
- CLS (Cumulative Layout Shift) - target: <0.1
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

---

### Lighthouse CI 0.15.1
**Purpose**: Automated performance testing in CI/CD

**Configuration**: `.github/workflows/lighthouse-ci.yml`
```yaml
- name: Run Lighthouse CI
  run: npm run lighthouse
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Assertions**:
- Performance score >85
- Accessibility score >90
- Best practices score >90
- SEO score >90
- Total Blocking Time <300ms

**Runs On**: Every pull request (prevents regressions)

---

## Development Tools

### ESLint 8.x
**Purpose**: JavaScript/TypeScript linting

**Configuration**: `.eslintrc.json`
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

**Plugins**:
- `eslint-config-next` (Next.js recommended rules)

---

### TypeScript 5.x
**Purpose**: Static type checking

**Features Used**:
- Strict mode enabled
- Path aliases (`@/*`)
- JSX preservation (Next.js handles transformation)
- ES2017 target (browser compatibility)

---

### Chrome Launcher 1.2.1 & Lighthouse 12.8.2
**Purpose**: Automated browser testing and performance auditing

**Usage**: Lighthouse CI automation

---

## Runtime Environment

### Node.js
**Version**: 20.x (Vercel default)
**Purpose**: Server-side execution for API routes and build process

---

### Vercel Edge Network
**Purpose**: Hosting platform with global CDN

**Features Used**:
- Edge middleware (locale detection)
- Serverless functions (API routes)
- Static asset CDN
- Image optimization
- Automatic HTTPS

---

## Missing/Future Stack Additions

**Not Currently Used**:
- Testing framework (Jest, Vitest, Playwright)
- Component documentation (Storybook)
- Error monitoring (Sentry, LogRocket)
- Database ORM (not needed - headless CMS architecture)
- Authentication library (NextAuth.js - future v2)
- Email service (Resend, SendGrid - future)
- SMS service (Twilio, Aligo - future)

---

## Dependency Tree Size

**Total Dependencies**: 30 packages
**Dev Dependencies**: 13 packages

**Bundle Size Analysis** (estimated):
- Next.js framework: ~80KB (gzipped)
- React + React DOM: ~40KB (gzipped)
- Framer Motion: ~30KB (gzipped)
- React Query: ~12KB (gzipped)
- Zustand: ~1KB (gzipped)
- Other libraries: ~30KB (gzipped)

**Total First Load JS**: ~118-126KB (all pages <220KB target met)

---

## Upgrade Path

**Near-term (v1.1 - v1.3)**:
- Next.js 15 (stable App Router improvements)
- React 19 (when stable)
- Tailwind CSS 4 (performance improvements)

**Long-term (v2.0+)**:
- Add testing (Vitest + Playwright)
- Add error monitoring (Sentry)
- Add authentication (NextAuth.js v5)
- Add CMS integration (Sanity or Contentful)

---

*Last analyzed: 2026-01-27*
