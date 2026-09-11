import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomNav() {
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on checkout, order success, and product detail pages to avoid covering action buttons
  if (
    location.pathname === '/checkout' ||
    location.pathname === '/order-success' ||
    location.pathname.startsWith('/product/')
  ) {
    return null;
  }

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const items = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: location.pathname === '/',
      onClick: () => goTo('/'),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid,
      isActive: location.pathname === '/categories',
      onClick: () => goTo('/categories'),
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      isActive: location.pathname === '/wishlist',
      badge: wishlistCount > 0 ? wishlistCount : null,
      onClick: () => goTo('/wishlist'),
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      isActive: location.pathname === '/account' || location.pathname === '/login',
      onClick: () => goTo('/account'),
    },
  ];

  return (
    <nav
      className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-stretch shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-all relative ${
              item.isActive ? 'text-[#B38029]' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[#B38029]' : 'stroke-gray-400'}`} strokeWidth={item.isActive ? 2.3 : 1.8} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 bg-[#C89B3C] text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`tracking-tight ${item.isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            {item.isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-[#B38029] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
