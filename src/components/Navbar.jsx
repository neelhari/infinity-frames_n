import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
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
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { setIsSearchOpen } = useUI();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Srivaikunta-style Brand: Logo First, Company Name beside it */}
          <div
            onClick={() => goTo('/')}
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group select-none py-0.5 shrink-0"
          >
            {/* Logo Emblem - Clearly visible */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-amber-50/50 flex items-center justify-center">
              <img
                src="/logo (4).png"
                alt={BRAND.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Company Name & Tagline beside the logo */}
            <div className="flex flex-col justify-center">
              <span className="font-serif font-black text-[13px] sm:text-[15px] md:text-base tracking-[0.08em] text-gray-900 uppercase leading-none">
                INFINITY FRAMES_N
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold tracking-[0.15em] text-[#B38029] uppercase mt-1 leading-none">
                CUSTOMIZED 3D GIFTS
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

          {/* Srivaikunta-style Right Action Icons: Search, Wishlist, User, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => goTo('/wishlist')}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#C89B3C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Profile Icon (just like srivaikunta.com) */}
            <button
              onClick={() => goTo('/account')}
              className={`p-1.5 sm:p-2 transition-colors rounded-full hover:bg-gray-100 cursor-pointer ${
                location.pathname === '/account'
                  ? 'text-[#B38029] bg-amber-50'
                  : 'text-gray-700 hover:text-[#B38029]'
              }`}
              title="My Account"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Shopping Cart Icon with Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
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
    </header>
  );
}
