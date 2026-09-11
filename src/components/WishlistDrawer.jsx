import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Wand2, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { BRAND } from '../config/brand';

export default function WishlistDrawer() {
  const navigate = useNavigate();
  const { isWishlistOpen, closeWishlist, wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={closeWishlist}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">Saved 3D Gifts</h2>
              <span className="bg-[#D4AF37] text-gray-950 font-black text-xs px-2 py-0.5 rounded-full">
                {wishlistItems.length}
              </span>
            </div>
            <button
              onClick={closeWishlist}
              className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#D4AF37]/30 flex items-center justify-center text-[#B38029]">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">Your Wishlist is Empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                    Save your favorite 3D Moon Lamps, LED plaques, and lithophane frames to customize anytime.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeWishlist();
                    navigate('/shop');
                  }}
                  className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 px-6 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Explore 3D Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 relative group"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-gray-900 mt-1">
                        ₹{(item.price || 999).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          closeWishlist();
                          navigate(`/product/${item.id}`);
                        }}
                        className="flex-1 bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Customize 3D</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {wishlistItems.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  closeWishlist();
                  navigate('/wishlist');
                }}
                className="w-full bg-[#1A1A1A] hover:bg-gray-800 text-[#D4AF37] py-3 rounded-xl font-bold text-xs transition-colors border border-[#D4AF37]/30"
              >
                View Full Wishlist Page
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
