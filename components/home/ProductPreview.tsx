'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Product Preview Section - Shows featured products on homepage
 * Fetches top 3 products from WooCommerce
 */

// Mock products for now - will be replaced with WooCommerce data
const featuredProducts = [
  {
    id: 1,
    slug: 'korea-esim-unlimited-30days',
    name: 'Korea eSIM Unlimited 30 Days',
    price: '45,000',
    currency: '₩',
    image: '/images/products/esim-unlimited.jpg',
    badge: 'Most Popular'
  },
  {
    id: 2,
    slug: 'korea-esim-standard-10days',
    name: 'Korea eSIM Standard 10 Days',
    price: '25,000',
    currency: '₩',
    image: '/images/products/esim-standard.jpg',
    badge: 'Best Value'
  },
  {
    id: 3,
    slug: 'korea-physical-sim-unlimited',
    name: 'Physical SIM Unlimited',
    price: '35,000',
    currency: '₩',
    image: '/images/products/sim-korea-unlimited.jpg',
    badge: null
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/${locale}/shop/${product.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-dancheong-red text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 group-hover:text-dancheong-red transition-colors">
                  {product.name}
                </h3>
                <p className="text-3xl font-bold text-dancheong-red">
                  {product.currency}{product.price}
                </p>
              </div>
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
