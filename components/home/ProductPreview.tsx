'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import SimCardFlip from '@/components/ui/SimCardFlip';

/**
 * Product Preview Section - Shows featured products on homepage
 * Fetches top 3 products from WooCommerce
 */

// Mock products for now - will be replaced with WooCommerce data
const featuredProducts = [
  {
    id: 1,
    slug: 'korea-esim-unlimited-30days',
    name: 'Korea eSIM',
    subtitle: 'Unlimited 30 Days',
    price: '₩45,000',
    features: [
      'Unlimited 5G Data',
      'Instant Activation',
      'Keep Your Phone Number',
      'No Physical Card Needed'
    ]
  },
  {
    id: 2,
    slug: 'korea-esim-standard-10days',
    name: 'Korea eSIM',
    subtitle: 'Standard 10 Days',
    price: '₩25,000',
    features: [
      '10GB High-Speed Data',
      'Instant QR Code',
      'Compatible with All Carriers',
      'Perfect for Short Trips'
    ]
  },
  {
    id: 3,
    slug: 'korea-physical-sim-unlimited',
    name: 'Physical SIM',
    subtitle: 'Unlimited Data',
    price: '₩35,000',
    features: [
      'Unlimited 4G/5G Data',
      'Works in Any Phone',
      'Pick up at Airport',
      '24/7 Customer Support'
    ]
  }
];

export default function ProductPreview() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Popular Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your stay in Korea
          </p>
        </div>

        {/* Product Grid with 3D Flip SIM Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/${locale}/shop/${product.slug}`}
              className="block"
            >
              <SimCardFlip
                title={product.name}
                subtitle={product.subtitle}
                features={product.features}
                price={product.price}
              />
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center px-8 py-4 bg-hanbok-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
          >
            View All Products
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
