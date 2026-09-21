import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Truck, Calendar, MessageCircle, Phone, ArrowRight, Home, ShieldCheck, Sparkles, Printer } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  const defaultOrderId = `IFN-${Math.floor(100000 + Math.random() * 900000)}`;

  const orderId = orderData?.id || orderData?.orderId || defaultOrderId;
  const items = orderData?.items || [];
  const customer = orderData?.customer || {};
  const totalAmount = orderData?.totalAmount || 0;
  const paymentId = orderData?.paymentId || null;
  const paymentStatus = orderData?.paymentStatus || 'Pending';
  const paymentMethod = orderData?.paymentMethod || 'Online / WhatsApp';

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Celebration Header Card */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#B38029] bg-[#FAF5EB] px-3 py-1 rounded-full border border-[#D4AF37]/30">
              3D Order Successfully Placed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-950">
              Thank You For Choosing {BRAND.name}!
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto">
              Your customized gift order has been forwarded to our 3D printing studio in Drakshramam. Our team led by <strong>Naresh Kukkala</strong> has queued it for 3D slicing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#FAF5EB] border border-[#D4AF37]/30 px-4 py-2 rounded-2xl text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Order ID:</span>
              <span className="font-mono font-black text-[#B38029] text-sm sm:text-base">{orderId}</span>
            </div>

            {totalAmount > 0 && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs sm:text-sm">
                <span className="text-emerald-700 font-medium">Total:</span>
                <span className="font-serif font-black text-emerald-900 text-sm sm:text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Payment:</span>
              <span className={`font-bold ${paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {paymentStatus === 'Paid' ? `Paid (${paymentId ? paymentId.slice(-8) : 'Razorpay'})` : 'COD / Pending'}
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Confirm Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waLink(`Hi Naresh, I just placed order #${orderId} on Infinity Frames N. Total Amount: ₹${totalAmount.toLocaleString('en-IN')}. Please confirm receipt of photo and customization details.`)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share Photos & Confirm on WhatsApp</span>
            </a>

            <Link
              to="/account?tab=orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-gray-800 text-[#D4AF37] text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <span>Track 3D Progress</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3D Manufacturing Timeline Info */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2E2413] rounded-3xl p-6 sm:p-8 text-white border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Printer className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg">Next Steps for Your 3D Creation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 space-y-1">
              <div className="font-bold text-[#D4AF37]">1. CAD Lithophane Slicing</div>
              <p className="text-gray-300">Your photo is mapped into microscopic 0.12mm relief layers for maximum light contrast.</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 border border-white/10 space-y-1">
              <div className="font-bold text-[#D4AF37]">2. 3D Filament Printing</div>
              <p className="text-gray-300">Printed over 18-24 hours using eco-friendly biodegradable white PLA in Drakshramam.</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 border border-white/10 space-y-1">
              <div className="font-bold text-[#D4AF37]">3. Shockproof Dispatch</div>
              <p className="text-gray-300">Packed in foam & wooden crating, arriving by {formattedDeliveryDate} via Express courier.</p>
            </div>
          </div>
        </div>

        {/* Return to Home CTA */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#B38029] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
