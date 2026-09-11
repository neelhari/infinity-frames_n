import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Heart, ArrowUp, MapPin } from 'lucide-react';
import { InstagramIcon } from './BrandIcons';
import { BRAND, waLink } from '../config/brand';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Categories', path: '/categories' },
  { label: 'All Products', path: '/shop' },
  { label: 'Photo Frames', path: '/shop?category=photo-frames' },
  { label: '3D Moon Lamps', path: '/shop?category=moon-lamps' },
  { label: 'Lithophane Products', path: '/shop?category=lithophane-products' },
  { label: 'Keychains', path: '/shop?category=keychains' },
  { label: 'My Account & Orders', path: '/account' },
  { label: 'Contact Us', path: '/contact' },
];

const policyLinks = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Return & Refund Policy', path: '/return-policy' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Terms & Conditions', path: '/terms' },
];

export default function Footer() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <footer className="bg-[#14110E] text-gray-300 border-t-2 border-[#C89B3C]/40 font-sans relative mb-14 xl:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {/* Golden Infinity Heart Emblem */}
              <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-xs">
                  <defs>
                    <linearGradient id="goldInfinityFoot" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E5C068" />
                      <stop offset="50%" stopColor="#C89B3C" />
                      <stop offset="100%" stopColor="#9E7422" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M100,60 C80,30 40,20 20,45 C-5,70 15,105 55,100 C85,95 95,70 100,60 C105,70 115,95 145,100 C185,105 205,70 180,45 C160,20 120,30 100,60 Z"
                    fill="none"
                    stroke="url(#goldInfinityFoot)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#E5C068] tracking-widest uppercase leading-none">
                  {BRAND.name}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">
                  {BRAND.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Specializing in 3D-printed personalized gifts, photo frames, lithophanes, moon lamps, devotional lamps, and customized tokens.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={waLink(`Hello ${BRAND.name}, I would like to order a custom gift.`)}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#25D366] hover:text-white text-gray-300 flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${BRAND.phone}`}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C89B3C] hover:text-[#1A1A1A] text-gray-300 flex items-center justify-center transition-colors"
                title="Phone Support"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C89B3C] hover:text-[#1A1A1A] text-gray-300 flex items-center justify-center transition-colors"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.slice(0, 6).map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => handleNav(link.path)}
                    className="text-gray-400 hover:text-[#E5C068] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories & Custom Gifts */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Popular Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('/shop?category=photo-frames')} className="text-gray-400 hover:text-[#E5C068] transition-colors cursor-pointer">
                  Personalized Photo Frames
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/shop?category=moon-lamps')} className="text-gray-400 hover:text-[#E5C068] transition-colors cursor-pointer">
                  3D Moon Lamps (10cm, 12cm, 15cm)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/shop?category=lithophane-products')} className="text-gray-400 hover:text-[#E5C068] transition-colors cursor-pointer">
                  Light-Revealing Lithophanes
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/shop?category=devotional-lamps')} className="text-gray-400 hover:text-[#E5C068] transition-colors cursor-pointer">
                  Devotional Mandir Lamps
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/shop?category=keychains')} className="text-gray-400 hover:text-[#E5C068] transition-colors cursor-pointer">
                  Custom Couple Keychains
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Workshop Location */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Workshop & Store
            </h4>
            <div className="text-xs text-gray-400 space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C89B3C] shrink-0 mt-0.5" />
                <span>{BRAND.address.full}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C89B3C] shrink-0" />
                <a href={`tel:${BRAND.phone}`} className="hover:text-white">
                  +91 {BRAND.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C89B3C] shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-white">
                  {BRAND.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} {BRAND.name}. All Rights Reserved. Crafted with passion for lasting memories.</p>
          <div className="flex items-center gap-4">
            {policyLinks.map((p) => (
              <button key={p.path} onClick={() => handleNav(p.path)} className="hover:text-gray-300 transition-colors cursor-pointer">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
