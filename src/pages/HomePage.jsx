import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, Sparkles, ShieldCheck, Truck, Award
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { BRAND } from '../config/brand';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, categories, banners } = useStoreData();

  const featuredProducts = (products.filter((p) => p.isFeatured).length > 0
    ? products.filter((p) => p.isFeatured)
    : products
  ).slice(0, 8);

  const activeBanner = banners.find((b) => b.active) || banners[0] || null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 text-gray-900 font-sans">
      
      {/* 1. HERO BANNER - STRAIGHT EDGE, TOUCHING SCREEN DIRECTLY, COMPACT ~220px */}
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
              {activeBanner ? activeBanner.title : (
                <>Customized <span className="bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">3D Gifts</span> for Every Emotion</>
              )}
            </h1>

            <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-2 hidden sm:block">
              Turn your cherished memories into illuminated lithophanes, moon lamps, and custom engraved frames.
            </p>

            <div className="pt-1">
              <button
                onClick={() => navigate(activeBanner?.link || '/shop')}
                className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-110 text-gray-950 font-black text-[11px] sm:text-xs px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Right Glowing 3D Moon Lamp / Banner Image */}
          <div className="relative z-10 w-[36%] sm:w-2/5 flex justify-end items-center pr-1 sm:pr-4">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              <img
                src={activeBanner?.image || '/categories/cat_moon_lamp.jpg'}
                alt="3D Printed Moon Lamp"
                className="relative z-10 w-28 h-28 sm:w-40 sm:h-40 md:w-44 md:h-44 object-cover rounded-full shadow-2xl border-2 border-amber-300/30"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. CIRCULAR CATEGORY GRID - DYNAMIC FROM SUPABASE */}
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
          {categories.slice(0, 7).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.id}`)}
              className="flex flex-col items-center text-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-xs group-hover:shadow-md group-hover:scale-108 transition-all duration-200 bg-white">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-[10.5px] sm:text-xs font-semibold text-gray-700 tracking-tight leading-tight line-clamp-2 max-w-[72px] group-hover:text-[#B38029] transition-colors">
                {cat.name}
              </span>
            </button>
          ))}

          {/* More Categories button */}
          <button
            onClick={() => navigate('/categories')}
            className="flex flex-col items-center text-center gap-1.5 group cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-xs group-hover:shadow-md group-hover:scale-108 transition-all duration-200 bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#B38029]" />
            </div>
            <span className="text-[10.5px] sm:text-xs font-semibold text-gray-700 tracking-tight leading-tight line-clamp-2 max-w-[72px] group-hover:text-[#B38029] transition-colors">
              More
            </span>
          </button>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION - DYNAMIC FROM SUPABASE */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
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
