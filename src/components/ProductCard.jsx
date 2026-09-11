import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Sparkles, Zap } from 'lucide-react';
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
      className="group bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-200 hover:border-[#D4AF37] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative"
    >
      {/* Image Box */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
        />

        {/* 3D Custom Badge */}
        <span className="absolute top-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> 3D PRINT
        </span>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center z-10 shadow-xs transition-transform hover:scale-110 ${
            isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {product.discount && (
          <span className="absolute bottom-2 right-2 z-10 bg-gradient-to-r from-[#B38029] to-[#D4AF37] text-gray-950 text-[9px] font-black px-2 py-0.5 rounded shadow-xs">
            {product.discount}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-2.5 flex flex-col gap-1 flex-1 justify-between">
        <div>
          <span className="text-[9px] tracking-widest font-extrabold text-[#B38029] uppercase block">
            {product.subcategory || product.category || 'CUSTOM 3D GIFT'}
          </span>

          <h3 className="text-xs sm:text-sm font-serif font-bold text-gray-900 line-clamp-1 group-hover:text-[#B38029] transition-colors mt-0.5">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-gray-500 font-semibold">({product.reviewsCount || 24})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif font-bold text-sm sm:text-base text-gray-950">
              ₹{(product.price || 999).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Equal Sized Action Buttons: ADD & BUY */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-2">
          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingBag className="w-3 h-3 text-gray-700" />
            <span>Add</span>
          </button>

          {/* Buy Button */}
          <button
            onClick={handleBuyNow}
            className="w-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 text-[11px] font-extrabold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
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
