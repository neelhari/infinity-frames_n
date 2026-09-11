import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, ArrowRight, Sparkles } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAF9F6]">
      <div className="max-w-md w-full text-center space-y-5 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-[#FAF5EB] border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#B38029]">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-black tracking-widest text-[#B38029] uppercase">Error 404</span>
          <h1 className="font-serif text-3xl font-extrabold text-gray-950">Page Not Found</h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          The 3D design or page you're searching for does not exist or may have been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 px-6 py-3 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <span>Back to {BRAND.name}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
