import React from 'react';

export default function CategoryTile({ category, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer flex flex-col relative aspect-[4/5] sm:aspect-[4/5]"
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute bottom-0 inset-x-0 p-4 text-white flex flex-col justify-end space-y-1">
        <span className="text-[10px] text-[#D3923A] font-bold uppercase tracking-widest">
          {category.itemCount}
        </span>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
          {category.name}
        </h3>
        <p className="text-xs text-gray-300 line-clamp-1">{category.tagline}</p>

        <div className="pt-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#6B1518] text-white px-3 py-1.5 rounded-lg group-hover:bg-[#4B0F11] transition-colors shadow-xs">
            SHOP NOW →
          </span>
        </div>
      </div>
    </div>
  );
}
