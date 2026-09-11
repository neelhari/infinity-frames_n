import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Search, ChevronDown, MessageCircle, ChevronRight, ArrowLeft, Sparkles, Printer, ShieldCheck } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function FaqPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      category: "3D Printing & Customization",
      q: "How does a 3D Moon Lamp or Lithophane work?",
      a: "Lithophanes are 3D-sculpted artworks where the thickness of the 3D-printed material varies based on the shading of your photograph. When lit from behind with warm or moonlight LEDs, thicker areas appear dark and thinner areas glow bright, creating an astonishing high-definition photorealistic 3D portrait."
    },
    {
      category: "3D Printing & Customization",
      q: "What kind of photos work best for 3D printing?",
      a: "Clear, close-up portraits with good front lighting and high contrast give the most breathtaking results. Don't worry if your photo needs minor cropping or background cleanup — founder Naresh Kukkala and our CAD team enhance each photo before slicing."
    },
    {
      category: "3D Printing & Customization",
      q: "Can I engrave custom text, names, or dates on the base?",
      a: "Absolutely! You can type your personalized message (e.g., 'Best Dad ❤️', 'Happy Anniversary 14.02.2024', or Spotify song codes) in our live customizer screen. We 3D engrave or UV laser print it directly onto the base."
    },
    {
      category: "Manufacturing & Studio",
      q: "How long does it take to 3D print each customized frame?",
      a: "Quality takes precision: each 15cm Moon Lamp requires 18 to 24 hours of continuous additive manufacturing at 0.12mm layer height in our Drakshramam studio. Once printed, it undergoes LED wiring, touch sensor calibration, and 12-hour burn-in testing."
    },
    {
      category: "Ordering & Delivery",
      q: "What are the shipping charges and delivery timelines?",
      a: `All orders above ₹${BRAND.freeShippingThreshold.toLocaleString('en-IN')} qualify for 100% FREE express shipping. We ship via Bluedart, Delhivery, and DTDC. Delivery takes 3-5 business days across India.`
    },
    {
      category: "Ordering & Delivery",
      q: "Can I place an order directly on WhatsApp?",
      a: `Yes! You can choose your product on the website and click 'Order via WhatsApp', or text Naresh Kukkala directly at +91 ${BRAND.phone} with your photo.`
    },
    {
      category: "Safety & Replacements",
      q: "What if the 3D lamp or frame gets damaged during courier delivery?",
      a: "We pack every order with shockproof multi-layer custom-cut EPE foam and heavy-duty corrugated crating. In the unlikely event of transit damage, simply send us an unboxing video within 48 hours and we will reprint and dispatch a brand new replacement free of charge."
    },
    {
      category: "Payments & Discounts",
      q: "Are there any promo codes available for first-time orders?",
      a: "Yes! Use coupon code 'INFINITY10' or 'FIRST10' during checkout for an instant 10% discount on all customized 3D frames and moon lamps."
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#B38029] py-1 px-2.5 rounded-lg hover:bg-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Go Back</span>
          </button>
          <span className="text-xs font-bold text-[#B38029] bg-[#FAF5EB] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            3D Knowledge Base & Help
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FAF5EB] text-[#B38029] border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-950">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto">
            Everything you need to know about our customized 3D Moon Lamps, Lithophanes, photo requirements, and deliveries from Drakshramam.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto relative pt-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-4.5 top-7" />
            <input
              type="text"
              placeholder="Search 3D printing, photos, shipping..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent shadow-xs outline-hidden"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-200 space-y-2">
              <p className="font-bold text-gray-700 text-sm">No matching questions found</p>
              <p className="text-xs text-gray-500">Ask founder Naresh Kukkala directly on WhatsApp</p>
              <a
                href={waLink("Hi Naresh, I have a question not answered in the FAQ.")}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Chat on WhatsApp
              </a>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:border-[#D4AF37] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FAF5EB] text-[#B38029] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      openIndex === idx ? 'rotate-180 text-[#B38029]' : ''
                    }`}
                  />
                </button>
                {openIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50 bg-[#FAF9F6] pl-14">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Founder WhatsApp CTA */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2E2413] rounded-3xl p-6 sm:p-8 text-white border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-lg text-white">Need a special custom 3D gift made?</h4>
            <p className="text-xs text-gray-300">
              Naresh Kukkala is available on WhatsApp to guide you through sizes and photo selection.
            </p>
          </div>
          <a
            href={waLink("Hello Naresh, I have a unique 3D gift requirement.")}
            target="_blank"
            rel="noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat With Naresh</span>
          </a>
        </div>
      </div>
    </div>
  );
}
