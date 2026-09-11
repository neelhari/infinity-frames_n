import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight, Layers, Scissors, ShoppingBag, Heart } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND } from '../config/brand';

// Lotus motif SVG matching Indian traditional luxury branding (Image 2 & Image 3 reference)
function LotusIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4c-2 3.5-3.5 7-3.5 10 0 3 1.5 5 3.5 5s3.5-2 3.5-5C15.5 11 14 7.5 12 4z" fill="#D3923A" fillOpacity="0.25" stroke="#D3923A" />
      <path d="M12 19c-3.5 0-7-2-7-5 0-3.5 3-6.5 6-8.5-1.5 3-2 6-1.5 8.5 1 1.8 2.5 3 2.5 5z" fill="#D3923A" fillOpacity="0.15" stroke="#D3923A" />
      <path d="M12 19c3.5 0 7-2 7-5 0-3.5-3-6.5-6-8.5 1.5 3 2 6 1.5 8.5-1 1.8-2.5 3-2.5 5z" fill="#D3923A" fillOpacity="0.15" stroke="#D3923A" />
    </svg>
  );
}

// Category Pill Icon Component
function CategoryPillIcon({ catId }) {
  if (catId === 'sarees') {
    return (
      <span className="w-5 h-5 rounded-full bg-[#6B1518]/10 text-[#6B1518] flex items-center justify-center text-[10px] font-bold shrink-0">
        🥻
      </span>
    );
  }
  if (catId === 'dresses') {
    return (
      <span className="w-5 h-5 rounded-full bg-[#6B1518]/10 text-[#6B1518] flex items-center justify-center text-[10px] font-bold shrink-0">
        👗
      </span>
    );
  }
  if (catId === 'fabrics') {
    return <Scissors className="w-4 h-4 text-[#D3923A] shrink-0" />;
  }
  return <Layers className="w-4 h-4 text-[#D3923A] shrink-0" />;
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'sarees';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const activeCatData = categories.find(c => c.id === activeCategory) || categories[0];

  const subcategoriesMap = {
    sarees: [
      "Banarasi Tissue",
      "Banarasi Petiti Work",
      "Manipuri Kota",
      "Tassar (Gold & Silver Lines)",
      "Mangalagiri Pattu Digital Print",
      "Checks Silk"
    ],
    dresses: [
      "Mulchanderi 3-Piece Embroidery",
      "Mulchanderi 3-Piece A-Line",
      "Jandani Pure Cotton Frock",
      "Jandani Pure Cotton 3-Piece Set"
    ]
  };

  const activeSubcategories = subcategoriesMap[activeCategory] || activeCatData.subcategories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* 1. Header Banner matching Image 2 & Image 3 Reference */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5" data-aos="fade-down">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FBF4EC] text-[#6B1518] border border-[#EBD6C3] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#D3923A]" />
          <span>BROWSE BY COLLECTIONS</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mt-1">
          Our Product Categories
        </h1>

        {/* Lotus Ornamental Divider (Image 2 & 3 exact detail) */}
        <div className="flex items-center justify-center gap-3 w-48 mx-auto my-2">
          <span className="flex-1 h-px bg-[#D3923A]/50"></span>
          <LotusIcon className="w-5 h-5 text-[#D3923A]" />
          <span className="flex-1 h-px bg-[#D3923A]/50"></span>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Discover sarees, dresses, fabrics and timeless Indian fashion.
        </p>
      </div>

      {/* 2. Category Filter Pills Bar (Image 3 UI exact reference) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scroll justify-start sm:justify-center">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full py-2 px-4 text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'border-2 border-[#6B1518] text-[#6B1518] bg-white shadow-sm font-extrabold'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 shadow-2xs'
              }`}
            >
              <CategoryPillIcon catId={cat.id} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Featured Category Hero Banner Card (Image 2 & Image 3 exact UI) */}
      <div className="max-w-4xl mx-auto space-y-6" data-aos="fade-up">
        <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] sm:aspect-[2.2/1] bg-[#FAF5EE] border border-gray-100 group">
          <img
            src={activeCatData.bannerImage || activeCatData.image}
            alt={activeCatData.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Banner Content Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white flex flex-col justify-end items-start space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#D3923A]">
              NEW ARRIVALS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {activeCatData.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 max-w-lg">
              {activeCatData.tagline}
            </p>

            <button
              onClick={() => navigate(`/shop?category=${activeCatData.id}`)}
              className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 mt-2 shadow-lg transition-transform transform hover:scale-105"
            >
              <span>EXPLORE {activeCatData.name.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pagination dots at bottom center */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            <div className="w-6 h-1.5 rounded-full bg-[#6B1518]"></div>
            <div className="w-2 h-1.5 rounded-full bg-white/50"></div>
            <div className="w-2 h-1.5 rounded-full bg-white/50"></div>
          </div>
        </div>

        {/* Category Description & Subcategory Badges (Image 2 bottom detail) */}
        <div className="space-y-4 px-2">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {activeCatData.description}
          </p>

          {/* Subcategories Pill Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {activeSubcategories.map((sub, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/shop?category=${activeCatData.id}&sub=${encodeURIComponent(sub)}`)}
                className="bg-[#F9F3EE] hover:bg-[#6B1518] hover:text-white text-[#6B1518] text-xs font-semibold px-3.5 py-1.5 rounded-full border border-[#EBE0D6] transition-all shadow-2xs"
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. All Categories Showcase Grid below */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-[#D3923A] uppercase tracking-widest">All Collections</span>
          <h3 className="font-serif text-2xl font-bold text-gray-900">Explore More Categories</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.id}`)}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#FAF5EE]">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <span className="text-[10px] text-[#D3923A] font-bold uppercase tracking-wider block">{cat.itemCount}</span>
                  <h4 className="font-serif text-xl font-bold text-white">{cat.name}</h4>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-white border-t border-gray-100">
                <span className="text-xs font-bold text-[#6B1518]">Browse {cat.name} →</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6B1518] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
