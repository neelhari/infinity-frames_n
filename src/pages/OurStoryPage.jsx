import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShieldCheck, Award, Users, Sparkles, CheckCircle2, ArrowRight, Printer, Layers, Eye, MapPin, Phone, MessageCircle } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function OurStoryPage() {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Layers className="w-8 h-8 text-[#D4AF37]" />,
      title: "0.12mm Micro-Layer Precision",
      desc: "Our industrial 3D printers build lithophanes and lamps layer-by-layer over 18-36 hours for photorealistic light diffusion."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />,
      title: "Eco-Friendly PLA & Crystal Acrylic",
      desc: "We use non-toxic, plant-based biopolymer filaments and scratch-resistant cast acrylics that remain vibrant for decades."
    },
    {
      icon: <Eye className="w-8 h-8 text-[#D4AF37]" />,
      title: "Live Preview & Proof Approval",
      desc: "Before we trigger the 3D printer bed, you see your photo & custom text rendered live. We also send WhatsApp proofs upon request."
    },
    {
      icon: <Award className="w-8 h-8 text-[#D4AF37]" />,
      title: "Handcrafted in Drakshramam",
      desc: "Every creation is personally sliced, printed, wired with warm LED sensors, and tested by Naresh Kukkala and our local artisans."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-8 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#FAF5EB] text-[#B38029] border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Screen 11 • About Us</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-gray-950 leading-tight">
          The Craft Behind <br />
          <span className="bg-gradient-to-r from-[#B38029] via-[#D4AF37] to-[#B38029] bg-clip-text text-transparent">
            {BRAND.name}
          </span>
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Transforming ordinary digital photographs into breathtaking 3D lamps, lithophanes, and illuminated acrylic art.
        </p>
      </section>

      {/* Main Brand Narrative */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" data-aos="fade-up">
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#1A1A1A]">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80"
              alt="3D Printing Workshop Infinity Frames N"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  Drakshramam Studio
                </span>
                <p className="text-white font-serif text-lg font-bold">
                  Precision 3D Filament Printing & Laser Craft
                </p>
              </div>
            </div>
          </div>

          {/* Floating Founder Card */}
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hidden sm:flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#B38029] to-[#D4AF37] rounded-full flex items-center justify-center text-gray-950 font-serif font-black text-xl shadow-md">
              NK
            </div>
            <div>
              <h5 className="font-serif font-bold text-sm text-gray-900">{BRAND.ownerFullName}</h5>
              <p className="text-xs text-[#B38029] font-bold">Founder & 3D Artist</p>
              <p className="text-[10px] text-gray-400">Drakshramam, Andhra Pradesh</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#B38029] bg-[#FAF5EB] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Our Mission & Origin
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">
            Small Ideas, Deep Emotions, Timeless 3D Dimensions
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Founded in the historic town of Drakshramam by Naresh Kukkala, <strong>Infinity Frames N</strong> was born from a singular passion: photographs shouldn't stay locked inside smartphone galleries.
          </p>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            By combining additive manufacturing (3D printing) with precision optical lithophanes and warm LED backlighting, we turn weddings, anniversaries, birthdays, and devotional deities into glowing, tactile centerpieces that light up your home every night.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              to="/shop"
              className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 text-xs font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore 3D Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={waLink("Hi Naresh, I would like to know more about custom 3D gifts and frames.")}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-800 text-xs font-bold px-5 py-3 rounded-xl border border-[#25D366]/30 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="max-w-6xl mx-auto space-y-8" data-aos="fade-up">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#B38029]">
            The Infinity Guarantee
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Why Thousands Choose Infinity Frames N
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#D4AF37] hover:shadow-lg transition-all space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FAF5EB] border border-[#D4AF37]/30 flex items-center justify-center">
                {v.icon}
              </div>
              <h4 className="font-serif font-bold text-base text-gray-900">{v.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workshop Location Banner */}
      <section className="max-w-4xl mx-auto bg-gradient-to-r from-[#1A1A1A] to-[#2E2413] text-white p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[#D4AF37] text-xs font-bold">
            <MapPin className="w-4 h-4" />
            <span>Studio & Dispatch Hub</span>
          </div>
          <h4 className="font-serif text-xl sm:text-2xl font-bold">Visit or Collect from Drakshramam</h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            Near Sri Bhimeswara Swamy Temple, Main Road, Drakshramam, Konaseema Dist, Andhra Pradesh - 533262.
          </p>
        </div>
        <a
          href="https://maps.google.com/?q=Drakshramam+Andhra+Pradesh"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-[#D4AF37] text-gray-950 text-xs font-extrabold px-5 py-3 rounded-xl hover:brightness-105 transition-all shadow-md shrink-0"
        >
          View On Google Maps
        </a>
      </section>
    </div>
  );
}
