import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Shimmer';
import { useStoreData } from '../context/StoreDataContext';

const categoryThumbnails = {
  'photo-frames': '/categories/cat_photo_frame.jpg',
  'moon-lamps': '/categories/cat_moon_lamp.jpg',
  'lithophane-products': '/categories/cat_lithophane.jpg',
  'keychains': '/categories/cat_keychain.jpg',
  'customized-gifts': '/categories/cat_gift_box.jpg',
  'devotional-lamps': '/categories/cat_devotional.jpg',
  'customized-lamps': '/categories/cat_acrylic_led.jpg',
};

export default function CategoriesPage() {
  const { products, categories, loading } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const dynamicCategories = [
    { id: 'all', label: 'All Gifts', image: '/categories/cat_more.jpg' },
    ...categories.map((c) => ({
      id: c.id,
      label: c.name,
      image: categoryThumbnails[c.id] || c.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
    }))
  ];

  // Sync with URL if query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  // Filter products based on selectedCategory and searchQuery
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        matchesCategory =
          p.category === selectedCategory ||
          (p.tags && p.tags.includes(selectedCategory)) ||
          (selectedCategory === 'customized-gifts' && (p.customizable || p.category === 'photo-frames'));
      }

      // Search query filter
      let matchesQuery = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        matchesQuery =
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q));
      }

      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 font-sans">
      
      {/* 1. HORIZONTAL SCROLLING CATEGORY ICONS */}
      <section className="bg-white border-b border-gray-100 py-3 shadow-2xs sticky top-[53px] sm:top-[61px] z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scroll px-3.5 sm:px-6">
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="flex flex-col items-center text-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  {/* Avatar Container */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-xs group-hover:shadow-md group-hover:scale-108 transition-all duration-200 bg-white">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] max-w-[70px] truncate leading-tight tracking-tight ${
                      isSelected
                        ? 'font-bold text-[#B38029]'
                        : 'font-semibold text-gray-700 group-hover:text-gray-900'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. SEARCH BAR DIRECTLY BELOW CATEGORY SCROLL */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-3.5 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in categories, moon lamps, 3D gifts..."
            className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-[#B38029] focus:ring-2 focus:ring-[#B38029]/20 outline-none text-xs text-gray-900 placeholder:text-gray-400 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active Filter Pill & Product Count */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 px-1">
          <span>
            Showing <strong className="text-gray-900">{filteredProducts.length}</strong> items
            {selectedCategory !== 'all' && (
              <span className="ml-1 text-[#B38029] font-medium">
                in "{dynamicCategories.find((c) => c.id === selectedCategory)?.label || selectedCategory}"
              </span>
            )}
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleSelectCategory('all')}
              className="text-[#B38029] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>
      </section>

      {/* 3. DIRECTLY THE PRODUCT CARDS (SIDE-BY-SIDE 2-COLUMN GRID ON MOBILE) */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2">
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center my-6 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-[#B38029] mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-gray-900 text-sm">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No matching products for your search. Try resetting your search or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
