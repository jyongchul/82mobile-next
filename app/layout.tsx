import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Syne } from 'next/font/google'
import './globals.css'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import QueryProvider from '@/components/providers/QueryProvider'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import WebVitals from '@/components/performance/WebVitals'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '82mobile - Your Best SIM Card for Traveling in Korea',
  description: 'Stay connected in Korea with 82mobile. Data, calls, and texts in one SIM card. eSIM and physical SIM cards available.',
  keywords: ['Korea SIM', 'eSIM', 'Travel SIM', 'Korea Data', '82mobile'],
  openGraph: {
    title: '82mobile - Your Best SIM Card for Traveling in Korea',
    description: 'Stay connected in Korea with 82mobile. Data, calls, and texts in one SIM card.',
    url: 'https://82mobile.com',
    siteName: '82mobile',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${outfit.variable} ${plusJakarta.variable} ${syne.variable}`}>
      <body>
        <GoogleAnalytics />
        <WebVitals />
        <QueryProvider>
          <LoadingSpinner />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
