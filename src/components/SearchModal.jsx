import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShoppingBag } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useStoreData } from '../context/StoreDataContext';

export default function SearchModal() {
  const navigate = useNavigate();
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const { products } = useStoreData();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();
  const filtered = q === ''
    ? []
    : products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Dark Backdrop */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 animate-slideDown">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6B1518]" />
          <input
            type="text"
            autoFocus
            placeholder="Search sarees, dresses, fabrics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm sm:text-base outline-none text-gray-900 placeholder:text-gray-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Popular Searches</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Banarasi Saree', 'Tassar Saree', 'Mulchanderi Dress', 'Jandani Cotton', 'Checks Silk', 'Manipuri Kota'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="bg-gray-100 hover:bg-[#F8F0F0] hover:text-[#6B1518] text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No products found matching "<strong>{query}</strong>". Try searching for "Saree", "Dress", or "Cotton".
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold mb-2">Found {filtered.length} products:</p>
              {filtered.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/product/${product.id}`);
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                >
                  <img src={product.image} alt={product.name} className="w-12 h-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h5 className="font-serif font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</h5>
                    <span className="text-[10px] text-[#D3923A] font-bold uppercase tracking-wider block">
                      {product.subcategory || product.category}
                    </span>
                    <span className="text-xs font-bold text-[#6B1518]">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
