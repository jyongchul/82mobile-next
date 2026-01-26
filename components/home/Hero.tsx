'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const heroImages = [
  '/images/hero/hero_scene_palace.jpg',
  '/images/hero/hero_scene_airport.jpg',
  '/images/hero/hero_scene_connect.jpg',
];

export default function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate hero images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Images with Crossfade */}
      {heroImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Hero ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            quality={85}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white space-y-6 animate-fade-in">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-body">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center justify-center px-8 py-4 bg-dancheong-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {t('hero.cta')}
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>

            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg transition-all border-2 border-white/50"
            >
              Learn More
            </Link>
          </div>

          {/* Image Indicators */}
          <div className="flex gap-2 pt-8">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentImage
                    ? 'w-8 bg-dancheong-red'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
