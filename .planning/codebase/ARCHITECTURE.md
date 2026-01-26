# Architecture

## High-Level System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│   Cloudflare CDN    │  (DNS, SSL, DDoS protection)
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│   Vercel Edge       │  (Next.js 14 App Router)
│  (Global Network)   │
└──────┬──────────────┘
       │
       ├─→ Static Pages (prerendered at build)
       ├─→ Server Components (SSR on demand)
       ├─→ API Routes (/api/*)
       │
       └─→ External APIs
           │
           ├─→ WooCommerce REST API (Gabia WordPress)
           ├─→ PortOne Payment Gateway
           ├─→ Eximbay Payment Gateway
           └─→ Google Analytics 4
```

---

## Application Architecture

### 1. Next.js App Router Architecture

**Framework**: Next.js 14 (App Router paradigm)

**Rendering Strategies**:
- **Static Generation (SSG)**: Homepage, static pages (built at deploy time)
- **Server-Side Rendering (SSR)**: Product pages, shop listing (on-demand)
- **Client-Side Rendering (CSR)**: Cart interactions, checkout form
- **API Routes**: Backend proxy to WooCommerce, payment webhooks

**File-Based Routing**:
```
app/
├── [locale]/                     # Locale-based routing (ko, en)
│   ├── layout.tsx               # Locale-specific layout
│   ├── page.tsx                 # Homepage (/)
│   ├── shop/
│   │   ├── page.tsx             # Shop listing (/shop)
│   │   └── [slug]/page.tsx      # Product detail (/shop/esim-5days)
│   ├── cart/page.tsx            # Cart (/cart)
│   ├── checkout/page.tsx        # Checkout (/checkout)
│   └── order-complete/page.tsx  # Order confirmation (/order-complete)
└── api/
    ├── products/route.ts        # GET /api/products
    ├── orders/route.ts          # POST /api/orders
    └── payment/
        ├── initiate/route.ts    # POST /api/payment/initiate
        └── webhook/route.ts     # POST /api/payment/webhook
```

---

### 2. Internationalization (i18n) Architecture

**Library**: `next-intl`

**Locale Detection Flow**:
```
Browser Request
  ↓
Middleware (middleware.ts)
  ├─→ Check URL path for locale (/ko/*, /en/*)
  ├─→ Check Accept-Language header
  └─→ Default to 'ko' if not found
  ↓
Rewrite to /[locale]/path
  ↓
Render page with locale context
```

**Message Loading**:
- Messages stored in `messages/{locale}.json`
- Loaded at build time (not runtime)
- Accessed via `useTranslations()` hook

**Locale Switching**:
- UI component: `components/ui/LanguageSwitcher.tsx`
- Uses Next.js router to navigate to `/[newLocale]/currentPath`
- Preserves query params and hash

---

### 3. State Management Architecture

**Global State** (Zustand):
- **Cart State** (`stores/cart.ts`):
  - Items, quantities, totals
  - Persisted to localStorage (`'cart-storage'`)
  - Actions: add, remove, update, clear

- **UI State** (`stores/ui.ts`):
  - Cart drawer open/closed
  - Mobile menu open/closed
  - Loading states

**Server State** (React Query):
- Product listings (cached 5 minutes)
- Product details (cached 5 minutes)
- Order status (no cache)

**Component State** (React useState):
- Form inputs (checkout form, filters)
- UI toggles (accordion open/closed)
- Local animations (hover states)

---

### 4. Data Flow Patterns

#### Product Listing Flow

```
User navigates to /shop
  ↓
Page Component (SSR)
  ├─→ Fetch products from /api/products (server-side)
  ├─→ Render ProductGrid with initial data
  └─→ Hydrate client-side
  ↓
Client-Side Filtering
  ├─→ User applies filters (eSIM/Physical, duration)
  ├─→ React Query refetches with new params
  └─→ UI updates with filtered products
```

#### Cart Flow

```
User clicks "Add to Cart"
  ↓
addItem() action in cart store
  ├─→ Add item to Zustand state
  ├─→ Zustand middleware persists to localStorage
  └─→ Toast notification appears
  ↓
Cart icon badge updates (auto-synced)
  ↓
User opens cart drawer
  ├─→ CartDrawer component reads from cart store
  └─→ Displays items with +/- quantity controls
```

#### Checkout Flow

```
User clicks "Proceed to Checkout"
  ↓
Navigate to /checkout
  ↓
BillingForm rendered (react-hook-form + Zod validation)
  ↓
User fills form and clicks "Place Order"
  ↓
POST /api/orders
  ├─→ Create WooCommerce order (customer_id: 0 for guest)
  ├─→ Returns { order_id, order_key }
  └─→ Store in session/state
  ↓
POST /api/payment/initiate
  ├─→ Initialize PortOne/Eximbay payment
  ├─→ Returns payment URL or modal config
  └─→ Open payment UI
  ↓
Payment completed (webhook callback)
  ├─→ POST /api/payment/webhook
  ├─→ Verify payment signature
  ├─→ Update WooCommerce order status
  └─→ Redirect to /order-complete?order_id=XXX
  ↓
Display order confirmation + eSIM QR code
```

---

### 5. Single-Page Homepage Architecture

**Component**: `components/home/SinglePageHome.tsx`

**Navigation Pattern**: Hash-based scrolling (not page transitions)

**URL Structure**:
- `/` - Hero section (default)
- `/#products` - Products preview section
- `/#why-choose-us` - Benefits section
- `/#faq` - FAQ section
- `/#contact` - Contact section

**Scroll Management**:
- **Lenis** for smooth scrolling (60fps)
- **Intersection Observer** for active section tracking
- **Hash navigation** for bookmarkable sections
- **Browser history** (pushState) for back button support

**Performance Optimizations**:
- Products section lazy-loaded (`dynamic()` import)
- 3D SIM card animation conditionally rendered (mobile static fallback)
- Scroll listener throttled with `requestAnimationFrame`

---

### 6. API Architecture

**Proxy Pattern**: All external API calls go through Next.js API routes (not direct from client)

**Why Proxy?**
- Hide API credentials (WooCommerce keys stay on server)
- CORS management (Vercel → Gabia WordPress)
- Rate limiting (future implementation)
- Request/response transformation
- Error handling and logging

**API Route Structure**:

```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  // Call WooCommerce API (server-side)
  const products = await getAllProducts({ category })

  // Transform data
  const transformed = products.map(transformWooCommerceProduct)

  // Return to client
  return NextResponse.json(transformed)
}
```

**Error Handling**:
- Try-catch at API route level
- Return appropriate HTTP status codes (400, 404, 500)
- Client-side React Query error states

---

### 7. Component Architecture

**Component Hierarchy**:

```
RootLayout (app/layout.tsx)
├── QueryProvider (React Query setup)
├── LocaleLayout (app/[locale]/layout.tsx)
│   ├── Header (navigation, cart icon, language switcher)
│   ├── {children} (page content)
│   └── Footer (links, credits)
└── GoogleAnalytics (tracking script)
```

**Component Types**:

1. **Layout Components** (`components/layout/`):
   - Header, Footer, MobileNav
   - Shared across all pages

2. **Page Components** (`components/home/`, `components/shop/`):
   - Feature-specific sections
   - SinglePageHome, ProductGrid, ProductCard

3. **Feature Components** (`components/cart/`, `components/checkout/`):
   - CartDrawer, CheckoutForm, OrderSummary
   - Business logic encapsulation

4. **UI Components** (`components/ui/`):
   - Button, Card, Input, Select, Accordion
   - Reusable primitives

5. **Provider Components** (`components/providers/`):
   - QueryProvider (React Query setup)
   - Wrap app with context

**Component Communication**:
- Props for parent → child
- Callbacks for child → parent
- Zustand stores for cross-tree state
- React Query for server data

---

### 8. Performance Architecture

#### Image Optimization

**Next.js Image Component**:
```typescript
import Image from 'next/image'

<Image
  src="/images/product.jpg"
  alt="Product"
  width={300}
  height={300}
  loading="lazy"  // Lazy load below fold
  priority       // Eager load above fold (hero)
/>
```

**Optimizations**:
- Automatic WebP conversion
- Responsive image sizing
- Lazy loading by default
- CDN delivery via Vercel

#### Code Splitting

**Automatic**:
- Each route automatically code-split
- Shared chunks extracted (React, UI components)

**Manual**:
```typescript
const ProductsSection = dynamic(
  () => import('@/components/home/ProductsSection'),
  {
    loading: () => <Skeleton />,
    ssr: false  // Client-side only (3D animations)
  }
)
```

#### Font Optimization

**next/font** for self-hosted fonts:
```typescript
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' })
```

**Benefits**:
- Self-hosted (no external requests)
- Automatic subsetting
- Preloaded in `<head>`

---

### 9. SEO & Analytics Architecture

**Metadata API** (Next.js 14):
```typescript
export const metadata: Metadata = {
  title: '82Mobile - Korea eSIM',
  description: 'Stay connected in Korea with instant eSIM',
  openGraph: { ... },
  twitter: { ... }
}
```

**Google Analytics 4**:
- Script injected in root layout
- Event tracking via `gtag()` function
- E-commerce events (view_item, add_to_cart, purchase)

**Structured Data** (TODO):
- Product schema for rich snippets
- Organization schema
- BreadcrumbList for navigation

---

## Deployment Architecture

**Platform**: Vercel (Next.js optimized)

**Build Process**:
1. Git push to main branch
2. Vercel webhook triggers build
3. Next.js build:
   - Static pages generated (SSG)
   - API routes bundled as serverless functions
   - Assets optimized and uploaded to CDN
4. Deploy to global edge network
5. Automatic HTTPS via Let's Encrypt

**Environment Variables**:
- Set in Vercel dashboard
- Separate for preview/production
- Secrets encrypted

**Caching Strategy**:
- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- API routes: No cache (dynamic)
- Pages: Depends on rendering strategy

---

## Security Architecture

**Authentication**: None (guest checkout only in v1.0)

**API Security**:
- WooCommerce keys stored as environment variables (server-side only)
- Payment webhooks verify signature before processing
- DOMPurify sanitizes HTML from WooCommerce

**HTTPS**: Enforced by Vercel (automatic redirect)

**CORS**: Handled by Next.js API routes (proxy pattern)

**Rate Limiting**: None in v1.0 (future: Vercel middleware)

---

## Future Architecture Considerations

1. **Authentication System**:
   - User accounts with NextAuth.js
   - Order history and saved addresses
   - Wishlist functionality

2. **Admin Dashboard**:
   - Internal order management
   - Analytics dashboard
   - Customer support tools

3. **Edge Functions**:
   - A/B testing at the edge
   - Geolocation-based routing
   - Bot detection

4. **Microservices**:
   - Separate inventory service
   - Notification service (email/SMS)
   - Search service (Algolia)

---

*Last analyzed: 2026-01-27*
