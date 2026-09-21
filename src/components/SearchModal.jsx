import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND } from '../config/brand';

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUI();
  const { products } = useStoreData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectProduct = (id) => {
    closeSearch();
    navigate(`/product/${id}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleTagClick = (tag) => {
    closeSearch();
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        onClick={closeSearch}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200 animate-scaleUp">
        {/* Search Bar Form */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search 3D Moon Lamps, Lithophanes, Acrylic LED, Keychains..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-[#1A1A1A] hover:bg-[#B38029] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={closeSearch}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
          {!query.trim() ? (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#B38029] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Popular 3D Gift Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  '3D Moon Lamp',
                  'Lithophane Night Light',
                  'Couple Acrylic LED',
                  'Personalized Keychain',
                  'Devotional 3D Frame',
                  'Spotify LED Plaque',
                  'Wooden Stand Lamp',
                  'Rotating 3D Lamp',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="bg-gray-100 hover:bg-[#FAF5EB] hover:text-[#B38029] text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#D4AF37]/30"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs sm:text-sm space-y-2">
              <p>No 3D creations found matching "<strong>{query}</strong>".</p>
              <p className="text-gray-400 text-xs">Try searching for "Moon Lamp", "Lithophane", or "Acrylic".</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Found {filteredProducts.length} Results
              </div>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.id)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-[#D4AF37]/30 transition-all group"
                >
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=200'}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[#B38029] transition-colors">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-gray-500">{product.category || '3D Custom Gift'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-gray-950">
                      ₹{(product.price || 999).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#B38029] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
