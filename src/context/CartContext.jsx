import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStoreData } from './StoreDataContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { coupons, settings } = useStoreData();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [couponCode, setCouponCode] = useState(() => {
    try {
      return localStorage.getItem('sv_applied_coupon') || '';
    } catch (e) {
      return '';
    }
  });

  useEffect(() => {
    try {
      if (couponCode) localStorage.setItem('sv_applied_coupon', couponCode);
      else localStorage.removeItem('sv_applied_coupon');
    } catch (e) {
      // ignore
    }
  }, [couponCode]);

  useEffect(() => {
    try {
      localStorage.setItem('sv_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, quantity = 1, arg3 = null, arg4 = null) => {
    let selectedColor = null;
    let selectedSize = null;
    let customName = product.customName || null;
    let customPhoto = product.customPhoto || null;

    if (arg3 && typeof arg3 === 'object') {
      selectedColor = arg3.color || arg3.selectedColor || null;
      selectedSize = arg3.size || arg3.selectedSize || null;
      if (arg3.customName) customName = arg3.customName;
      if (arg3.customPhoto) customPhoto = arg3.customPhoto;
    } else {
      selectedColor = arg3 || product.selectedColor || null;
      selectedSize = arg4 || product.selectedSize || null;
    }

    setCartItems((prev) => {
      // Create a specific key including variants and customizations so distinct gifts don't collide
      const customSnippet = (customName || '').trim().toLowerCase().slice(0, 20);
      const photoSnippet = customPhoto ? 'hasphoto' : 'nophoto';
      const itemKey = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}-${customSnippet}-${photoSnippet}`;

      const existingIndex = prev.findIndex((item) => item.itemKey === itemKey || (item.id === product.id && item.itemKey === itemKey));

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            itemKey,
            quantity,
            selectedColor,
            selectedSize,
            customName,
            customPhoto,
          },
        ];
      }
    });

    showToast(`Added "${product.name}" to your cart!`);
  };

  const removeFromCart = (keyOrId) => {
    setCartItems((prev) => prev.filter((item) => item.itemKey !== keyOrId && item.id !== keyOrId));
  };

  const updateQuantity = (keyOrId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(keyOrId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.itemKey === keyOrId || item.id === keyOrId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 1499;
  const shippingCost = Number(settings?.shippingCost) || 50;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Coupons come from the admin-managed list (Supabase-backed via StoreDataContext)
  // instead of hardcoded strings, so codes created in /admin/coupons actually work at checkout.
  const appliedCoupon = couponCode
    ? coupons.find((c) => c.code === couponCode && c.active)
    : null;
  const couponMinOrderMet = appliedCoupon ? subtotal >= appliedCoupon.minOrder : false;

  const discountAmount = (() => {
    if (!appliedCoupon || !couponMinOrderMet) return 0;
    let amount = appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue;
    if (appliedCoupon.maxDiscount) amount = Math.min(amount, appliedCoupon.maxDiscount);
    return Math.min(amount, subtotal);
  })();

  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase();
    const match = coupons.find((c) => c.code === normalized && c.active);
    if (!match) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }
    if (subtotal < match.minOrder) {
      return { success: false, message: `This code needs a minimum order of ₹${match.minOrder.toLocaleString('en-IN')}.` };
    }
    setCouponCode(normalized);
    return { success: true, coupon: match };
  };

  const removeCoupon = () => setCouponCode('');

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItemsCount,
      cartCount: totalItemsCount,
      subtotal,
      freeShippingThreshold,
      shippingCost,
      isFreeShipping,
      amountNeededForFreeShipping,
      toastMessage,
      showToast,
      appliedCoupon: appliedCoupon && couponMinOrderMet ? appliedCoupon : null,
      discountAmount,
      discount: discountAmount,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
