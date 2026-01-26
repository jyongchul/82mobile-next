'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Lenis with research-backed configuration
    const lenis = new Lenis({
      duration: 1.2,           // Scroll duration in seconds (under 1.5s per NAV-01)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,       // Enable smooth scrolling for mouse wheel
      // @ts-ignore - smoothTouch option exists in runtime but missing from type definitions
      smoothTouch: false,      // CRITICAL: Disable on touch devices for 60fps mobile
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;
    window.lenis = lenis; // Expose globally for programmatic scrolling

    // Request Animation Frame loop (CRITICAL for Lenis to work)
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  // Reset scroll position when route changes (prevents Lenis scroll issues on navigation)
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
