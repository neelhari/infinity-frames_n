import React from 'react';

/**
 * Universal Shimmer Block
 * Renders an animated gradient skeleton buffer
 */
export function Shimmer({ className = '', gold = false, style = {} }) {
  return (
    <div
      className={`${gold ? 'animate-shimmer-gold' : 'animate-shimmer'} ${className}`}
      style={style}
    />
  );
}

/**
 * Product Card Skeleton Buffer (Storefront product grids)
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs flex flex-col">
      {/* Image box placeholder */}
      <div className="w-full aspect-[4/5] bg-gray-100 relative overflow-hidden">
        <Shimmer className="w-full h-full" />
        <div className="absolute top-2.5 left-2.5">
          <Shimmer className="w-14 h-4 rounded-full bg-white/70" />
        </div>
      </div>

      {/* Details placeholder */}
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-3 w-16 rounded-md" />
          <Shimmer className="h-4 w-full rounded-md" />
          <Shimmer className="h-4 w-3/4 rounded-md" />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <Shimmer className="h-4 w-12 rounded-md" gold />
            <Shimmer className="h-3 w-8 rounded-md" />
          </div>
          <Shimmer className="h-7 w-16 rounded-lg" gold />
        </div>
      </div>
    </div>
  );
}

/**
 * Circular Category Skeleton (Home page category row)
 */
export function CategoryCircleSkeleton() {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-xs bg-gray-100">
        <Shimmer className="w-full h-full" />
      </div>
      <Shimmer className="h-2.5 w-12 rounded-md mt-1" />
    </div>
  );
}

/**
 * Hero Banner Skeleton (Home page top slider)
 */
export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px] bg-stone-900 flex items-center overflow-hidden border-b border-stone-800">
      <Shimmer className="absolute inset-0 w-full h-full opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-10 md:px-14 space-y-3">
        <Shimmer className="h-7 sm:h-10 md:h-12 w-3/5 max-w-md rounded-xl bg-white/20" />
        <Shimmer className="h-3.5 sm:h-4 md:h-5 w-2/5 max-w-sm rounded-md bg-white/10" />
        <div className="pt-2">
          <Shimmer className="h-8 sm:h-10 w-28 sm:w-32 rounded-xl bg-white/20" gold />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Rows Skeleton (Admin orders, products, categories, inventory)
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <tbody className="divide-y divide-gray-100 font-medium">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="hover:bg-gray-50/50">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div className="flex items-center gap-2.5">
                {cIdx === 0 && (
                  <Shimmer className="w-9 h-9 rounded-lg shrink-0" />
                )}
                <div className="space-y-1.5 flex-1">
                  <Shimmer className={`h-3.5 rounded-md ${cIdx === 1 ? 'w-3/4' : 'w-20'}`} />
                  {cIdx === 1 && <Shimmer className="h-2.5 w-1/2 rounded-md" />}
                </div>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * Product Detail Page Skeleton Buffer
 */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Gallery */}
      <div className="space-y-4">
        <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100">
          <Shimmer className="w-full h-full" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              <Shimmer className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Details */}
      <div className="space-y-5">
        <Shimmer className="h-4 w-24 rounded-full" gold />
        <Shimmer className="h-8 w-4/5 rounded-xl" />
        <Shimmer className="h-4 w-32 rounded-md" />
        <div className="flex items-baseline gap-3 pt-2">
          <Shimmer className="h-7 w-24 rounded-lg" gold />
          <Shimmer className="h-4 w-16 rounded-md" />
        </div>
        <div className="h-px bg-gray-100 my-4" />
        <div className="space-y-2">
          <Shimmer className="h-4 w-28 rounded-md" />
          <div className="flex gap-2">
            <Shimmer className="h-9 w-20 rounded-xl" />
            <Shimmer className="h-9 w-20 rounded-xl" />
            <Shimmer className="h-9 w-20 rounded-xl" />
          </div>
        </div>
        <div className="pt-4 flex gap-3">
          <Shimmer className="h-12 flex-1 rounded-2xl" gold />
          <Shimmer className="h-12 w-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default Shimmer;
