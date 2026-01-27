# WordPress API Authentication Documentation

**82mobile.com Headless WordPress Backend**

This document provides complete authentication and API usage instructions for the Next.js frontend (Phase 3 implementation).

---

## 1. JWT Authentication Flow

### Overview

JWT (JSON Web Token) authentication provides stateless, secure API access for user-authenticated requests. Tokens are generated via username/password and included in Authorization headers.

### Token Generation

**Endpoint:** `POST /wp-json/jwt-auth/v1/token`

```bash
curl -X POST http://82mobile.com/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "whadmin",
    "password": "WhMkt2026!@AdamKorSim"
  }'
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user_email": "jyongchul@naver.com",
  "user_nicename": "whadmin",
  "user_display_name": "whadmin"
}
```

### Token Usage

Include the token in the `Authorization` header for authenticated requests:

```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

curl http://82mobile.com/wp-json/wp/v2/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Token Validation

**Endpoint:** `POST /wp-json/jwt-auth/v1/token/validate`

```bash
curl -X POST http://82mobile.com/wp-json/jwt-auth/v1/token/validate \
  -H "Authorization: Bearer $TOKEN"
```

**Response (valid token):**
```json
{
  "code": "jwt_auth_valid_token",
  "data": {
    "status": 200
  }
}
```

### Token Expiration

- **Default:** 7 days (604800 seconds)
- **Recommended for 82mobile:** 24 hours (86400 seconds)
- **To change:** Add filter in wp-config.php or functions.php:
  ```php
  add_filter('jwt_auth_expire', function() {
      return 86400; // 24 hours
  });
  ```

---

## 2. WooCommerce Consumer Key Authentication

### Overview

Consumer keys provide server-to-server authentication for WooCommerce REST API. **NEVER expose these keys in frontend code** — use only in Next.js API routes.

### Authentication Methods

#### Method 1: Basic Auth (Recommended)

```bash
curl "http://82mobile.com/wp-json/wc/v3/products" \
  -u "ck_cd3965181a66868b9f094f8df4d3abacaeec6652:cs_cc74b52dc817261af251b1fe234e672e1dafd297"
```

#### Method 2: Query Parameters (Alternative)

```bash
curl "http://82mobile.com/wp-json/wc/v3/products?consumer_key=ck_cd3965181a66868b9f094f8df4d3abacaeec6652&consumer_secret=cs_cc74b52dc817261af251b1fe234e672e1dafd297"
```

### Security Considerations

- ✅ **DO:** Store keys in environment variables (`.env.local`)
- ✅ **DO:** Use only in Next.js API routes (`/app/api/*`)
- ✅ **DO:** Use HTTPS in production (redirect HTTP → HTTPS in .htaccess)
- ❌ **DON'T:** Include keys in client-side JavaScript
- ❌ **DON'T:** Commit keys to version control
- ❌ **DON'T:** Log keys in console or error messages

### Example: Fetch Products

```bash
# Get all products (paginated)
curl "http://82mobile.com/wp-json/wc/v3/products?per_page=20" \
  -u "ck_cd3965181a66868b9f094f8df4d3abacaeec6652:cs_cc74b52dc817261af251b1fe234e672e1dafd297"

# Get single product by ID
curl "http://82mobile.com/wp-json/wc/v3/products/123" \
  -u "ck_cd3965181a66868b9f094f8df4d3abacaeec6652:cs_cc74b52dc817261af251b1fe234e672e1dafd297"

# Get products by category
curl "http://82mobile.com/wp-json/wc/v3/products?category=10" \
  -u "ck_cd3965181a66868b9f094f8df4d3abacaeec6652:cs_cc74b52dc817261af251b1fe234e672e1dafd297"
```

---

## 3. CoCart Cart Operations

### Overview

CoCart provides headless cart management with database-backed sessions. Cart tokens persist across page reloads and browser sessions.

### Cart Token Management

- **Token Header:** `CoCart-API-Cart-Key`
- **Generated:** Automatically on first `add-item` request
- **Returned:** In response headers as `cocart-api-cart-key`
- **Storage:** Store in HTTP-only cookie or localStorage (client-side)
- **Persistence:** Database-backed via WooCommerce sessions table (`wp_woocommerce_sessions`)

### Content-Type Requirement

⚠️ **IMPORTANT:** CoCart POST/PUT requests require `Content-Type: application/x-www-form-urlencoded`. JSON format (`application/json`) will return 400 Bad Request errors on Gabia hosting.

```bash
# ✅ CORRECT - Form-encoded
curl -X POST http://82mobile.com/wp-json/cocart/v2/cart/add-item \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "id=123&quantity=1"

# ❌ WRONG - JSON (returns 400 error)
curl -X POST http://82mobile.com/wp-json/cocart/v2/cart/add-item \
  -H "Content-Type: application/json" \
  -d '{"id":"123","quantity":"1"}'
```

### Cart Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/wp-json/cocart/v2/cart` | GET | Retrieve cart contents |
| `/wp-json/cocart/v2/cart/add-item` | POST | Add product to cart |
| `/wp-json/cocart/v2/cart/item/{item_key}` | PUT | Update item quantity |
| `/wp-json/cocart/v2/cart/item/{item_key}` | DELETE | Remove item from cart |
| `/wp-json/cocart/v2/cart/clear` | POST | Clear entire cart |
| `/wp-json/cocart/v2/cart/count-items` | GET | Get total item count |
| `/wp-json/cocart/v2/cart/totals` | GET | Get cart totals |

### Example: Complete Cart Flow

```bash
# Step 1: Get empty cart (generates cart token)
curl -v http://82mobile.com/wp-json/cocart/v2/cart

# Extract cart token from response headers:
# cocart-api-cart-key: e5a4c2d8f1b3a7c6e9d2f8b4a1c5e7d9

CART_TOKEN="e5a4c2d8f1b3a7c6e9d2f8b4a1c5e7d9"

# Step 2: Add product to cart
curl -X POST http://82mobile.com/wp-json/cocart/v2/cart/add-item \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "CoCart-API-Cart-Key: $CART_TOKEN" \
  -d "id=123&quantity=1"

# Step 3: Retrieve cart with token
curl http://82mobile.com/wp-json/cocart/v2/cart \
  -H "CoCart-API-Cart-Key: $CART_TOKEN"

# Step 4: Update item quantity
curl -X PUT http://82mobile.com/wp-json/cocart/v2/cart/item/{item_key} \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "CoCart-API-Cart-Key: $CART_TOKEN" \
  -d "quantity=3"

# Step 5: Remove item
curl -X DELETE http://82mobile.com/wp-json/cocart/v2/cart/item/{item_key} \
  -H "CoCart-API-Cart-Key: $CART_TOKEN"

# Step 6: Clear cart
curl -X POST http://82mobile.com/wp-json/cocart/v2/cart/clear \
  -H "CoCart-API-Cart-Key: $CART_TOKEN"
```

### Cart Response Structure

```json
{
  "cart_hash": "abc123def456",
  "cart_key": "e5a4c2d8f1b3a7c6e9d2f8b4a1c5e7d9",
  "items": [
    {
      "item_key": "d1e8c9a2b3f4e5d6c7a8b9",
      "id": 123,
      "name": "Korea Travel eSIM - 7 Days Unlimited",
      "title": "Korea Travel eSIM - 7 Days Unlimited",
      "price": "29000",
      "quantity": {
        "value": 1,
        "min_purchase": 1,
        "max_purchase": 10
      },
      "totals": {
        "subtotal": 29000,
        "subtotal_tax": 0,
        "total": 29000,
        "tax": 0
      }
    }
  ],
  "items_count": 1,
  "items_weight": 0,
  "coupons": [],
  "needs_payment": true,
  "needs_shipping": false,
  "shipping": {
    "total_packages": 0,
    "packages": []
  },
  "fees": [],
  "taxes": [],
  "totals": {
    "subtotal": "29000",
    "subtotal_tax": "0",
    "fee_total": "0",
    "fee_tax": "0",
    "discount_total": "0",
    "discount_tax": "0",
    "shipping_total": "0",
    "shipping_tax": "0",
    "total": "29000",
    "total_tax": "0"
  }
}
```

---

## 4. CORS Configuration

### Current Allowed Origin

- **Production:** `https://82mobile-next.vercel.app`
- **Headers location:** `.htaccess` in WordPress root

### CORS Headers

```apache
<If "%{REQUEST_URI} =~ m#^/wp-json/#">
  Header set Access-Control-Allow-Origin "https://82mobile-next.vercel.app"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, CoCart-API-Cart-Key"
  Header set Access-Control-Allow-Credentials "true"
  Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
  Header set Pragma "no-cache"
  Header set Expires "0"
</If>
```

### Adding Local Development Origin

To allow `http://localhost:3000` for local development:

**Option 1: Edit .htaccess (requires FTP access)**

```apache
# Change single origin to multiple origins (use wildcard or specific list)
Header set Access-Control-Allow-Origin "*"
# OR list both:
Header set Access-Control-Allow-Origin "https://82mobile-next.vercel.app http://localhost:3000"
```

**Option 2: Use CoCart CORS Plugin (recommended for Gabia caching issues)**

1. Install "CoCart CORS" plugin via WP Admin
2. Configure allowed origins in Settings > CoCart > CORS
3. Plugin handles CORS headers dynamically (bypasses .htaccess cache)

### Required Headers by Endpoint

| Endpoint Type | Required Headers |
|---------------|------------------|
| JWT Auth | `Authorization: Bearer {token}` |
| WooCommerce API | `Authorization: Basic {base64}` OR consumer_key/consumer_secret params |
| CoCart | `CoCart-API-Cart-Key: {token}` |
| All API requests | `Content-Type: application/json` (for POST/PUT/DELETE) |

---

## 5. Environment Variables for Next.js (Phase 3)

### Server-Side Only (.env.local)

```bash
# WordPress Backend
WORDPRESS_API_URL=http://82mobile.com

# WooCommerce API Authentication (NEVER expose to client)
WC_CONSUMER_KEY=ck_cd3965181a66868b9f094f8df4d3abacaeec6652
WC_CONSUMER_SECRET=cs_cc74b52dc817261af251b1fe234e672e1dafd297

# JWT Authentication (for admin operations, if needed)
JWT_USERNAME=whadmin
JWT_PASSWORD=WhMkt2026!@AdamKorSim
JWT_AUTH_SECRET_KEY=see_wp_config_for_actual_key

# Optional: Admin user for automated tasks
WP_ADMIN_USERNAME=whadmin
WP_ADMIN_PASSWORD=WhMkt2026!@AdamKorSim
```

### Client-Safe (Public) Variables (.env.local with NEXT_PUBLIC_ prefix)

```bash
# These CAN be exposed to browser (no secrets)
NEXT_PUBLIC_WORDPRESS_URL=http://82mobile.com
NEXT_PUBLIC_SITE_NAME=82Mobile
NEXT_PUBLIC_SITE_DESCRIPTION=Korea SIM Cards and eSIM Services
```

### Usage in Next.js

```typescript
// Server-side only (API routes, server components)
const wcKey = process.env.WC_CONSUMER_KEY;
const wcSecret = process.env.WC_CONSUMER_SECRET;

// Client-side safe
const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
```

---

## 6. Quick Reference: Common API Calls

### Fetch All Products

```bash
curl "http://82mobile.com/wp-json/wc/v3/products?per_page=100" \
  -u "$WC_CONSUMER_KEY:$WC_CONSUMER_SECRET"
```

### Create Order

```bash
curl -X POST "http://82mobile.com/wp-json/wc/v3/orders" \
  -u "$WC_CONSUMER_KEY:$WC_CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "bacs",
    "payment_method_title": "Direct Bank Transfer",
    "billing": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "010-1234-5678"
    },
    "line_items": [
      {
        "product_id": 123,
        "quantity": 1
      }
    ]
  }'
```

### Get Order Status

```bash
curl "http://82mobile.com/wp-json/wc/v3/orders/456" \
  -u "$WC_CONSUMER_KEY:$WC_CONSUMER_SECRET"
```

---

## 7. Troubleshooting

### Issue: JWT token returns 400 Bad Request

**Cause:** Authorization header not passed through Apache.

**Fix:** Verify `.htaccess` has Authorization header passthrough:
```apache
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

### Issue: CORS preflight fails

**Cause:** Gabia server cache (24-48h) hasn't updated .htaccess changes.

**Fix:** Install "CoCart CORS" plugin for dynamic CORS headers that bypass cache.

### Issue: Cart token not persisting

**Cause:** Missing `CoCart-API-Cart-Key` header in requests.

**Fix:** Ensure header is included in ALL cart requests after initial cart creation.

### Issue: WooCommerce API returns 401 Unauthorized

**Cause:** Invalid consumer key/secret or incorrect authentication format.

**Fix:** Verify keys are correct, use Basic Auth format, ensure HTTPS redirect is disabled during development.

---

## 8. Next Steps (Phase 3 Implementation)

1. **Create Next.js API Routes:**
   - `/api/products` - Fetch products from WooCommerce
   - `/api/cart` - Proxy to CoCart endpoints
   - `/api/orders` - Create and retrieve orders

2. **Implement Cart Zustand Store:**
   - Initialize cart token from cookie/localStorage
   - Sync cart state with CoCart API
   - Handle cart token refresh

3. **Build Authentication Flow:**
   - JWT token generation for admin users (if needed)
   - Consumer key rotation strategy
   - Secure credential management

4. **Error Handling:**
   - API timeout handling (Gabia shared hosting)
   - Cart token expiration recovery
   - CORS error fallbacks

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Maintained By:** 82Mobile Development Team
