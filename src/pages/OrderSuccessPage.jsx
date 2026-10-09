import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, ShoppingBag, Truck, Calendar, MessageCircle,
  MapPin, CreditCard, ArrowRight, Home, ShieldCheck, Sparkles, Tag
} from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve order from router state or fallback to persisted sessionStorage / localStorage
  const orderData = location.state?.orderData || (() => {
    try {
      const saved = sessionStorage.getItem('last_order') || localStorage.getItem('last_order');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-[#B38029] rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-950">Looking for Your Orders?</h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            All your placed orders, invoices, and delivery tracking details are securely saved in your customer account.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to="/account?tab=orders"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-[#D4AF37] font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-md transition-all text-center"
            >
              <span>View My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all text-center"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const defaultOrderId = `IFN-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = orderData.id || orderData.orderId || defaultOrderId;
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const customerName = orderData.customerName || orderData.customer?.name || '';
  const customerPhone = orderData.customerPhone || orderData.customer?.phone || '';
  const address = orderData.address || '';
  const totalAmount = orderData.totalAmount || 0;
  const subtotal = orderData.subtotal || totalAmount;
  const deliveryCharge = orderData.deliveryCharge || 0;
  const paymentMethod = orderData.paymentMethod || 'Cash on Delivery (COD)';
  const paymentStatus = orderData.paymentStatus || 'Pending';
  const isCOD = (paymentMethod || '').toLowerCase().includes('cod');
  const isPaid = paymentStatus === 'Paid' || (!isCOD && (paymentMethod || '').toLowerCase().includes('paid'));

  // Calculate estimated delivery: 4 to 6 business days
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 1. Order Confirmed Celebration Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#B38029] bg-[#FAF5EB] px-3 py-1 rounded-full border border-[#D4AF37]/30">
              Order Confirmed
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-gray-950 pt-1">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Your order has been recorded. Our 3D workshop team led by <strong>Naresh Kukkala</strong> has received your order for production.
            </p>
          </div>

          {/* Order ID & Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="text-gray-500 font-medium">Order ID:</span>
              <span className="font-mono font-black text-gray-900">{orderId}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
              <span>{isCOD ? '💵 Cash on Delivery' : isPaid ? '💳 Paid Online' : '💳 Online Payment'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900">
              <Truck className="w-3.5 h-3.5" />
              <span>Arriving by {formattedDeliveryDate}</span>
            </div>
          </div>
        </div>

        {/* 2. Delivery Address & Customer Details Card */}
        {address && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2.5">
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B38029]" />
              <span>Delivery Address</span>
            </h2>
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">
                {customerName} {customerPhone ? `• ${customerPhone}` : ''}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {address}
              </p>
            </div>
          </div>
        )}

        {/* 3. Items Ordered Receipt Card */}
        {items.length > 0 && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#B38029]" />
                <span>Items in This Order ({items.length})</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => {
                const itemPhoto = item.customPhoto || item.image;
                return (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                    {itemPhoto && (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img
                          src={itemPhoto}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {item.quantity > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9.5px] font-bold px-1.5 py-0.2 rounded-md">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                          {item.name}
                        </h3>
                        <span className="font-bold text-xs sm:text-sm text-gray-900 shrink-0">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500">
                        Qty: {item.quantity || 1} • ₹{item.price} each
                      </div>

                      {/* Customization Details Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.customName && (
                          <span className="inline-flex items-center text-[10px] bg-amber-50 text-[#B38029] border border-[#D4AF37]/40 px-2 py-0.5 rounded-md font-bold">
                            ✍️ Custom Text: "{item.customName}"
                          </span>
                        )}
                        {item.customPhoto && (
                          <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                            📷 Custom Photo Attached
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                            Style: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Payment & Price Summary Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3 text-xs">
          <h2 className="font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#B38029]" />
            <span>Payment Summary</span>
          </h2>

          <div className="space-y-1.5 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-gray-600">
              <span>Item Subtotal</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-gray-900">
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 font-bold text-sm">
              <span className="text-gray-900">Total Payable</span>
              <span className="font-serif text-base text-gray-950">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 text-[11px] text-gray-500">
              Payment Method: <span className="font-bold text-gray-900">{paymentMethod}</span>
              {isCOD && <span className="block text-amber-800 font-semibold mt-0.5">• Please keep cash or UPI ready at delivery doorstep.</span>}
            </div>
          </div>
        </div>

        {/* 5. Clean Action Buttons: My Orders & Continue Shopping */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/account?tab=orders"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-[#D4AF37] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all text-center"
          >
            <span>View in My Orders & Track</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xs transition-all text-center"
          >
            <ShoppingBag className="w-4 h-4 text-gray-500" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* 6. Optional Discreet Support Link */}
        <div className="text-center pt-2">
          <a
            href={waLink(`Hi Naresh, I am checking on my order #${orderId} on Infinity Frames N.`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-700 font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Have questions about your order? Chat with us on WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
