import { Metric } from 'web-vitals'
import { event } from './analytics'

// Send Web Vitals to GA4
export function sendToGA4(metric: Metric) {
  const { name, value, id, rating } = metric

  // Round values to 2 decimal places
  const roundedValue = Math.round(value)

  event({
    action: name,
    category: 'Web Vitals',
    label: id,
    value: roundedValue,
  })

  // Also send as custom event with rating
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', name, {
      value: roundedValue,
      metric_id: id,
      metric_rating: rating, // 'good', 'needs-improvement', 'poor'
      metric_delta: Math.round(metric.delta),
    })
  }
}

// Get performance rating based on thresholds
export function getPerformanceRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const { name, value } = metric

  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Log to console in development
export function logWebVital(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    const rating = getPerformanceRating(metric)
    const color = rating === 'good' ? '\x1b[32m' : rating === 'needs-improvement' ? '\x1b[33m' : '\x1b[31m'
    console.log(
      `${color}%s\x1b[0m`,
      `[WebVitals] ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${rating})`
    )
  }
}
