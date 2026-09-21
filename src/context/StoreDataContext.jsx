import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProducts, insertProduct, updateProductInDb, deleteProductFromDb,
  fetchCategories, insertCategory, updateCategoryInDb, deleteCategoryFromDb,
  fetchBanners, insertBanner, updateBannerInDb, deleteBannerFromDb,
  fetchCoupons, insertCoupon, updateCouponInDb, deleteCouponFromDb,
  fetchOrders, saveOrderToSupabase, updateOrderStatusInDb,
  fetchContactMessages, updateMessageStatusInDb,
  fetchSettings, updateSettingsInDb,
  supabase,
  mapProductFromDb,
  mapCategoryFromDb,
  mapBannerFromDb,
  mapCouponFromDb,
  mapOrderFromDb,
  mapSettingsFromDb,
  mapMessageFromDb,
} from '../lib/supabase';

const StoreDataContext = createContext();

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({
    storeName: 'Infinity Frames N', phone: '', email: '', whatsapp: '', ownerName: '',
    address: '', freeShippingThreshold: 1499, shippingCost: 50, gstin: '', currency: '₹',
    announcementText: 'Special Offer: Free Delivery across India on orders above ₹1499 | Handcrafted 3D Gifts',
    announcementEnabled: true,
    announcementLink: '/shop',
  });
  const [loading, setLoading] = useState(true);

  const refetchAll = useCallback(async () => {
    try {
      const [p, c, b, cp, s] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchBanners(), fetchCoupons(), fetchSettings(),
      ]);
      if (p.success) setProducts(p.data);
      if (c.success) setCategories(c.data);
      if (b.success) setBanners(b.data);
      if (cp.success) setCoupons(cp.data);
      if (s.success && s.data) setSettings(s.data);
    } catch (err) {
      console.warn('StoreDataProvider refetch error:', err);
    }
  }, []);

  // Initial load — public-readable data (products/categories/banners/coupons/settings).
  useEffect(() => {
    let active = true;
    (async () => {
      await refetchAll();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [refetchAll]);

  // Real-time synchronization: Listen to database changes across all tables so
  // any updates made in the admin panel immediately reflect on storefronts and across all devices
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('store-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [mapProductFromDb(payload.new), ...prev.filter((p) => p.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) => prev.map((p) => (p.id === payload.new.id ? mapProductFromDb(payload.new) : p)));
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories((prev) => [...prev.filter((c) => c.id !== payload.new.id), mapCategoryFromDb(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setCategories((prev) => prev.map((c) => (c.id === payload.new.id ? mapCategoryFromDb(payload.new) : c)));
          } else if (payload.eventType === 'DELETE') {
            setCategories((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBanners((prev) => [...prev.filter((b) => b.id !== payload.new.id), mapBannerFromDb(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setBanners((prev) => prev.map((b) => (b.id === payload.new.id ? mapBannerFromDb(payload.new) : b)));
          } else if (payload.eventType === 'DELETE') {
            setBanners((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coupons' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCoupons((prev) => [mapCouponFromDb(payload.new), ...prev.filter((c) => c.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setCoupons((prev) => prev.map((c) => (c.id === payload.new.id ? mapCouponFromDb(payload.new) : c)));
          } else if (payload.eventType === 'DELETE') {
            setCoupons((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          if (payload.new) {
            setSettings(mapSettingsFromDb(payload.new));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [mapOrderFromDb(payload.new), ...prev.filter((o) => o.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? mapOrderFromDb(payload.new) : o)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Orders & contact messages are admin-only (blocked by RLS for anon visitors),
  // so the admin pages call these explicitly once the admin session is ready.
  const refreshOrders = useCallback(async () => {
    const res = await fetchOrders();
    if (res.success) setOrders(res.data);
    return res;
  }, []);

  const refreshMessages = useCallback(async () => {
    const res = await fetchContactMessages();
    if (res.success) setMessages(res.data);
    return res;
  }, []);

  // ---------------- Products ----------------
  const addProduct = async (newProduct) => {
    const res = await insertProduct(newProduct);
    if (res.success) setProducts((prev) => [res.data, ...prev]);
    return res;
  };

  const updateProduct = async (id, updatedData) => {
    const res = await updateProductInDb(id, updatedData);
    if (res.success) setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await deleteProductFromDb(id);
    if (res.success) setProducts((prev) => prev.filter((p) => p.id !== id));
    return res;
  };

  // ---------------- Categories ----------------
  const addCategory = async (newCat) => {
    const res = await insertCategory(newCat);
    if (res.success) setCategories((prev) => [...prev, res.data]);
    return res;
  };

  const updateCategory = async (id, updatedData) => {
    const res = await updateCategoryInDb(id, updatedData);
    if (res.success) setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res;
  };

  const deleteCategory = async (id) => {
    const res = await deleteCategoryFromDb(id);
    if (res.success) setCategories((prev) => prev.filter((c) => c.id !== id));
    return res;
  };

  // ---------------- Orders ----------------
  const addOrder = async (orderData) => {
    const res = await saveOrderToSupabase(orderData);
    if (res.success) {
      setOrders((prev) => [res.data, ...prev]);

      // Decrement in-memory stock for customer UI without invoking updateProductInDb -> ensureAdminAuthSession()
      // which would hijack customer auth sessions.
      setProducts((prev) =>
        prev.map((p) => {
          const orderedItem = (orderData.items || []).find((it) => it.id === p.id);
          if (orderedItem) {
            return { ...p, stock: Math.max(0, (p.stock || 0) - (orderedItem.quantity || 1)) };
          }
          return p;
        })
      );
    }
    return res;
  };

  const updateOrderStatus = async (id, status) => {
    const res = await updateOrderStatusInDb(id, status);
    if (res.success) setOrders((prev) => prev.map((o) => (o.id === id ? res.data : o)));
    return res;
  };

  // ---------------- Contact messages ----------------
  const updateMessageStatus = async (id, status) => {
    const res = await updateMessageStatusInDb(id, status);
    if (res.success) setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    return res;
  };

  // ---------------- Banners ----------------
  const addBanner = async (banner) => {
    const res = await insertBanner(banner);
    if (res.success) setBanners((prev) => [...prev, res.data]);
    return res;
  };

  const updateBanner = async (id, updated) => {
    const res = await updateBannerInDb(id, updated);
    if (res.success) setBanners((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    return res;
  };

  const deleteBanner = async (id) => {
    const res = await deleteBannerFromDb(id);
    if (res.success) setBanners((prev) => prev.filter((b) => b.id !== id));
    return res;
  };

  // ---------------- Coupons ----------------
  const addCoupon = async (coupon) => {
    const res = await insertCoupon(coupon);
    if (res.success) setCoupons((prev) => [res.data, ...prev]);
    return res;
  };

  const updateCoupon = async (id, updated) => {
    const res = await updateCouponInDb(id, updated);
    if (res.success) setCoupons((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res;
  };

  const deleteCoupon = async (id) => {
    const res = await deleteCouponFromDb(id);
    if (res.success) setCoupons((prev) => prev.filter((c) => c.id !== id));
    return res;
  };

  // ---------------- Settings ----------------
  const updateSettings = async (newSettings) => {
    const res = await updateSettingsInDb(newSettings);
    if (res.success) setSettings((prev) => ({ ...prev, ...res.data }));
    return res;
  };

  return (
    <StoreDataContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        orders,
        messages,
        settings,
        loading,
        refetchAll,
        refreshOrders,
        refreshMessages,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addOrder,
        saveOrder: addOrder,
        updateOrderStatus,
        updateMessageStatus,
        addBanner,
        updateBanner,
        deleteBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSettings,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
}
