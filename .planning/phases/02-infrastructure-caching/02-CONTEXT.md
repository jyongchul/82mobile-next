---
phase: 2
status: ready_to_plan
gathered: 2026-01-27
---

# Phase 2 Context: Infrastructure & Caching Strategy

## Phase Goal

Gabia hosting caching bypassed for API endpoints, DNS cutover strategy established, immediate production cutover ready (no subdomain testing).

## Implementation Decisions

### 1. Cache Verification Strategy

**Deployment Timing**: Deploy immediately with automated tests
- No waiting period
- Automated verification script runs post-deployment
- Tests both cache headers and timestamp freshness

**Verification Method**: Both timestamp comparison and header checking
- Cache-Control header inspection: `no-cache, no-store, must-revalidate`
- Timestamp test: Compare product update time vs API response
- Both methods must pass for verification

**Failure Handling**: Verification-only approach (no automatic rollback)
- Log verification failures
- Alert if cache still active
- No rollback unless actual functional problems occur
- Gabia cache may take 24-48h to clear (documented expectation)

**Test Frequency**: Claude's discretion
- Initial verification: Immediately after deployment
- Follow-up checks: 1 hour, 6 hours, 24 hours, 48 hours
- Stop when cache bypass confirmed working

**Decision Rationale**:
- Aggressive verification catches issues early
- No automatic rollback prevents unnecessary disruption
- Multiple verification methods increase confidence
- Staggered checks accommodate Gabia's cache propagation delay

---

### 2. DNS Cutover Strategy (IMMEDIATE, NO SUBDOMAIN)

**CRITICAL CHANGE**: User wants immediate DNS cutover, NOT gradual subdomain approach.

**Original Plan (REJECTED)**:
- ❌ Set up new.82mobile.com subdomain
- ❌ Parallel run testing phase
- ❌ Gradual cutover after verification

**New Strategy (APPROVED)**:
- ✅ 82mobile.com → Vercel Next.js directly
- ✅ No subdomain testing phase
- ✅ Immediate production cutover

**Implementation Decisions**:

**/wp-admin Routing**: Vercel rewrite proxy to Gabia
- Vercel rewrites configuration in `vercel.json`
- Pattern: `/wp-admin*` → `http://82mobile.com/wp-admin*`
- Preserves WordPress admin access at original domain
- Headers pass-through for authentication

**DNS TTL**: 300 seconds (5 minutes)
- Low TTL enables fast rollback if needed
- Set before cutover for quick propagation
- Cloudflare DNS management

**Rollback Procedure**: Manual DNS revert
- Cloudflare dashboard access: immediate DNS change
- 300s TTL = 5min propagation for rollback
- Backup plan: Keep Gabia hosting unchanged
- No automatic rollback (manual intervention required)

**Pre-Cutover Verification**: Vercel preview domain testing
- Deploy to Vercel preview URL first
- Test full e-commerce flow on preview
- Verify API connectivity from preview → Gabia WordPress
- Only cutover DNS after preview verification passes

**DNS Management**: Cloudflare
- User confirmed using Cloudflare
- A record: 82mobile.com → Vercel IP
- CNAME record for www: www.82mobile.com → 82mobile.com
- Preserve MX records (email)

**Decision Rationale**:
- User explicitly requested immediate cutover: "바로 전환"
- Subdomain approach adds unnecessary complexity
- Vercel rewrites cleanly handle /wp-admin routing
- Low TTL provides safety net for rollback
- Preview domain testing catches issues before production

---

### 3. Redis Cache Strategy

**Installation Method**: Playwright automated installation
- Download Redis Object Cache plugin from WordPress.org
- Upload via FTP to `/wp-content/plugins/`
- Activate via Playwright browser automation
- Same pattern as CoCart installation (Phase 1 success)

**Gabia Redis Availability**: Test with fallback
- Attempt Redis connection first
- If Gabia doesn't support Redis: Document limitation, skip Redis
- If Redis available: Configure and verify
- Phase continues regardless (Redis is optimization, not blocker)

**Redis Configuration**: Standard WordPress Object Cache
- Drop-in file: `wp-content/object-cache.php`
- Redis host: Check Gabia docs (likely localhost or 127.0.0.1)
- Persistent cache for WooCommerce queries
- Exclude `/wp-json/` from Redis (already handled by .htaccess)

**Cache Exclusion Verification**: Test API freshness
- Query product via API
- Update product in wp-admin
- Query again, verify change reflected
- If stale: Adjust Redis exclusion rules
- Goal: API always returns fresh data

**Decision Rationale**:
- Playwright automation proven reliable (Phase 1)
- Redis improves performance but not critical for headless architecture
- Test-first approach prevents assumption about Gabia capabilities
- API freshness verification ensures cache bypass working

---

## Key Constraints

1. **No Subdomain Phase**: User wants immediate DNS cutover
2. **Gabia Cache Delay**: 24-48 hour propagation expected
3. **WordPress Admin Access**: Must remain functional via /wp-admin
4. **Zero Downtime**: DNS cutover must not break live site
5. **Vercel Domain Conflict**: Must resolve "domain already assigned" error (CRITICAL-01)

---

## Success Criteria (from ROADMAP.md)

1. API endpoints (`/wp-json/*`) return fresh data (no 24-48h cache delay) verified by timestamp testing
2. ~~Subdomain `new.82mobile.com` configured and accessible (parallel run environment ready)~~ **REMOVED** - immediate cutover instead
3. DNS cutover plan documented with rollback procedure; low TTL DNS records (300s) configured in Cloudflare
4. .htaccess cache exclusion rules deployed and verified working for `/wp-json/` paths
5. Redis Object Cache plugin (if Gabia supports) configured and cache hit rate monitored

**Adjusted Success Criteria** (based on immediate cutover strategy):
1. API endpoints return fresh data (timestamp + header verification)
2. **NEW**: Vercel preview domain fully functional (products, cart, checkout)
3. DNS cutover plan documented with rollback procedure (300s TTL)
4. .htaccess cache exclusion verified working (Phase 1 already deployed, verify persistence)
5. Redis Object Cache configured if Gabia supports; skip if not available

---

## Dependencies

**Requires from Phase 1**:
- ✅ WordPress API endpoints accessible
- ✅ CORS headers configured
- ✅ .htaccess cache bypass deployed

**Blocks Phase 3**:
- Cache verification must pass
- DNS strategy documented
- Vercel preview environment ready

---

## Risk Mitigation

**Risk 1**: Gabia cache persists despite .htaccess rules
- **Mitigation**: Multiple verification methods, 48-hour monitoring
- **Fallback**: Contact Gabia support for manual cache exclusion

**Risk 2**: DNS cutover breaks WordPress admin
- **Mitigation**: Vercel rewrites tested on preview domain first
- **Rollback**: 300s TTL enables 5-minute DNS revert

**Risk 3**: Vercel domain conflict (CRITICAL-01)
- **Mitigation**: Resolve in Phase 7 deployment (check for old project, remove domain)
- **Impact**: Blocks final production cutover, not Phase 2

**Risk 4**: Redis not available on Gabia
- **Mitigation**: Test first, skip if unavailable
- **Impact**: Performance optimization lost, but headless architecture still works

---

## Open Questions for Planning

1. **Verification Script Location**: Where to run cache verification tests?
   - Option A: GitHub Actions (automated, scheduled)
   - Option B: Local Python script (manual trigger)
   - Option C: Vercel Edge Functions (deployed monitoring)

2. **Redis Connection Details**: How to get Gabia Redis credentials?
   - Check Gabia control panel
   - Contact Gabia support
   - Infer from typical shared hosting setup (localhost:6379)

3. **Vercel Rewrites vs Redirects**: Which for /wp-admin routing?
   - Rewrites: Transparent proxy (URL stays 82mobile.com/wp-admin)
   - Redirects: Visible to user (URL changes)
   - Recommendation: Rewrites for seamless UX

---

## Notes for Research Agent

- Research Vercel rewrites syntax for WordPress admin proxying
- Research Cloudflare API for programmatic DNS changes
- Research Redis Object Cache plugin configuration options
- Research Gabia hosting Redis support (check docs, forums)
- Research cache header testing methodologies
- Research immediate DNS cutover best practices (no gradual rollout)

---

## Notes for Planner Agent

- Plan must eliminate subdomain testing phase
- Plan must include Vercel preview testing before DNS cutover
- Plan must include Redis availability check (don't assume supported)
- Plan must include Cloudflare DNS TTL reduction before cutover
- Plan must verify Phase 1 .htaccess cache bypass still active
- Plan should create automated verification script for cache freshness

---

**Context gathering complete**: 2026-01-27
**Key change**: Immediate DNS cutover strategy (no subdomain)
**Ready for**: Phase 2 research and planning
