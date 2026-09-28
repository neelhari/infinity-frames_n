import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ChevronRight, ShieldCheck, Lock, CheckCircle2,
  Smartphone, Banknote, Building2, Plus, Check, Edit3, X, Tag,
  ShoppingBag, Sparkles, AlertCircle, Trash2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, addAddress } = useAuth();
  const {
    cartItems,
    subtotal,
    clearCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { saveOrder, settings, coupons } = useStoreData();

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

  // Saved addresses list from user profile
  const savedAddresses = (user?.addresses || []).filter(
    (addr) => !(
      (addr.addressLine === 'Main Road' || addr.street === 'Main Road') &&
      (addr.city === 'Drakshramam' || addr.pincode === '533262')
    )
  );

  // Address View Mode: 'selected' (viewing chosen), 'list' (picking from saved), 'add' (adding new)
  const [addressMode, setAddressMode] = useState(() => (savedAddresses.length > 0 ? 'selected' : 'none'));
  const [selectedAddressId, setSelectedAddressId] = useState(() => savedAddresses[0]?.id || null);

  // Form state for adding/editing address
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    pincode: '',
    addressLine: '',
    city: '',
    email: user?.email || '',
  });

  const [formError, setFormError] = useState('');

  // Coupon input state
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Sync user details into form data if user loads asynchronously
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
      if (savedAddresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(savedAddresses[0].id);
        setAddressMode('selected');
      }
    }
  }, [user, savedAddresses.length, selectedAddressId]);

  // Currently selected active address object
  const activeAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || null;

  // Handle saving new address
  const handleSaveAddress = (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter Full Name.');
      return;
    }
    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      setFormError('Please enter a valid 6-digit PIN Code.');
      return;
    }
    if (!formData.addressLine.trim()) {
      setFormError('Please enter Delivery Address (House / Street / Landmark).');
      return;
    }

    const newAddrObj = {
      id: `addr_${Date.now()}`,
      name: formData.name.trim(),
      phone: cleanPhone,
      pincode: formData.pincode.trim(),
      addressLine: formData.addressLine.trim(),
      city: formData.city.trim() || 'India',
      email: formData.email.trim(),
    };

    if (addAddress) {
      addAddress(newAddrObj);
    }
    setSelectedAddressId(newAddrObj.id);
    setAddressMode('selected');
    setFormError('');
  };

  // Payment Method selection: 'upi' (default), 'cod', 'netbanking'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Exact Arithmetic: Subtotal, Shipping, Discount, Total
  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 1499;
  const shippingCost = Number(settings?.shippingCost) || 50;
  const discount = discountAmount || 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = Math.max(0, subtotal - discount + (cartItems.length > 0 ? shipping : 0));

  // Handle Coupon Apply
  const handleApplyCoupon = (codeToApply) => {
    const code = codeToApply || inputCoupon;
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponError('');
    setCouponSuccess('');
    const res = applyCoupon(code);
    if (res.success) {
      setCouponSuccess(`Coupon '${code.toUpperCase()}' applied successfully!`);
      setInputCoupon('');
    } else {
      setCouponError(res.message || 'Invalid coupon code.');
    }
  };

  const handlePlaceOrder = async () => {
    let finalAddress = activeAddress;

    if (!finalAddress) {
      alert('Please add a delivery address to proceed.');
      setAddressMode('add');
      return;
    }

    setPlacingOrder(true);
    const orderId = `IFN-${Date.now().toString().slice(-6)}`;

    // Prepare order payload for Supabase database
    const orderPayload = {
      id: orderId,
      orderId: orderId,
      customerName: finalAddress.name,
      customerPhone: finalAddress.phone,
      customerEmail: finalAddress.email || user?.email || '',
      address: `${finalAddress.addressLine}, ${finalAddress.city || ''} - ${finalAddress.pincode}`,
      city: finalAddress.city || '',
      state: 'India',
      pincode: finalAddress.pincode,
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
      await saveOrder(finalPayload);

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
      window.open(waLink(whatsappMessage), '_blank');
      navigate('/order-success', { state: { orderData: finalPayload } });
    };

    if (paymentMethod !== 'cod') {
      try {
        await openRazorpayCheckout({
          orderId,
          amount: total,
          customer: {
            fullName: finalAddress.name,
            email: finalAddress.email || user?.email || '',
            phone: finalAddress.phone,
            address: finalAddress.addressLine,
            city: finalAddress.city || '',
            pincode: finalAddress.pincode,
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
      const codPayload = {
        ...orderPayload,
        paymentStatus: 'Pending (COD)',
        paymentMethod: 'CASH ON DELIVERY (COD)',
      };
      await finishOrderAndRedirect(codPayload);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] pb-32 lg:pb-16 font-sans">
      {/* 1. Header with Breadcrumb */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-base sm:text-xl font-bold text-gray-900 leading-tight">
                Order Checkout
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-medium">
                <Link to="/cart" className="hover:text-gray-900">1. Cart</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#B38029] font-bold">2. Address & Payment</span>
                <ChevronRight className="w-3 h-3" />
                <span>3. Done</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">100% Safe & Secure Checkout</span>
            <span className="sm:hidden">Safe Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Container: 2-Column Responsive Layout on Desktop (lg:) / 1-Column on Mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Items, Address, Payment (lg:col-span-7)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* STEP 1: ORDERED PRODUCTS DETAILS & PRICE */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#B38029]" />
                  <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                    Items in Order ({cartItems.length})
                  </h2>
                </div>
                <Link
                  to="/cart"
                  className="text-xs font-bold text-[#B38029] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Cart
                </Link>
              </div>

              {/* Product Items List */}
              <div className="divide-y divide-gray-100 p-4 space-y-3">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="pt-3 first:pt-0 flex gap-4 items-start">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img
                        src={item.image || item.customPhoto || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                          x{item.quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-1">
                        {item.name}
                      </h3>

                      {/* Customization Details Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {item.customName && (
                          <span className="inline-flex items-center text-[10px] bg-amber-50 text-[#B38029] border border-[#D4AF37]/30 px-2 py-0.5 rounded-md font-medium">
                            Text: "{item.customName}"
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.customPhoto && (
                          <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                            ✓ Photo Uploaded
                          </span>
                        )}
                      </div>

                      {/* Quantity & Item Price */}
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-500 font-medium">
                          Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* + Add More Items Button */}
              <div className="p-3 bg-[#FAF8F5] border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium">
                  Want to add more gifts or photo frames?
                </span>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-[#B38029] border border-[#D4AF37]/50 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Items</span>
                </Link>
              </div>
            </div>

            {/* STEP 2: DELIVERY ADDRESS SECTION */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#B38029]" />
                  Delivery Address
                </h2>

                {savedAddresses.length > 0 && activeAddress && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddressMode('list')}
                      className="text-xs font-bold text-[#B38029] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          name: user?.name || '',
                          phone: user?.phone || '',
                          pincode: '',
                          addressLine: '',
                          city: '',
                          email: user?.email || '',
                        });
                        setAddressMode('add');
                      }}
                      className="text-xs font-bold text-[#B38029] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add New
                    </button>
                  </div>
                )}
              </div>

              {activeAddress ? (
                <div className="bg-amber-50/30 border border-[#D4AF37]/30 rounded-xl p-3.5 flex items-start justify-between gap-3 mt-2">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      <span>{activeAddress.name}</span>
                      <span className="bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                        PIN: {activeAddress.pincode}
                      </span>
                    </p>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      {activeAddress.addressLine}{activeAddress.city ? `, ${activeAddress.city}` : ''}
                    </p>
                    <p className="text-gray-500 text-[11px] font-medium pt-0.5">
                      Mobile: <span className="font-semibold text-gray-800">{activeAddress.phone}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddressMode('list')}
                    className="bg-white hover:bg-amber-50 text-[#B38029] border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-2xs transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="mt-2 text-center p-5 border-2 border-dashed border-gray-200 rounded-xl space-y-2.5">
                  <p className="text-xs text-gray-600">
                    No delivery address selected. Add your shipping address to proceed with checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddressMode('add')}
                    className="inline-flex items-center gap-1.5 bg-[#B38029] hover:bg-[#8C5E16] text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase shadow-sm cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Delivery Address</span>
                  </button>
                </div>
              )}
            </div>

            {/* STEP 3: PAYMENT METHOD SELECTION */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
              <h2 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#B38029]" />
                Select Payment Method
              </h2>

              <div className="space-y-2.5 text-xs">
                {/* Option 1: UPI / QR */}
                <label
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-[#B38029] bg-amber-50/40 shadow-xs ring-1 ring-[#B38029]/30' : 'border-gray-200 hover:bg-gray-50'
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 block">UPI / QR (Instant & Recommended)</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-sm">FAST</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] bg-[#5f259f] text-white px-1.5 py-0.5 rounded font-bold">PhonePe</span>
                        <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">GPay</span>
                        <span className="text-[9px] bg-[#002e6e] text-white px-1.5 py-0.5 rounded font-bold">Paytm</span>
                        <span className="text-[9px] bg-gray-800 text-white px-1.5 py-0.5 rounded font-bold">Any UPI</span>
                      </div>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-[#B38029]" />
                </label>

                {/* Option 2: Cash on Delivery (COD) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-[#B38029] bg-amber-50/40 shadow-xs ring-1 ring-[#B38029]/30' : 'border-gray-200 hover:bg-gray-50'
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
                    <div>
                      <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Pay with cash or UPI at delivery doorstep</p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-gray-400" />
                </label>

                {/* Option 3: Net Banking */}
                <label
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'netbanking' ? 'border-[#B38029] bg-amber-50/40 shadow-xs ring-1 ring-[#B38029]/30' : 'border-gray-200 hover:bg-gray-50'
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
                    <div>
                      <span className="font-bold text-gray-900">Net Banking</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">All major Indian banks supported via Razorpay</p>
                    </div>
                  </div>
                  <Building2 className="w-5 h-5 text-gray-400" />
                </label>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Coupon, Summary & Desktop CTA (lg:col-span-5)*/}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-4 mt-4 lg:mt-0 lg:sticky lg:top-24">
            
            {/* APPLY COUPON CARD */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#B38029]" />
                  Apply Coupon
                </h2>
                {appliedCoupon && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Applied
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                    <div>
                      <p className="font-bold text-xs text-emerald-900">
                        {appliedCoupon.code} Applied
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Saved ₹{discount.toLocaleString('en-IN')}!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponSuccess('');
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => {
                        setInputCoupon(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="Coupon Code (e.g. INFINITY10)"
                      className="flex-1 p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs uppercase font-bold text-gray-900 outline-none placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="bg-[#B38029] hover:bg-[#8C5E16] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> {couponSuccess}
                    </p>
                  )}

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">Offers:</span>
                    {['INFINITY10', 'FIRST10'].map((suggested) => (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => handleApplyCoupon(suggested)}
                        className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-[#B38029] border border-[#D4AF37]/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {suggested} (10% OFF)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ORDER PRICE SUMMARY CARD */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3 text-xs">
              <h2 className="font-bold text-gray-900 uppercase tracking-wider mb-2">
                Price Details ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
              </h2>

              <div className="flex items-center justify-between text-gray-600">
                <span>Total MRP / Item Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon Discount ({appliedCoupon?.code || 'Coupon'})
                  </span>
                  <span className="font-bold">- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>

              {shipping === 0 && (
                <p className="text-[10px] text-emerald-600 font-medium">
                  ✓ Free delivery unlocked on your order!
                </p>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between font-bold">
                <span className="text-sm text-gray-900">Total Amount</span>
                <span className="font-serif text-xl text-gray-900">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <div className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold p-2.5 rounded-xl text-center border border-emerald-200/60">
                  🎉 You will save ₹{discount.toLocaleString('en-IN')} on this order!
                </div>
              )}

              {/* Desktop Place Order Button (Inside Sidebar) */}
              <div className="hidden lg:block pt-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cartItems.length === 0}
                  className="w-full bg-[#B38029] hover:bg-[#8C5E16] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4" />
                  <span>{placingOrder ? 'Processing Order...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}</span>
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Encrypted & Safe Razorpay Payment</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {addressMode === 'list' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-gray-900">Select Delivery Address</h3>
              <button
                type="button"
                onClick={() => setAddressMode(activeAddress ? 'selected' : 'none')}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setAddressMode('selected');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    selectedAddressId === addr.id
                      ? 'border-[#B38029] bg-amber-50/50 ring-2 ring-[#B38029]/20 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === addr.id}
                    onChange={() => {
                      setSelectedAddressId(addr.id);
                      setAddressMode('selected');
                    }}
                    className="accent-[#B38029] mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">
                      {addr.name} • <span className="font-normal text-gray-600">{addr.phone}</span>
                    </p>
                    <p className="text-gray-600 mt-0.5 leading-relaxed">
                      {addr.addressLine}{addr.city ? `, ${addr.city}` : ''} - <span className="font-bold">{addr.pincode}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  pincode: '',
                  addressLine: '',
                  city: '',
                  email: user?.email || '',
                });
                setAddressMode('add');
              }}
              className="w-full py-3 border-2 border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-2xl text-xs font-bold text-[#B38029] flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-amber-50/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Address</span>
            </button>
          </div>
        </div>
      )}

      {addressMode === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-gray-900">
                {savedAddresses.length > 0 ? 'Add New Delivery Address' : 'Enter Delivery Address'}
              </h3>
              <button
                type="button"
                onClick={() => setAddressMode(activeAddress ? 'selected' : 'none')}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="6-digit PIN"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="House / Flat No., Street, Area, Landmark"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    City / Town <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City or Town"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Email <span className="text-gray-400 font-normal">(For Invoice)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddressMode(activeAddress ? 'selected' : 'none')}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#B38029] hover:bg-[#8C5E16] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile-Only Sticky Bottom Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Payable</span>
            <span className="font-serif text-lg sm:text-xl font-bold text-gray-900">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || cartItems.length === 0}
            className="flex-1 max-w-xs bg-[#B38029] hover:bg-[#8C5E16] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
          >
            <Lock className="w-4 h-4" />
            <span>{placingOrder ? 'Processing...' : 'Place Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
