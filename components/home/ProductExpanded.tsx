'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/hooks/useToast';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Product } from '@/hooks/useProducts';

interface ProductExpandedProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductExpanded({ product, onClose }: ProductExpandedProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { success } = useToast();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price.replace(/,/g, '')),
      image: product.image,
    }, 1);

    success(`${product.name} added to cart!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-colors shadow-lg"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* Product Image */}
              <div className="relative h-64 md:h-80 bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.duration && (
                    <span className="bg-dancheong-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {product.duration}
                    </span>
                  )}
                  {product.dataAmount && (
                    <span className="bg-hanbok-blue text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {product.dataAmount}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 md:p-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-dancheong-red">
                    ₩{product.price}
                  </span>
                  {product.regularPrice && product.regularPrice !== product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      ₩{product.regularPrice}
                    </span>
                  )}
                </div>

                {/* Description - Content is sanitized with DOMPurify before rendering */}
                {product.description && (
                  <div
                    className="prose prose-gray max-w-none mb-6"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(product.description)
                    }}
                  />
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: '⚡', label: 'Instant Activation' },
                    { icon: '📶', label: 'High-Speed 5G/LTE' },
                    { icon: '🌏', label: 'Nationwide Coverage' },
                    { icon: '💬', label: '24/7 Support' },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Continue Browsing
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 bg-dancheong-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
