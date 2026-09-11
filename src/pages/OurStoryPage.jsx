import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, Award, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function OurStoryPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#F8F0F0] text-[#6B1518] border border-[#EADEDF] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#D3923A]" />
          <span>Our Journey & Values</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          The Story of {BRAND.name}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          {BRAND.tagline} — {BRAND.subTagline}
        </p>
      </section>

      {/* Main Brand Narrative */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" data-aos="fade-up">
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] sm:aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#FAF8F5]">
            <img
              src="/products/saree-placeholder.png"
              alt={`${BRAND.name} Heritage`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating Owner Card */}
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hidden sm:flex items-center gap-3">
            <div className="w-12 h-12 bg-[#6B1518] rounded-full flex items-center justify-center text-[#D3923A] font-serif font-bold text-xl">
              AV
            </div>
            <div>
              <h5 className="font-serif font-bold text-sm text-gray-900">{BRAND.ownerFullName}</h5>
              <p className="text-xs text-[#6B1518] font-semibold">Founder & Owner</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D3923A]">Who We Are</span>
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Style & Quality Created With Passion
          </h2>
          {BRAND.about.split('\n\n').map((para, idx) => (
            <p key={idx} className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Vision & Mission Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up">
        {/* Vision */}
        <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-gray-100 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F0F0] flex items-center justify-center text-[#6B1518]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">Our Vision</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Our vision is to make beautiful, stylish fashion accessible to everyone, ensuring that every customer feels regal and confident on every occasion without high price tags.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-[#F8F0F0] p-8 rounded-3xl border border-[#EADEDF] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#6B1518]">
            <Heart className="w-6 h-6 fill-[#6B1518]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">Our Mission</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Our mission is to offer handpicked sarees, ethnic and contemporary womenswear, and fine fabrics — each piece inspected for quality, durability, and elegance.
          </p>
        </div>
      </section>

      {/* What We Believe (Core Values) */}
      <section className="space-y-8" data-aos="fade-up">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D3923A]">Guiding Principles</span>
          <h2 className="font-serif text-3xl font-bold text-gray-900">What We Believe In</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#6B1518]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Authentic Quality</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every fabric and item undergoes strict quality checks before reaching your hands.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#6B1518]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Honest Pricing</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Transparent and affordable rates for high fashion, guaranteed without hidden fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#6B1518]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Customer Delight</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              We treat every customer like family, ensuring personal WhatsApp support and guidance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#6B1518]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Timeless Elegance</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Designs that remain graceful, versatile, and stylish across festive occasions and daily wear.
            </p>
          </div>
        </div>
      </section>

      {/* Final Callout Banner */}
      <section className="bg-[#6B1518] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl" data-aos="fade-up">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="font-serif text-3xl font-bold">Experience the {BRAND.name} Distinction</h3>
          <p className="text-gray-200 text-xs sm:text-sm">
            Have questions about saree weaves or fabric choices? Talk directly to {BRAND.ownerName} on WhatsApp!
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-[#D3923A] hover:bg-[#B37C31] text-[#6B1518] px-8 py-3 rounded-xl font-extrabold text-sm inline-flex items-center gap-2 transition-transform hover:scale-105 shadow-md"
          >
            <span>Get in Touch With Us</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
