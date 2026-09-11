import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, Heart, Star, ChevronRight, Zap, Sparkles, ShieldCheck, Truck, Award
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND } from '../config/brand';

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // 8 circular category buttons with photorealistic 3D picture icons - NO gold border
  const quickCategories = [
    { id: 'customized-gifts', label: 'Customized Gifts', image: '/categories/cat_gift_box.jpg' },
    { id: 'moon-lamps', label: '3D Moon Lamps', image: '/categories/cat_moon_lamp.jpg' },
    { id: 'photo-frames', label: 'Photo Frames', image: '/categories/cat_photo_frame.jpg' },
    { id: 'lithophane-products', label: 'Lithophanes', image: '/categories/cat_lithophane.jpg' },
    { id: 'acrylic-led', label: 'Acrylic LED', image: '/categories/cat_acrylic_led.jpg' },
    { id: 'devotional-lamps', label: 'Devotional Lamps', image: '/categories/cat_devotional.jpg' },
    { id: 'keychains', label: '3D Keychains', image: '/categories/cat_keychain.jpg' },
    { id: 'categories', label: 'More Categories', image: '/categories/cat_more.jpg', isAll: true },
  ];

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  const handleBuyNow = (e, p) => {
    e.stopPropagation();
    addToCart(p);
    navigate('/checkout');
  };

  const handleAddToCart = (e, p) => {
    e.stopPropagation();
    addToCart(p);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 text-gray-900 font-sans">
      
      {/* 1. HERO BANNER - STRAIGHT EDGE, TOUCHING SCREEN DIRECTLY, 15% INCREASE OVER ORIGINAL (COMPACT ~220px) */}
      <section className="w-full relative overflow-hidden bg-gradient-to-r from-[#18140F] via-[#2A2116] to-[#120F0C] text-white rounded-none border-b border-amber-950/30">
        <div className="w-full relative min-h-[220px] sm:min-h-[280px] max-w-7xl mx-auto px-4 sm:px-8 py-5 sm:py-7 flex items-center justify-between">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22)_0%,transparent_70%)] pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 w-[62%] sm:w-3/5 space-y-2 sm:space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-xs font-black uppercase tracking-wider text-[#E5C068]">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Custom 3D Gifts</span>
            </span>

            <h1 className="font-serif text-lg sm:text-2xl md:text-3xl font-extrabold leading-snug tracking-tight text-white">
              Customized <span className="bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">3D Gifts</span> for Every Emotion
            </h1>

            <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-2 hidden sm:block">
              Turn your cherished memories into illuminated lithophanes, moon lamps, and custom engraved frames.
            </p>

            <div className="pt-1">
              <button
                onClick={() => navigate('/shop')}
                className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-110 text-gray-950 font-black text-[11px] sm:text-xs px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Right Glowing 3D Moon Lamp - Compact Side-by-Side (Matches Original Proportions) */}
          <div className="relative z-10 w-[36%] sm:w-2/5 flex justify-end items-center pr-1 sm:pr-4">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              <img
                src="/categories/cat_moon_lamp.jpg"
                alt="3D Printed Moon Lamp"
                className="relative z-10 w-28 h-28 sm:w-40 sm:h-40 md:w-44 md:h-44 object-cover rounded-full shadow-2xl border-2 border-amber-300/30"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. CIRCULAR CATEGORY GRID - 3D PICTURES WITH NO GOLD BORDER */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Explore by Category</h2>
          <Link
            to="/categories"
            className="text-xs font-bold text-[#B38029] hover:text-amber-800 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(cat.isAll ? '/categories' : `/shop?category=${cat.id}`)}
              className="flex flex-col items-center text-center gap-1.5 group cursor-pointer"
            >
              {/* Clean 3D Picture Avatar - ZERO gold border */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-xs group-hover:shadow-md group-hover:scale-108 transition-all duration-200 bg-white">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-[10.5px] sm:text-xs font-semibold text-gray-700 tracking-tight leading-tight line-clamp-2 max-w-[72px] group-hover:text-[#B38029] transition-colors">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION WITH COMPACT, EQUAL ADD & BUY BUTTONS */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Featured Products</h3>
            <p className="text-[11px] text-gray-500">Most loved custom creations</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-[#B38029] hover:text-amber-800 flex items-center gap-0.5 cursor-pointer"
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
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                {/* Product Image + Discount Pill + Wishlist Button */}
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                  />

                  {/* 3D Custom Badge */}
                  <span className="absolute top-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> 3D PRINT
                  </span>

                  {p.discount && (
                    <span className="absolute bottom-2 right-2 bg-gradient-to-r from-[#B38029] to-[#D4AF37] text-gray-950 font-extrabold text-[9px] px-2 py-0.5 rounded shadow-xs">
                      {p.discount}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                    }}
                    className="absolute top-2 right-2 w-7.5 h-7.5 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-gray-600 hover:scale-110 transition-transform"
                    title="Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 justify-between space-y-2">
                  <div>
                    <span className="text-[9px] tracking-widest font-extrabold text-[#B38029] uppercase block">
                      {p.subcategory || p.category || 'CUSTOM 3D GIFT'}
                    </span>

                    <h4 className="font-serif text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#B38029] transition-colors mt-0.5">
                      {p.name}
                    </h4>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-gray-500 font-semibold">({p.reviewsCount || 24})</span>
                    </div>

                    {/* Price & Old Price */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="font-serif font-bold text-sm sm:text-base text-gray-950">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.oldPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{p.oldPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EQUAL COMPACT BUTTONS: ADD & BUY */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-2">
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-3 h-3 text-gray-700" />
                      <span>Add</span>
                    </button>

                    <button
                      onClick={(e) => handleBuyNow(e, p)}
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
          })}
        </div>
      </section>

      {/* 4. BRAND PROMISE CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <Sparkles className="w-5 h-5 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">High Precision 3D</h4>
            <p className="text-[10px] text-gray-500">0.12mm layers</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">Shockproof Pack</h4>
            <p className="text-[10px] text-gray-500">Safe transit</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <Truck className="w-5 h-5 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">Express Delivery</h4>
            <p className="text-[10px] text-gray-500">All India</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <Award className="w-5 h-5 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">Drakshramam Studio</h4>
            <p className="text-[10px] text-gray-500">By Naresh Kukkala</p>
          </div>
        </div>
      </section>

    </div>
  );
}
