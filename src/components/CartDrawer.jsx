import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, Plus, Minus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND } from '../config/brand';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { settings } = useStoreData();
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartCount,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 1499;
  const shippingCost = Number(settings?.shippingCost) || 50;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const missingAmount = freeShippingThreshold - subtotal;
  const finalTotal = subtotal - discount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim().toUpperCase());
    if (res.success) {
      setCouponMsg(res.message);
      setCouponInput('');
    } else {
      setCouponMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">Your 3D Gift Cart</h2>
              <span className="bg-[#D4AF37] text-gray-950 font-black text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#FAF5EB] p-3 px-5 border-b border-[#D4AF37]/20 text-xs text-[#B38029]">
            {isFreeShipping ? (
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                ✨ Congratulations! You unlocked 100% Free Express Shipping!
              </span>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Add ₹{missingAmount.toLocaleString('en-IN')} more for Free Shipping</span>
                  <span>{Math.round((subtotal / freeShippingThreshold) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#D4AF37]/30 flex items-center justify-center text-[#B38029]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">Your Cart is Empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                    Explore our customized 3D Moon Lamps, Lithophanes & Acrylic LED gifts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/shop');
                  }}
                  className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 px-6 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Explore 3D Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 relative group"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.customPhoto && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 rounded-tl bg-black/70 overflow-hidden border-t border-l border-white/40" title="Custom Photo Uploaded">
                        <img src={item.customPhoto} alt="Upload" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>• Style: {item.selectedColor}</span>}
                      </div>

                      {item.customText && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-[#B38029] bg-[#FAF5EB] px-2 py-0.5 rounded-md mt-1 border border-[#D4AF37]/30">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[160px]">"{item.customText}"</span>
                        </div>
                      )}

                      <div className="text-xs font-bold text-gray-900 mt-1">
                        ₹{(item.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3">
              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon (e.g. INFINITY10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#D4AF37] uppercase"
                />
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-gray-800 text-[#D4AF37] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#D4AF37]/30"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className="text-[11px] text-emerald-700 font-bold">{couponMsg}</p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900">
                    {isFreeShipping ? <span className="text-emerald-700">FREE</span> : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount:</span>
                  <span className="text-base text-gray-950 font-serif font-black">
                    ₹{(finalTotal + (isFreeShipping ? 0 : shippingCost)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => {
                  closeCart();
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
