# Testing

## Current Testing State

**Status**: No automated test suite exists in the current codebase.

**Test Files Found**: 0

**Coverage**: Not measured

---

## Testing Gaps

### 1. Unit Testing
**Missing**: No unit tests for utility functions, hooks, or component logic

**Critical Areas Needing Tests**:
- `lib/woocommerce.ts` - API transformations and error handling
- `lib/utils.ts` - Helper functions (cn, formatPrice)
- `hooks/useHashNavigation.ts` - Complex scroll logic
- `hooks/useCart.ts` - Cart store operations
- `stores/cart.ts` - Zustand state mutations

### 2. Integration Testing
**Missing**: No integration tests for API routes or data flows

**Critical Flows**:
- Product listing from WooCommerce API
- Cart operations (add, remove, update quantity)
- Checkout form validation and submission
- Order creation workflow
- Payment gateway integration
- Internationalization (locale switching)

### 3. End-to-End Testing
**Missing**: No E2E tests for user journeys

**Critical User Journeys**:
- Browse products → Add to cart → Checkout → Payment → Confirmation
- Language switching across all pages
- Mobile navigation and responsive behavior
- Error handling (network failures, payment errors)

### 4. Visual Regression Testing
**Missing**: No visual regression tests

**High-Value Areas**:
- Product card 3D flip animations
- Mobile cart drawer
- Checkout form layouts
- Hero section with rotating SIM card

---

## Testing Tools Available

### Installed but Unused
None - no testing libraries in `package.json`

### Recommended Tools

**Unit & Integration Testing**:
- **Vitest** - Fast Vite-native test runner
- **React Testing Library** - Component testing with user-centric queries
- **MSW (Mock Service Worker)** - API mocking for WooCommerce endpoints

**E2E Testing**:
- **Playwright** - Browser automation for critical user flows
- **Cypress** - Alternative E2E framework

**Visual Testing**:
- **Playwright Visual Comparisons** - Built-in screenshot comparison
- **Chromatic** - Visual regression service for Storybook

---

## Testing Strategy Recommendations

### Phase 1: Critical Path Coverage (High Priority)
1. **E2E tests for core flows** using Playwright:
   - Product browsing → Cart → Checkout → Order confirmation
   - Payment gateway integration (test mode)
   - Locale switching (Korean ↔ English)

2. **API route integration tests**:
   - `/api/products` - Mock WooCommerce responses
   - `/api/orders` - Order creation validation
   - `/api/payment/*` - Payment webhook handling

### Phase 2: Component Testing (Medium Priority)
1. **Cart store tests** using Vitest:
   - Add/remove/update operations
   - localStorage persistence
   - State synchronization

2. **Form validation tests**:
   - Checkout form with Zod schema
   - Error message rendering
   - Field validation rules

### Phase 3: Performance Testing (Medium Priority)
1. **Lighthouse CI** (already configured):
   - Performance budgets (LCP < 2.5s)
   - Accessibility audits (score > 90)
   - Core Web Vitals tracking

2. **Load testing for API routes**:
   - Simulate concurrent users
   - WooCommerce API rate limiting

### Phase 4: Visual Regression (Low Priority)
1. **Key components**:
   - ProductCard (with 3D flip)
   - Hero section
   - Cart drawer
   - Checkout layout

---

## Testing Challenges

### 1. WooCommerce API Dependency
**Challenge**: Tests depend on external WooCommerce API availability

**Solutions**:
- Mock API responses using MSW
- Record real API responses for replay
- Maintain test fixtures for common scenarios
- Use WooCommerce test mode/sandbox

### 2. Payment Gateway Testing
**Challenge**: PortOne and Eximbay require real payment flows

**Solutions**:
- Use payment gateway test environments
- Mock webhook callbacks
- Test with expired/invalid card numbers
- Verify error handling without real payments

### 3. Animation Testing
**Challenge**: Framer Motion and Lenis animations difficult to test

**Solutions**:
- Disable animations in test mode
- Test final state instead of transitions
- Use Playwright video recording for visual verification
- Focus on functional behavior over animation smoothness

### 4. Internationalization Testing
**Challenge**: Testing all locale combinations

**Solutions**:
- Parameterized tests for each locale
- Test translation key coverage
- Verify locale-specific formatting (dates, prices)
- Check RTL support if adding Arabic/Hebrew

---

## Current Testing Workflow

**Manual Testing**: Ad-hoc browser testing during development

**CI/CD Testing**: None (no automated tests in pipeline)

**Production Monitoring**:
- Google Analytics 4 for user behavior
- Web Vitals for performance metrics
- No error tracking (Sentry not configured)

---

## Recommended Test Structure

```
82mobile-next/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── woocommerce.test.ts
│   │   │   └── utils.test.ts
│   │   ├── hooks/
│   │   │   └── useHashNavigation.test.ts
│   │   └── stores/
│   │       └── cart.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── products.test.ts
│   │   │   └── orders.test.ts
│   │   └── components/
│   │       ├── ProductCard.test.tsx
│   │       └── CartDrawer.test.tsx
│   └── e2e/
│       ├── checkout-flow.spec.ts
│       ├── product-browsing.spec.ts
│       └── locale-switching.spec.ts
├── vitest.config.ts
├── playwright.config.ts
└── .github/
    └── workflows/
        └── test.yml
```

---

## Dependencies to Add

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@vitejs/plugin-react": "^4.2.1",
    "vitest": "^1.0.4",
    "@playwright/test": "^1.40.1",
    "msw": "^2.0.11"
  }
}
```

---

## Next Steps

1. **Install testing dependencies**:
   ```bash
   npm install -D vitest @testing-library/react @playwright/test msw
   ```

2. **Configure Vitest**:
   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: './vitest.setup.ts',
     },
   })
   ```

3. **Configure Playwright**:
   ```typescript
   // playwright.config.ts
   import { defineConfig } from '@playwright/test'

   export default defineConfig({
     testDir: './__tests__/e2e',
     use: {
       baseURL: 'http://localhost:3000',
     },
     webServer: {
       command: 'npm run dev',
       port: 3000,
     },
   })
   ```

4. **Write first test** (E2E checkout flow)

5. **Add CI pipeline** (GitHub Actions)

---

*Last analyzed: 2026-01-27*
