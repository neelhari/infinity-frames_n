import React from 'react';

export default function CategoryTile({ category, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-200 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex flex-col relative aspect-[4/5]"
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <div className="absolute bottom-0 inset-x-0 p-4 text-white flex flex-col justify-end space-y-1">
        <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">
          {category.itemCount}
        </span>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
          {category.name}
        </h3>
        <p className="text-xs text-gray-300 line-clamp-1">{category.tagline}</p>

        <div className="pt-2">
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-[#B38029] to-[#D4AF37] text-gray-950 px-3 py-1.5 rounded-lg shadow-sm hover:brightness-105 transition-all">
            CUSTOMIZE 3D →
          </span>
        </div>
      </div>
    </div>
  );
}
