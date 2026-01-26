module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en#products',
        'http://localhost:3000/en#about',
        'http://localhost:3000/en#contact',
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      settings: {
        // Mobile emulation (Phase 5 mobile-first)
        preset: 'desktop', // Start with desktop, add mobile in separate run
        throttling: {
          // Simulated 3G
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance thresholds (Phase 6 goals)
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.90 }],

        // Core Web Vitals (align with Phase 5 baseline)
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],

        // Resource hints
        'uses-rel-preconnect': 'off', // Not critical for single-page app
        'uses-http2': 'off', // Vercel handles this

        // Bundle size (Phase 5 baseline: 118-125KB)
        'total-byte-weight': ['warn', { maxNumericValue: 225000 }], // 220KB + 5KB buffer
      },
    },
    upload: {
      target: 'temporary-public-storage', // Free LHCI server for 7 days
    },
  },
}
