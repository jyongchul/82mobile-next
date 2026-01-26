// Google Analytics 4 helper functions
// NOTE: Uses window.gtag (loaded from external GA script), not dangerouslySetInnerHTML

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Page view tracking
export const pageview = (url: string, title: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID as string, {
      page_path: url,
      page_title: title,
    })
  }
}

// Event tracking
type GTagEvent = {
  action: string
  category: string
  label?: string
  value?: number
}

export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// E-commerce events
export const trackProductView = (product: {
  id: string
  name: string
  price: number
  category?: string
}) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', 'view_item', {
      currency: 'KRW',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      }]
    })
  }
}

export const trackAddToCart = (product: {
  id: string
  name: string
  price: number
  quantity: number
}) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', 'add_to_cart', {
      currency: 'KRW',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      }]
    })
  }
}

export const trackBeginCheckout = (value: number, items: any[]) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', 'begin_checkout', {
      currency: 'KRW',
      value: value,
      items: items,
    })
  }
}

export const trackPurchase = (orderId: string, value: number, items: any[]) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      currency: 'KRW',
      value: value,
      items: items,
    })
  }
}
