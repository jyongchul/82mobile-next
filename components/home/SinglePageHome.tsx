'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import RotatingSIMCard from './RotatingSIMCard';
import ProductPreview from './ProductPreview';
import WhyChooseUs from './WhyChooseUs';
import FaqPreview from './FaqPreview';
import { useHashNavigation } from '@/hooks/useHashNavigation';

export default function SinglePageHome() {
  const t = useTranslations();
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Initialize hash navigation hook
  const { scrollToSection, updateHashOnScroll } = useHashNavigation({
    onSectionChange: setActiveSection,
    headerOffset: 80,
    scrollDuration: 1.2,
  });

  // Scroll progress tracking (with passive listener for 60fps)
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Optimized Intersection Observer for accurate section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio
        let maxEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxEntry = entry;
          }
        });

        // Only update if we found an intersecting entry with at least 30% visibility
        if (maxEntry && maxRatio >= 0.3) {
          const sectionId = maxEntry.target.id;
          updateHashOnScroll(sectionId); // Updates both activeSection and URL hash
        }
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9], // Multiple thresholds for accuracy
        rootMargin: '0px 0px -20% 0px',       // Bottom 20% is "dead zone"
      }
    );

    const sections = ['hero', 'products', 'why-choose-us', 'faq', 'contact'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [updateHashOnScroll]);

  return (
    <div className="single-page-container">
      {/* Floating Navigation Dots */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <ul className="space-y-4">
          {[
            { id: 'hero', label: 'Home', icon: '🏠' },
            { id: 'products', label: 'Products', icon: '📱' },
            { id: 'why-choose-us', label: 'Why Us', icon: '⭐' },
            { id: 'faq', label: 'FAQ', icon: '❓' },
            { id: 'contact', label: 'Contact', icon: '📧' }
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`group relative flex items-center gap-3 transition-all ${
                  activeSection === item.id
                    ? 'scale-110'
                    : 'hover:scale-105 opacity-60 hover:opacity-100'
                }`}
                aria-label={`Scroll to ${item.label}`}
              >
                <span
                  className={`w-3 h-3 rounded-full border-2 transition-all ${
                    activeSection === item.id
                      ? 'bg-dancheong-red border-dancheong-red w-4 h-4'
                      : 'bg-transparent border-gray-400 group-hover:border-dancheong-red'
                  }`}
                />
                <span className="absolute right-6 whitespace-nowrap bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {item.icon} {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-dancheong-red via-hanbok-blue to-jade-green transition-all duration-300"
          style={{
            width: `${scrollProgress}%`
          }}
        />
      </div>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-tertiary"
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-white space-y-8 animate-fade-in-up">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold border border-white/20">
                  <span className="w-2 h-2 bg-jade-green rounded-full animate-pulse" />
                  Korea's #1 eSIM Provider
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Stay Connected
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                  Anywhere in Korea
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 font-body leading-relaxed">
                Instant eSIM activation. Unlimited data. No roaming fees.
                <br />
                <span className="text-jade-green font-bold">Your Korean adventure starts here.</span>
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: '⚡', label: 'Instant' },
                  { icon: '📶', label: '5G Speed' },
                  { icon: '🌏', label: 'Unlimited' }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <div className="text-sm font-bold">{feature.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => scrollToSection('products')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-dancheong-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg group"
                >
                  Browse Plans
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                </button>

                <button
                  onClick={() => scrollToSection('why-choose-us')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg transition-all border-2 border-white/50"
                >
                  Why 82Mobile?
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="font-semibold">4.9/5</span>
                </div>
                <div className="h-4 w-px bg-white/30" />
                <div className="font-semibold">10,000+ Happy Customers</div>
                <div className="h-4 w-px bg-white/30" />
                <div className="font-semibold">24/7 Support</div>
              </div>
            </div>

            {/* Right: 3D Rotating SIM Card */}
            <div className="flex items-center justify-center">
              <RotatingSIMCard />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection('products')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer group"
          aria-label="Scroll to products"
        >
          <div className="flex flex-col items-center gap-2 text-white">
            <span className="text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity">
              Scroll to explore
            </span>
            <svg
              className="w-6 h-6 group-hover:translate-y-1 transition-transform"
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
        </button>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-bold mb-4">
              OUR PRODUCTS
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From short trips to extended stays, we've got you covered with flexible data plans
            </p>
          </div>
          <ProductPreview />
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-hanbok-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
            >
              View All Plans
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-jade-100 text-jade-700 rounded-full text-sm font-bold mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The 82Mobile Difference
            </h2>
          </div>
          <WhyChooseUs />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-bold mb-4">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Got Questions? We've Got Answers
            </h2>
          </div>
          <FaqPreview />
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/faq`}
              className="inline-flex items-center gap-2 text-hanbok-blue hover:text-blue-700 font-bold"
            >
              View All FAQs
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-primary via-secondary to-tertiary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Connected?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Have questions? Our support team is available 24/7 to help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-all border-2 border-white/50"
            >
              Contact Support
            </Link>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
            <div className="space-y-2">
              <div className="text-4xl mb-2">📧</div>
              <h3 className="font-bold text-lg">Email Us</h3>
              <p className="text-gray-200">support@82mobile.com</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-bold text-lg">Live Chat</h3>
              <p className="text-gray-200">Available 24/7</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-bold text-lg">KakaoTalk</h3>
              <p className="text-gray-200">@82mobile</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
