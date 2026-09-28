import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingBag, Star, Heart, SlidersHorizontal, Sparkles, ChevronRight } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCardSkeleton } from '../components/Shimmer';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search') || searchParams.get('q') || '';
  const { products, categories, loading } = useStoreData();
  
  const currentCategory = categories.find((c) => c.id === categoryParam) || null;
  const availableChips = currentCategory?.subcategories && currentCategory.subcategories.length > 0
    ? ['All', ...currentCategory.subcategories]
    : ['All'];

  const [activeChip, setActiveChip] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating'
  const { totalItemsCount, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = categoryParam ? p.category === categoryParam : true;
      if (!matchCat) return false;

      if (searchParam) {
        const q = searchParam.toLowerCase().trim();
        const matchSearch =
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          (Array.isArray(p.materials) && p.materials.some((m) => m.toLowerCase().includes(q))) ||
          (Array.isArray(p.sizes) && p.sizes.some((s) => s.toLowerCase().includes(q)));
        if (!matchSearch) return false;
      }

      if (activeChip === 'All') return true;
      return p.subcategory?.toLowerCase().includes(activeChip.toLowerCase());
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }

    return result;
  }, [products, categoryParam, searchParam, activeChip, sortBy]);

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const headerTitle = searchParam
    ? `Search: "${searchParam}"`
    : currentCategory?.name || 'All Products';

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 font-sans">
      
      {/* 1. MOBILE ONLY TOP HEADER (< md) */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={handleBack}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-base font-bold text-gray-900 tracking-wide truncate">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {searchParam && (
              <button
                onClick={clearSearch}
                className="text-[11px] font-bold text-[#B38029] bg-[#FAF5EB] px-2 py-1 rounded-lg border border-[#D4AF37]/30 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => navigate('/categories')}
              className="p-1.5 text-gray-700 hover:text-[#B38029] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Categories"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={openCart || (() => navigate('/cart'))}
              className="relative p-1.5 text-gray-700 hover:text-[#B38029] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C89B3C] text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DESKTOP BREADCRUMBS & PAGE HEADER (hidden on mobile, shown on md+) */}
      <div className="hidden md:block bg-white border-b border-gray-100 py-4 px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Link to="/" className="hover:text-[#B38029] transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <Link to="/categories" className="hover:text-[#B38029] transition-colors">Categories</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-bold">{headerTitle}</span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-gray-950">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {searchParam && (
              <button
                onClick={clearSearch}
                className="text-xs font-bold text-[#B38029] bg-[#FAF5EB] px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}

            {/* Desktop Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUB-FILTER CHIPS ROW */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 shadow-2xs sticky top-[50px] md:top-[60px] z-20 overflow-x-auto hide-scroll">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll">
            {availableChips.map((chip) => {
              const isActive = activeChip === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#B38029] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-gray-400 font-medium hidden sm:inline-block shrink-0">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
          </span>
        </div>
      </div>

      {/* 4. PRODUCT GRID (Desktop 4-Columns / Tablet 3-Columns / Mobile 2-Columns) */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6">
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-2xs max-w-lg mx-auto p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#B38029] flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-lg font-bold text-gray-900">No products found</h2>
            <p className="text-xs text-gray-500">Try selecting another filter chip or view all customized gifts</p>
            <button
              onClick={() => setActiveChip('All')}
              className="mt-2 inline-flex bg-[#B38029] hover:bg-[#8C5E16] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
