'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart';

export default function CartDrawerItems() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600">
          Add some amazing Korean SIM cards to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            {/* Top row: Image, Name, Remove */}
            <div className="flex gap-3 mb-3">
              {/* Product Image - Compact 48x48 */}
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image || '/images/placeholder-product.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Name */}
              <div className="flex-1 min-w-0">
                <h4 className="font-heading text-sm font-bold text-gray-900 line-clamp-2">
                  {item.name}
                </h4>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeItem(item.productId)}
                className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Bottom row: Price, Quantity Controls, Subtotal */}
            <div className="flex items-center justify-between">
              {/* Unit Price */}
              <div className="text-sm text-gray-600">
                ₩{item.price.toLocaleString()}
              </div>

              {/* Quantity Controls - Touch-optimized */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  className="px-3 py-3 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-3 py-1 text-sm font-bold text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-3 py-3 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-sm font-bold text-dancheong-red">
                ₩{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
