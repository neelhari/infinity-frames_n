import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
      <div className="w-16 h-16 bg-[#F8F0F0] rounded-full flex items-center justify-center mx-auto text-[#6B1518]">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-4xl font-bold text-[#6B1518]">404</h1>
      <h2 className="font-serif text-xl font-bold text-gray-900">Page Not Found</h2>
      <p className="text-sm text-gray-500">
        The page you're looking for doesn't exist. It may have been moved, or the link might be incorrect.
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-colors"
      >
        <span>Back to {BRAND.name}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
