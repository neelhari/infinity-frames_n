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
      {/* Top ambient space */}
      <div className="pt-12 text-xs font-semibold text-gray-400 tracking-wider">
        <span>9:41</span>
      </div>

      {/* Center Brand Identity */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-sm transition-all duration-1000 ease-out transform ${
          isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Golden Infinity Heart Emblem */}
        <div className="w-40 h-32 relative flex items-center justify-center mb-4">
          <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="goldInfinity" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E5C068" />
                <stop offset="45%" stopColor="#C89B3C" />
                <stop offset="75%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#9E7422" />
              </linearGradient>
            </defs>
            {/* Elegant double-heart infinity curve */}
            <path
              d="M100,60 C80,30 40,20 20,45 C-5,70 15,105 55,100 C85,95 95,70 100,60 C105,70 115,95 145,100 C185,105 205,70 180,45 C160,20 120,30 100,60 Z"
              fill="none"
              stroke="url(#goldInfinity)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand Title */}
        <h1 className="font-serif text-2xl font-bold tracking-[0.2em] text-[#C89B3C] mb-2 uppercase">
          INFINITY FRAMES_N
        </h1>

        {/* Category subtitle pills */}
        <p className="text-[11px] font-medium text-gray-500 tracking-wide leading-relaxed mb-6 max-w-xs">
          Customized Gifts &bull; 3D Prints &bull; Photo Frames<br />
          Lamps &bull; Keychains &bull; & More
        </p>

        {/* Signature Quote */}
        <div className="font-serif italic text-lg text-gray-700 tracking-wide">
          &ldquo;Turn Your Memories<br />Into Lasting Gifts&rdquo;
        </div>
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
