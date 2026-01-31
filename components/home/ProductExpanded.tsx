'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { useToast } from '@/hooks/useToast';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Product } from '@/hooks/useProducts';

interface ProductExpandedProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductExpanded({ product, onClose }: ProductExpandedProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const { success } = useToast();
  const t = useTranslations('productDetail');
  const tr = useTranslations('reservation');
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (product) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const handleReserve = () => {
    if (!product) return;

    // Add ₩5,000 reservation item to cart (not full product price)
    addItem({
      productId: product.id,
      name: `[${tr('reservationPrefix')}] ${product.name}`,
      slug: product.slug,
      price: 5000,
      image: product.image,
    }, 1);

    success(tr('reservationAdded'));
    onClose();
    openCart();
  };

  // Content is sanitized with DOMPurify via sanitizeHtml() before rendering
  const renderDescription = (html: string) => ({ __html: sanitizeHtml(html) });

  const modalContent = (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="pointer-events-auto w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-colors shadow-lg"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="overflow-y-auto flex-1">
                {/* Product Image */}
                <div className="relative h-48 md:h-64 bg-gray-100">
                  <Image src={product.image} alt={product.name} fill className="object-cover" priority />
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

                <div className="p-6 md:p-8">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h2>

                  {/* Plan price (for reference) */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-400 line-through">₩{product.price}</span>
                    <span className="text-sm text-gray-500">{tr('fullPriceAtStore')}</span>
                  </div>

                  {/* Reservation price highlight */}
                  <div className="bg-gradient-to-r from-dancheong-red to-red-600 text-white rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">{tr('onlineReservation')}</p>
                        <p className="text-3xl font-black">₩5,000</p>
                      </div>
                      <div className="text-right text-sm opacity-90">
                        <p>{tr('reservationDeposit')}</p>
                        <p className="font-bold">{tr('discountAtStore')}</p>
                      </div>
                    </div>
                  </div>

                  {/* In-store notice */}
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏪</span>
                      <div className="text-sm">
                        <p className="font-bold text-amber-800 mb-1">{tr('inStoreNoticeTitle')}</p>
                        <p className="text-amber-700">{tr('inStoreNoticeBody')}</p>
                        {locale === 'ko' && (
                          <p className="text-amber-600 mt-1 text-xs">
                            The remaining plan fee and activation will be completed at our store.
                          </p>
                        )}
                        {locale === 'en' && (
                          <p className="text-amber-600 mt-1 text-xs">
                            나머지 요금제 결제와 개통은 매장 방문 시 진행됩니다.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Store location */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span>📍</span> {tr('storeLocation')}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {tr('storeFullAddress')}
                    </p>
                    <a
                      href="https://map.naver.com/v5/search/서울특별시 성북구 월곡로10길 42"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-hanbok-blue hover:underline"
                    >
                      {tr('viewOnMap')} →
                    </a>
                  </div>

                  {/* How it works */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-bold text-gray-900">{tr('howItWorks')}</h3>
                    {[
                      { step: '1', text: tr('step1') },
                      { step: '2', text: tr('step2') },
                      { step: '3', text: tr('step3') },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-dancheong-red text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {item.step}
                        </span>
                        <p className="text-sm text-gray-700">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description - sanitized with DOMPurify via sanitizeHtml() */}
                  {product.description && (
                    <div
                      className="prose prose-gray prose-sm max-w-none mb-6"
                      dangerouslySetInnerHTML={renderDescription(product.description)}
                    />
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('continueBrowsing')}
                </button>
                <button
                  onClick={handleReserve}
                  className="flex-1 py-3 px-4 bg-dancheong-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {tr('reserveButton')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
