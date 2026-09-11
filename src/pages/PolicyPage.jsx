import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, FileText, ChevronRight, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function PolicyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const tabs = [
    { id: '/privacy-policy', label: 'Photo & Privacy Policy', icon: ShieldCheck },
    { id: '/return-policy', label: 'Damage & Replacement Policy', icon: RefreshCw },
    { id: '/shipping-policy', label: 'Shipping & Delivery', icon: Truck },
    { id: '/terms', label: 'Terms of Service', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="pb-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#B38029] py-1 px-2.5 rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 hide-scroll">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = path === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/30'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
          {path === '/privacy-policy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#B38029] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Customer Data & Image Security</span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-gray-950 border-b border-gray-100 pb-3">
                Photo Privacy & Data Protection
              </h1>
              <p>
                At <strong>{BRAND.name}</strong>, owned and operated by <strong>{BRAND.ownerFullName}</strong> in Drakshramam, Andhra Pradesh, we hold the highest standards for safeguarding the photos, names, and memories you entrust to us.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Personal Photo Uploads</h3>
              <p>
                Photographs uploaded through our 3D customizer are strictly used for CAD 3D modeling and lithophane slicing in our workshop. We do not display customer photos publicly or on social media without your explicit prior permission.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Secure Storage & Auto-Purging</h3>
              <p>
                Once your customized 3D Moon Lamp, Acrylic LED plaque, or Lithophane frame is printed, inspected, and safely delivered, customer photo files are automatically archived and removed from our active slicing cache.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">3. Zero Third-Party Sharing</h3>
              <p>
                We never sell, rent, or trade your phone numbers, email addresses, or uploaded media to marketing agencies or third parties.
              </p>
            </div>
          )}

          {path === '/return-policy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#B38029] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Quality Assurance</span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-gray-950 border-b border-gray-100 pb-3">
                Transit Damage & Replacement Policy
              </h1>
              <p>
                Because each 3D creation is custom printed with your unique photo and personal text, returns for change-of-mind are not feasible. However, your peace of mind is guaranteed with our <strong>100% Free Replacement Guarantee</strong>.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Transit Damage or Defective LED Modules</h3>
              <p>
                If your 3D Moon Lamp, wooden stand, or acrylic plaque arrives damaged, broken, or has an LED lighting malfunction, we will reprint and dispatch a brand new replacement immediately at zero cost to you.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Claiming a Free Replacement</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Record a brief 30-second unboxing video while opening the courier parcel.</li>
                <li>Message founder Naresh Kukkala on WhatsApp (+91 {BRAND.phone}) with your Order ID and the video within 48 hours of delivery.</li>
                <li>Your replacement order will be fast-tracked to the front of our 3D print queue within 24 hours.</li>
              </ul>
            </div>
          )}

          {path === '/shipping-policy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#B38029] text-xs font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Fast & Safe Express Logistics</span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-gray-950 border-b border-gray-100 pb-3">
                Shipping & Delivery Timelines
              </h1>
              <p>
                We carefully package and dispatch every customized 3D creation directly from our studio in Drakshramam, Andhra Pradesh to pin codes across India.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Manufacturing Time (3D Print Queue)</h3>
              <p>
                Each high-density 3D Moon Lamp requires 18-24 hours of printing followed by LED assembly and multi-point QC. Standard production takes <strong>1 to 2 business days</strong> before courier handover.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Courier Delivery Timelines</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong className="text-emerald-700">100% FREE Express Shipping</strong> on all orders above ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')}.</li>
                <li>Delivery takes <strong>3 to 5 business days</strong> via Bluedart, Delhivery, or DTDC.</li>
                <li>Tracking details are sent automatically to your WhatsApp number upon courier pickup.</li>
              </ul>
            </div>
          )}

          {path === '/terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#B38029] text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>Legal & Ordering Guidelines</span>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-gray-950 border-b border-gray-100 pb-3">
                Terms of Service
              </h1>
              <p>
                By placing an order on <strong>{BRAND.name}</strong>, you acknowledge that our products are made-to-order personalized 3D printed artifacts.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Image Rights & Permissions</h3>
              <p>
                Customers must possess the necessary personal rights or consent for any images submitted for custom 3D printing. We reserve the right to decline printing offensive or unlawful media.
              </p>

              <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Contact & Jurisdiction</h3>
              <p>
                For any disputes or inquiries, contact Naresh Kukkala at {BRAND.phone} or visit us at {BRAND.address.full}. All agreements are governed by the jurisdiction of Andhra Pradesh, India.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
