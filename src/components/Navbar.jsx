import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
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
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { setIsSearchOpen } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: On Homepage show Logo; on every other page show clean Go Back button */}
          {isHome ? (
            <div
              onClick={() => goTo('/')}
              className="cursor-pointer flex items-center select-none py-1 shrink-0"
            >
              <img
                src="/logo (4).png"
                alt={BRAND.name}
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </div>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-800 hover:text-[#B38029] py-1.5 px-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer -ml-2"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
              <span>Back</span>
            </button>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[12px] font-bold tracking-wider">
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

          {/* Header Action Icons (Search, Wishlist, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-amber-50/50 cursor-pointer"
              title="Search 3D creations"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => goTo('/wishlist')}
              className="relative p-2 text-gray-700 hover:text-[#B38029] transition-colors rounded-full hover:bg-amber-50/50 cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#C89B3C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon with Badge */}
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
    </header>
  );
}
