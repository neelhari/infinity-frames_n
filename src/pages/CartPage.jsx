import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, X, Plus, Minus, Tag, ChevronRight, ShoppingBag, ShieldCheck, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    freeShippingThreshold = 1499,
    shippingCost = 50,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');

  // Math
  const discount = discountAmount || 0;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shipping = cartItems.length > 0 ? (isFreeShipping ? 0 : shippingCost) : 0;
  const total = Math.max(0, subtotal - discount + shipping);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponMsg('');
    setCouponError('');
    const res = applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponMsg(`Coupon '${res.coupon.code}' applied! Saved ₹${discountAmount || ''}`);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-32 lg:pb-16 font-sans">
      
      {/* 1. Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-base sm:text-xl font-bold text-gray-900">
              Shopping Cart {cartItems.length > 0 && `(${cartItems.length})`}
            </h1>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all items from your cart?')) {
                  clearCart();
                }
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Cart</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-[#B38029] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-gray-900">Your Cart is Empty</h2>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Turn your favorite memories into glowing 3D Moon Lamps and personalized lithophanes!
              </p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 bg-[#B38029] hover:bg-[#8C5E16] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
            >
              <span>Explore 3D Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* 2-Column Responsive Layout on Desktop */
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Cart Items (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Shipping Progress Indicator */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">
                    {isFreeShipping ? '🎉 Free Express Delivery Unlocked!' : `Add ₹${amountNeeded.toLocaleString('en-IN')} more for FREE delivery`}
                  </span>
                  <span className="text-[#B38029] font-extrabold">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden">
                {cartItems.map((item) => (
                  <div
                    key={item.itemKey || item.id}
                    className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img
                        src={item.image || item.customPhoto || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-gray-900 leading-snug line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.itemKey || item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-full transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Customization Details */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {item.customName && (
                          <span className="bg-amber-50 text-[#B38029] border border-[#D4AF37]/30 px-2 py-0.5 rounded-md font-medium">
                            Text: "{item.customName}"
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.customPhoto && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                            ✓ Custom Photo
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.itemKey || item.id, item.quantity - 1)}
                            className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.itemKey || item.id, item.quantity + 1)}
                            className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-base sm:text-lg text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/categories"
                  className="text-xs font-bold text-[#B38029] hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Summary, Coupon & Checkout (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4 mt-4 lg:mt-0 lg:sticky lg:top-24">
              
              {/* Coupon Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs space-y-3">
                <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#B38029]" />
                  Have a Promo Code?
                </h2>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div>
                      <p className="font-bold text-xs text-emerald-900">{appliedCoupon.code} Applied</p>
                      <p className="text-[11px] text-emerald-700">Saved ₹{discount.toLocaleString('en-IN')}!</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="Coupon Code"
                        className="flex-1 p-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 uppercase outline-none focus:border-[#B38029]"
                      />
                      <button
                        type="submit"
                        className="bg-[#B38029] hover:bg-[#8C5E16] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {couponError}
                      </p>
                    )}
                    {couponMsg && (
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> {couponMsg}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Details Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3 text-xs">
                <h2 className="font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Order Summary
                </h2>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-bold text-gray-900">
                    {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shipping}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between font-bold">
                  <span className="text-sm text-gray-900">Estimated Total</span>
                  <span className="font-serif text-xl text-gray-900">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Desktop Checkout CTA */}
                <div className="hidden lg:block pt-3">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#B38029] hover:bg-[#8C5E16] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="flex items-center justify-center gap-1 text-[10px] text-gray-400 font-medium mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free replacements for transit damage</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Only Sticky Bottom Bar (< lg) */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total</span>
              <span className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="flex-1 max-w-xs bg-[#B38029] hover:bg-[#8C5E16] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
