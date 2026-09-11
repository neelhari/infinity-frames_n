import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { categories } from '../data/categories';

export default function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 font-sans">
      {/* Top Header Bar */}
      <div className="sticky top-[45px] sm:top-[50px] z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-lg font-bold text-gray-900 tracking-wide">
              Categories
            </h1>
          </div>
          <span className="text-xs font-semibold text-[#B38029]">
            {categories.length} Collections
          </span>
        </div>
      </div>

      {/* Categories Vertical Cards List (Screen 3) */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/shop?category=${cat.id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-3 flex items-center justify-between gap-4 group hover:shadow-md hover:border-[#C89B3C]/40 transition-all cursor-pointer"
          >
            {/* Left: Thumbnail Image */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
              />
            </div>

            {/* Middle: Title & Product Count */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#B38029] transition-colors truncate">
                {cat.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                ({cat.itemCount})
              </p>
              {cat.tagline && (
                <p className="text-[11px] text-gray-400 truncate mt-0.5 hidden sm:block">
                  {cat.tagline}
                </p>
              )}
            </div>

            {/* Right: Chevron Arrow */}
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-amber-50 group-hover:text-[#B38029] flex items-center justify-center text-gray-400 transition-colors shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
