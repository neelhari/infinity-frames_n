import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
  const navigate = useNavigate();
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#6B1518] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              <h3 className="font-serif font-bold text-lg text-white">Your Wishlist</h3>
              <span className="bg-[#4B0F11] text-[#D3923A] text-xs font-bold px-2 py-0.5 rounded-full border border-[#831A1D]">
                {wishlistItems.length} saved
              </span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1 text-gray-200 hover:text-white rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-400">
                  <Heart className="w-10 h-10" />
                </div>
                <h4 className="font-serif text-xl font-bold text-gray-800">Your wishlist is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Save your favorite sarees, dresses, or fabrics to review anytime.
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    navigate('/shop');
                  }}
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Discover Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsWishlistOpen(false);
                      navigate(`/product/${item.id}`);
                    }}
                    className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 relative cursor-pointer hover:border-gray-200 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-lg shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-[#D3923A] font-bold uppercase tracking-wider block">
                          {item.subcategory || item.category}
                        </span>
                        <div className="text-xs font-bold text-[#6B1518] mt-1">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                            toggleWishlist(item);
                          }}
                          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                      className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 p-1"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
