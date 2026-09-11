import React, { useEffect, useState } from 'react';
import { BRAND } from '../config/brand';

export default function SplashScreen({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation immediately
    const loadTimer = setTimeout(() => setIsLoaded(true), 50);

    // Fade out phase after 1.8 seconds
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 1850);

    // Complete transition after 2.4 seconds
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#FAF5EE] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Luxury Gold Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,146,58,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Luxury Artwork Logo Container */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center px-6 transition-all duration-1000 ease-out transform ${
          isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        <div className="w-[88%] sm:w-[480px] max-w-lg overflow-hidden drop-shadow-md transition-transform duration-1000 hover:scale-102">
          <img
            src="/brand-splash-logo.jpg"
            alt={BRAND.name}
            className="w-full h-auto object-contain mix-blend-multiply"
          />
        </div>

        {/* Shimmering Gold Bottom Divider Line */}
        <div
          className={`mt-4 flex items-center justify-center gap-3 w-48 sm:w-64 transition-all duration-1000 delay-300 ${
            isLoaded ? 'opacity-100 w-48 sm:w-64' : 'opacity-0 w-0'
          }`}
        >
          <span className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#D3923A]/70 to-[#D3923A]" />
          <span className="text-[#D3923A] text-xs font-serif font-bold">🪷</span>
          <span className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-[#D3923A]/70 to-[#D3923A]" />
        </div>
      </div>
    </div>
  );
}
