# 82mobile Headless WordPress + Next.js Migration

This project is a **headless WordPress + Next.js** implementation for 82mobile.com, migrating from a traditional WordPress monolith to a modern, performant architecture.

## 🎯 Project Goals

- **Solve Gabia caching issues**: API-based architecture bypasses server-side file caching
- **Modern UX**: React/Next.js for interactive, app-like experience
- **Better performance**: SSR/SSG with Vercel edge network
- **Credit card payments**: Integration with PortOne (아임포트) payment gateway
- **Multilingual support**: Korean, English, Chinese, Japanese

## 🏗️ Architecture

```
User → Cloudflare (CDN/Proxy) → Vercel (Next.js Frontend)
                                      ↓
                              Gabia (WordPress API)
                                      ↓
                              WooCommerce (Products/Orders)
```

## 📦 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14 (App Router) | SSR/SSG, routing, API routes |
| Styling | TailwindCSS + Framer Motion | Korean cultural design system |
| State | Zustand | Cart and user state management |
| i18n | next-intl | Multilingual support |
| CMS | WordPress (Headless) | Content and product management |
| E-commerce | WooCommerce REST API | Product catalog, orders |
| Payment | PortOne (아임포트) | Credit card, virtual account |
| Hosting | Vercel | Frontend deployment |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- WordPress site with WooCommerce (already set up at 82mobile.com)
- WooCommerce REST API credentials
- PortOne account and API keys

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd 82mobile-next
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   - `WC_CONSUMER_KEY`: From WooCommerce → Settings → Advanced → REST API
   - `WC_CONSUMER_SECRET`: From WooCommerce → Settings → Advanced → REST API
   - `PORTONE_*`: From PortOne dashboard

3. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
82mobile-next/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── page.tsx        # Homepage
│   │   ├── shop/           # Product listing & details
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   └── layout.tsx      # Locale layout
│   ├── api/                # API routes
│   │   ├── checkout/       # Payment processing
│   │   └── webhook/        # Payment webhooks
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header.tsx          # Site header
│   ├── Footer.tsx          # Site footer
│   ├── ProductCard.tsx     # Product display
│   └── ...
├── lib/
│   ├── woocommerce.ts      # WooCommerce API client
│   └── utils.ts            # Utility functions
├── stores/
│   └── cart.ts             # Zustand cart store
├── messages/               # Translations
│   ├── ko.json             # Korean
│   ├── en.json             # English
│   ├── zh.json             # Chinese
│   └── ja.json             # Japanese
├── middleware.ts           # next-intl middleware
└── i18n.ts                 # i18n configuration
```

## 🎨 Design System

The project uses a **Korean cultural design system** inspired by Dancheong (단청) and Hanbok:

### Colors

```css
--dancheong-red: #CD2E3A    /* Primary brand color */
--hanbok-blue: #0047AB      /* Secondary brand color */
--jade-green: #7CB342       /* Accent color */
--seoul-night: #1a1a2e      /* Dark backgrounds */
--neon-pink: #FF1744        /* CTA highlights */
--neon-cyan: #00E5FF        /* Interactive elements */
```

### Typography

- **Display**: Outfit (headings, hero text)
- **Heading**: Syne (section titles)
- **Body**: Plus Jakarta Sans (content, UI)

### Animations

- Turtle loading animation with Seoul gradient
- 3D product card flip on hover
- Parallax scrolling effects
- Smooth scroll progress indicator

## 📋 Migration Phases

### ✅ Phase 0: Preparation (Current)
- [x] Next.js project scaffold
- [x] TailwindCSS with Korean design system
- [x] WooCommerce API integration setup
- [x] Internationalization (next-intl)
- [x] Cart state management (Zustand)
- [ ] WordPress REST API enabled
- [ ] Cloudflare route splitting configured

### 🔄 Phase 1: Design System + Static Pages (Week 3-4)
- [ ] Homepage with hero section
- [ ] About, Contact, FAQ pages
- [ ] Header with mega menu
- [ ] Footer with newsletter
- [ ] Loading screen with turtle animation

### 📦 Phase 2: Product Catalog (Week 5-6)
- [ ] Shop listing page (`/shop`)
- [ ] Product detail pages (`/shop/[slug]`)
- [ ] Category filtering
- [ ] Product search
- [ ] Wishlist functionality

### 🛒 Phase 3: Cart & Checkout (Week 7-8)
- [ ] Shopping cart page
- [ ] Checkout flow
- [ ] Order confirmation
- [ ] Email notifications

### 💳 Phase 4: Payment Gateway (Week 9-10)
- [ ] PortOne integration
- [ ] Credit card payments
- [ ] Virtual account
- [ ] Payment webhooks
- [ ] Order status updates

### 🌐 Phase 5: Multilingual (Week 11)
- [ ] Complete translations (ko, en, zh, ja)
- [ ] Language switcher
- [ ] Locale-specific SEO

### 🚀 Phase 6: Go Live (Week 12)
- [ ] Production deployment to Vercel
- [ ] Cloudflare route cutover
- [ ] Performance monitoring
- [ ] SEO verification

## 🔧 WordPress Setup (Phase 0 Tasks)

These tasks require manual setup in WordPress:

### 1. Enable WooCommerce REST API

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add Key**
3. Set **Description**: "Next.js Frontend"
4. Set **User**: Your admin user
5. Set **Permissions**: Read/Write
6. Click **Generate API Key**
7. Copy **Consumer Key** and **Consumer Secret** to `.env.local`

### 2. Install JWT Authentication Plugin

```bash
# Via WordPress admin:
Plugins → Add New → Search "JWT Authentication for WP REST API"
Install and activate
```

Or download from: https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

### 3. Add CORS Headers

Create `/wp-content/mu-plugins/cors.php`:

```php
<?php
add_action('rest_api_init', function() {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function($value) {
    header('Access-Control-Allow-Origin: https://82mobile.com');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    return $value;
  });
});
```

### 4. Test API Access

```bash
# Test products endpoint
curl https://82mobile.com/wp-json/wc/v3/products \
  -u "ck_xxx:cs_xxx"
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

### WordPress & WooCommerce
- `WORDPRESS_URL`: WordPress site URL (https://82mobile.com)
- `WC_CONSUMER_KEY`: WooCommerce API consumer key
- `WC_CONSUMER_SECRET`: WooCommerce API consumer secret

### PortOne Payment Gateway
- `NEXT_PUBLIC_PORTONE_STORE_ID`: PortOne store ID
- `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`: PortOne channel key
- `PORTONE_API_KEY`: PortOne API key (server-side)
- `PORTONE_API_SECRET`: PortOne API secret (server-side)

### Next.js
- `NEXT_PUBLIC_URL`: Production URL (https://82mobile.com)

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build

# Start production server
npm run start
```

## 📚 Key Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [PortOne (아임포트) Docs](https://portone.gitbook.io/docs/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

## 🤝 Contributing

This is a private project for 82mobile.com. For questions or issues:

**Developer**: 이종철 (Whitehat Marketing)
- Email: jyongchul@naver.com
- Phone: 010-9333-2028

**Project Owner**: 권아담 (Adam Korea Simcard)
- Email: adamwoohaha@naver.com
- Phone: 010-6424-6530

## 📄 License

Private project - All rights reserved © 2026 82mobile

---

**Status**: Phase 0 (Foundation) ✅ | Next: Phase 1 (Design System + Static Pages)
