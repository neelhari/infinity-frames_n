import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, Phone, MessageCircle, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';

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
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { setIsSearchOpen } = useUI();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { settings } = useStoreData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 font-sans">
      {/* 1. TOP ANNOUNCEMENT BAR (Clean & elegant, NO badge symbol) */}
      {(settings?.announcementEnabled !== false) && (
        <div className="bg-[#181512] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-amber-900/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium tracking-wide truncate">
              {settings?.announcementLink ? (
                <a href={settings.announcementLink} className="truncate hover:text-[#E5C068] transition-colors">
                  {settings?.announcementText || `Free Shipping on Customized Orders above ₹${(settings?.freeShippingThreshold || BRAND.freeShippingThreshold).toLocaleString('en-IN')}`}
                </a>
              ) : (
                <span className="truncate text-gray-200">
                  {settings?.announcementText || `Free Shipping on Customized Orders above ₹${(settings?.freeShippingThreshold || BRAND.freeShippingThreshold).toLocaleString('en-IN')}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-gray-300 text-[11px] shrink-0">
              <a href={`tel:${BRAND.phone}`} className="hover:text-[#E5C068] transition-colors flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#C89B3C]" />
                <span className="hidden sm:inline">+91 {BRAND.phone}</span>
              </a>
              <span className="hidden sm:inline text-gray-700">|</span>
              <a
                href={waLink(`Hello Infinity Frames N, I would like to inquire about customized 3D gifting.`)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E5C068] transition-colors flex items-center gap-1"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER (Screen 2: Menu, Logo in center, Search & Cart on right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile Hamburger Menu button (Left in Screen 2) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 -ml-1 text-gray-700 hover:text-[#B38029] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Infinity Frames N Golden Logo (Screen 2 Header) */}
          <div
            onClick={() => goTo('/')}
            className="cursor-pointer flex items-center gap-2 sm:gap-2.5 group select-none"
          >
            {/* Golden Infinity Heart Emblem */}
            <div className="w-7 h-7 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
              <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-xs transition-transform duration-300 group-hover:scale-108">
                <defs>
                  <linearGradient id="goldInfinityNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5C068" />
                    <stop offset="50%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#9E7422" />
                  </linearGradient>
                </defs>
                <path
                  d="M100,60 C80,30 40,20 20,45 C-5,70 15,105 55,100 C85,95 95,70 100,60 C105,70 115,95 145,100 C185,105 205,70 180,45 C160,20 120,30 100,60 Z"
                  fill="none"
                  stroke="url(#goldInfinityNav)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Brand Title */}
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm sm:text-base tracking-[0.14em] text-[#C89B3C] uppercase leading-none">
                INFINITY FRAMES_N
              </span>
              <span className="text-[8px] sm:text-[9.5px] text-gray-400 font-medium tracking-wider hidden sm:block uppercase mt-0.5">
                Customized 3D Gifts
              </span>
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

          {/* Header Action Icons (Search, Wishlist, Cart - Right in Screen 2) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-amber-50/50 cursor-pointer"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon (Desktop) */}
            <button
              onClick={() => goTo('/wishlist')}
              className="hidden sm:flex relative p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-amber-50/50 cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 bg-[#C89B3C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon with Badge (Screen 2) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-amber-50/50 cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#C89B3C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => goTo(link.path)}
              className="block w-full text-left py-2 px-3 text-xs font-bold text-gray-700 hover:text-[#B38029] hover:bg-amber-50/50 rounded-xl transition-colors uppercase"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 px-3">
            <span>Customer Support:</span>
            <a href={`tel:${BRAND.phone}`} className="font-bold text-[#B38029]">
              +91 {BRAND.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
