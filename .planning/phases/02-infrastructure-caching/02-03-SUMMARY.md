---
phase: 02-infrastructure-caching
plan: 03
subsystem: infra
tags: [dns, cloudflare, vercel, cutover, automation]

# Dependency graph
requires:
  - phase: 02-01
    provides: Cache verification with 48-hour monitoring
  - phase: 02-02
    provides: Redis status assessment (unavailable on Gabia)
provides:
  - DNS cutover plan with immediate production deployment strategy
  - Cloudflare DNS automation script for cutover and rollback
  - Vercel rewrites configuration for WordPress admin proxy
  - 300s TTL strategy for fast rollback capability
affects: [07-deployment-cutover, all-phases]

# Tech tracking
tech-stack:
  added: [cloudflare (python SDK), vercel.json configuration]
  patterns: [DNS automation via API, transparent proxy rewrites, low TTL for rollback capability]

key-files:
  created:
    - .planning/phases/02-infrastructure-caching/DNS-CUTOVER-PLAN.md
    - scripts/cloudflare_dns_manager.py
    - vercel.json
  modified: []

key-decisions:
  - "Immediate production cutover (no subdomain testing) per user requirement"
  - "300s TTL for fast rollback (5-10 min recovery vs. 1-hour default)"
  - "Vercel rewrites for WordPress admin proxy (transparent to user)"
  - "DNS cutover executes AFTER Phases 3-6 complete (all features operational)"
  - "Mandatory Vercel preview domain testing before cutover"

patterns-established:
  - "DNS automation pattern: Dry-run mode, clear rollback procedures, TTL pre-lowering"
  - "Cutover safety: Pre-cutover checklist, health checks, automated rollback script"
  - "Transparent proxy: Vercel rewrites keep /wp-admin URL while proxying to backend"

# Metrics
duration: 12min
completed: 2026-01-27
---

# Phase 2 Plan 3: DNS Cutover Strategy & Vercel Configuration Summary

**DNS cutover plan with immediate production deployment (no subdomain), Cloudflare automation for 5-minute rollback, and Vercel WordPress admin proxy**

## Performance

- **Duration:** 12 minutes
- **Started:** 2026-01-27T10:20:33Z
- **Completed:** 2026-01-27T10:32:37Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- Comprehensive DNS cutover plan with immediate production deployment strategy (per user "바로 전환" requirement)
- Cloudflare DNS automation script with cutover, rollback, and TTL management capabilities
- Vercel rewrites configuration for transparent WordPress admin proxy
- 300s TTL strategy documented for 5-10 minute rollback capability
- User approval checkpoint passed - strategy approved

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DNS cutover plan document** - `6bc50a4` (docs)
2. **Task 2: Create Cloudflare DNS automation script** - `8634698` (feat)
3. **Task 3: Create Vercel configuration with rewrites** - `16d4cc6` (feat)

## Files Created/Modified

- `.planning/phases/02-infrastructure-caching/DNS-CUTOVER-PLAN.md` - Complete DNS cutover strategy: pre-cutover requirements, execution steps, rollback procedures, health checks, risk assessment
- `scripts/cloudflare_dns_manager.py` - Cloudflare API automation: DNS cutover to Vercel (76.76.21.21), rollback to Gabia (182.162.142.102), TTL lowering, dry-run mode
- `vercel.json` - Vercel rewrites for WordPress admin proxy: /wp-admin, /wp-login.php, /wp-includes, /wp-content with security headers

## Decisions Made

**DNS Cutover Strategy (immediate production deployment)**:
- No subdomain testing phase per user requirement ("바로 전환")
- DNS cutover executes AFTER Phases 3-6 complete (product catalog, cart, checkout, payment all operational)
- Mandatory Vercel preview domain testing before cutover (full e-commerce flow verification)
- 300s TTL for fast rollback capability (5-10 min recovery vs. 1-hour default)

**Technical Approach**:
- Cloudflare DNS automation via Python SDK (requires `pip install cloudflare`)
- Vercel rewrites for transparent WordPress admin proxy (URL stays 82mobile.com/wp-admin)
- Cloudflare proxy disabled (DNS only / gray cloud) - CRITICAL for Vercel SSL to work
- Gabia IP documented: 182.162.142.102 (current production)

**Risk Mitigation**:
- Extensive Vercel preview domain testing (mandatory checklist)
- Low-traffic cutover window (3-5 AM Korea Time)
- Automated rollback script ready
- 72-hour TTL pre-lowering before cutover

## Deviations from Plan

None - plan executed exactly as written.

All automation scripts include proper error handling, dry-run modes, and clear documentation.

## Issues Encountered

None - all tasks completed successfully.

**Notes**:
- CloudFlare SDK not installed (expected) - will install when needed: `pip install cloudflare`
- Current Gabia IP resolved: 182.162.142.102 (verified 2026-01-27)
- User approval received for immediate cutover strategy

## User Setup Required

**Cloudflare API token** required before DNS cutover execution:
1. Log in to Cloudflare dashboard
2. Go to My Profile → API Tokens
3. Create token with permissions: Zone:DNS:Edit for 82mobile.com
4. Export token: `export CLOUDFLARE_API_TOKEN='your-token-here'`

**Verification command**:
```bash
# Test script in dry-run mode (no changes made)
python3 scripts/cloudflare_dns_manager.py --dry-run --cutover
```

**When to execute**:
- Do NOT execute DNS cutover now
- DNS cutover happens in Phase 7 (Deployment & Cutover)
- Prerequisites: Phases 3-6 must complete first

## Next Phase Readiness

**Phase 2 complete** - Infrastructure and caching strategy documented:
- ✅ Cache verification passed (Plan 02-01)
- ✅ Redis status assessed (Plan 02-02)
- ✅ DNS cutover strategy approved (Plan 02-03)

**Ready for Phase 3** (Next.js API routes setup):
- DNS strategy documented and tooling prepared
- Vercel configuration ready for deployment
- Clear roadmap for production cutover after all features complete

**Blockers for DNS cutover execution**:
- ⏳ Phase 3: Next.js API routes and environment variables
- ⏳ Phase 4: Cart functionality with CoCart integration
- ⏳ Phase 5: Product catalog, checkout flow, multilingual UI
- ⏳ Phase 6: Payment gateway integration and testing
- ⏳ Vercel preview domain testing (full e-commerce flow)

**No blockers for continuing development** - DNS cutover is Phase 7 activity.

---
*Phase: 02-infrastructure-caching*
*Plan: 03*
*Completed: 2026-01-27*
