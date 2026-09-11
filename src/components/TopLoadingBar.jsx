import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStoreData } from '../context/StoreDataContext';

export default function TopLoadingBar() {
  const { loading } = useStoreData();
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setNavigating(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setNavigating(false), 200);
    }, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname]);

  const isBuffering = loading || navigating;

  if (!isBuffering && progress === 100) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#B38029] via-[#F3E5AB] to-[#D4AF37] shadow-sm transition-all duration-300 ease-out animate-pulse"
        style={{
          width: loading ? '85%' : `${progress}%`,
          opacity: isBuffering ? 1 : 0,
        }}
      />
    </div>
  );
}
