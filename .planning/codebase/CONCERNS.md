# Concerns & Technical Debt

## High Priority Issues

### 1. No Authentication System (v1.0 Limitation)

**Issue**: Guest checkout only - no user accounts or login

**Impact**:
- Users cannot view order history
- Cannot save addresses or payment methods
- No wishlist or saved items
- Repeat customers must re-enter information

**Recommendation**: Implement NextAuth.js v5 for authentication
- Email/password login
- OAuth (Google, Naver, KakaoTalk)
- Session management with JWT
- User profile management

**Estimated Effort**: 3-5 days (Phase for v2.0)

---

### 2. No Error Monitoring

**Issue**: No production error tracking or logging

**Impact**:
- Payment failures go undetected
- API errors not monitored
- Client-side crashes invisible
- No alerting for critical issues

**Recommendation**: Integrate Sentry
- Error tracking for frontend and API routes
- Performance monitoring
- Release tracking
- Alerting for critical errors

**Estimated Effort**: 1 day

---

### 3. Payment Gateway Incomplete

**Issue**: Eximbay credentials pending from customer

**Current Status**:
- PortOne (domestic payments) - ✅ Active
- Eximbay (international payments) - ⏳ Pending customer credentials

**Impact**:
- International tourists cannot pay with foreign cards
- Limited to Korean payment methods only

**Blockers**: Customer must provide Eximbay credentials

**Next Steps**:
1. Request credentials from customer
2. Configure Eximbay in `/api/payment/initiate`
3. Test with foreign credit cards
4. Update checkout UI for payment method selection

---

### 4. No Automated Testing

**Issue**: Zero test coverage - manual testing only

**Impact**:
- Regression bugs likely on new features
- Payment flow not validated automatically
- Refactoring is risky
- No CI/CD quality gates

**Recommendation**: See TESTING.md for comprehensive strategy

**Priority**: High (before v2.0 features)

---

## Medium Priority Issues

### 5. localStorage Cart Not Encrypted

**Issue**: Cart data stored in plain text in localStorage

**Security Risk**: Low (cart data is non-sensitive)

**Potential Issues**:
- Cart can be modified via browser console
- Prices could be tampered with (mitigated by server-side validation)
- No expiration on cart data

**Recommendation**:
- Add server-side cart validation before checkout
- Implement cart expiration (30-day TTL)
- Consider session-based cart for authenticated users

---

### 6. No Rate Limiting on API Routes

**Issue**: API routes (`/api/products`, `/api/orders`) have no rate limiting

**Abuse Scenarios**:
- Scraping product catalog
- DDoS via order creation endpoint
- Payment webhook spam

**Recommendation**: Implement Vercel middleware rate limiting
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

**Estimated Effort**: 1 day

---

### 7. WooCommerce Single Point of Failure

**Issue**: All product/order data depends on Gabia WordPress availability

**Failure Modes**:
- Gabia server downtime = site is unusable
- WooCommerce API changes break integration
- Network latency to Gabia affects all requests

**Mitigation Strategies**:
- Implement React Query caching (already done - 5 minute cache)
- Add fallback product data for critical items
- Monitor WooCommerce API health with uptime service
- Consider CDN caching for product catalog

**Future**: Migrate to headless CMS (Sanity, Contentful) for better reliability

---

### 8. No Email Service for Order Confirmations

**Issue**: Order confirmations rely on WooCommerce email system

**Limitations**:
- Cannot customize email templates from Next.js
- No transactional email analytics
- Delivery reliability depends on Gabia SMTP

**Recommendation**: Integrate Resend or SendGrid
- Custom branded email templates
- Order confirmation emails from Next.js
- Delivery tracking and analytics
- Better spam score management

**Estimated Effort**: 2 days

---

### 9. Image Optimization Not Leveraged Fully

**Issue**: WooCommerce product images not optimized by Next.js Image

**Current**: Images served from `82mobile.com` (WordPress media library)

**Problems**:
- No automatic WebP conversion
- No responsive image sizing
- No lazy loading optimization
- Larger bundle sizes

**Recommendation**:
- Migrate product images to Vercel Blob Storage
- Use Next.js Image component everywhere
- Implement image CDN (Cloudinary or Imgix)

**Estimated Effort**: 1-2 days

---

### 10. No SMS Notifications

**Issue**: No SMS alerts for order status updates

**Use Case**: Korean customers expect SMS notifications

**Recommendation**: Integrate Aligo or Twilio
- Order confirmation SMS
- Shipping updates
- eSIM delivery notification

**Estimated Effort**: 1 day

---

## Low Priority Issues

### 11. No A/B Testing Infrastructure

**Issue**: Cannot test pricing, CTAs, or checkout flow variations

**Impact**: Optimization based on assumptions rather than data

**Recommendation**: Vercel Edge Config + Split.io or PostHog

---

### 12. SEO Metadata Not Dynamic

**Issue**: Product pages use static metadata

**Impact**: Suboptimal SEO for individual products

**Recommendation**: Generate dynamic metadata in `generateMetadata()`
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  return {
    title: `${product.name} - 82Mobile`,
    description: product.description,
    openGraph: { images: [product.image] },
  }
}
```

---

### 13. No Order Tracking System

**Issue**: Customers cannot track eSIM delivery status

**Impact**: Support inquiries for "where is my eSIM?"

**Recommendation**: Build order status page
- Track order status from WooCommerce
- Display eSIM QR code when ready
- Email notifications on status changes

---

### 14. No Analytics Goals Configured

**Issue**: Google Analytics 4 installed but no conversion goals

**Impact**: Cannot measure funnel drop-off or ROI

**Recommendation**: Configure GA4 e-commerce events
- Purchase conversion tracking
- Checkout abandonment funnel
- Product view → Add to cart → Purchase

---

### 15. Hardcoded Strings in Components

**Issue**: Some UI strings not in translation files

**Impact**: Hard to maintain consistent copy

**Recommendation**: Move all strings to `messages/{locale}.json`

---

## Performance Concerns

### 1. First Load JS Bundle Size

**Current**: ~118-126KB (all pages)

**Target**: <220KB (met ✅)

**Observation**: Close to target - monitor on new features

---

### 2. Largest Contentful Paint (LCP)

**Current**: <2.5s (target met)

**Risk Areas**:
- Hero section background image loading
- Product grid initial render
- WooCommerce API latency

**Mitigation**: Already using Next.js Image with `priority` flag

---

### 3. Cumulative Layout Shift (CLS)

**Current**: <0.1 (target met)

**Risk Areas**:
- Loading states for product images
- Cart drawer animation
- Font loading (FOUT)

**Mitigation**: Using `next/font` for font optimization

---

## Security Concerns

### 1. WooCommerce API Keys Exposed in Server Logs

**Risk**: Low (keys are server-side only)

**Recommendation**: Use environment variable masking in logs

---

### 2. Payment Webhook Signature Verification

**Status**: ✅ Implemented for PortOne
**Status**: ⏳ Pending for Eximbay

**Recommendation**: Verify signature on all webhook requests

---

### 3. CORS Configuration

**Current**: Next.js API routes handle CORS automatically

**Observation**: Review for production hardening

---

## Accessibility Concerns

### 1. Keyboard Navigation Tested Manually Only

**Issue**: No automated accessibility testing

**Recommendation**: Add `axe-core` to Playwright tests

---

### 2. Color Contrast Not Validated

**Issue**: Custom Dancheong theme colors not checked for WCAG compliance

**Recommendation**: Run contrast checker on all color combinations

---

## Dependency Management

### 1. Dependency Update Strategy

**Current**: Manual updates as needed

**Recommendation**: Use Dependabot or Renovate
- Automated PR for updates
- Security vulnerability alerts
- Version compatibility checks

---

### 2. Unused Dependencies

**Potential**: None identified (all dependencies used)

**Note**: Run `depcheck` periodically to verify

---

## Technical Debt Tracking

### Debt Items by Priority

**High (Address in v2.0)**:
- Authentication system
- Error monitoring (Sentry)
- Automated testing suite
- Eximbay payment integration
- Rate limiting on API routes

**Medium (Address in v2.1)**:
- Email service integration
- SMS notifications
- Image optimization migration
- Order tracking system
- localStorage cart encryption

**Low (Backlog)**:
- A/B testing infrastructure
- Dynamic SEO metadata
- Analytics goal configuration
- Dependency automation
- Accessibility auditing

---

## Monitoring Recommendations

**Add to production**:
1. **Uptime monitoring** - Pingdom or UptimeRobot for 82mobile.com
2. **Error tracking** - Sentry for frontend + API routes
3. **Performance monitoring** - Vercel Analytics or Lighthouse CI
4. **WooCommerce health check** - Ping `/wp-json/wc/v3/products` every 5 minutes

---

## Future Architecture Considerations

### 1. Transition to Headless CMS

**Current**: Tightly coupled to WooCommerce

**Future**: Decouple product catalog from WooCommerce
- Migrate to Sanity or Contentful for product data
- Keep WooCommerce for order management only
- Improve reliability and performance

---

### 2. Edge Functions for Localization

**Current**: Middleware-based locale detection

**Future**: Edge Config for A/B testing and personalization

---

### 3. Microservices for Notifications

**Current**: Monolithic Next.js app

**Future**: Separate notification service for email/SMS
- Better fault isolation
- Independent scaling
- Easier to swap providers

---

*Last analyzed: 2026-01-27*
