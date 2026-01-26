'use client';

import { useEffect, useCallback, useRef } from 'react';
import { pageview } from '@/lib/analytics';

interface UseHashNavigationOptions {
  onSectionChange?: (sectionId: string) => void;
  headerOffset?: number;
  scrollDuration?: number;
}

export function useHashNavigation({
  onSectionChange,
  headerOffset = 80,
  scrollDuration = 1.2,
}: UseHashNavigationOptions = {}) {
  const isNavigating = useRef(false);

  // Scroll to section using Lenis (exposed globally from Plan 01-01)
  const scrollToSection = useCallback((sectionId: string, addToHistory: boolean = true) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    isNavigating.current = true;

    // Update URL hash
    const newHash = `#${sectionId}`;
    if (window.location.hash !== newHash) {
      if (addToHistory) {
        // User clicked link - ADD to history stack (enables Back button)
        window.history.pushState({ section: sectionId }, '', newHash);
      } else {
        // Programmatic navigation (popstate) - DON'T add to history
        window.history.replaceState({ section: sectionId }, '', newHash);
      }
    }

    // Scroll with Lenis if available, fallback to native
    if (window.lenis) {
      window.lenis.scrollTo(element, {
        offset: -headerOffset,
        duration: scrollDuration,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => {
          isNavigating.current = false;
        },
      });
    } else {
      // Fallback for when Lenis isn't loaded
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isNavigating.current = false;
      }, scrollDuration * 1000);
    }
  }, [headerOffset, scrollDuration]);

  // Update hash on scroll (called by Intersection Observer) - uses replaceState
  const updateHashOnScroll = useCallback((sectionId: string) => {
    // Don't update hash if we're in the middle of programmatic navigation
    if (isNavigating.current) return;

    const newHash = `#${sectionId}`;
    if (window.location.hash !== newHash) {
      // Use replaceState (NOT pushState) for scroll-based updates
      // This prevents Back button from having to go through every scrolled section
      window.history.replaceState({ section: sectionId }, '', newHash);

      // Track section view as virtual page view in GA4
      const sectionTitle = sectionId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      pageview(`/#${sectionId}`, `82Mobile - ${sectionTitle}`);
    }

    onSectionChange?.(sectionId);
  }, [onSectionChange]);

  // Handle browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash.slice(1); // Remove '#' prefix
      if (hash) {
        scrollToSection(hash, false); // false = don't add to history
      } else {
        // No hash = scroll to top (e.g., pressing Back at first section)
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: false });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [scrollToSection]);

  // Handle initial page load with hash
  useEffect(() => {
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      // Small delay to ensure DOM and Lenis are ready
      const timer = setTimeout(() => {
        scrollToSection(initialHash, false); // false = don't add duplicate history entry
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency - runs once on mount

  return {
    scrollToSection,
    updateHashOnScroll,
    isNavigating: isNavigating.current,
  };
}
