import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ChevronRight, ShieldCheck, Lock, CheckCircle2,
  Smartphone, Banknote, Building2, Plus, Check, Edit3, X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, addAddress } = useAuth();
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

  // Saved addresses list from user profile (filtering out old legacy dummy hardcoded address)
  const savedAddresses = (user?.addresses || []).filter(
    (addr) => !(
      (addr.addressLine === 'Main Road' || addr.street === 'Main Road') &&
      (addr.city === 'Drakshramam' || addr.pincode === '533262')
    )
  );

  // Address View Mode: 'selected' (viewing chosen), 'list' (picking from saved), 'add' (adding new)
  const [addressMode, setAddressMode] = useState(() => (savedAddresses.length > 0 ? 'selected' : 'add'));
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

  // Payment Method selection: 'upi' (default), 'cod', 'netbanking' (Credit/Debit removed as requested)
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Exact Arithmetic: Subtotal, Shipping, Discount, Total
  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 1499;
  const shippingCost = Number(settings?.shippingCost) || 50;
  const discount = discountAmount || 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = Math.max(0, subtotal - discount + (cartItems.length > 0 ? shipping : 0));

  const handlePlaceOrder = async () => {
    // Validate that an address is selected or filled
    let finalAddress = activeAddress;

    if (!finalAddress) {
      if (addressMode === 'add') {
        if (!formData.name.trim() || !formData.phone.trim() || !formData.pincode.trim() || !formData.addressLine.trim()) {
          setFormError('Please fill in all required delivery address fields (*).');
          return;
        }
        finalAddress = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          pincode: formData.pincode.trim(),
          addressLine: formData.addressLine.trim(),
          city: formData.city.trim() || 'India',
          email: formData.email.trim(),
        };
      } else {
        alert('Please add a delivery address to proceed.');
        setAddressMode('add');
        return;
      }
    }

    setPlacingOrder(true);
    const orderId = `IFN-${Date.now().toString().slice(-6)}`;

    // Prepare order payload for Supabase database
    const orderPayload = {
      id: orderId,
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
      window.open(waLink(whatsappMessage), '_blank');
      navigate('/order-success', { state: { orderData: finalPayload } });
    };

    // If online payment (UPI or Net Banking), invoke Razorpay Checkout
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
      {/* 1. Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-base sm:text-lg font-bold text-gray-900">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* 2. SHIPPING ADDRESS CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-[#B38029] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-gray-900">Delivery Address</h2>
            </div>

            {/* Quick toggle buttons when in selected mode */}
            {addressMode === 'selected' && activeAddress && (
              <div className="flex items-center gap-2">
                {savedAddresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAddressMode('list')}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline cursor-pointer"
                  >
                    Change
                  </button>
                )}
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
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              </div>
            )}
          </div>

          {/* STATE A: Display Selected Address */}
          {addressMode === 'selected' && activeAddress && (
            <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-200/60">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{activeAddress.name}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> Delivering Here
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{activeAddress.phone}</p>
                  <p className="text-gray-600 leading-relaxed">
                    {activeAddress.addressLine}
                    {activeAddress.city ? `, ${activeAddress.city}` : ''} - <span className="font-bold">{activeAddress.pincode}</span>
                  </p>
                  {activeAddress.email && (
                    <p className="text-gray-400 text-[11px]">{activeAddress.email}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: activeAddress.name,
                      phone: activeAddress.phone,
                      pincode: activeAddress.pincode,
                      addressLine: activeAddress.addressLine,
                      city: activeAddress.city || '',
                      email: activeAddress.email || user?.email || '',
                    });
                    setAddressMode('add');
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Edit this address"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons below selected address */}
              <div className="mt-3 pt-2.5 border-t border-amber-200/40 flex items-center justify-between text-xs">
                {savedAddresses.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setAddressMode('list')}
                    className="font-bold text-[#B38029] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Saved Addresses ({savedAddresses.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : <span />}

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
                  className="font-bold text-gray-700 hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Another Address</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE B: Pick from Saved Addresses list */}
          {addressMode === 'list' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-gray-700">Choose a saved address:</span>
                <button
                  type="button"
                  onClick={() => setAddressMode('selected')}
                  className="text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>

              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setAddressMode('selected');
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                    selectedAddressId === addr.id
                      ? 'border-[#B38029] bg-amber-50/40'
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
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{addr.name} &bull; <span className="font-normal text-gray-600">{addr.phone}</span></p>
                    <p className="text-gray-600 mt-0.5">{addr.addressLine}, {addr.city} - {addr.pincode}</p>
                  </div>
                </div>
              ))}

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
                className="w-full py-2.5 mt-2 border-2 border-dashed border-gray-300 hover:border-[#B38029] rounded-xl text-xs font-bold text-gray-700 hover:text-[#B38029] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>
          )}

          {/* STATE C: Add / Edit Address Form with Clear Required Fields & Star Marks */}
          {addressMode === 'add' && (
            <form onSubmit={handleSaveAddress} className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <p className="font-bold text-gray-800">
                  {savedAddresses.length > 0 ? 'Add New Delivery Address' : 'Enter Delivery Address'}
                </p>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAddressMode('selected')}
                    className="text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>

              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* 1. Full Name * */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Receiver's full name"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                />
              </div>

              {/* 2. Mobile Number * & 3. PIN Code * */}
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
                    placeholder="10-digit mobile number"
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
                    placeholder="6-digit postal PIN"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              {/* 4. Delivery Address * */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="House / Flat No., Building, Street, Area, Landmark"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none resize-none"
                />
              </div>

              {/* City & Email (Optional) */}
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
                    Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="For order invoice"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#B38029] hover:bg-[#8C5E16] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer mt-1"
              >
                Save Delivery Address
              </button>
            </form>
          )}
        </div>

        {/* 3. PAYMENT METHOD CARD (Credit / Debit Card removed as requested) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4 sm:p-5 space-y-3">
          <h2 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Payment Method
          </h2>

          <div className="space-y-2 text-xs">
            {/* Option 1: UPI / QR (Default) */}
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

            {/* Option 2: Cash on Delivery (COD) */}
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

            {/* Option 3: Net Banking */}
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

        {/* 4. Order Summary Card */}
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

        {/* 5. Fixed Bottom "Place Order" Button with Clean Bullet */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-xl mx-auto space-y-2">
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || cartItems.length === 0}
              className="w-full bg-[#B38029] hover:bg-[#8C5E16] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>{placingOrder ? 'Processing Order...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}</span>
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
