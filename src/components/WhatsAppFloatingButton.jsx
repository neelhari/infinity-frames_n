import React from 'react';
import { MessageCircle } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function WhatsAppFloatingButton() {
  const whatsappUrl = waLink(
    `Hello Naresh, I am visiting the Infinity Frames N store and would like assistance with a customized 3D gift.`
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Direct WhatsApp Consultation with Naresh Kukkala"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-xs sm:text-sm pl-0 group-hover:pl-2">
        Chat With Naresh
      </span>
    </a>
  );
}
