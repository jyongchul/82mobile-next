'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCart = useUIStore((state) => state.openCart);

  // Check if we're on the home page (single-page design)
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Smooth scroll to section with hash navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Update hash with pushState (enables Back button)
    const newHash = `#${sectionId}`;
    if (window.location.hash !== newHash) {
      window.history.pushState({ section: sectionId }, '', newHash);
    }

    // Scroll with Lenis if available
    if (window.lenis) {
      window.lenis.scrollTo(element, {
        offset: -80,
        duration: 1.2,
      });
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setIsMenuOpen(false);
  };

  // Handle scroll effect (with passive listener for 60fps)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items - different for single-page vs multi-page
  const singlePageNavigation = [
    { name: t('nav.home'), id: 'hero', icon: '🏠' },
    { name: t('nav.shop'), id: 'products', icon: '📱' },
    { name: 'Why Us', id: 'why-choose-us', icon: '⭐' },
    { name: t('nav.faq'), id: 'faq', icon: '❓' },
    { name: t('nav.contact'), id: 'contact', icon: '📧' },
  ];

  const multiPageNavigation = [
    { name: t('nav.home'), href: `/${locale}` },
    { name: t('nav.shop'), href: `/${locale}/shop` },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg'
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-dancheong-red to-hanbok-blue rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative font-display text-2xl font-black bg-gradient-to-r from-dancheong-red to-hanbok-blue bg-clip-text text-transparent">
                82Mobile
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isHomePage ? (
              // Single-page navigation (smooth scroll)
              <>
                {singlePageNavigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="px-4 py-2 text-gray-700 hover:text-dancheong-red hover:bg-red-50 rounded-lg transition-all font-medium group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      {item.name}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              // Multi-page navigation (page links)
              <>
                {multiPageNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-gray-700 hover:text-dancheong-red hover:bg-red-50 rounded-lg transition-all font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side: Language + Cart */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-dancheong-red transition-colors group"
              aria-label="Open cart"
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-dancheong-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - with Framer Motion AnimatePresence */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="md:hidden overflow-hidden border-t border-gray-200"
            >
              <nav className="py-4 space-y-2">
                {isHomePage ? (
                  // Single-page mobile navigation
                  <>
                    {singlePageNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="text-left text-gray-700 hover:text-dancheong-red hover:bg-red-50 transition-all font-medium px-4 py-3 rounded-lg flex items-center gap-3 w-full"
                      >
                        <span className="text-xl">{item.icon}</span>
                        {item.name}
                      </button>
                    ))}
                  </>
                ) : (
                  // Multi-page mobile navigation
                  <>
                    {multiPageNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-gray-700 hover:text-dancheong-red hover:bg-red-50 transition-all font-medium px-4 py-3 rounded-lg"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
