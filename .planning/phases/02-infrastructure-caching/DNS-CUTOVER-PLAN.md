# DNS Cutover Plan: Immediate Production Deployment

**Strategy**: Immediate DNS cutover (no subdomain testing phase)
**Target**: 82mobile.com → Vercel Next.js frontend
**WordPress Admin**: Proxied via Vercel rewrites to Gabia hosting
**DNS Management**: Cloudflare
**TTL**: 300 seconds (5-minute rollback window)

## Pre-Cutover Requirements

**MANDATORY** - Must be TRUE before DNS cutover:

1. ✅ **Phase 1 Complete**: WordPress API accessible, CORS configured, CoCart working
2. ✅ **Phase 2 Cache Verified**: 48-hour monitoring confirms cache bypass working (Plan 02-01)
3. ⏳ **Phase 3 Complete**: Next.js API routes operational, environment variables configured
4. ⏳ **Phase 4 Complete**: Cart functionality working with CoCart integration
5. ⏳ **Phase 5 Complete**: Product catalog, checkout flow, multilingual UI operational
6. ⏳ **Phase 6 Complete**: Payment gateway integrated and tested in sandbox
7. ⏳ **Vercel Preview Verified**: Full e-commerce flow tested on Vercel preview domain (products, cart, checkout, payment)

**Pre-cutover testing checklist** (Vercel preview domain):
- [ ] Homepage loads
- [ ] Product listing page works (API call to WordPress)
- [ ] Product detail page works
- [ ] Add to cart works (CoCart API call)
- [ ] Cart drawer displays items
- [ ] Checkout form works
- [ ] Payment modal opens (sandbox)
- [ ] WordPress admin accessible via preview URL /wp-admin (rewrite proxy test)
- [ ] No CORS errors in browser console
- [ ] All API endpoints return fresh data

## DNS Configuration

**Current State** (before cutover):
- A record: 82mobile.com → Gabia IP (xxx.xxx.xxx.xxx)
- CNAME: www.82mobile.com → 82mobile.com
- MX records: Preserved (email)
- TTL: Default (3600s or higher)

**Target State** (after cutover):
- A record: 82mobile.com → Vercel IP (76.76.21.21)
- CNAME: www.82mobile.com → cname.vercel-dns.com
- MX records: UNCHANGED (email routing preserved)
- TTL: 300s (set 72 hours before cutover for propagation)

**Cloudflare Settings**:
- SSL/TLS Mode: Full (Vercel provides SSL certificate)
- Proxy Status: DNS only (gray cloud, not orange) - **CRITICAL for Vercel SSL**
- Always Use HTTPS: Enabled
- Automatic HTTPS Rewrites: Enabled

## Vercel Rewrites Configuration

Transparent proxy for WordPress admin access:

```json
{
  "rewrites": [
    {
      "source": "/wp-admin",
      "destination": "http://82mobile.com/wp-admin"
    },
    {
      "source": "/wp-admin/:path*",
      "destination": "http://82mobile.com/wp-admin/:path*"
    },
    {
      "source": "/wp-login.php",
      "destination": "http://82mobile.com/wp-login.php"
    },
    {
      "source": "/wp-includes/:path*",
      "destination": "http://82mobile.com/wp-includes/:path*"
    },
    {
      "source": "/wp-content/:path*",
      "destination": "http://82mobile.com/wp-content/:path*"
    }
  ]
}
```

**How it works**:
- User visits: https://82mobile.com/wp-admin
- Vercel receives request, proxies to Gabia WordPress
- Response returned through Vercel
- URL stays 82mobile.com/wp-admin (transparent to user)
- Cookies, authentication headers passed through automatically

## Cutover Execution Steps

**72 hours before cutover**:
1. Lower Cloudflare DNS TTL to 300s for all 82mobile.com records
2. Wait for TTL propagation (existing 3600s TTL must expire)

**Cutover day** (recommended: 3-5 AM Korea Time, low traffic):
1. Final verification on Vercel preview domain (30 min)
2. Announce maintenance window (if needed, or silent cutover)
3. Change Cloudflare DNS via automation script:
   - A record: 82mobile.com → 76.76.21.21 (Vercel)
   - CNAME: www.82mobile.com → cname.vercel-dns.com
4. Monitor DNS propagation: `dig 82mobile.com` (should show Vercel IP within 5-10 min)
5. Test immediately:
   - Visit https://82mobile.com (Next.js homepage)
   - Test /wp-admin access (should proxy to Gabia)
   - Test product listing (API call to WordPress)
   - Test cart functionality
6. Monitor error logs (Vercel dashboard, Sentry if configured)

**Health checks** (first 30 minutes):
- HTTP status codes (200 for pages, 401 for auth endpoints)
- API response times (< 2s)
- CORS headers present
- WordPress admin login working
- Cart operations working
- Payment modal opening

## Rollback Procedures

**If critical issues occur**:

1. **Immediate DNS rollback** (5-10 minute recovery):
   ```bash
   # Revert Cloudflare DNS to Gabia IP
   python3 scripts/cloudflare_dns_manager.py --rollback
   ```
   - 300s TTL means 5-10 min for most users to revert
   - Note: Some ISPs/browsers cache beyond TTL (15-30 min worst case)

2. **Identify root cause**:
   - Check Vercel logs for errors
   - Check WordPress API accessibility
   - Check CORS headers
   - Test /wp-admin proxy functionality

3. **Fix and retry**:
   - Fix issue on Vercel preview domain first
   - Re-verify full e-commerce flow
   - Schedule new cutover window

**Common failure modes**:
- CORS errors: Check .htaccess CORS headers include production domain
- /wp-admin 404: Check Vercel rewrites configuration
- API timeout: Check WordPress API accessibility from Vercel servers
- Cart not working: Check CoCart API calls from Next.js API routes

## Post-Cutover Monitoring

**First 24 hours**:
- Monitor Vercel dashboard for errors
- Check WordPress API response times
- Verify cart sessions persisting
- Test payment flow in production
- Monitor customer support channels

**First 72 hours**:
- Track Core Web Vitals (Vercel Analytics)
- Monitor order completion rate
- Check for CORS errors in browser console
- Verify /wp-admin performance acceptable

**Success criteria**:
- Zero downtime observed
- All customer-facing features working
- WordPress admin accessible
- No increase in support tickets
- Core Web Vitals maintained or improved

## Risk Assessment

**HIGH RISK**:
- No subdomain testing phase (immediate production cutover)
- DNS caching beyond TTL control (15-30 min worst case rollback)
- WordPress admin proxy latency (Vercel → Gabia round-trip)

**MEDIUM RISK**:
- CORS headers not covering production domain
- Vercel rewrite configuration errors
- Cloudflare SSL/TLS mode misconfiguration

**LOW RISK**:
- Vercel global CDN more reliable than Gabia hosting
- 300s TTL enables fast rollback
- Preview domain testing catches most issues

**Mitigation**:
- Extensive Vercel preview domain testing (mandatory)
- Low-traffic cutover window (3-5 AM Korea)
- Automated health checks
- Clear rollback procedures documented
- Customer support team on standby

## Stakeholder Communication

**Before cutover** (24 hours):
- Email to customer: DNS cutover scheduled, expected downtime (if any)
- Prepare customer support team: Known issues, rollback plan

**During cutover**:
- Real-time monitoring dashboard
- Team chat for issue escalation

**After cutover** (1 hour):
- Email to customer: Cutover complete, verification passed
- Update status page (if available)

---

**Created**: 2026-01-27
**Strategy**: Immediate production cutover (user requirement)
**Approval required**: Yes (checkpoint)
