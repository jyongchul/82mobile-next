'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import CartItems from '@/components/cart/CartItems';
import OrderSummary from '@/components/cart/OrderSummary';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const items = useCartStore((state) => state.items);

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {isEmpty ? 'Your cart is empty' : `${items.length} item(s) in your cart`}
          </p>
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              {/* Empty Cart Icon */}
              <svg
                className="w-32 h-32 mx-auto mb-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet. Start exploring our products!
              </p>

              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center px-8 py-4 bg-dancheong-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <CartItems />
            </div>

            {/* Order Summary */}
            <div>
              <OrderSummary showCheckoutButton={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
