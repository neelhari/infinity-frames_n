import React from 'react';
import { ShoppingBag, CheckCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-[#1A1A1A] to-[#2E2413] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#D4AF37]/50 flex items-center gap-3 animate-slideLeft">
      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/40">
        <Sparkles className="w-4 h-4" />
      </div>
      <p className="text-xs sm:text-sm font-bold text-gray-100 pr-2">{toastMessage}</p>
    </div>
  );
}
