'use client';

import { useState } from 'react';

interface SimCardFlipProps {
  title: string;
  subtitle: string;
  features: string[];
  price: string;
  className?: string;
}

export default function SimCardFlip({
  title,
  subtitle,
  features,
  price,
  className = '',
}: SimCardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`sim-card-flip-container ${className}`}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`sim-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* 앞면: SIM 카드 디자인 */}
        <div className="sim-card-front">
          <div className="sim-card-shape">
            {/* SIM 카드 컷오프 (오른쪽 상단) */}
            <div className="sim-cutoff" />

            {/* 82Mobile 로고 */}
            <div className="sim-logo">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                82
              </span>
            </div>

            {/* SIM 카드 칩 */}
            <div className="sim-chip">
              <div className="chip-lines">
                <div className="line horizontal" />
                <div className="line horizontal" />
                <div className="line horizontal" />
                <div className="line vertical" />
                <div className="line vertical" />
                <div className="line vertical" />
              </div>
            </div>

            {/* 플랜 정보 */}
            <div className="sim-info">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* 뒷면: 상세 정보 */}
        <div className="sim-card-back">
          <div className="flex flex-col h-full justify-center text-white">
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <ul className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <div className="text-3xl font-bold">{price}</div>
              <button className="mt-4 w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors">
                플랜 선택하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sim-card-flip-container {
          perspective: 1000px;
          width: 100%;
          height: 400px;
        }

        .sim-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .sim-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .sim-card-front,
        .sim-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        .sim-card-front {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }

        .sim-card-back {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          padding: 40px;
        }

        /* SIM 카드 모양 */
        .sim-card-shape {
          position: relative;
          width: 240px;
          height: 350px;
          background: white;
          border: 3px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* SIM 카드 컷오프 (오른쪽 상단 모서리) */
        .sim-cutoff {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 40px;
          height: 40px;
          background: #f8fafc;
          border-left: 3px solid #e2e8f0;
          border-bottom: 3px solid #e2e8f0;
          transform: rotate(45deg);
          transform-origin: bottom left;
        }

        /* 82Mobile 로고 */
        .sim-logo {
          text-align: center;
          margin-bottom: 30px;
        }

        /* SIM 카드 칩 */
        .sim-chip {
          width: 180px;
          height: 140px;
          margin: 0 auto 30px;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          border: 2px solid #e6c200;
          border-radius: 8px;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chip-lines {
          position: absolute;
          inset: 0;
          padding: 10px;
        }

        .line {
          position: absolute;
          background: #c9a700;
        }

        .line.horizontal {
          width: calc(100% - 20px);
          height: 2px;
          left: 10px;
        }

        .line.horizontal:nth-child(1) {
          top: 30%;
        }

        .line.horizontal:nth-child(2) {
          top: 50%;
        }

        .line.horizontal:nth-child(3) {
          top: 70%;
        }

        .line.vertical {
          height: calc(100% - 20px);
          width: 2px;
          top: 10px;
        }

        .line.vertical:nth-child(4) {
          left: 30%;
        }

        .line.vertical:nth-child(5) {
          left: 50%;
        }

        .line.vertical:nth-child(6) {
          left: 70%;
        }

        /* SIM 정보 */
        .sim-info {
          text-align: center;
        }

        /* 호버 효과 */
        .sim-card-flip-container:hover .sim-card-shape {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
