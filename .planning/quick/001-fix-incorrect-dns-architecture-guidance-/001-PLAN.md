---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - 82mobile-next/vercel.json
  - 82mobile-next/.env
  - DNS_CUTOVER_GUIDE.md
  - DNS_CORRECTION_EMAIL.md
autonomous: false

must_haves:
  truths:
    - "WORDPRESS_URL env var points to Gabia IP directly, not domain (avoids DNS loop)"
    - "vercel.json rewrites /wp-json/* to Gabia backend"
    - "Customer receives corrected DNS instructions before making changes"
  artifacts:
    - path: "82mobile-next/vercel.json"
      provides: "Reverse proxy rewrites for wp-json, wp-admin, wp-content"
      contains: "wp-json"
    - path: "DNS_CUTOVER_GUIDE.md"
      provides: "Corrected DNS cutover guide"
      contains: "182.162"
    - path: "DNS_CORRECTION_EMAIL.md"
      provides: "Correction email/SMS to send to customer"
  key_links:
    - from: "82mobile-next/.env"
      to: "Gabia server"
      via: "WORDPRESS_URL pointing to IP not domain"
      pattern: "WORDPRESS_URL=http://182\\.162"
---

<objective>
Fix incorrect DNS architecture guidance sent to customer that would break WordPress backend.

Purpose: The email sent to Adam (권아담) instructed changing the A record to Vercel IP (76.76.21.21). This would cause WORDPRESS_URL=http://82mobile.com to loop back to Vercel instead of reaching Gabia's WordPress, breaking ALL WooCommerce API calls. Must fix the architecture AND send correction before customer acts.

Output: Corrected vercel.json with wp-json rewrites, updated .env with direct Gabia IP, corrected DNS guide, and correction email ready to send.
</objective>

<execution_context>
@/home/charles_lee/.claude/get-shit-done/workflows/execute-plan.md
@/home/charles_lee/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@82mobile-next/vercel.json (current rewrites - missing wp-json)
@82mobile-next/.env (WORDPRESS_URL=http://82mobile.com - will loop after DNS change)
@82mobile-next/next.config.js (image remote patterns reference 82mobile.com)
@DNS_CHANGE_REQUEST_SENT.md (incorrect email already sent)
@DNS_CUTOVER_GUIDE.md (needs correction)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix vercel.json and .env for DNS cutover safety</name>
  <files>82mobile-next/vercel.json, 82mobile-next/.env, 82mobile-next/next.config.js</files>
  <action>
  **Problem**: After DNS change, `WORDPRESS_URL=http://82mobile.com` resolves to Vercel (loop). All wp-json API calls fail.

  **Fix 1 - vercel.json**: Add wp-json rewrite BEFORE existing rewrites:
  ```json
  {
    "source": "/wp-json/:path*",
    "destination": "http://182.162.142.102/wp-json/:path*"
  }
  ```
  This ensures any wp-json requests that somehow hit Vercel get proxied to Gabia.

  **Fix 2 - .env**: Change WORDPRESS_URL to use Gabia IP directly:
  ```
  WORDPRESS_URL=http://182.162.142.102
  ```
  This is the critical fix. Server-side API calls (woocommerce.ts, wordpress-auth.ts, cart-session.ts) all use this env var. Using the IP bypasses DNS entirely, so it works regardless of where 82mobile.com points.

  **Fix 3 - next.config.js**: Add Gabia IP to remotePatterns for images:
  ```js
  {
    protocol: 'http',
    hostname: '182.162.142.102',
    pathname: '/wp-content/uploads/**',
  }
  ```

  **Fix 4 - All vercel.json rewrite destinations**: Update existing wp-admin/wp-content/wp-includes rewrites to use `http://182.162.142.102` instead of `http://82mobile.com` (same loop problem).

  **Do NOT** remove the 82mobile.com remote patterns from next.config.js (keep both for backward compat).
  </action>
  <verify>
  - `grep "182.162.142.102" 82mobile-next/vercel.json` shows IP in all rewrite destinations
  - `grep "182.162.142.102" 82mobile-next/.env` shows WORDPRESS_URL uses IP
  - `grep "182.162.142.102" 82mobile-next/next.config.js` shows IP in remotePatterns
  - `grep "wp-json" 82mobile-next/vercel.json` shows wp-json rewrite exists
  - `cat 82mobile-next/vercel.json | python3 -m json.tool` validates JSON
  </verify>
  <done>All server-side WordPress API calls use Gabia IP directly, vercel.json proxies wp-json/wp-admin/wp-content to Gabia IP, DNS change is safe to proceed.</done>
</task>

<task type="auto">
  <name>Task 2: Create corrected DNS guide and correction email</name>
  <files>DNS_CUTOVER_GUIDE.md, DNS_CORRECTION_EMAIL.md</files>
  <action>
  **DNS_CUTOVER_GUIDE.md**: Rewrite with correct architecture explanation:

  1. Explain the headless architecture: Vercel serves Next.js frontend, Gabia serves WordPress API backend
  2. DNS change IS correct (A record to 76.76.21.21) - the fix is on our side (using IP in env vars and rewrites)
  3. Document the vercel.json reverse proxy setup that handles wp-admin, wp-json, wp-content
  4. Add verification steps:
     - `nslookup 82mobile.com` -> 76.76.21.21
     - `curl https://82mobile.com` -> Next.js app
     - `curl https://82mobile.com/wp-admin` -> WordPress admin (via Vercel proxy)
     - `curl https://82mobile.com/wp-json/wc/v3/products` -> WooCommerce API (via Vercel proxy)
  5. Add rollback plan: Change A record back to 182.162.142.102

  **DNS_CORRECTION_EMAIL.md**: Create a follow-up email to Adam:
  - Subject: [82mobile.com] DNS 변경 관련 보충 안내
  - Tone: NOT alarming. Frame as "additional preparation completed on our side"
  - Key message: "DNS 변경 전에 저희 쪽에서 추가 설정을 완료했습니다. 이제 안심하고 변경하셔도 됩니다."
  - Reiterate the same DNS change instructions (A record to 76.76.21.21) - the change itself is correct
  - Add: "변경 후 wp-admin 접속이 안 되시면 바로 연락 주세요" (safety net)
  - Include both Korean and brief English summary
  - Format: HTML email with inline CSS, logo header, contact footer per standing orders
  - Do NOT mention "we sent wrong instructions" - just frame as "we completed additional setup"
  </action>
  <verify>
  - `test -f DNS_CUTOVER_GUIDE.md` exists and contains "182.162.142.102" and "76.76.21.21" and "vercel.json"
  - `test -f DNS_CORRECTION_EMAIL.md` exists and contains "보충 안내" and "추가 설정"
  - DNS_CORRECTION_EMAIL.md does NOT contain words like "잘못" or "오류" or "incorrect"
  </verify>
  <done>Corrected DNS guide documents the full reverse proxy architecture. Follow-up email is ready to send, framed positively as additional preparation.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
  Fixed vercel.json (wp-json rewrites + IP-based destinations), .env (WORDPRESS_URL=IP), next.config.js (IP in remotePatterns), corrected DNS guide, and follow-up email to customer.
  </what-built>
  <how-to-verify>
  1. Review vercel.json rewrites - all destinations should use 182.162.142.102
  2. Review .env - WORDPRESS_URL should be http://182.162.142.102
  3. Review DNS_CORRECTION_EMAIL.md - tone should be reassuring, not alarming
  4. Confirm: Has customer already changed DNS? If yes, verify wp-admin still works
  5. Decide: Send the follow-up email now? Or wait?
  </how-to-verify>
  <resume-signal>Type "send email" to send correction, "approved" if no email needed, or describe issues</resume-signal>
</task>

</tasks>

<verification>
- vercel.json has rewrites for: wp-json, wp-admin, wp-login.php, wp-includes, wp-content - ALL pointing to 182.162.142.102
- .env WORDPRESS_URL uses Gabia IP directly (no DNS dependency)
- next.config.js allows images from both 82mobile.com and 182.162.142.102
- DNS_CUTOVER_GUIDE.md accurately documents the reverse proxy architecture
- Follow-up email is professional and non-alarming
</verification>

<success_criteria>
- DNS change to Vercel IP is safe: WordPress API calls bypass DNS via direct IP
- Customer has clear, correct instructions
- wp-admin access preserved via Vercel reverse proxy after DNS change
- Rollback plan documented
</success_criteria>

<output>
After completion, create `.planning/quick/001-fix-incorrect-dns-architecture-guidance-/001-SUMMARY.md`
</output>
