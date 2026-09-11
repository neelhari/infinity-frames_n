import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift, Box, Image as ImageIcon, Moon, Flame, Key, Sparkles, Grid,
  Star, ShoppingBag, ArrowRight, Heart, ShieldCheck, ChevronRight
} from 'lucide-react';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND } from '../config/brand';

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // 8 circular category buttons from Screen 2
  const quickCategories = [
    { id: 'customized-gifts', label: 'Customized Gifts', icon: Gift, color: 'bg-amber-50 text-[#C89B3C]' },
    { id: '3d-printed-products', label: '3D Printed Products', icon: Box, color: 'bg-orange-50 text-[#B38029]' },
    { id: 'photo-frames', label: 'Photo Frames', icon: ImageIcon, color: 'bg-yellow-50 text-[#A0701F]' },
    { id: 'moon-lamps', label: 'Moon Lamps', icon: Moon, color: 'bg-amber-50 text-[#C89B3C]' },
    { id: 'devotional-lamps', label: 'Devotional Lamps', icon: Flame, color: 'bg-orange-50 text-[#B38029]' },
    { id: 'keychains', label: 'Keychains', icon: Key, color: 'bg-yellow-50 text-[#A0701F]' },
    { id: 'glow-in-dark', label: 'Glow in Dark', icon: Sparkles, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'categories', label: 'More Categories', icon: Grid, color: 'bg-gray-100 text-gray-700', isAll: true },
  ];

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-gray-900 font-sans">
      {/* 1. HERO BANNER CARD (Screen 2) */}
      <section className="px-4 pt-3 pb-2 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E1913] via-[#2D2319] to-[#120F0C] text-white shadow-xl min-h-[190px] sm:min-h-[260px] flex items-center">
          {/* Subtle Golden Ambient Background Glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 w-3/5 p-5 sm:p-8 space-y-3">
            <h2 className="font-serif text-xl sm:text-3xl font-bold leading-tight tracking-wide text-white">
              Customized <span className="text-[#E5C068]">3D Gifts</span> for Every Emotion
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-2 hidden sm:block">
              Turn your cherished memories into illuminated lithophanes, moon lamps, and custom engraved frames.
            </p>
            <div>
              <button
                onClick={() => navigate('/shop')}
                className="bg-gradient-to-r from-[#D4AF37] to-[#C89B3C] hover:from-[#C89B3C] hover:to-[#B38029] text-[#1A1A1A] font-extrabold text-[11px] sm:text-xs px-5 py-2.5 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Glowing Moon Lamp Hero Graphic */}
          <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-2/5 max-w-[170px] sm:max-w-[240px] flex justify-center items-center">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              <img
                src="https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=500&auto=format&fit=crop&q=80"
                alt="3D Printed Moon Lamp"
                className="relative z-10 w-28 sm:w-44 h-28 sm:h-44 object-cover rounded-full shadow-2xl border-2 border-amber-300/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CIRCULAR CATEGORY GRID (Screen 2: 8 Circles) */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-3 sm:gap-6">
          {quickCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(cat.isAll ? '/categories' : `/shop?category=${cat.id}`)}
                className="flex flex-col items-center text-center gap-1.5 group cursor-pointer"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xs border border-amber-900/5 transition-all duration-200 group-hover:scale-108 group-hover:shadow-md ${cat.color}`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-[10.5px] sm:text-xs font-semibold text-gray-700 tracking-tight leading-tight line-clamp-2 max-w-[72px]">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION (Screen 2) */}
      <section className="px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Featured Products</h3>
            <p className="text-[11px] text-gray-500">Most loved custom creations</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-[#B38029] hover:text-[#8C5E16] flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Responsive Grid matching Screen 2 & Screen 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featuredProducts.map((p) => {
            const inWishlist = isInWishlist(p.id);
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="bg-white rounded-2xl border border-gray-100/90 shadow-2xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer"
              >
                {/* Product Image + Discount Pill + Wishlist Button */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.discount && (
                    <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                      {p.discount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-xs text-gray-600 transition-colors"
                    title="Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                      {p.name}
                    </h4>

                    {/* Price & Old Price */}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-bold text-sm text-gray-900">₹{p.price}</span>
                      {p.oldPrice && (
                        <span className="text-[11px] text-gray-400 line-through">₹{p.oldPrice}</span>
                      )}
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-gray-700">{p.rating}</span>
                      <span>({p.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.customizable) {
                        navigate(`/product/${p.id}`);
                      } else {
                        addToCart(p, 1);
                      }
                    }}
                    className="mt-2.5 w-full bg-[#B38029] hover:bg-[#8C5E16] text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{p.customizable ? 'Customize' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BRAND PROMISE PILLS (Screen 11 teaser) */}
      <section className="px-4 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="block text-base mb-0.5">🎨</span>
            <span className="text-[11px] font-bold text-gray-800">Custom Designs</span>
            <p className="text-[9px] text-gray-400">Tailored to your memory</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="block text-base mb-0.5">✨</span>
            <span className="text-[11px] font-bold text-gray-800">High Quality</span>
            <p className="text-[9px] text-gray-400">Precision 0.1mm layers</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="block text-base mb-0.5">🚀</span>
            <span className="text-[11px] font-bold text-gray-800">Timely Delivery</span>
            <p className="text-[9px] text-gray-400">Safely packed in thermocol</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="block text-base mb-0.5">💬</span>
            <span className="text-[11px] font-bold text-gray-800">WhatsApp Support</span>
            <p className="text-[9px] text-gray-400">+91 9494066914</p>
          </div>
        </div>
      </section>
    </div>
  );
}
