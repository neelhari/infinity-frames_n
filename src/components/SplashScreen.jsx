import React, { useEffect, useState } from 'react';
import { BRAND } from '../config/brand';

export default function SplashScreen({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 50);
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 2100);
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2600);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#FFFFFF] flex flex-col items-center justify-between overflow-hidden transition-opacity duration-700 ease-in-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top ambient space - Clean, no fake time */}
      <div className="pt-8 sm:pt-12" />

      {/* Center Brand Identity with Real Image & Mobile Proportions */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-sm transition-all duration-1000 ease-out transform ${
          isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <img
          src="/infinity-splash-logo.png"
          alt="Infinity Frames N"
          className="w-64 sm:w-72 max-w-[85vw] h-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* Bottom Luxury Golden Wave Decoration */}
      <div className="w-full relative overflow-hidden pointer-events-none">
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-24 sm:h-32 opacity-85">
          <defs>
            <linearGradient id="goldWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#C89B3C" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9E7422" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path d="M0,60 C150,110 250,10 400,70 L400,120 L0,120 Z" fill="url(#goldWave)" />
        </svg>
        <div className="absolute bottom-3 inset-x-0 flex justify-center">
          <div className="w-32 h-1 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}
