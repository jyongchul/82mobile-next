'use client';

import { useState, useEffect } from 'react';

/**
 * Custom React hook for responsive breakpoints
 * SSR-safe: Returns false during SSR, hydrates on client
 *
 * @param query - Media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (using modern addEventListener for broader support)
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile viewport detection
 * @returns true if viewport is mobile (<768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
