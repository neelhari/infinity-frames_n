import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingBag, Star, Heart, SlidersHorizontal } from 'lucide-react';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'photo-frames';
  
  const currentCategory = categories.find((c) => c.id === categoryParam) || categories[2]; // defaults to photo-frames
  const availableChips = currentCategory?.subcategories || ['All', 'Wooden', 'Acrylic', 'LED Frames'];

  const [activeChip, setActiveChip] = useState('All');
  const { addToCart, totalItemsCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filter products by category and active chip
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryParam ? p.category === categoryParam : true;
      if (!matchCat) return false;
      if (activeChip === 'All') return true;
      return p.subcategory?.toLowerCase().includes(activeChip.toLowerCase());
    });
  }, [categoryParam, activeChip]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 font-sans">
      {/* 1. TOP HEADER (Screen 4: Back, Title, Search, Cart with badge) */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-base sm:text-lg font-bold text-gray-900 tracking-wide truncate">
              {currentCategory?.name || 'All Products'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shop')}
              className="p-1.5 text-gray-700 hover:text-[#B38029] rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative p-1.5 text-gray-700 hover:text-[#B38029] rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C89B3C] text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-FILTER CHIPS ROW (Screen 4: All, Wooden, Acrylic, LED Frames) */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 shadow-2xs sticky top-[50px] z-20 overflow-x-auto hide-scroll">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {availableChips.map((chip) => {
            const isActive = activeChip === chip;
            return (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#B38029] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRODUCT GRID (Screen 4: 2-Column Clean Cards) */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="font-serif text-base font-bold text-gray-800 mb-1">No products found in this filter</p>
            <p className="text-xs text-gray-400 mb-4">Try selecting another filter chip or view all products</p>
            <button
              onClick={() => setActiveChip('All')}
              className="bg-[#B38029] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const inWishlist = isInWishlist(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Image, Discount Badge & Wishlist */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.discount && (
                      <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#1A1A1A] font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                        {p.discount}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-xs text-gray-600 transition-colors cursor-pointer"
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
                      <h3 className="font-serif text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h3>

                      {/* Price row */}
                      <div className="flex items-baseline gap-1.5 mt-1.5">
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

                    {/* Action Button: Add to Cart / Customize */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${p.id}`);
                      }}
                      className="mt-3 w-full bg-[#B38029] hover:bg-[#8C5E16] text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{p.customizable ? 'Customize' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
