'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import CartDrawerItems from './CartDrawerItems';
import CartDrawerCheckout from './CartDrawerCheckout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore((state) => state.itemCount);
  const { cartView, setCartView } = useUIStore();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
  };

  // Desktop: slide from right
  const desktopVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' },
  };

  // Mobile: slide from bottom
  const mobileVariants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer Panel - Mobile (slide from bottom) */}
          <motion.div
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed right-0 bottom-0 w-full h-[80vh] bg-white z-50 flex flex-col shadow-2xl rounded-t-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              {cartView === 'checkout' && (
                <button
                  onClick={() => setCartView('cart')}
                  className="p-2 hover:bg-gray-100 rounded-lg mr-2"
                  aria-label="Back to cart"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                {cartView === 'cart' ? (
                  <>
                    Your Cart
                    {itemCount > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                    )}
                  </>
                ) : (
                  'Checkout'
                )}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content - View Switcher */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {cartView === 'cart' ? (
                  <motion.div
                    key="cart-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartDrawerItems />
                  </motion.div>
                ) : (
                  <motion.div
                    key="checkout-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartDrawerCheckout />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Only show in cart view */}
            {cartView === 'cart' && (
              <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
                {/* Simple Total Display */}
                <div className="flex justify-between items-baseline">
                  <span className="font-heading text-lg font-bold text-gray-900">Total</span>
                  <span className="font-heading text-2xl font-bold text-dancheong-red">
                    ₩{total.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setCartView('checkout')}
                  disabled={itemCount === 0}
                  className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg ${
                    itemCount === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-dancheong-red text-white hover:bg-red-700'
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>

          {/* Drawer Panel - Desktop (slide from right) */}
          <motion.div
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden md:flex md:flex-col fixed right-0 top-0 w-[400px] h-full bg-white z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              {cartView === 'checkout' && (
                <button
                  onClick={() => setCartView('cart')}
                  className="p-2 hover:bg-gray-100 rounded-lg mr-2"
                  aria-label="Back to cart"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                {cartView === 'cart' ? (
                  <>
                    Your Cart
                    {itemCount > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                    )}
                  </>
                ) : (
                  'Checkout'
                )}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content - View Switcher */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {cartView === 'cart' ? (
                  <motion.div
                    key="cart-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartDrawerItems />
                  </motion.div>
                ) : (
                  <motion.div
                    key="checkout-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartDrawerCheckout />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Only show in cart view */}
            {cartView === 'cart' && (
              <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
                {/* Simple Total Display */}
                <div className="flex justify-between items-baseline">
                  <span className="font-heading text-lg font-bold text-gray-900">Total</span>
                  <span className="font-heading text-2xl font-bold text-dancheong-red">
                    ₩{total.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setCartView('checkout')}
                  disabled={itemCount === 0}
                  className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg ${
                    itemCount === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-dancheong-red text-white hover:bg-red-700'
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
