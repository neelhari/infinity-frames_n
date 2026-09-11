import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Sparkles, ArrowUpRight, Search } from 'lucide-react';
import { BRAND } from '../config/brand';

export const categoriesList = [
  {
    id: 'customized-gifts',
    name: 'Customized Gifts',
    tagline: 'Turn Your Memories Into Lasting 3D Treasures',
    description: 'Personalized engraved frames, custom anniversary keepsakes, and bespoke 3D tokens.',
    image: '/categories/cat_gift_box.jpg',
    itemCount: '12 Products',
    highlights: ['Anniversary Specials', 'Couple Gifts', 'Custom Names']
  },
  {
    id: 'moon-lamps',
    name: '3D Moon Lamps',
    tagline: 'Personalized Glowing Lunar Touch Lamps',
    description: 'Ultra high-definition spherical 3D moon lamps with realistic lunar craters and touch dimming.',
    image: '/categories/cat_moon_lamp.jpg',
    itemCount: '8 Products',
    highlights: ['15cm Diameter', '16 Color RGB', 'Wooden Stand']
  },
  {
    id: 'photo-frames',
    name: 'Photo Frames',
    tagline: 'Illuminated LED & Handcrafted 3D Frames',
    description: 'Preserve cherished portraits with optical backlighting and precision laser edges.',
    image: '/categories/cat_photo_frame.jpg',
    itemCount: '10 Products',
    highlights: ['Warm White LED', 'Acrylic Crystal', 'Solid Wood']
  },
  {
    id: 'lithophane-products',
    name: 'Lithophanes',
    tagline: 'Light-Activated Micro-Relief Photography',
    description: 'Magic 3D carved portraits that reveal stunning photo contrasts when illuminated.',
    image: '/categories/cat_lithophane.jpg',
    itemCount: '6 Products',
    highlights: ['0.12mm Micro Layers', 'Curved Display', 'Night Light']
  },
  {
    id: 'acrylic-led',
    name: 'Acrylic LED Lamps',
    tagline: 'Warm Neon & Laser Engraved Plaques',
    description: 'Crystal-clear cast acrylic with glowing couple silhouettes and Spotify song codes.',
    image: '/categories/cat_acrylic_led.jpg',
    itemCount: '9 Products',
    highlights: ['Spotify Codes', 'Couple Silhouette', 'USB Powered']
  },
  {
    id: 'devotional-lamps',
    name: 'Devotional Lamps',
    tagline: 'Sacred Temple Diyas & Pooja Room Illumination',
    description: 'Divine 3D deities and sacred lamps casting warm spiritual aura for your mandir.',
    image: '/categories/cat_devotional.jpg',
    itemCount: '5 Products',
    highlights: ['Ganesha & Shiva', 'Brass Tone Finish', 'Continuous Glow']
  },
  {
    id: 'keychains',
    name: '3D Keychains',
    tagline: 'Miniature Photo & Name Engraved Charms',
    description: 'Pocket-sized durable 3D printed lithophane and engraved photo keychains.',
    image: '/categories/cat_keychain.jpg',
    itemCount: '14 Products',
    highlights: ['Photo Litho Ring', 'Metallic Chain', 'Double Sided']
  },
  {
    id: 'more-creations',
    name: 'Glow in Dark & More',
    tagline: 'Phosphorescent & Specialized 3D Art',
    description: 'Unique custom desk toys, glow-in-the-dark lithophanes, and creative bespoke prints.',
    image: '/categories/cat_more.jpg',
    itemCount: '7 Products',
    highlights: ['Glow Pigments', 'Desk Sculptures', 'Custom Gifts']
  },
];

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('all');

  const filteredCategories = selectedId === 'all'
    ? categoriesList
    : categoriesList.filter(c => c.id === selectedId);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 font-sans">
      
      {/* 1. Sticky Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-gray-900 leading-tight">
                3D Gift Collections
              </h1>
              <span className="text-[10.5px] text-gray-400 font-medium">
                {categoriesList.length} Categories Available
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-[#B38029] hover:text-amber-800 bg-[#FAF5EB] px-3 py-1.5 rounded-full border border-[#D4AF37]/30 transition-colors"
          >
            Browse All Products
          </button>
        </div>
      </div>

      {/* 2. Top Horizontal Scrolling Category Bar (Zepto/Blinkit Style) */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 shadow-2xs">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            <button
              onClick={() => setSelectedId('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedId === 'all'
                  ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ★ All Categories
            </button>

            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedId(selectedId === cat.id ? 'all' : cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  selectedId === cat.id
                    ? 'bg-[#FAF5EB] text-[#B38029] border-[#D4AF37] shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Fluid Scrolling Categories Feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/shop?category=${cat.id}`)}
            className="group bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col sm:flex-row"
          >
            {/* Left/Top: 3D Picture touching card boundary (Zepto style) */}
            <div className="w-full sm:w-48 md:w-56 aspect-[16/9] sm:aspect-square overflow-hidden bg-gray-100 shrink-0 relative">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                {cat.itemCount}
              </span>
            </div>

            {/* Right/Bottom: Category Details & CTA */}
            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#B38029] transition-colors">
                    {cat.name}
                  </h2>
                  <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-[#FAF5EB] group-hover:text-[#B38029] flex items-center justify-center text-gray-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-[#B38029] font-semibold">
                  {cat.tagline}
                </p>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Highlights Chips & Action Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {cat.highlights.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-50 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B38029] group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Collection</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
