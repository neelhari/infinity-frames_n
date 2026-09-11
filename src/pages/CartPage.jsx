import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, Plus, Minus, Tag, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponOpen, setCouponOpen] = useState(false);

  // Discount math
  const discount = appliedCoupon ? Math.min(300, Math.round(subtotal * 0.15)) : 0;
  const shipping = subtotal > 1499 ? 0 : 50;
  const total = Math.max(0, subtotal - discount + (cartItems.length > 0 ? shipping : 0));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (couponInput.toUpperCase() === 'INFINITY10' || couponInput.toUpperCase() === 'WELCOME') {
      setAppliedCoupon(couponInput.toUpperCase());
    } else {
      window.alert('Invalid Coupon Code. Try: INFINITY10');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-32 font-sans">
      {/* 1. Header (Screen 7: Back, "My Cart", Trash icon) */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <h1 className="font-serif text-base sm:text-lg font-bold text-gray-900">
              My Cart {cartItems.length > 0 && `(${cartItems.length})`}
            </h1>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all items from your cart?')) {
                  clearCart();
                }
              }}
              className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              title="Empty Cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-2xs space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#B38029] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-base font-bold text-gray-900">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Explore our 3D Moon Lamps and personalized photo frames to create your first gift!
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-2 bg-[#B38029] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* 2. Cart Items List (Screen 7) */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex items-center gap-3 relative group"
                >
                  {/* Thumbnail Image (uploaded custom photo or product image) */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <img
                      src={item.customPhoto || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-serif text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    
                    {/* Custom text tag if present */}
                    {item.customName && (
                      <span className="inline-block bg-amber-50 text-[#8C5E16] text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 truncate max-w-full">
                        Text: &ldquo;{item.customName}&rdquo;
                      </span>
                    )}

                    {/* Variations if present */}
                    {(item.selectedSize || item.selectedColor || item.selectedFrameColor) && (
                      <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">
                        {[item.selectedSize, item.selectedColor, item.selectedFrameColor].filter(Boolean).join(' &bull; ')}
                      </p>
                    )}

                    {/* Price & Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif text-sm font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Stepper (Screen 7) */}
                      <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="text-gray-600 hover:text-black font-bold text-xs cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-600 hover:text-black font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button (X icon - Screen 7) */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 3. Have a Coupon Code? (Screen 7) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
              <button
                onClick={() => setCouponOpen(!couponOpen)}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#B38029]" />
                  <span>{appliedCoupon ? `Applied: ${appliedCoupon}` : 'Have a Coupon Code?'}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${couponOpen ? 'rotate-90' : ''}`} />
              </button>

              {couponOpen && (
                <form onSubmit={handleApplyCoupon} className="p-3.5 pt-0 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code (e.g. INFINITY10)"
                    className="flex-1 p-2 rounded-xl border border-gray-200 text-xs uppercase font-mono outline-none focus:border-[#B38029]"
                  />
                  <button
                    type="submit"
                    className="bg-[#B38029] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* 4. Order Summary Card (Screen 7) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Sub Total</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Discount</span>
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

            {/* 5. Fixed Bottom "Proceed to Checkout" Button (Screen 7) */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
              <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Amount</span>
                  <span className="font-serif text-lg font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="flex-1 bg-[#B38029] hover:bg-[#8C5E16] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
