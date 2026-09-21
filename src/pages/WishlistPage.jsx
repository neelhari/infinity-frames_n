import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { BRAND } from '../config/brand';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navigation Bar with Back Button */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
            Saved 3D Gifts
          </h1>
          <div className="text-xs font-bold text-gray-900 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="w-20 h-20 bg-[#FAF5EB] border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#B38029]">
              <Heart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-gray-900">Your Wishlist is Empty</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Save your favorite 3D Moon Lamps, Acrylic LED plaques, and Lithophane night lights to customize later.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B38029] to-[#D4AF37] text-gray-950 font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:brightness-105 transition-all"
            >
              <span>Explore 3D Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-gray-900">Your Saved 3D Gifts</h1>
                <p className="text-xs text-gray-500 mt-0.5">Customize with your favorite memories whenever you're ready</p>
              </div>

              <button
                onClick={clearWishlist}
                className="text-xs text-gray-500 hover:text-rose-600 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#D4AF37] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=500'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-500 shadow-md hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>3D Custom</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B38029]">
                        {product.category || 'Personalized Gift'}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-gray-900 truncate mt-0.5">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-serif font-bold text-sm text-gray-900">
                          ₹{(product.price || 999).toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <Link
                        to={`/product/${product.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Customize 3D</span>
                      </Link>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
