import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ChevronRight, ShieldCheck, Lock, CheckCircle2,
  CreditCard, Smartphone, Banknote, Building2, Plus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, subtotal, clearCart, appliedCoupon, discountAmount } = useCart();
  const { saveOrder, settings } = useStoreData();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate]);

  // Address state populated with logged-in user profile
  const [address, setAddress] = useState(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: user?.addresses?.[0]?.addressLine || user?.addresses?.[0]?.street || 'Main Road',
    city: user?.addresses?.[0]?.city || 'Drakshramam',
    pincode: user?.addresses?.[0]?.pincode || '533262',
    state: user?.addresses?.[0]?.state || 'Andhra Pradesh',
  }));

  // Sync address if user loads asynchronously
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Payment Method selection (Screen 8)
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'cod', 'netbanking'
  const [placingOrder, setPlacingOrder] = useState(false);

  // Exact Arithmetic: Subtotal, Shipping, Discount, Total
  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 1499;
  const shippingCost = Number(settings?.shippingCost) || 50;
  const discount = discountAmount || 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = Math.max(0, subtotal - discount + (cartItems.length > 0 ? shipping : 0));

  const handlePlaceOrder = async () => {
    // Validate required address fields
    if (!address.name.trim()) {
      alert('Please enter your Full Name for delivery.');
      setIsEditingAddress(true);
      return;
    }
    if (!address.phone.trim() || address.phone.trim().length < 10) {
      alert('Please enter a valid 10-digit Mobile Number for delivery.');
      setIsEditingAddress(true);
      return;
    }
    if (!address.street.trim() || !address.pincode.trim()) {
      alert('Please enter your Street Address and PIN Code.');
      setIsEditingAddress(true);
      return;
    }

    setPlacingOrder(true);
    const orderId = `IFN-${Date.now().toString().slice(-6)}`;

    // Prepare order payload for Supabase database
    const orderPayload = {
      id: orderId,
      customerName: address.name.trim(),
      customerPhone: address.phone.trim(),
      customerEmail: address.email || user?.email || '',
      address: `${address.street.trim()}, ${address.city.trim()} - ${address.pincode.trim()}, ${address.state.trim()}`,
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      items: cartItems.map((it) => ({
        id: it.id,
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        image: it.image || '',
        customName: it.customName || null,
        customPhoto: it.customPhoto || null,
        selectedSize: it.selectedSize || null,
        selectedColor: it.selectedColor || null,
        selectedFrameColor: it.selectedFrameColor || null,
        selectedFontStyle: it.selectedFontStyle || null,
      })),
      subtotal: subtotal,
      deliveryCharge: shipping,
      totalAmount: total,
      paymentMethod: paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : `RAZORPAY (${paymentMethod.toUpperCase()})`,
      paymentStatus: 'Pending',
      status: 'Pending',
      couponCode: appliedCoupon?.code || null,
    };

    const finishOrderAndRedirect = async (finalPayload) => {
      // 1. Save directly to Supabase
      await saveOrder(finalPayload);

      // 2. Format WhatsApp invoice
      const orderItemsSummary = cartItems
        .map(
          (it, idx) =>
            `${idx + 1}. *${it.name}* (Qty: ${it.quantity}) - ₹${it.price * it.quantity}` +
            (it.customName ? `\n   Custom Text: "${it.customName}"` : '') +
            (it.selectedSize ? `\n   Size: ${it.selectedSize}` : '') +
            (it.customPhoto ? `\n   Photo: [Uploaded]` : '')
        )
        .join('\n\n');

      const whatsappMessage = `*NEW ORDER (${orderId}) - INFINITY FRAMES N*\n\n` +
        `*Customer:* ${finalPayload.customerName}\n` +
        `*Phone:* ${finalPayload.customerPhone}\n` +
        `*Address:* ${finalPayload.address}\n\n` +
        `*Ordered Items:*\n${orderItemsSummary}\n\n` +
        `*Subtotal:* ₹${finalPayload.subtotal}\n` +
        `*Delivery Charge:* ₹${finalPayload.deliveryCharge}\n` +
        (discount > 0 ? `*Discount:* -₹${discount}\n` : '') +
        `*Total Paid:* ₹${finalPayload.totalAmount}\n` +
        `*Payment Method:* ${finalPayload.paymentMethod}\n` +
        `*Payment Status:* ${finalPayload.paymentStatus}\n` +
        (finalPayload.paymentId ? `*Payment ID:* ${finalPayload.paymentId}\n\n` : '\n') +
        `Please confirm my custom order!`;

      clearCart();
      setPlacingOrder(false);
      // Open WhatsApp directly for fulfillment & redirect to success
      window.open(waLink(whatsappMessage), '_blank');
      navigate('/order-success');
    };

    // If online payment (UPI, Cards, NetBanking), invoke Razorpay Checkout
    if (paymentMethod !== 'cod') {
      try {
        await openRazorpayCheckout({
          orderId,
          amount: total, // e.g. 550 INR (converted to 55000 paise in razorpay.js)
          customer: {
            fullName: address.name,
            email: address.email || user?.email || '',
            phone: address.phone,
            address: address.street,
            city: address.city,
            pincode: address.pincode,
          },
          description: `Order ${orderId} - ₹${total}`,
          onSuccess: async (razorpayResponse) => {
            const paidPayload = {
              ...orderPayload,
              paymentStatus: 'Paid',
              paymentId: razorpayResponse.razorpay_payment_id,
              paymentMethod: `Razorpay (${paymentMethod.toUpperCase()})`,
            };
            await finishOrderAndRedirect(paidPayload);
          },
          onFailure: (err) => {
            setPlacingOrder(false);
            const msg = err?.description || err?.message || 'Payment was cancelled or could not be completed.';
            alert(`Payment Notice: ${msg}\nYour cart items are safe. You can retry or choose Cash on Delivery.`);
          },
          onDismiss: () => {
            setPlacingOrder(false);
          },
        });
      } catch (e) {
        setPlacingOrder(false);
        alert('Could not open Razorpay checkout: ' + e.message);
      }
    } else {
      // Cash on Delivery flow
      const codPayload = {
        ...orderPayload,
        paymentStatus: 'Pending (COD)',
        paymentMethod: 'CASH ON DELIVERY (COD)',
      };
      await finishOrderAndRedirect(codPayload);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-32 font-sans">
      {/* 1. Header (Screen 8: Back arrow, "Checkout") */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-base sm:text-lg font-bold text-gray-900">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* 2. Shipping Address Card (Screen 8) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-[#B38029] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h2 className="font-bold text-gray-900">Shipping Address</h2>
                <p className="text-gray-600 font-medium mt-1">
                  <span className="font-bold text-gray-800">{address.name}</span> &bull; {address.phone}
                </p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  {address.street}, {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs font-bold text-[#B38029] hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
            >
              <span>{isEditingAddress ? 'Close' : 'Change'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Address Edit Drawer */}
          {isEditingAddress && (
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
              <input
                type="text"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                placeholder="Full Name"
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none"
              />
              <input
                type="text"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="Phone Number"
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none"
              />
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="House / Street / Landmark"
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City / Village"
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none"
                />
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="PIN Code"
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="w-full bg-[#B38029] text-white py-2 rounded-xl font-bold cursor-pointer"
              >
                Save Delivery Address
              </button>
            </div>
          )}
        </div>

        {/* 3. Payment Method Card (Screen 8: UPI, Cards, COD, Net Banking) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4 space-y-3">
          <h2 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Payment Method
          </h2>

          <div className="space-y-2 text-xs">
            {/* Option 1: UPI / QR (Screen 8) */}
            <label
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'upi' ? 'border-[#B38029] bg-amber-50/40 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="accent-[#B38029]"
                />
                <div>
                  <span className="font-bold text-gray-900 block">UPI / QR (PhonePe, GPay, Paytm)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] bg-[#5f259f] text-white px-1.5 py-0.5 rounded font-bold">PhonePe</span>
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">GPay</span>
                    <span className="text-[9px] bg-[#002e6e] text-white px-1.5 py-0.5 rounded font-bold">Paytm</span>
                  </div>
                </div>
              </div>
              <Smartphone className="w-5 h-5 text-[#B38029]" />
            </label>

            {/* Option 2: Credit / Debit Card (Screen 8) */}
            <label
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'card' ? 'border-[#B38029] bg-amber-50/40 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-[#B38029]"
                />
                <span className="font-bold text-gray-900">Credit / Debit Card</span>
              </div>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </label>

            {/* Option 3: Cash on Delivery (Screen 8) */}
            <label
              onClick={() => setPaymentMethod('cod')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'cod' ? 'border-[#B38029] bg-amber-50/40 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-[#B38029]"
                />
                <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
              </div>
              <Banknote className="w-5 h-5 text-gray-400" />
            </label>

            {/* Option 4: Net Banking (Screen 8) */}
            <label
              onClick={() => setPaymentMethod('netbanking')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'netbanking' ? 'border-[#B38029] bg-amber-50/40 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                  className="accent-[#B38029]"
                />
                <span className="font-bold text-gray-900">Net Banking</span>
              </div>
              <Building2 className="w-5 h-5 text-gray-400" />
            </label>
          </div>
        </div>

        {/* 4. Order Summary Card (Screen 8) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2 text-xs">
          <h2 className="font-bold text-gray-900 uppercase tracking-wider mb-2">
            Order Summary
          </h2>

          <div className="flex items-center justify-between text-gray-600">
            <span>{cartItems.length} items</span>
            <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Discount ({appliedCoupon?.code || 'Coupon'})</span>
              <span className="font-bold">- ₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-gray-600">
            <span>Shipping</span>
            <span className="font-bold text-gray-900">
              {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shipping}`}
            </span>
          </div>

          <div className="pt-2.5 border-t border-gray-100 flex items-baseline justify-between font-bold">
            <span className="text-sm text-gray-900">Total</span>
            <span className="font-serif text-lg text-gray-900">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 5. Fixed Bottom "Place Order" Button (Screen 8) */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-xl mx-auto space-y-2">
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || cartItems.length === 0}
              className="w-full bg-[#B38029] hover:bg-[#8C5E16] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>{placingOrder ? 'Processing Order...' : `Place Order &bull; ₹${total.toLocaleString('en-IN')}`}</span>
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your order is safe & secure</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
