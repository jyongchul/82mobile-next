'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'
import { sendToGA4, logWebVital } from '@/lib/performance'

export default function WebVitals() {
  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      // Log in development
      logWebVital(metric)

      // Send to GA4
      sendToGA4(metric)
    }

    // Measure all Core Web Vitals
    onCLS(handleMetric)
    onFCP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
    onINP(handleMetric) // INP replaces FID in web-vitals v4
  }, [])

  return null // This component doesn't render anything
}
