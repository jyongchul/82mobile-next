# Phase 0: Preparation - Setup Guide

## ✅ What's Been Completed

The Next.js project foundation has been created with:

### 1. Project Structure ✅
- Next.js 14 with App Router
- TypeScript configuration
- TailwindCSS with Korean design system
- File structure as per migration plan

### 2. Design System ✅
- Korean cultural colors (Dancheong red, Hanbok blue, etc.)
- Custom fonts (Outfit, Syne, Plus Jakarta Sans)
- Animation utilities (turtle swim, fade-in, 3D card flip)
- Glassmorphism and gradient effects

### 3. Internationalization (i18n) ✅
- next-intl configured for 4 languages (ko, en, zh, ja)
- Translation files created
- Locale-based routing configured
- Middleware set up

### 4. WooCommerce Integration ✅
- API client library (`lib/woocommerce.ts`)
- Type definitions for products and orders
- Helper functions for fetching data

### 5. State Management ✅
- Zustand cart store configured
- Persistent localStorage
- Cart operations (add, remove, update quantity)

### 6. Basic Pages ✅
- Root layout with font loading
- Locale layout with i18n
- Homepage with hero section

---

## 🔧 What Needs Manual Setup

These tasks require access to WordPress admin, Cloudflare, and external services:

### Task 1: Enable WooCommerce REST API 🔑

**Where**: WordPress Admin Dashboard

**Steps**:
1. Log in to WordPress admin: http://82mobile.com/wp-admin
   - Username: `whadmin`
   - Password: `WhMkt2026!@AdamKorSim`

2. Navigate to **WooCommerce → Settings → Advanced → REST API**

3. Click **Add Key**

4. Configure:
   - Description: `Next.js Frontend`
   - User: `whadmin`
   - Permissions: **Read/Write**

5. Click **Generate API Key**

6. **IMPORTANT**: Copy the credentials immediately (they won't be shown again):
   - Consumer Key: `ck_...`
   - Consumer Secret: `cs_...`

7. Save these credentials to `/mnt/c/82Mobile/82mobile-next/.env.local`:
   ```env
   WC_CONSUMER_KEY=ck_your_key_here
   WC_CONSUMER_SECRET=cs_your_secret_here
   ```

**Test**:
```bash
curl https://82mobile.com/wp-json/wc/v3/products \
  -u "ck_your_key:cs_your_secret"
```

You should see JSON product data.

---

### Task 2: Deploy CORS Plugin 🌐

**Where**: WordPress via FTP

**What**: The CORS plugin allows Next.js (running on Vercel) to access the WordPress API.

**Steps**:

1. Navigate to the wordpress-setup directory:
   ```bash
   cd /mnt/c/82Mobile/82mobile-next/wordpress-setup
   ```

2. Run the deployment script:
   ```bash
   python3 deploy_cors_plugin.py
   ```

3. The script will:
   - Connect to WordPress via FTP
   - Create `/wp-content/mu-plugins/` directory if needed
   - Upload `82mobile-cors.php`
   - The plugin auto-activates (mu-plugins don't need manual activation)

4. **Verify**: Visit https://82mobile.com/wp-json/ - you should see API endpoints

**Manual Method** (if script fails):
1. Upload `wordpress-setup/cors.php` via FTP to `/wp-content/mu-plugins/82mobile-cors.php`
2. The plugin will auto-activate

---

### Task 3: Set Up Cloudflare Route Splitting 🔀

**Where**: Cloudflare Dashboard

**What**: Configure Cloudflare to route traffic between WordPress and Next.js.

**Steps**:

1. Log in to Cloudflare dashboard

2. Select domain: `82mobile.com`

3. Go to **Workers & Pages**

4. Create a new Worker with this code:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Route WordPress admin and API to Gabia
  if (
    url.pathname.startsWith('/wp-admin') ||
    url.pathname.startsWith('/wp-json') ||
    url.pathname.startsWith('/wp-content') ||
    url.pathname.startsWith('/wp-includes')
  ) {
    // Forward to WordPress (Gabia)
    return fetch(request)
  }

  // Route everything else to Next.js (Vercel)
  // For now, still route to WordPress until Next.js is deployed
  return fetch(request)
}
```

5. Save and deploy the Worker

6. **Note**: We'll update this routing after Next.js is deployed to Vercel (Phase 6)

---

### Task 4: Install Dependencies & Run Dev Server 💻

**Where**: Local development environment

**Steps**:

1. Navigate to project directory:
   ```bash
   cd /mnt/c/82Mobile/82mobile-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with your credentials:
   ```env
   # WordPress & WooCommerce (from Task 1)
   WORDPRESS_URL=https://82mobile.com
   WC_CONSUMER_KEY=ck_your_key_here
   WC_CONSUMER_SECRET=cs_your_secret_here

   # PortOne (get these in Phase 4)
   NEXT_PUBLIC_PORTONE_STORE_ID=store-xxxxx
   NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-xxxxx
   PORTONE_API_KEY=xxxxx
   PORTONE_API_SECRET=xxxxx

   # Next.js
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

7. **Expected**: You should see the hero section with "82mobile" title

---

### Task 5: Test WooCommerce API Integration 🧪

**Where**: Next.js development server

**What**: Verify that the Next.js app can fetch products from WordPress.

**Steps**:

1. Create a test API route:
   ```bash
   mkdir -p /mnt/c/82Mobile/82mobile-next/app/api/test
   ```

2. Create `/mnt/c/82Mobile/82mobile-next/app/api/test/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server';
   import { getProducts } from '@/lib/woocommerce';

   export async function GET() {
     try {
       const products = await getProducts(1, 5);
       return NextResponse.json({
         success: true,
         count: products.length,
         products
       });
     } catch (error) {
       return NextResponse.json({
         success: false,
         error: String(error)
       }, { status: 500 });
     }
   }
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

4. Visit http://localhost:3000/api/test

5. **Expected**: JSON response with product data from WooCommerce

---

### Task 6: Set Up Vercel Deployment (Optional for Phase 0) 🚀

**Where**: Vercel dashboard

**What**: Deploy Next.js to Vercel for staging environment.

**Steps**:

1. Go to https://vercel.com

2. Click **New Project**

3. Import from Git (or deploy manually):
   - Connect GitHub repo, OR
   - Use Vercel CLI: `npm i -g vercel && vercel`

4. Configure project:
   - Framework: Next.js
   - Root Directory: `./82mobile-next`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add environment variables in Vercel dashboard:
   - `WORDPRESS_URL`
   - `WC_CONSUMER_KEY`
   - `WC_CONSUMER_SECRET`
   - `NEXT_PUBLIC_URL` (set to Vercel preview URL)

6. Deploy

7. **Expected**: Your Next.js app is live at `https://your-project.vercel.app`

8. **Set up custom domain** (optional):
   - In Vercel: Settings → Domains
   - Add `new.82mobile.com` as custom domain
   - Update Cloudflare DNS: CNAME `new` → `cname.vercel-dns.com`

---

## 📋 Checklist Summary

Before moving to Phase 1, complete these tasks:

- [ ] **Task 1**: WooCommerce REST API enabled with credentials saved
- [ ] **Task 2**: CORS plugin deployed to WordPress
- [ ] **Task 3**: Cloudflare Workers configured (basic version)
- [ ] **Task 4**: Dependencies installed, dev server running
- [ ] **Task 5**: API integration test passes
- [ ] **Task 6**: (Optional) Vercel deployment with staging domain

---

## 🐛 Troubleshooting

### "401 Unauthorized" when fetching products

**Cause**: WooCommerce API credentials are invalid or not set.

**Fix**:
1. Verify credentials in `.env.local` match WordPress REST API keys
2. Check that `WC_CONSUMER_KEY` starts with `ck_`
3. Check that `WC_CONSUMER_SECRET` starts with `cs_`
4. Restart dev server after changing `.env.local`

### "CORS error" in browser console

**Cause**: CORS plugin not deployed or not configured correctly.

**Fix**:
1. Verify `82mobile-cors.php` exists at `/wp-content/mu-plugins/` via FTP
2. Check WordPress error log: `/error_log` (FTP root)
3. Try adding `http://localhost:3000` to allowed origins in `cors.php`

### "Module not found" errors

**Cause**: Dependencies not installed or package.json corrupted.

**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Development server won't start

**Cause**: Port 3000 already in use, or Node.js version mismatch.

**Fix**:
```bash
# Use different port
npm run dev -- -p 3001

# Check Node.js version (need 18+)
node -v
```

---

## 📞 Support

**Developer**: 이종철 (Whitehat Marketing)
- Email: jyongchul@naver.com
- Phone: 010-9333-2028
- KakaoTalk: jyongchul

**Questions?**
1. Check README.md for detailed documentation
2. Review the migration plan in project root
3. Contact developer for assistance

---

## ✨ Next Steps

Once all Phase 0 tasks are complete, proceed to **Phase 1: Design System + Static Pages**:

1. Build Header component with mega menu
2. Build Footer component with newsletter
3. Implement Hero section with Ken Burns animation
4. Create About, Contact, and FAQ pages
5. Add turtle loading animation

See `README.md` for Phase 1 details.

---

**Last Updated**: 2026-01-24
**Status**: Phase 0 Foundation Complete ✅
**Next**: Phase 1 (Design System + Static Pages)
