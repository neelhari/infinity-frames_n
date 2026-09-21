import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { BRAND } from '../config/brand';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/categories', label: 'CATEGORIES' },
  { path: '/shop?category=photo-frames', label: 'PHOTO FRAMES' },
  { path: '/shop?category=moon-lamps', label: 'MOON LAMPS' },
  { path: '/shop?category=lithophane-products', label: 'LITHOPHANES' },
  { path: '/shop?category=keychains', label: 'KEYCHAINS' },
  { path: '/shop?category=customized-gifts', label: 'CUSTOM GIFTS' },
  { path: '/contact', label: 'CONTACT' },
];

export default function Navbar() {
  const { wishlistCount } = useWishlist();
  const { cartCount, openCart } = useCart();
  const { setIsSearchOpen } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-2xs border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand: Heart/Infinity Emblem on the left, Original 3D Gold Heading beside it */}
          <div
            onClick={() => goTo('/')}
            className="cursor-pointer flex items-center gap-2 sm:gap-2.5 group select-none py-0.5 shrink-0"
            title="Infinity Frames_N Home"
          >
            {/* 1. Heart / Infinity Emblem - Untouched */}
            <div className="h-7 sm:h-8 flex items-center justify-center shrink-0">
              <img
                src="/logo-symbol.png"
                alt="Infinity Symbol"
                className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* 2. Exact 3D Embossed Gold Heading from the Logo */}
            <div className="flex items-center shrink-0">
              <img
                src="/logo-heading-gold.png"
                alt={BRAND.name}
                className="h-3.5 sm:h-4 md:h-4.5 w-auto object-contain shrink-0"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-[12px] font-bold tracking-wider">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => goTo(link.path)}
                className={`transition-colors uppercase cursor-pointer ${
                  location.pathname + location.search === link.path
                    ? 'text-[#B38029] border-b-2 border-[#B38029] pb-0.5'
                    : 'text-gray-600 hover:text-[#B38029]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Header Action Icons: ONLY SEARCH AND WISHLIST ICONS */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => goTo('/wishlist')}
              className="relative p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C89B3C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#B38029] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scaleUp">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
