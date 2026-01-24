'use client';

import { useCartStore } from '@/stores/cart';
import { useLocale } from 'next-intl';
import Link from 'next/link';

interface OrderSummaryProps {
  showCheckoutButton?: boolean;
}

export default function OrderSummary({ showCheckoutButton = true }: OrderSummaryProps) {
  const items = useCartStore((state) => state.items);
  const locale = useLocale();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.1); // 10% VAT
  const total = subtotal + shipping + tax;

  const isEmpty = items.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
        Order Summary
      </h2>

      {/* Summary Items */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({items.length} items)</span>
          <span className="font-medium">₩{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium text-jade-green">Free</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>VAT (10%)</span>
          <span className="font-medium">₩{tax.toLocaleString()}</span>
        </div>

        <div className="pt-4 border-t-2 border-gray-200">
          <div className="flex justify-between items-baseline">
            <span className="font-heading text-xl font-bold text-gray-900">
              Total
            </span>
            <span className="font-heading text-3xl font-bold text-dancheong-red">
              ₩{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Link
          href={isEmpty ? '#' : `/${locale}/checkout`}
          className={`block w-full text-center px-6 py-4 rounded-lg font-bold transition-all ${
            isEmpty
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-dancheong-red text-white hover:bg-red-700 transform hover:scale-105'
          }`}
          onClick={(e) => {
            if (isEmpty) {
              e.preventDefault();
            }
          }}
          aria-disabled={isEmpty}
        >
          {isEmpty ? 'Cart is Empty' : 'Proceed to Checkout'}
        </Link>
      )}

      {/* Continue Shopping */}
      <Link
        href={`/${locale}/shop`}
        className="block w-full text-center px-6 py-3 mt-4 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:border-dancheong-red hover:text-dancheong-red transition-colors"
      >
        Continue Shopping
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-jade-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-jade-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-jade-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Instant delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
