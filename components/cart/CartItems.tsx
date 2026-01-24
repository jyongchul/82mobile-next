'use client';

import Image from 'next/image';
import { useCartStore } from '@/stores/cart';

export default function CartItems() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return null; // Empty state handled in cart page
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.productId}
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex gap-6">
            {/* Product Image */}
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={item.image || '/images/placeholder-product.jpg'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-2xl font-bold text-dancheong-red">
                ₩{item.price.toLocaleString()}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end gap-4">
              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Subtotal */}
              <p className="text-sm text-gray-600">
                Subtotal: <span className="font-bold text-gray-900">₩{(item.price * item.quantity).toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
