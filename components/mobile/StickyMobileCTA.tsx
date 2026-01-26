'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';

export function StickyMobileCTA() {
  const { items } = useCart();
  const { openCart, openCartToCheckout, isCartOpen } = useUIStore();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = itemCount > 0;

  // Hide when cart is empty or drawer is open
  if (!hasItems || isCartOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Cart Count Badge */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#c8102e] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={openCart}
                className="px-4 py-2 text-sm font-medium text-[#0047ba] bg-white border border-[#0047ba] rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={openCartToCheckout}
                className="px-4 py-2 text-sm font-medium text-white bg-[#c8102e] rounded-lg hover:bg-[#a00d24] transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Checkout
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
