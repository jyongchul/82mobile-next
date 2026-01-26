'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';

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
  index: number; // For lazy loading strategy
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
  index
}: ProductCardProps) {
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const toast = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Determine loading strategy based on position
  // First 6 products (index 0-5) are above fold → eager load
  // Products 7+ (index 6+) are below fold → lazy load
  const loadingStrategy = index < 6 ? 'eager' : 'lazy';
  const priority = index < 6; // LCP optimization for above-fold images

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    addItem({
      productId: id,
      name,
      slug,
      price: parseFloat(price.replace(/,/g, '')),
      image
    }, 1);

    // Show success toast with cart icon and open drawer
    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${name} added to cart!`, {
        icon: '🛒',
        duration: 3000,
      });
      // Open cart drawer to show added item
      openCart();
    }, 500);
  };

  return (
    <div
      className="group perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card */}
        <Link
          href={`/${locale}/shop/${slug}`}
          className="block backface-hidden"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
            {/* Image */}
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

              {/* Badge */}
              {badge && (
                <div className="absolute top-4 right-4 bg-dancheong-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {badge}
                </div>
              )}

              {/* Sale badge if regularPrice exists */}
              {regularPrice && regularPrice !== price && (
                <div className="absolute top-4 left-4 bg-jade-green text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  Sale!
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {name}
              </h3>

              {/* Specs */}
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

              {/* Price */}
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
        </Link>

        {/* Back of Card (3D Flip) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="bg-gradient-to-br from-dancheong-red to-red-700 rounded-2xl h-full p-6 flex flex-col justify-between text-white shadow-2xl">
            <div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                {name}
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  High-speed LTE/5G
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant activation
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  24/7 support
                </li>
              </ul>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
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
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
