# 🚀 START HERE - 82mobile Headless Migration

Welcome to the 82mobile Next.js project! This guide will get you up and running in 5 minutes.

## ⚡ Quick Start (Fast Path)

```bash
cd /mnt/c/82Mobile/82mobile-next
./quick-start.sh
```

The script will:
1. ✅ Check Node.js version (18+ required)
2. ✅ Create `.env.local` from template
3. ✅ Install dependencies
4. ✅ Type-check the project
5. 🚀 Start the dev server at http://localhost:3000

## 📋 Manual Setup (If Script Fails)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
WORDPRESS_URL=https://82mobile.com
WC_CONSUMER_KEY=ck_your_key_here      # Get from WordPress
WC_CONSUMER_SECRET=cs_your_secret_here # Get from WordPress
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

## 🧪 Test API Integration

After starting the dev server, visit:
```
http://localhost:3000/api/test
```

**Expected**: JSON response with WooCommerce products

**If you see an error**:
1. Check `.env.local` has correct WooCommerce credentials
2. Make sure CORS plugin is deployed to WordPress (see below)
3. Verify WordPress API is accessible: `curl https://82mobile.com/wp-json/wc/v3/products`

## 🔧 WordPress Setup Required

Before the Next.js app can fetch products, you need to:

### 1. Enable WooCommerce REST API
1. Go to http://82mobile.com/wp-admin
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Click **Add Key**
4. Set permissions to **Read/Write**
5. Copy the Consumer Key and Secret to `.env.local`

### 2. Deploy CORS Plugin
```bash
cd wordpress-setup
python3 deploy_cors_plugin.py
```

This allows Next.js to access the WordPress API.

**Detailed instructions**: See `PHASE0_SETUP_GUIDE.md`

## 📂 Project Structure

```
82mobile-next/
├── app/
│   ├── [locale]/          # Internationalized pages (ko, en, zh, ja)
│   │   ├── page.tsx       # Homepage
│   │   └── layout.tsx     # Locale wrapper
│   ├── api/
│   │   └── test/          # API test endpoint
│   └── globals.css        # Global styles
├── components/            # React components (to be created in Phase 1)
├── lib/
│   └── woocommerce.ts     # WooCommerce API client
├── stores/
│   └── cart.ts            # Zustand cart store
├── messages/              # Translations (ko.json, en.json, etc.)
├── wordpress-setup/       # WordPress deployment scripts
│   ├── cors.php           # CORS plugin
│   └── deploy_cors_plugin.py
├── .env.example           # Environment template
├── package.json           # Dependencies
└── tailwind.config.ts     # Korean design system
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| `START_HERE.md` (this file) | Quick start guide |
| `README.md` | Complete project documentation |
| `PHASE0_SETUP_GUIDE.md` | Detailed Phase 0 setup instructions |
| `IMPLEMENTATION_SUMMARY.md` | Technical architecture and decisions |

## 🎨 Design System

The project uses a **Korean cultural design system**:

**Colors**:
- Dancheong Red (#CD2E3A) - Primary
- Hanbok Blue (#0047AB) - Secondary
- Jade Green (#7CB342) - Accent
- Seoul Gradient (Purple to Violet)

**Typography**:
- Outfit - Display text
- Syne - Headings
- Plus Jakarta Sans - Body text

**Animations**:
- Turtle swim
- 3D card flip
- Glassmorphism effects

## ✅ What's Done (Phase 0)

- [x] Next.js 14 project scaffold
- [x] TailwindCSS with Korean design system
- [x] WooCommerce API integration
- [x] Cart state management (Zustand)
- [x] Internationalization (4 languages)
- [x] WordPress CORS plugin
- [x] Basic homepage with hero section

## 🔜 What's Next (Phase 1)

Phase 1 focuses on **Design System + Static Pages**:

1. **Components to build**:
   - Header with mega menu
   - Footer with newsletter
   - Product card with 3D flip
   - Loading screen with turtle animation

2. **Pages to create**:
   - About (`/about`)
   - Contact (`/contact`)
   - FAQ (`/faq`)

See `README.md` for detailed Phase 1 requirements.

## 🐛 Common Issues

### "Module not found" error
```bash
rm -rf node_modules package-lock.json
npm install
```

### "401 Unauthorized" from API
- Check WooCommerce API credentials in `.env.local`
- Verify credentials in WordPress admin

### "CORS error" in browser
- Deploy CORS plugin: `cd wordpress-setup && python3 deploy_cors_plugin.py`
- Check plugin exists at `/wp-content/mu-plugins/82mobile-cors.php` via FTP

### Port 3000 already in use
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

## 📞 Support

**Developer**: 이종철 (Whitehat Marketing)
- Email: jyongchul@naver.com
- Phone: 010-9333-2028
- KakaoTalk: jyongchul

**Questions?**
1. Check documentation files listed above
2. Review error logs in terminal
3. Contact developer

## 🎯 Current Status

```
✅ Phase 0: Foundation (COMPLETE)
🔄 Phase 1: Design System + Static Pages (NEXT)
⏳ Phase 2: Product Catalog
⏳ Phase 3: Cart & Checkout
⏳ Phase 4: Payment Gateway
⏳ Phase 5: Multilingual
⏳ Phase 6: Go Live
```

**Timeline**: 10-12 weeks total
**Budget**: 30-50M KRW
**Current Phase**: Week 1-2 (Foundation)

---

**Ready to start?** Run `./quick-start.sh` and begin developing! 🚀
