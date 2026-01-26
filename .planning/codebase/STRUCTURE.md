# Structure

## Project Directory Overview

```
82mobile-next/
├── .next/                    # Next.js build output (gitignored)
├── app/                      # App Router pages and API routes
├── components/               # React components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and configurations
├── messages/                 # i18n translation files
├── public/                   # Static assets
├── stores/                   # Zustand state management
├── types/                    # TypeScript type definitions
├── .env.local               # Environment variables (gitignored)
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore rules
├── i18n.ts                  # i18n configuration
├── middleware.ts            # Next.js middleware (locale detection)
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## `/app` Folder Structure

### Pages (Route Handlers)

```
app/
├── [locale]/                           # Locale-based routing wrapper
│   ├── layout.tsx                     # Locale-specific layout (Header, Footer)
│   ├── page.tsx                       # Homepage (/)
│   │
│   ├── shop/
│   │   ├── page.tsx                   # Shop listing page (/shop)
│   │   └── [slug]/
│   │       └── page.tsx               # Product detail page (/shop/esim-5-days)
│   │
│   ├── cart/
│   │   └── page.tsx                   # Cart page (/cart)
│   │
│   ├── checkout/
│   │   └── page.tsx                   # Checkout page (/checkout)
│   │
│   ├── order-complete/
│   │   └── page.tsx                   # Order confirmation page (/order-complete)
│   │
│   ├── about/
│   │   └── page.tsx                   # About us page (/about)
│   │
│   ├── contact/
│   │   └── page.tsx                   # Contact page (/contact)
│   │
│   └── faq/
│       └── page.tsx                   # FAQ page (/faq)
│
├── layout.tsx                          # Root layout (QueryProvider, GA)
└── globals.css                         # Global styles
```

### API Routes

```
app/api/
├── products/
│   └── route.ts                       # GET /api/products (list all products)
│
├── orders/
│   └── route.ts                       # POST /api/orders (create order)
│                                      # GET /api/orders?id=XXX (get order)
│
└── payment/
    ├── initiate/
    │   └── route.ts                   # POST /api/payment/initiate
    │
    └── webhook/
        └── route.ts                   # POST /api/payment/webhook
```

---

## `/components` Folder Structure

```
components/
├── analytics/
│   └── GoogleAnalytics.tsx            # GA4 tracking script component
│
├── cart/
│   ├── CartDrawer.tsx                 # Side drawer cart UI
│   ├── CartDrawerItems.tsx            # Cart items list with +/- controls
│   └── OrderSummary.tsx               # Subtotal, shipping, total display
│
├── checkout/
│   ├── BillingForm.tsx                # Checkout form (react-hook-form + Zod)
│   ├── CheckoutSummary.tsx            # Order summary in checkout
│   └── PaymentMethods.tsx             # Payment method selection UI
│
├── home/
│   ├── FaqPreview.tsx                 # FAQ preview section (accordion)
│   ├── Hero.tsx                       # Hero section (NOT USED - inline in SinglePageHome)
│   ├── ProductPreview.tsx             # Product preview cards (3 featured products)
│   ├── RotatingSIMCard.tsx            # 3D rotating SIM card animation
│   ├── SinglePageHome.tsx             # Main single-page homepage component
│   └── WhyChooseUs.tsx                # Why choose us section (3 reasons)
│
├── layout/
│   ├── Footer.tsx                     # Site footer (links, credits)
│   ├── Header.tsx                     # Site header (logo, nav, cart icon)
│   └── MobileNav.tsx                  # Mobile hamburger menu
│
├── mobile/
│   └── MobileCTA.tsx                  # Sticky mobile bottom CTA button
│
├── providers/
│   └── QueryProvider.tsx              # React Query setup wrapper
│
├── shop/
│   ├── ProductCard.tsx                # Product card with 3D flip animation
│   ├── ProductExpansion.tsx           # Inline product detail expansion (AnimatePresence)
│   ├── ProductFilter.tsx              # Filter UI (type, duration)
│   ├── ProductGrid.tsx                # Product grid layout with filtering
│   └── ProductsSection.tsx            # Products section for homepage
│
└── ui/
    ├── Accordion.tsx                  # Accordion component (FAQ)
    ├── Button.tsx                     # Button primitive component
    ├── Card.tsx                       # Card primitive component
    ├── Input.tsx                      # Input primitive component
    ├── LanguageSwitcher.tsx           # Language toggle (ko/en)
    └── Select.tsx                     # Select dropdown component
```

### Component Organization Principles

1. **Feature-based grouping**: Components grouped by feature area (cart, checkout, shop)
2. **Colocation**: Related components placed together (CartDrawer + CartDrawerItems)
3. **Separation of concerns**: UI primitives (`ui/`) separate from feature components
4. **Single responsibility**: Each component has one clear purpose

---

## `/hooks` Folder Structure

```
hooks/
├── useCart.ts                         # Cart store hook (re-export from stores/cart)
├── useHashNavigation.ts               # Hash-based scroll navigation for single-page
└── useMediaQuery.ts                   # Responsive breakpoint hook
```

---

## `/lib` Folder Structure

```
lib/
├── eximbay.ts                         # Eximbay payment utility functions
├── portone.ts                         # PortOne payment utility functions
├── utils.ts                           # General utility functions (cn, formatPrice)
└── woocommerce.ts                     # WooCommerce API client and transformations
```

**Key Functions**:
- `lib/woocommerce.ts`:
  - `getAllProducts()` - Fetch products from WooCommerce
  - `getProductBySlug()` - Fetch single product
  - `createOrder()` - Create WooCommerce order
  - `transformWooCommerceProduct()` - Map WooCommerce schema to app types

- `lib/utils.ts`:
  - `cn()` - Tailwind class name merger (uses clsx)
  - `formatPrice()` - Currency formatting (₩ for KRW)

---

## `/stores` Folder Structure

```
stores/
├── cart.ts                            # Cart Zustand store (items, add, remove, update)
└── ui.ts                              # UI Zustand store (drawer open state)
```

**Cart Store Persistence**:
```typescript
// stores/cart.ts
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({ ... }),
    { name: 'cart-storage' }  // localStorage key
  )
)
```

---

## `/types` Folder Structure

```
types/
└── index.ts                           # Centralized type definitions
```

**Key Types**:
```typescript
// types/index.ts
export interface ProductData {
  id: number
  slug: string
  name: string
  price: number
  image: string
  description: string
  type: 'esim' | 'physical'
  duration: number
  coverage: string[]
}

export interface CartItem {
  product: ProductData
  quantity: number
  selectedPlan?: string
}

export interface Order {
  id: number
  customer: CustomerInfo
  items: CartItem[]
  total: number
  status: string
}
```

---

## `/messages` Folder Structure

```
messages/
├── ko.json                            # Korean translations
└── en.json                            # English translations
```

**Translation Structure**:
```json
{
  "nav": {
    "home": "홈",
    "shop": "상품",
    "cart": "장바구니"
  },
  "product": {
    "addToCart": "장바구니에 담기",
    "price": "가격"
  }
}
```

---

## `/public` Folder Structure

```
public/
├── images/
│   ├── hero/                          # Hero section images
│   ├── products/                      # Product images
│   ├── stores/                        # Store location images
│   └── logo.png                       # Site logo
│
├── favicon.ico                        # Site favicon
└── robots.txt                         # SEO robots file
```

---

## Configuration Files

### `next.config.js`

```javascript
const config = {
  reactStrictMode: true,
  images: {
    domains: ['82mobile.com'],  // Allow WooCommerce product images
  },
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
  },
}
```

### `tailwind.config.ts`

```typescript
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dancheong-red': '#CD2E3A',
        'hanbok-blue': '#0047AB',
        'jade-green': '#00A896',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
}
```

### `i18n.ts`

```typescript
export const locales = ['ko', 'en'] as const
export const defaultLocale = 'ko'
export type Locale = (typeof locales)[number]
```

### `middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Locale detection logic
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect to default locale
  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url)
  )
}
```

---

## File Naming Conventions

**React Components**:
- PascalCase: `ProductCard.tsx`, `SinglePageHome.tsx`
- One component per file (primary export matches filename)

**Utilities and Hooks**:
- camelCase: `woocommerce.ts`, `useHashNavigation.ts`

**API Routes**:
- `route.ts` for Next.js App Router convention

**Configuration Files**:
- kebab-case: `next.config.js`, `tailwind.config.ts`

**Type Files**:
- `index.ts` for centralized exports

---

## Import Alias Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage**:
```typescript
import { ProductCard } from '@/components/shop/ProductCard'
import { useCart } from '@/hooks/useCart'
import { getAllProducts } from '@/lib/woocommerce'
```

---

## Component Hierarchy Diagram

```
RootLayout (app/layout.tsx)
│
├── QueryProvider
│   └── LocaleLayout (app/[locale]/layout.tsx)
│       ├── Header
│       │   ├── Logo
│       │   ├── Navigation
│       │   ├── LanguageSwitcher
│       │   └── CartIcon
│       │
│       ├── {children} (page content)
│       │   ├── HomePage (SinglePageHome)
│       │   │   ├── Hero (inline)
│       │   │   ├── ProductsSection
│       │   │   ├── WhyChooseUs
│       │   │   ├── FaqPreview
│       │   │   └── Contact
│       │   │
│       │   ├── ShopPage
│       │   │   └── ProductGrid
│       │   │       └── ProductCard (multiple)
│       │   │
│       │   ├── CartPage
│       │   │   ├── CartDrawerItems
│       │   │   └── OrderSummary
│       │   │
│       │   └── CheckoutPage
│       │       ├── BillingForm
│       │       ├── CheckoutSummary
│       │       └── PaymentMethods
│       │
│       ├── Footer
│       │   ├── Links
│       │   └── Credits
│       │
│       ├── MobileCTA (mobile only)
│       └── CartDrawer (overlay)
│
└── GoogleAnalytics
```

---

## Code Organization Principles

1. **Feature-based structure**: Group by feature, not by file type
2. **Colocation**: Keep related files close (component + styles + tests)
3. **Single responsibility**: Each file/component has one clear purpose
4. **Dependency direction**: Pages → components → hooks → lib → types
5. **No circular dependencies**: Strict one-way data flow
6. **Barrel exports**: Use `index.ts` for clean imports where appropriate

---

*Last analyzed: 2026-01-27*
