import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl p-2 sm:p-2.5 border border-gray-200 hover:border-[#D4AF37] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative"
    >
      {/* Image Box - Clean without 3D print or discount badges */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=500'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center z-10 shadow-2xs transition-transform hover:scale-110 ${
            isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Compact Product Information - No ratings, reduced size */}
      <div className="pt-2 flex flex-col justify-between flex-1 space-y-1.5">
        <div>
          <span className="text-[8.5px] sm:text-[9px] tracking-wider font-extrabold text-[#B38029] uppercase block truncate">
            {product.subcategory || product.category || 'CUSTOM 3D GIFT'}
          </span>

          <h3 className="text-xs sm:text-[13px] font-serif font-bold text-gray-900 line-clamp-1 group-hover:text-[#B38029] transition-colors mt-0.5 leading-snug">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif font-bold text-xs sm:text-sm text-gray-950">
              ₹{(product.price || 999).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-[9.5px] text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Compact Equal Sized Buttons: ADD & BUY */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] sm:text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingBag className="w-3 h-3 text-gray-600" />
            <span>Add</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 text-[10px] sm:text-[11px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
            title="Buy Now"
          >
            <Zap className="w-3 h-3 fill-gray-950" />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
