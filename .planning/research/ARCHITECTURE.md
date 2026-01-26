# Architecture Research

**Domain:** Headless WordPress + Next.js E-commerce
**Researched:** 2026-01-27
**Confidence:** HIGH

## Standard Architecture

### System Overview - Headless WordPress Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Vercel)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Next.js │  │  React  │  │ Zustand │  │  React  │        │
│  │   App   │  │  Query  │  │  Store  │  │  Server │        │
│  │ Router  │  │ (Cache) │  │ (Cart)  │  │  Comps  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                      API ROUTES LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /api/products  /api/orders  /api/payment/initiate │    │
│  │  (Next.js API Routes - Server-Side Only)            │    │
│  └─────────────────────────────────────────────────────┘    │
│       │ WooCommerce Client (OAuth 1.0a)                      │
├───────┴──────────────────────────────────────────────────────┤
│                    HTTP/REST API CALLS                       │
└─────────────────────────────────────────────────────────────┘
       │
       │ CORS + OAuth 1.0a Authentication
       ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND LAYER (Gabia Hosting)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │WordPress │  │WooCommerce│ │ Polylang │                   │
│  │   Core   │  │ REST API  │ │  (i18n)  │                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                   │
│       │             │             │                          │
├───────┴─────────────┴─────────────┴──────────────────────────┤
│                      MySQL DATABASE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Products │  │  Orders  │  │   Posts  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Next.js App Router** | Routing, SSR, ISR, page rendering | `/app/[locale]/shop/page.tsx` |
| **API Routes** | Backend proxy, authentication, data transformation | `/app/api/products/route.ts` |
| **WooCommerce Client** | WordPress REST API communication | `lib/woocommerce.ts` (OAuth 1.0a) |
| **Zustand Store** | Client-side cart state (persisted to localStorage) | `stores/cart.ts` |
| **React Query** | Server state caching, automatic refetching | Product data caching |
| **WordPress Backend** | Headless CMS/API, product catalog, order management | WooCommerce REST API v3 |
| **MySQL Database** | Persistent data storage for products, orders, users | Gabia hosted (external) |

## Recommended Project Structure

```
82mobile-next/
├── app/
│   ├── [locale]/           # i18n routes (ko, en, zh, ja)
│   │   ├── shop/           # Product listing & detail pages
│   │   ├── cart/           # Shopping cart page
│   │   ├── checkout/       # Checkout flow
│   │   └── order-complete/ # Order confirmation
│   ├── api/                # Next.js API routes (backend proxy)
│   │   ├── products/       # GET /api/products
│   │   ├── orders/         # POST /api/orders, GET /api/orders?id={orderId}
│   │   └── payment/        # Payment gateway integration
│   └── layout.tsx          # Root layout
├── lib/
│   ├── woocommerce.ts      # WooCommerce REST API client (OAuth 1.0a)
│   ├── hooks/              # Custom React hooks
│   ├── validation/         # Zod schemas (checkout-schema.ts)
│   └── payment/            # Payment gateway clients (portone.ts, eximbay.ts)
├── stores/
│   ├── cart.ts             # Zustand cart store (persisted)
│   └── ui.ts               # UI state (modals, loading states)
├── components/
│   ├── shop/               # Product cards, filters
│   ├── cart/               # Cart items, summary
│   └── checkout/           # Billing forms, payment methods
├── public/
│   └── images/             # Static assets
└── .env.local              # Environment variables
```

### Structure Rationale

- **`app/api/` folder:** Keeps WooCommerce credentials server-side (never exposed to client), enables request transformation and CORS handling
- **`stores/` folder:** Separates client-side state management from server state (React Query handles server state)
- **`lib/woocommerce.ts`:** Centralized API client with OAuth 1.0a authentication, reusable across all API routes
- **`[locale]` routes:** Supports 4 languages (Korean, English, Chinese, Japanese) via next-intl

## Architectural Patterns

### Pattern 1: API Route Proxy (Backend-for-Frontend)

**What:** Next.js API routes act as a proxy between frontend and WordPress, never exposing WooCommerce credentials to the browser.

**When to use:** Always for headless WordPress (prevents CORS issues, secures credentials, enables data transformation)

**Trade-offs:**
- ✅ Pros: Secure (credentials server-side only), CORS-free, enables caching/rate limiting
- ❌ Cons: Extra network hop (latency), more complex deployment

**Example:**
```typescript
// app/api/products/route.ts
import { getProducts } from '@/lib/woocommerce';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // Fetch from WordPress (server-side OAuth 1.0a)
  const products = await getProducts();

  // Transform & filter data before sending to client
  const filtered = products.filter(p =>
    category ? p.categories.some(c => c.slug === category) : true
  );

  return NextResponse.json({ success: true, products: filtered });
}
```

### Pattern 2: Client-Side Cart + Server-Side Order Creation

**What:** Cart state lives in browser (Zustand + localStorage), order creation happens server-side via API route.

**When to use:** E-commerce sites where cart must persist across sessions but orders require validation.

**Trade-offs:**
- ✅ Pros: Fast cart updates (no server round-trip), offline support, simple state management
- ❌ Cons: Cart state can diverge from inventory (need real-time validation at checkout)

**Example:**
```typescript
// stores/cart.ts - Client-side cart
const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => ({
          items: [...state.items, { ...item, quantity }]
        }));
      },
      clearCart: () => set({ items: [] })
    }),
    { name: 'cart-storage' } // Persisted to localStorage
  )
);

// app/api/orders/route.ts - Server-side order creation
export async function POST(request: Request) {
  const { items, billing } = await request.json();

  // Validate & create order in WooCommerce (server-side)
  const order = await createOrder({
    line_items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
    billing
  });

  return NextResponse.json({ success: true, orderId: order.id });
}
```

### Pattern 3: Incremental Static Regeneration (ISR) for Product Pages

**What:** Product pages are statically generated at build time, revalidated on-demand or after a time interval.

**When to use:** Product catalogs that change infrequently (few times per day).

**Trade-offs:**
- ✅ Pros: Near-instant page loads, reduced WordPress load, SEO-friendly
- ❌ Cons: Not real-time (up to revalidation interval delay), more complex cache invalidation

**Example:**
```typescript
// app/[locale]/shop/[slug]/page.tsx
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(p => ({ slug: p.slug }));
}

export const revalidate = 3600; // Revalidate every 1 hour

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return <ProductDetail product={product} />;
}
```

## Data Flow

### Request Flow - Product Listing

```
[User visits /shop]
    ↓
[Next.js SSR/ISR] → [API Route /api/products] → [WooCommerce Client] → [WordPress REST API]
    ↓                     ↓                          ↓                       ↓
[HTML Response] ← [Transform Data] ← [OAuth 1.0a Auth] ← [MySQL Query] ← [Database]
```

**Steps:**
1. User navigates to `/shop` page
2. Next.js checks if page is cached (ISR)
3. If not cached or stale, call `/api/products` API route
4. API route uses `lib/woocommerce.ts` client with OAuth 1.0a credentials
5. WooCommerce REST API queries MySQL database
6. API route transforms WooCommerce data to frontend-friendly format
7. Next.js renders page with product data
8. Cache for `revalidate` interval (e.g., 1 hour)

### Request Flow - Checkout & Order Creation

```
[User clicks "Place Order"]
    ↓
[Client submits cart + billing data] → [POST /api/orders] → [createOrder()] → [WordPress WooCommerce API]
    ↓                                          ↓                   ↓                      ↓
[Redirect to payment] ← [Order ID + Total] ← [Order created] ← [MySQL INSERT]
    ↓
[Payment Gateway (Eximbay/PortOne)]
    ↓
[Webhook: POST /api/payment/webhook] → [updateOrderStatus()] → [WordPress Order Status]
    ↓
[Order Complete Page]
```

**Steps:**
1. User fills billing form, clicks "Place Order"
2. Client-side cart (Zustand) + billing data sent to `/api/orders` (POST)
3. API route calls `createOrder()` in `lib/woocommerce.ts`
4. WooCommerce creates order in MySQL with status `pending`
5. API route returns `orderId` and `total`
6. Client initiates payment via `/api/payment/initiate`
7. User redirected to payment gateway (Eximbay or PortOne)
8. Payment gateway sends webhook to `/api/payment/webhook`
9. Webhook updates order status to `processing` or `completed`
10. User redirected to `/order-complete?orderId={id}`

### State Management

```
[Client State: Zustand]
    ↓ (subscribe)
[Cart Components] ←→ [addItem/removeItem] → [Zustand Store] → [localStorage]
    │
    └─ (on checkout) → [POST /api/orders]

[Server State: React Query]
    ↓ (fetch)
[Product Components] ←→ [useQuery('/api/products')] → [React Query Cache] → [Next.js API Route]
```

**Cart State (Zustand):**
- Lives in browser, persisted to `localStorage`
- Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- Survives page refresh, lost on browser clear

**Product State (React Query):**
- Fetched from `/api/products` on mount
- Cached for 5 minutes (default `staleTime`)
- Auto-refetch on window focus
- Falls back to mock data if API fails

### Key Data Flows

1. **Product Catalog Sync:** WordPress admin updates product → WooCommerce API returns new data → Next.js ISR regenerates page within `revalidate` interval
2. **Cart Persistence:** User adds to cart → Zustand updates state → Synced to `localStorage` → Survives page refresh
3. **Order Processing:** Cart submitted → API creates WooCommerce order → Payment initiated → Webhook confirms payment → Order status updated → Confirmation email sent

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Current architecture is fine. Single WordPress instance, Vercel Edge caching, ISR for products. |
| **1k-10k users** | Add CDN for images (Cloudflare Images), optimize WordPress queries (indexes on product tables), increase ISR revalidation to 15 min. |
| **10k-100k users** | WordPress read replicas for API calls, Redis cache for WooCommerce queries, dedicated payment gateway instances. |
| **100k+ users** | Microservices split (product catalog API, order API, payment API), consider headless commerce platform (Shopify Hydrogen, Medusa.js). |

### Scaling Priorities

1. **First bottleneck: WordPress API rate limits** (100k+ users)
   - **Fix:** Implement Redis cache layer in API routes, reduce WordPress load by caching transformed data
   - **Implementation:** Add `node-cache` or Redis to Next.js API routes with 1-hour TTL

2. **Second bottleneck: Gabia extreme caching (24-48h TTL)**
   - **Fix:** Migrate WordPress to dedicated hosting (AWS EC2, DigitalOcean) or managed WordPress (Kinsta, WP Engine)
   - **Why:** Current Gabia caching prevents real-time updates, causes deployment issues

3. **Third bottleneck: Database query performance** (1M+ products)
   - **Fix:** Elasticsearch for product search, database indexes on `wp_posts.post_status`, `wp_postmeta.meta_key`
   - **Alternative:** Move to headless commerce platform with built-in scaling (Medusa.js, Saleor)

## Anti-Patterns

### Anti-Pattern 1: Fetching WooCommerce API Directly from Client

**What people do:** Call `fetch('https://82mobile.com/wp-json/wc/v3/products?consumer_key=...')` from client-side React components

**Why it's wrong:**
- Exposes WooCommerce API keys in browser (security risk)
- CORS errors if WordPress not configured properly
- No request transformation or validation
- Difficult to implement authentication (JWT, cookies)

**Do this instead:** Use Next.js API routes as a proxy

```typescript
// ❌ WRONG - Client-side direct call
const products = await fetch('https://82mobile.com/wp-json/wc/v3/products?consumer_key=ck_xxx&consumer_secret=cs_xxx');

// ✅ CORRECT - API route proxy
const products = await fetch('/api/products');
```

### Anti-Pattern 2: Storing Cart in Database Before Checkout

**What people do:** Create WooCommerce "draft orders" every time user adds to cart

**Why it's wrong:**
- Creates database bloat (1000s of abandoned carts)
- Increases API calls to WordPress (rate limiting)
- Slower cart updates (network round-trip)
- Complicates cart sync across devices

**Do this instead:** Use client-side state (Zustand + localStorage), only create order on checkout

```typescript
// ❌ WRONG - Database cart
const addToCart = async (product) => {
  await fetch('/api/cart/add', { method: 'POST', body: JSON.stringify({ product }) });
  // Network round-trip, database write
};

// ✅ CORRECT - Client-side cart
const addToCart = (product) => {
  useCartStore.getState().addItem(product);
  // Instant update, persisted to localStorage
};
```

### Anti-Pattern 3: Using WordPress as Frontend Renderer

**What people do:** Keep WordPress theme rendering pages, use Next.js only for blog or specific sections

**Why it's wrong:**
- Defeats purpose of headless architecture (still coupled to WordPress)
- Cannot leverage Next.js SSR, ISR, or Edge rendering
- Worse performance (WordPress PHP rendering slower than React SSR)
- Complex deployment (need to sync themes between WordPress and Next.js)

**Do this instead:** WordPress is API-only, Next.js handles all rendering

```
❌ WRONG Architecture:
WordPress Theme (PHP) renders /shop → User visits 82mobile.com/shop → WordPress serves HTML

✅ CORRECT Architecture:
Next.js renders /shop → User visits 82mobile.com/shop → Next.js SSR → Fetch from WordPress API → Return HTML
WordPress admin panel ONLY (no public theme)
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **WooCommerce REST API** | OAuth 1.0a via Next.js API routes | Credentials in `.env.local` (never exposed) |
| **PortOne (아임포트)** | Client-side SDK + server-side webhook | Korean payment gateway (credit cards, bank transfer) |
| **Eximbay** | Server-side API + redirect flow | International payments for tourists |
| **Polylang** | WordPress plugin for i18n | Product translations stored in WordPress, fetched via API |
| **Vercel Edge Network** | Automatic via Next.js deployment | ISR, Edge caching, serverless functions |
| **Gabia MySQL Database** | External connection (db.82mobile.com) | Direct access for migrations, WordPress handles CRUD |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ API Routes** | HTTP/JSON (fetch) | All WordPress communication goes through API routes |
| **API Routes ↔ WooCommerce** | REST API (OAuth 1.0a) | `lib/woocommerce.ts` client used by all API routes |
| **Zustand ↔ localStorage** | Synchronous (persist middleware) | Cart auto-saved on every update |
| **React Query ↔ API Routes** | HTTP/JSON (fetch) | Automatic caching, refetching, error handling |
| **WordPress ↔ MySQL** | PDO/MySQLi (internal) | WordPress handles database queries internally |

## Headless WordPress Integration - Key Patterns

### Backend API Separation (WordPress as Backend-Only)

**Current State:**
- WordPress installed at Gabia shared hosting (FTP root `/`)
- WooCommerce REST API v3 enabled (`/wp-json/wc/v3/`)
- Next.js consumes WordPress via API routes (never direct)

**Integration Pattern:**
```typescript
// lib/woocommerce.ts - OAuth 1.0a Authentication
const woo = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL, // https://82mobile.com
  consumerKey: process.env.WC_CONSUMER_KEY, // ck_xxxxx
  consumerSecret: process.env.WC_CONSUMER_SECRET, // cs_xxxxx
  version: "wc/v3",
  queryStringAuth: true // Required for shared hosting
});
```

**WordPress Configuration:**
1. Disable WordPress frontend theme (redirect all requests to Next.js)
2. Enable WooCommerce REST API in Settings → Advanced → REST API
3. Create API keys: WooCommerce → Settings → Advanced → REST API → Add Key
4. Install CoCart plugin for enhanced cart API (optional but recommended)

### Frontend API Consumption from Next.js

**Pattern A: Server-Side Fetching (Recommended for ISR)**
```typescript
// app/[locale]/shop/page.tsx - Server Component
export const revalidate = 3600; // ISR: revalidate every 1 hour

export default async function ShopPage() {
  // Fetch directly in Server Component (no API route needed)
  const products = await getProducts(); // Uses lib/woocommerce.ts
  return <ProductGrid products={products} />;
}
```

**Pattern B: Client-Side Fetching (Recommended for Dynamic Data)**
```typescript
// app/[locale]/cart/page.tsx - Client Component
'use client';

export default function CartPage() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  return <ProductList products={products} />;
}
```

**Pattern C: API Route Proxy (Recommended for Client-Side + Authentication)**
```typescript
// app/api/orders/route.ts
export async function POST(request: Request) {
  const { items, billing } = await request.json();

  // OAuth 1.0a handled by lib/woocommerce.ts (server-side)
  const order = await createOrder({ line_items: items, billing });

  return NextResponse.json({ success: true, orderId: order.id });
}
```

### State Management in Headless Mode

**Session Management:**
- No WordPress sessions needed (Next.js is stateless)
- User authentication via JWT tokens (stored in cookies or localStorage)
- Guest checkout supported (no user account required)

**Auth Token Flow (if implementing user accounts):**
```
1. User logs in → POST /api/auth/login → WordPress JWT plugin generates token
2. Token stored in httpOnly cookie (secure, can't be accessed by JS)
3. Future API requests include cookie → Next.js API route validates token
4. Token expires after 7 days → User re-authenticates
```

**Cart State (Current Implementation):**
- Zustand store with `persist` middleware (localStorage)
- No server-side cart (until checkout)
- Benefits: Fast, offline-capable, no database bloat

**Order State:**
- Created in WooCommerce only at checkout
- Status tracked via `order.status` field:
  - `pending` → Order created, payment not completed
  - `processing` → Payment confirmed, awaiting fulfillment
  - `completed` → eSIM/SIM card delivered

### Data Flow Changes (Before/After Headless)

**BEFORE Headless (Monolithic WordPress):**
```
[User Browser] → [WordPress PHP Theme] → [WooCommerce Plugin] → [MySQL Database]
                       ↓
              [Renders HTML + CSS + JS]
                       ↓
              [Returns Full Page HTML]
```

**AFTER Headless (Current Architecture):**
```
[User Browser] → [Next.js Frontend (Vercel)] → [API Routes] → [WooCommerce REST API] → [MySQL Database]
      ↓                    ↓                         ↓                  ↓
[React Components] ← [Server/Client] ← [Transform Data] ← [WordPress (Gabia)]
```

**Key Differences:**
1. **Rendering:** PHP → React SSR/ISR (faster, better SEO)
2. **Data Fetching:** SQL queries in theme → REST API calls (decoupled)
3. **State Management:** WordPress session → Zustand + React Query (client-side)
4. **Deployment:** Single server → Vercel (frontend) + Gabia (backend)

### Deployment Architecture (Separate Hosts)

**Current Setup:**
- **Frontend (Next.js):** Hosted on Vercel (domain: TBD - Vercel conflict with 82mobile.com)
- **Backend (WordPress):** Gabia shared hosting (82mobile.com)
- **Database:** Gabia MySQL (db.82mobile.com)

**Routing Strategy Options:**

**Option 1: Subdomain Split (Recommended)**
```
www.82mobile.com → Vercel (Next.js frontend)
api.82mobile.com → Gabia (WordPress backend)
admin.82mobile.com → Gabia (WordPress admin panel)
```

**Option 2: Path-Based Routing**
```
82mobile.com/* → Vercel (Next.js frontend)
82mobile.com/wp-admin → Gabia (WordPress admin)
82mobile.com/wp-json → Gabia (WordPress API)
```

**Option 3: Full Domain Migration**
```
82mobile.com → Vercel (Next.js frontend)
82mobile-cms.com → Gabia (WordPress backend)
```

**DNS Configuration (Option 1 - Recommended):**
```
# Gabia DNS settings:
A     @                  → 82mobile.com (Gabia server IP)
CNAME www                → cname.vercel-dns.com
CNAME api                → 82mobile.com (Gabia server)
CNAME admin              → 82mobile.com (Gabia server)

# Vercel Project Settings:
Domain: www.82mobile.com
```

### Environment Variable Management Across Two Systems

**WordPress (.env or wp-config.php):**
```php
# Gabia WordPress - Only needs own config
define('DB_NAME', 'dbadam82mob0105');
define('DB_USER', 'adam82mob0105');
define('DB_PASSWORD', '06695bbf36155cd');
define('DB_HOST', 'db.82mobile.com');

# Enable CORS for headless
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

**Next.js (.env.local):**
```bash
# Next.js - Needs WordPress connection details
WORDPRESS_URL=https://82mobile.com
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxx

# Payment gateways
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxxxx
PORTONE_API_SECRET=xxxxx

# Deployment
NEXT_PUBLIC_URL=https://www.82mobile.com
```

**Vercel Environment Variables (Production):**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set visibility to "Production" (or "Production + Preview")
4. Restart deployment after changes

**Security Best Practices:**
- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's encrypted environment variables for secrets
- ✅ Rotate WooCommerce API keys every 90 days
- ✅ Use different API keys for development and production
- ❌ Never expose `WC_CONSUMER_SECRET` in client-side code

### Build Order and Deployment Strategy (Zero Downtime)

**Current State:**
- WordPress live at 82mobile.com (Gabia)
- Next.js not deployed yet (local development only)

**Deployment Strategy: Zero Downtime Migration**

**Phase 1: Parallel Deployment (No DNS Changes)**
```
Week 1: Deploy Next.js to Vercel with temporary domain
   → Vercel assigns: 82mobile-next.vercel.app
   → Test all features on staging domain
   → No impact to production WordPress site

Week 2: Enable CORS on WordPress for Vercel domain
   → Add to functions.php:
     header('Access-Control-Allow-Origin: https://82mobile-next.vercel.app');
   → Test API calls from Vercel to Gabia WordPress
```

**Phase 2: Subdomain Testing (Partial DNS Change)**
```
Week 3: Point www subdomain to Vercel
   → DNS: www.82mobile.com → Vercel
   → DNS: 82mobile.com (apex) → Still Gabia (WordPress)
   → Users can test Next.js at www.82mobile.com
   → Old WordPress still accessible at 82mobile.com

Week 4: Monitor traffic, fix bugs, collect feedback
   → Use Vercel Analytics to track errors
   → Keep WordPress as fallback
```

**Phase 3: Full Cutover (Complete Migration)**
```
Week 5: Point apex domain to Vercel
   → DNS: 82mobile.com → Vercel
   → DNS: api.82mobile.com → Gabia (WordPress API only)
   → Disable WordPress theme (redirect to Next.js)
   → Zero downtime: DNS propagation takes 5-30 minutes

Week 6: Clean up and monitoring
   → Remove WordPress theme files (keep admin only)
   → Set up monitoring (Sentry, LogRocket)
   → Celebrate successful migration! 🎉
```

**Build Order Dependencies:**

```
1. WordPress Configuration (Backend First)
   ├─ Enable WooCommerce REST API
   ├─ Create API keys
   ├─ Install CORS plugin or add headers
   └─ Test API endpoints with Postman

2. Next.js API Routes (Proxy Layer)
   ├─ Implement lib/woocommerce.ts client
   ├─ Build /api/products route
   ├─ Build /api/orders route
   └─ Test API routes locally

3. Next.js Frontend (UI Layer)
   ├─ Implement product listing page
   ├─ Implement cart functionality
   ├─ Implement checkout flow
   └─ Test full user journey

4. Payment Integration (Critical Path)
   ├─ Integrate PortOne/Eximbay SDKs
   ├─ Implement webhook handlers
   └─ Test payment flow end-to-end

5. Deployment (Zero Downtime)
   ├─ Deploy to Vercel (staging)
   ├─ Test on Vercel domain
   ├─ Update DNS (www first, then apex)
   └─ Monitor and fix issues
```

**Rollback Strategy:**

If Next.js deployment fails, rollback is instant:
```
1. Change DNS back to Gabia IP address (5 minutes)
2. WordPress still running (unchanged)
3. No data loss (all orders in WordPress database)
4. Users redirected back to WordPress theme
```

**Zero Downtime Guarantees:**

1. **DNS Level:** Use Cloudflare or Route53 with health checks → Auto-failover if Vercel down
2. **Application Level:** WordPress stays online during entire migration → API always available
3. **Data Level:** Single source of truth (WordPress MySQL) → No data sync issues
4. **Deployment Level:** Vercel auto-deploys to Edge → Instant global availability

**Post-Deployment Verification Checklist:**

```bash
# Test all critical paths after DNS change
✅ Homepage loads (www.82mobile.com)
✅ Product listing loads (/shop)
✅ Product detail page loads (/shop/[slug])
✅ Add to cart works (client-side state)
✅ Checkout flow completes (order created in WordPress)
✅ Payment redirect works (Eximbay/PortOne)
✅ Order confirmation page displays (/order-complete)
✅ WordPress admin accessible (admin.82mobile.com or 82mobile.com/wp-admin)
✅ API endpoints respond (api.82mobile.com/wp-json/wc/v3/products)
```

## Critical Constraint Handling

### Gabia Extreme Caching (24-48h TTL)

**Problem:** Gabia's server-level cache prevents WordPress API updates from reflecting immediately.

**Solutions:**

1. **For Development:** Use WordPress REST API endpoint caching headers to force revalidation
   ```php
   // functions.php - Disable caching for API responses
   add_filter('rest_post_dispatch', function($response) {
       $response->header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
       return $response;
   });
   ```

2. **For Production:** Accept 1-hour delay for product updates (use ISR `revalidate: 3600`)
   - Product changes are infrequent (few times per day)
   - ISR revalidation happens on first request after 1 hour
   - Next.js Edge cache ensures fast subsequent requests

3. **For Urgent Updates:** Use Vercel's On-Demand Revalidation API
   ```typescript
   // WordPress webhook triggers Next.js revalidation
   // POST https://www.82mobile.com/api/revalidate?secret=xxx&path=/shop
   export async function POST(request: Request) {
       const { path } = await request.json();
       await revalidatePath(path);
       return NextResponse.json({ revalidated: true });
   }
   ```

### Vercel Domain Conflict (82mobile.com Already Assigned)

**Problem:** Domain 82mobile.com already assigned to another Vercel project (cannot reassign without deleting).

**Solutions:**

1. **Temporary Subdomain (Development Phase):**
   - Use `www.82mobile.com` for Next.js
   - Keep `82mobile.com` (apex) for WordPress during testing
   - Easier to roll back if issues arise

2. **Contact Vercel Support (Production Phase):**
   - Vercel support can forcibly transfer domain between accounts
   - Required if previous developer had access
   - Takes 1-2 business days

3. **Use Cloudflare Proxy (Recommended):**
   - Point DNS to Cloudflare
   - Cloudflare proxies requests to Vercel via CNAME
   - Avoids Vercel domain limitation
   - Bonus: DDoS protection, WAF, caching

## Sources

- [Headless WordPress in 2026: A Complete Guide to Decoupled Web Creation](https://elementor.com/blog/headless-wordpress/)
- [Headless WordPress as an API for a Next.js application](https://tsh.io/blog/headless-wordpress-as-an-api-for-a-next-js-application)
- [How to Use Headless WordPress with Next.js and Vercel](https://vercel.com/guides/wordpress-with-vercel)
- [Headless eCommerce API for Developers – CoCart](https://wordpress.org/plugins/cart-rest-api-for-woocommerce/)
- [WordPress REST API CORS Issues Solved](https://robertmarshall.dev/blog/wordpress-rest-api-cors-issues/)
- [How can I migrate a site to Vercel without downtime?](https://vercel.com/kb/guide/zero-downtime-migration)
- [Using Headless WordPress with Next.js and Vercel](https://vercel.com/kb/guide/wordpress-with-vercel)
- [Incremental migration from WordPress for a dev-first approach](https://vercel.com/blog/incremental-migration-from-wordpress-for-a-dev-first-approach)

---
*Architecture research for: Headless WordPress + Next.js E-commerce Integration*
*Researched: 2026-01-27*
