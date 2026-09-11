import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send, CheckCircle2, User, HelpCircle, ChevronDown, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';
import { saveContactMessageToSupabase } from '../lib/supabase';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    occasion: 'Anniversary Gift',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please provide your full name';
    if (!formData.phone.trim()) {
      errs.phone = 'WhatsApp phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit number';
    }
    if (!formData.message.trim()) errs.message = 'Please tell us what customized gift you need';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    await saveContactMessageToSupabase(formData);
    setSubmitting(false);
    setSubmitted(true);
  };

  const contactCards = [
    {
      icon: <MessageCircle className="w-7 h-7 text-[#25D366]" />,
      title: "Direct WhatsApp",
      detail: `+91 ${BRAND.phone}`,
      subdetail: "Instant response for photo proofs & custom orders",
      href: waLink(`Hello Naresh, I'm interested in ordering a customized 3D gift from Infinity Frames N.`),
      actionText: "Chat On WhatsApp",
      highlight: true
    },
    {
      icon: <Phone className="w-7 h-7 text-[#B38029]" />,
      title: "Founder Contact",
      detail: `${BRAND.ownerFullName}`,
      subdetail: `+91 ${BRAND.phone} (9 AM - 9 PM IST)`,
      href: `tel:${BRAND.phone}`,
      actionText: "Call Naresh Now",
      highlight: false
    },
    {
      icon: <MapPin className="w-7 h-7 text-emerald-600]" />,
      title: "3D Printing Studio",
      detail: "Drakshramam, Andhra Pradesh",
      subdetail: "Near Bhimeswara Swamy Temple - 533262",
      href: "https://maps.google.com/?q=Drakshramam+Andhra+Pradesh",
      actionText: "Open Location Map",
      highlight: false
    }
  ];

  const faqs = [
    {
      q: "How do I submit my photo for 3D Moon Lamps or Lithophanes?",
      a: "You can upload your photo directly on the product customizer screen during order placement, or simply send the high-resolution photo on WhatsApp to +91 9494066914 along with your order ID."
    },
    {
      q: "How long does it take to 3D print and deliver my customized gift?",
      a: "Each 3D moon lamp or lithophane takes 18-24 hours of continuous high-precision printing to achieve smooth light diffusion. Orders are dispatched within 24-48 hours and delivered within 3-5 business days across India via Bluedart Express."
    },
    {
      q: "Can I see a 3D digital preview before you start printing?",
      a: "Yes! Our product customizer provides an instant live preview of your uploaded photo and engraved text on the frame. Additionally, Naresh can share a digital proof on WhatsApp before 3D slicing upon request."
    },
    {
      q: "What materials do you use for the 3D frames and lamps?",
      a: "We use 100% premium, eco-friendly, biodegradable PLA biopolymers imported for optical diffusion, paired with natural solid wooden bases and touch-sensitive dimmable LED modules."
    },
    {
      q: "What if the 3D gift arrives damaged during courier transit?",
      a: "We pack all customized gifts in shock-absorbing multi-layer foam and wooden-reinforced boxes. In the rare event of transit damage, we provide a 100% free re-print and expedited replacement upon sharing an unboxing video."
    }
  ];

  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-8 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#FAF5EB] text-[#B38029] border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Screen 12 • Contact & Direct Assistance</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950">
          Get in Touch with {BRAND.name}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Need a personalized 3D gift for an upcoming anniversary, birthday, or corporate event? Talk directly to founder <strong>Naresh Kukkala</strong>.
        </p>
      </section>

      {/* Contact Cards Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
        {contactCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 text-center ${
              card.highlight
                ? 'border-[#25D366] shadow-lg ring-2 ring-[#25D366]/20 relative overflow-hidden'
                : 'border-gray-200 hover:border-[#D4AF37] hover:shadow-md'
            }`}
          >
            {card.highlight && (
              <span className="absolute top-0 right-0 bg-[#25D366] text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Instant Response
              </span>
            )}
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF5EB] border border-[#D4AF37]/30 mx-auto flex items-center justify-center">
                {card.icon}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">{card.title}</h3>
                <p className="font-mono text-sm font-black text-[#B38029] mt-0.5">{card.detail}</p>
                <p className="text-xs text-gray-500 mt-1">{card.subdetail}</p>
              </div>
            </div>

            <a
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                card.highlight
                  ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md'
                  : 'bg-gray-950 hover:bg-gray-800 text-[#D4AF37]'
              }`}
            >
              <span>{card.actionText}</span>
            </a>
          </div>
        ))}
      </section>

      {/* Main Grid: Form & FAQs */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" data-aos="fade-up">
        {/* Contact Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold text-[#B38029] uppercase tracking-wider">Custom Gift Request</span>
            <h3 className="font-serif font-bold text-2xl text-gray-900 mt-1">Send Us Your Requirement</h3>
            <p className="text-xs text-gray-500 mt-1">
              Share details about your desired 3D frame, lamp, or lithophane.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-emerald-900">Thank You! Message Received</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Naresh Kukkala will contact you on WhatsApp (+91 {formData.phone}) within a few hours.
                </p>
              </div>
              <a
                href={waLink(`Hi Naresh, I just submitted a custom gift request on the website for: ${formData.occasion}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs hover:brightness-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Speed Up on WhatsApp</span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Varma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-hidden"
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-hidden"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Occasion / Gift Type</label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-hidden bg-white"
                  >
                    <option value="Anniversary Gift">Anniversary Gift</option>
                    <option value="Birthday Gift">Birthday Gift</option>
                    <option value="Wedding / Couple Gift">Wedding / Couple Gift</option>
                    <option value="Devotional / Pooja Room Lamp">Devotional / Pooja Lamp</option>
                    <option value="Memorial Frame">Memorial Frame</option>
                    <option value="Corporate / Bulk Order">Corporate / Bulk Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message / Customization Details *</label>
                <textarea
                  rows={3}
                  placeholder="Describe your photo, text to be engraved, required size, or required delivery date..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-hidden"
                />
                {errors.message && <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-gray-800 text-[#D4AF37] text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Send Custom Gift Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#B38029] uppercase tracking-wider">Help & Answers</span>
            <h3 className="font-serif font-bold text-2xl text-gray-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-[#B38029]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50 bg-[#FAF9F6]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Direct Support Box */}
          <div className="bg-[#FAF5EB] rounded-2xl p-5 border border-[#D4AF37]/30 flex items-center justify-between gap-4">
            <div>
              <h5 className="font-serif font-bold text-sm text-gray-900">Still have a unique gift idea?</h5>
              <p className="text-xs text-gray-600 mt-0.5">Send your concept photo directly to Naresh on WhatsApp</p>
            </div>
            <a
              href={waLink("Hi Naresh, I have a unique customized 3D gift idea.")}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
