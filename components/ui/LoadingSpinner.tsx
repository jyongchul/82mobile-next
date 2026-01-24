'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingSpinner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 페이지 로드 완료 후 2초 뒤에 로딩 화면 숨기기
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 transition-opacity duration-500"
         style={{ opacity: isVisible ? 1 : 0 }}>
      <div className="flex flex-col items-center gap-6">
        {/* 82Mobile 로고 회전 애니메이션 */}
        <div className="relative w-40 h-40">
          {/* 회전하는 외곽 링 (큰 원) */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white animate-spin"
               style={{ animationDuration: '2s' }} />

          {/* 회전하는 내부 링 (작은 원, 반대 방향) */}
          <div className="absolute inset-4 rounded-full border-4 border-white/20 border-b-white animate-spin"
               style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />

          {/* 82Mobile 로고 (중앙) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24 animate-pulse">
              <Image
                src="/images/logo/logo.png"
                alt="82Mobile"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* 배경 빛나는 효과 */}
          <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* 로딩 텍스트 */}
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-2 tracking-wider">82Mobile</h2>
          <p className="text-sm opacity-90 animate-pulse">Korea SIM & eSIM Service</p>
          <div className="mt-4 flex gap-2 justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
