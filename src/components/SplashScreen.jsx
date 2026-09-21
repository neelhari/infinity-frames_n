import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Smooth entrance animation
    const loadTimer = setTimeout(() => setIsLoaded(true), 40);

    // Fade out splash screen after displaying
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 1900);

    // Complete transition and unmount
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
      onClick={onComplete}
      className={`fixed inset-0 z-[9999] bg-[#FFFFFF] flex items-center justify-center select-none cursor-pointer transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Infinity Frames N Splash Screen"
    >
      {/* Exact Brand Design: Golden Double-Heart Infinity Logo & INFINITY FRAMES_N */}
      <div
        className={`flex flex-col items-center justify-center p-6 transition-all duration-700 ease-out transform ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <img
          src="/infinity-splash-logo.png"
          alt="Infinity Frames N"
          className="w-72 sm:w-80 md:w-96 max-w-[85vw] h-auto object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}
