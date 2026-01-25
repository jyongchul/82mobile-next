'use client';

import { useEffect, useRef } from 'react';

export default function RotatingSIMCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add entrance animation
    if (cardRef.current) {
      cardRef.current.classList.add('sim-card-enter');
    }
  }, []);

  return (
    <div className="sim-card-container">
      <div ref={cardRef} className="sim-card-3d">
        {/* Front Face */}
        <div className="sim-card-face sim-card-front">
          <div className="sim-card-header">
            <div className="sim-logo">82Mobile</div>
            <div className="sim-type">eSIM</div>
          </div>

          <div className="sim-chip">
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
            <div className="chip-contact"></div>
          </div>

          <div className="sim-info">
            <div className="sim-number">KR-ESIM-2026</div>
            <div className="sim-plan">Unlimited Data</div>
          </div>

          <div className="sim-footer">
            <div className="korea-flag">🇰🇷</div>
            <div className="sim-tagline">Korea Connectivity</div>
          </div>

          {/* Decorative Korean pattern */}
          <div className="dancheong-pattern"></div>
        </div>

        {/* Back Face */}
        <div className="sim-card-face sim-card-back">
          <div className="sim-card-back-content">
            <div className="qr-code-placeholder">
              <div className="qr-grid">
                {[...Array(64)].map((_, i) => (
                  <div
                    key={i}
                    className="qr-pixel"
                    style={{
                      opacity: Math.random() > 0.5 ? 1 : 0,
                      animationDelay: `${i * 0.02}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="activation-text">Scan to Activate</div>
            <div className="activation-subtitle">Instant QR Delivery</div>
          </div>
        </div>

        {/* Left Edge */}
        <div className="sim-card-face sim-card-left"></div>

        {/* Right Edge */}
        <div className="sim-card-face sim-card-right"></div>

        {/* Top Edge */}
        <div className="sim-card-face sim-card-top"></div>

        {/* Bottom Edge */}
        <div className="sim-card-face sim-card-bottom"></div>
      </div>

      {/* Glow effect */}
      <div className="sim-card-glow"></div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
