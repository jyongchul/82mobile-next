# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**82mobile.com** — Next.js 14 headless e-commerce frontend for selling Korean SIM cards and eSIM services. Backed by WordPress/WooCommerce on Gabia shared hosting. Deployed on Vercel.

## Commands

```bash
npm run dev              # Development server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript strict check (tsc --noEmit)
npm run lighthouse       # Lighthouse CI audit (desktop)
npm run lighthouse:mobile # Lighthouse CI audit (mobile)
```

## Architecture

### Routing & i18n

- **App Router** with `[locale]` dynamic prefix — all pages live under `app/[locale]/`
- **next-intl** handles i18n — supported locales: `ko` (default), `en`
- Translation files: `messages/ko.json`, `messages/en.json`
- Middleware (`middleware.ts`) enforces locale prefix on all non-static routes and handles JWT auth for protected API routes (`/api/orders/[id]`, `/api/user/*`)

### State Management

- **Zustand** (`stores/cart.ts`) — client-side cart with localStorage persistence
- **React Query** (`@tanstack/react-query`) — server state for product fetching via `useProducts()` hook
- **UI Store** (`stores/ui.ts`) — drawer/modal visibility

### WooCommerce Integration

Custom API client in `lib/woocommerce.ts` (not the npm library) because Gabia virtual hosting requires Host header injection. Key API routes:

| Route | Purpose |
|---|---|
| `GET /api/products` | Product list (transforms WooCommerce data, rewrites images to local paths) |
| `GET /api/products/[slug]` | Single product with features, plans |
| `POST /api/orders` | Create WooCommerce order (JWT protected) |
| `POST /api/cart/*` | CoCart cart sessions (must use `x-www-form-urlencoded` — Gabia WAF blocks JSON) |
| `POST /api/payment/initiate` | PortOne/Eximbay payment flow |
| `POST /api/payment/webhook` | Payment gateway callbacks |
| `POST /api/auth/token` | JWT token from WordPress |

### Image Handling

Product images are downloaded locally to `public/images/products/` to avoid HTTP proxy issues with Gabia virtual hosting. API routes use `toLocalImage()` to rewrite WooCommerce URLs to `/images/products/{filename}`.

### Authentication

JWT tokens from WordPress JWT plugin, stored in httpOnly `auth-token` cookie. Verification uses `jose` library (Edge Runtime compatible). See `lib/wordpress-auth.ts`.

### Payment

- **PortOne** — Korean credit cards (primary)
- **Eximbay** — International cards (fallback)
- Config: `PORTONE_*` env vars (server-side secrets) + `NEXT_PUBLIC_PORTONE_*` (browser SDK)

### Design System (Tailwind)

Korean cultural "Dancheong" color palette defined in `tailwind.config.ts`:
- `dancheong-red` (#CD2E3A), `hanbok-blue` (#0047AB), `jade-green` (#7CB342)
- Fonts: Outfit (display), Syne (headings), Plus Jakarta Sans (body)
- Custom animations: `fade-in`, `slide-up`, `scale-up`, `turtle-swim`

## Key Patterns

- **Components use `'use client'`** when they need hooks/interactivity; layout/page files are server components by default
- **HTML from WooCommerce** is sanitized with DOMPurify (`lib/sanitize.ts`) before rendering with innerHTML
- **Cart operates dual-mode**: Zustand (fast client UX) + CoCart (server persistence)
- **Product cards** have 3D flip animation (`perspective-1000`, `backface-hidden`, `rotate-y-180`)
- **`onSelect` prop** on ProductCard — when provided (homepage), prevents Link navigation and opens parent modal instead

## Environment Variables

Required in `.env.local` (see `.env.local.template`):

```
WORDPRESS_URL=https://82mobile.com
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
JWT_SECRET=...
NEXT_PUBLIC_PORTONE_STORE_ID=...
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=...
PORTONE_API_KEY=...
PORTONE_API_SECRET=...
NEXT_PUBLIC_URL=https://82mobile.com
```

## Gabia Hosting Quirks

- WordPress at Gabia IP `182.162.142.102` with virtual hosting — requires `Host: 82mobile.com` header
- WAF blocks JSON POST bodies to CoCart — must use `application/x-www-form-urlencoded`
- Custom WooCommerce proxy endpoint: `/wp-json/82m/v1/`
- FTP-deployed files cached 24-48 hours by server

## Contact

**Project Owner**: adamwoohaha@naver.com, 010-6424-6530
**Developer**: jyongchul@naver.com, 010-9333-2028
