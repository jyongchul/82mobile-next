'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { useToast } from '@/hooks/useToast';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { trackProductView } from '@/lib/analytics';

interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  price: string;
  regularPrice?: string;
  image: string;
  imageFull?: string;
  duration?: string;
  dataAmount?: string;
  badge?: string;
  index: number;
  onSelect?: () => void;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  regularPrice,
  image,
  imageFull,
  duration,
  dataAmount,
  badge,
  index,
  onSelect
}: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('productDetail');
  const tr = useTranslations('reservation');
  const tc = useTranslations('common');
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const toast = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const hasTrackedView = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const loadingStrategy = index < 6 ? 'eager' : 'lazy';
  const priority = index < 6;

  const handleReserve = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    addItem({
      productId: id,
      name: `[${tr('reservationPrefix')}] ${name}`,
      slug,
      price: 5000,
      image
    }, 1);

    setTimeout(() => {
      setIsAdding(false);
      toast.success(tr('reservationAdded'), {
        icon: '🛒',
        duration: 3000,
      });
      openCart();
    }, 500);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsFlipped(true);
    }
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      trackProductView({
        id: id.toString(),
        name,
        price: parseFloat(price.replace(/,/g, '')),
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If onSelect is provided (homepage), always open parent modal - never navigate
    if (onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      return;
    }

    // On touch devices without onSelect (shop page), open inline modal
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
      if (!hasTrackedView.current) {
        hasTrackedView.current = true;
        trackProductView({
          id: id.toString(),
          name,
          price: parseFloat(price.replace(/,/g, '')),
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Card front content (shared between Link and div wrapper)
  const cardFrontContent = (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={loadingStrategy}
          priority={priority}
        />
        {badge && (
          <div className="absolute top-4 right-4 bg-dancheong-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {badge}
          </div>
        )}
        {regularPrice && regularPrice !== price && (
          <div className="absolute top-4 left-4 bg-jade-green text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Sale!
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>
        <div className="flex gap-2 mb-3">
          {duration && (
            <span className="text-xs bg-primary-50 text-dancheong-red px-2 py-1 rounded-full font-medium">
              {duration}
            </span>
          )}
          {dataAmount && (
            <span className="text-xs bg-secondary-50 text-hanbok-blue px-2 py-1 rounded-full font-medium">
              {dataAmount}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-dancheong-red">
            ₩{price}
          </p>
          {regularPrice && regularPrice !== price && (
            <p className="text-lg text-gray-400 line-through">
              ₩{regularPrice}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Touch device modal rendered via Portal for correct centering
  const touchModal = isModalOpen && mounted ? createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleCloseModal}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-md animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-dancheong-red to-red-700 rounded-2xl p-6 shadow-2xl text-white">
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="font-heading text-2xl font-bold mb-6 pr-8">{name}</h3>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">High-speed LTE/5G</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Instant activation</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">24/7 support</span>
            </li>
          </ul>

          <div className="mb-4 pb-4 border-b border-white/20">
            <p className="text-sm text-white/70 mb-1">{tr('fullPriceAtStore')}</p>
            <p className="text-xl text-white/50 line-through">₩{price}</p>
          </div>

          <div className="mb-6 pb-6 border-b border-white/20">
            <p className="text-sm text-white/70 mb-1">{tr('onlineReservation')}</p>
            <p className="text-4xl font-bold">₩5,000</p>
            <p className="text-sm text-white/80 mt-1">{tr('discountAtStore')}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleReserve}
              disabled={isAdding}
              className={`w-full py-4 px-4 bg-white text-dancheong-red font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 min-h-[44px] ${
                isAdding ? 'opacity-75' : ''
              }`}
            >
              {isAdding ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('adding')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {tr('reserveButton')}
                </>
              )}
            </button>

            <Link
              href={`/${locale}/shop/${slug}`}
              className="block w-full py-4 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all text-center"
              onClick={handleCloseModal}
            >
              {tc('viewDetails')}
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        data-card-id={id}
        className="group perspective-1000 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          if (!isTouchDevice) {
            setIsFlipped(false);
          }
        }}
      >
        <div
          className={`relative w-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of Card - use div+onClick when onSelect provided, Link otherwise */}
          {onSelect ? (
            <div
              className="block backface-hidden"
              onClick={handleCardClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e as any); }}
            >
              {cardFrontContent}
            </div>
          ) : (
            <Link
              href={`/${locale}/shop/${slug}`}
              className="block backface-hidden"
              onClick={handleCardClick}
            >
              {cardFrontContent}
            </Link>
          )}

          {/* Back of Card (3D Flip) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-dancheong-red to-red-700 rounded-2xl h-full p-6 flex flex-col justify-between text-white shadow-2xl">
              <div>
                <h3 className="font-heading text-2xl font-bold mb-4">{name}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('highSpeedLte')}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('instantActivation')}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('support247Feature')}
                  </li>
                </ul>
              </div>

              <button
                onClick={handleReserve}
                disabled={isAdding}
                className={`w-full py-4 px-4 bg-white text-dancheong-red font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 min-h-[44px] ${
                  isAdding ? 'opacity-75' : ''
                }`}
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('adding')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {tr('reserveButton')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Touch device modal - Portal to document.body for correct centering */}
      {touchModal}
    </>
  );
}
