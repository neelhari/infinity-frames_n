import React from 'react';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-[#6B1518] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#D3923A] flex items-center gap-3 animate-slideLeft">
      <div className="w-8 h-8 rounded-full bg-[#4B0F11] flex items-center justify-center text-[#D3923A]">
        <CheckCircle className="w-5 h-5" />
      </div>
      <p className="text-xs sm:text-sm font-semibold pr-2">{toastMessage}</p>
    </div>
  );
}
