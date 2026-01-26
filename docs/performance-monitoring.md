# Performance Monitoring Guide

## Core Web Vitals in GA4

### Custom Exploration Query

1. Go to GA4 → Explore → Create custom exploration
2. Add dimensions:
   - Event name
   - Metric rating
3. Add metrics:
   - Event count
   - Average event value
4. Filter by event name contains: "CLS", "FID", "LCP", "FCP", "TTFB", "INP"

### Expected Values (Targets)

| Metric | Good | Needs Improvement | Poor | Current Target |
|--------|------|-------------------|------|----------------|
| LCP    | <2.5s | 2.5-4s | >4s | <3s (Phase 5 goal) |
| FID    | <100ms | 100-300ms | >300ms | <100ms |
| CLS    | <0.1 | 0.1-0.25 | >0.25 | <0.1 |
| FCP    | <1.8s | 1.8-3s | >3s | <2s |
| TTFB   | <800ms | 800-1800ms | >1800ms | <1s |
| INP    | <200ms | 200-500ms | >500ms | <200ms |

### Real-Time Monitoring

Navigate to: GA4 → Reports → Realtime → Event name filter = "LCP" (or other metrics)

### Setting Up Alerts

1. Go to GA4 → Configure → Custom Definitions → Create custom metrics
2. Create metric for each Web Vital (LCP, FID, CLS, etc.)
3. Set up alerts in GA4 → Admin → Data Display → Custom Alerts
4. Alert condition: "Average LCP > 3000ms for 7 days"

## Development Monitoring

Web Vitals are logged to console in development mode:

```
[WebVitals] LCP: 2341ms (good)
[WebVitals] FID: 12ms (good)
[WebVitals] CLS: 0.002 (good)
```

## Production Verification

After deployment:
1. Visit production site
2. Open GA4 real-time reports
3. Verify Web Vitals events appearing
4. Check metric values against targets
