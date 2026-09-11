import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, Heart, Star, ChevronRight, Zap, Sparkles, ShieldCheck, Truck, Clock, Award
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND } from '../config/brand';

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // 8 circular category buttons with photorealistic 3D picture icons
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
      
      {/* 1. HERO BANNER - STRAIGHT EDGE, TOUCHING SCREEN DIRECTLY, INCREASED SIZE, NO CURVES */}
      <section className="w-full relative overflow-hidden bg-[#120F0C] text-white">
        <div className="w-full relative min-h-[440px] sm:min-h-[520px] md:min-h-[600px] flex items-center">
          
          {/* Background Photo Texture & Gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=85"
              alt="Custom 3D Illuminated Frames Background"
              className="w-full h-full object-cover object-center opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,transparent_70%)] pointer-events-none" />
          </div>

          {/* Banner Content Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Headline & CTAs */}
            <div className="md:col-span-7 space-y-4 sm:space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 px-3.5 py-1 rounded-full text-xs font-bold text-[#F3E5AB] uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>India's Premier 3D Custom Gift Studio</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
                Turn Memories Into <br />
                <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B38029] bg-clip-text text-transparent">
                  Glowing 3D Realities
                </span>
              </h1>

              <p className="text-xs sm:text-base text-gray-300 max-w-xl leading-relaxed">
                High-precision 0.12mm lithophanes, personalized 3D Moon Lamps, and acrylic LED illusion frames crafted with care in Drakshramam.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-110 text-gray-950 font-black text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>EXPLORE 3D COLLECTION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/product/moon-lamp-15cm')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-white/20 transition-all backdrop-blur-xs cursor-pointer flex items-center gap-2"
                >
                  <span>Customize Moon Lamp</span>
                </button>
              </div>

              {/* Quick Trust Highlight */}
              <div className="pt-2 flex items-center gap-6 text-[11px] text-gray-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> 100% Transit Safe
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#D4AF37]" /> Free Express Shipping
                </span>
              </div>
            </div>

            {/* Right Glowing 3D Moon Lamp Hero Graphic */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative group w-48 sm:w-72 md:w-80 aspect-square">
                {/* Golden ambient glow halo */}
                <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl animate-pulse" />
                <img
                  src="/categories/cat_moon_lamp.jpg"
                  alt="Personalized 3D Moon Lamp"
                  className="relative z-10 w-full h-full object-cover rounded-full shadow-2xl border-4 border-[#D4AF37]/50 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-[11px] font-bold text-[#F3E5AB] whitespace-nowrap shadow-lg">
                  ★ Handcrafted 3D Relief
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. 3D PICTURE CATEGORY GRID (8 Categories with 3D Rendered Pictures) */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#B38029] uppercase tracking-wider">Top 3D Collections</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">Explore by 3D Category</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-[#B38029] hover:text-amber-800 flex items-center gap-1"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(cat.isAll ? '/categories' : `/shop?category=${cat.id}`)}
              className="flex flex-col items-center text-center gap-2 group cursor-pointer"
            >
              {/* 3D Rendered Picture Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-white">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-800 tracking-tight leading-snug line-clamp-2 max-w-[80px] group-hover:text-[#B38029] transition-colors">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION WITH BOTH "BUY NOW" AND "ADD TO CART" */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#B38029] uppercase tracking-wider">Handcrafted For You</span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">Featured 3D Creations</h3>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-[#B38029] hover:text-amber-800 flex items-center gap-1 cursor-pointer"
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
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
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

                  {/* BOTH BUTTONS: ADD TO CART & BUY NOW */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-[10px] sm:text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Add to Shopping Cart"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span className="truncate">Add to Cart</span>
                    </button>

                    <button
                      onClick={(e) => handleBuyNow(e, p)}
                      className="w-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 text-[10px] sm:text-[11px] font-extrabold py-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                      title="Instant Buy Now"
                    >
                      <Zap className="w-3 h-3 fill-gray-950" />
                      <span className="truncate">Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BRAND PROMISE CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">High Precision 3D</h4>
            <p className="text-[10px] text-gray-500">0.12mm microscopic layers</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">Shockproof Packaging</h4>
            <p className="text-[10px] text-gray-500">Safe all-India transit</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <Truck className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">Free Express Delivery</h4>
            <p className="text-[10px] text-gray-500">On orders above ₹999</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <Award className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-bold text-gray-900">Drakshramam Studio</h4>
            <p className="text-[10px] text-gray-500">Crafted by Naresh Kukkala</p>
          </div>
        </div>
      </section>

    </div>
  );
}
