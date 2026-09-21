import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Production fallback credentials if Vercel has the dummy placeholder from .env.example
const DEFAULT_URL = 'https://iyxmnuplychflbmvgvip.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_8V7Vgn2jznw8QeEeTOPsow_EcYxMxnM';

const supabaseUrl = (rawUrl && !rawUrl.includes('placeholder') && !rawUrl.includes('your_'))
  ? rawUrl.trim()
  : DEFAULT_URL;

const supabaseAnonKey = (rawAnonKey && !rawAnonKey.includes('placeholder') && !rawAnonKey.includes('your_'))
  ? rawAnonKey.trim()
  : DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function requireClient() {
  if (!supabase) throw new Error('Supabase client is not initialized. Check your .env configuration.');
  return supabase;
}

// ============================================================================
// Customer & Admin Auth
// ============================================================================
export async function signInAdmin(email, password) {
  try {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function isUserAdmin(userId, userEmail) {
  if (userEmail) {
    const email = userEmail.toLowerCase().trim();
    if (
      email === 'dacnikhil21@gmail.com' ||
      email === 'infinityframesn@gmail.com' ||
      email === 'admin@infinityframesn.com'
    ) {
      return true;
    }
  }
  if (!supabase || !userId) return false;
  try {
    const { data, error } = await supabase.from('admin_users').select('id').eq('id', userId).maybeSingle();
    if (!error && data) return true;
  } catch {
    // ignore
  }
  return false;
}

function sanitizeAuthError(error, context = 'auth') {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  // Log full raw technical details to browser console for developers
  console.error(`[Supabase Auth ${context} error]:`, error);

  const rawMsg = (error.message || error.msg || error.error_description || error.description || '').toLowerCase();
  const errorCode = (error.code || error.error_code || '').toLowerCase();

  if (rawMsg.includes('already') || rawMsg.includes('registered') || rawMsg.includes('exists') || errorCode.includes('already')) {
    return 'An account with this email address already exists. Please Log In.';
  }

  if (
    rawMsg.includes('rate limit') ||
    errorCode.includes('rate_limit') ||
    errorCode === 'over_email_send_rate_limit' ||
    error.status === 429
  ) {
    return 'Email signup rate limit reached. To fix this permanently, disable "Confirm email" in your Supabase Auth settings.';
  }

  if (rawMsg.includes('invalid login credentials') || rawMsg.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your credentials or create an account.';
  }

  if (rawMsg.includes('email not confirmed')) {
    return 'Please check your email inbox to confirm your email, or reset your password.';
  }

  if (rawMsg.includes('password') && (rawMsg.includes('short') || rawMsg.includes('least 6') || rawMsg.includes('weak'))) {
    return 'Password must be at least 6 characters long.';
  }

  if (rawMsg.includes('api key') || rawMsg.includes('jwt') || rawMsg.includes('unauthorized') || rawMsg.includes('not initialized')) {
    return 'Unable to connect to account service. Please check your Supabase API credentials in Vercel.';
  }

  if (rawMsg.includes('network') || rawMsg.includes('fetch') || rawMsg.includes('failed to fetch')) {
    return 'Network connection issue. Please check your internet connection.';
  }

  return error.message || error.msg || 'Unable to complete your request. Please try again.';
}

export async function signUpCustomer({ email, password, name, phone }) {
  if (!supabase) return { success: false, message: 'Account service unavailable. Please refresh the page.' };
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone: phone ? phone.trim() : '',
        },
      },
    });
    if (error) {
      return { success: false, message: sanitizeAuthError(error, 'signUp') };
    }

    // Safely upsert profile row if table exists
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            full_name: name.trim(),
            email: cleanEmail,
            phone: phone ? phone.trim() : null,
            updated_at: new Date().toISOString(),
          }
        ]);
      } catch (e) {
        // Table may not exist or RLS handled
      }
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, message: sanitizeAuthError(err, 'signUp') };
  }
}

export async function signInCustomer({ email, password }) {
  if (!supabase) return { success: false, message: 'Account service unavailable. Please refresh the page.' };
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      return { success: false, message: sanitizeAuthError(error, 'signIn') };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, message: sanitizeAuthError(err, 'signIn') };
  }
}

export async function sendPasswordResetEmailToSupabase(email) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function verifyRecoveryOtpInSupabase(email, token) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updateCustomerPasswordInSupabase(newPassword) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ============================================================================
// Mapping helpers — DB uses snake_case columns, the app uses camelCase.
// ============================================================================
export function mapProductFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku || '',
    category: row.category,
    subcategory: row.subcategory || '',
    price: Number(row.price) || 0,
    oldPrice: row.old_price !== null && row.old_price !== undefined ? Number(row.old_price) : null,
    costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : null,
    discount: row.discount || null,
    stock: row.stock ?? 0,
    inStock: (row.stock ?? 0) > 0,
    customizable: !!row.customizable,
    customType: row.custom_type || (row.customizable ? 'photo-text' : null),
    sizes: row.sizes || [],
    colors: row.colors || [],
    materials: row.materials || [],
    frameColors: row.frame_colors || [],
    fontStyles: row.font_styles || [],
    description: row.description || '',
    image: row.image || (row.images && row.images[0]) || '',
    images: row.images || [],
    video: row.video || null,
    videoUrl: row.video_url || null,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 4.8,
    reviewsCount: row.reviews_count ?? 0,
    isNew: !!row.is_new,
    isFeatured: !!row.is_featured,
    createdDate: row.created_at ? row.created_at.split('T')[0] : undefined,
  };
}

function mapProductToDb(p) {
  const row = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.category !== undefined) row.category = p.category;
  if (p.subcategory !== undefined) row.subcategory = p.subcategory;
  if (p.price !== undefined) row.price = Number(p.price) || 0;
  if (p.oldPrice !== undefined) row.old_price = p.oldPrice === '' || p.oldPrice === null ? null : Number(p.oldPrice);
  if (p.costPrice !== undefined) row.cost_price = p.costPrice === '' || p.costPrice === null ? null : Number(p.costPrice);
  if (p.discount !== undefined) row.discount = p.discount;
  if (p.stock !== undefined) row.stock = Number(p.stock) || 0;
  if (p.customizable !== undefined) row.customizable = Boolean(p.customizable);
  if (p.customType !== undefined) row.custom_type = p.customType;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.colors !== undefined) row.colors = p.colors;
  if (p.materials !== undefined) row.materials = p.materials;
  if (p.frameColors !== undefined) row.frame_colors = p.frameColors;
  if (p.fontStyles !== undefined) row.font_styles = p.fontStyles;
  if (p.description !== undefined) row.description = p.description;
  if (p.image !== undefined) row.image = p.image;
  if (p.images !== undefined) row.images = p.images;
  if (p.video !== undefined) row.video = p.video;
  if (p.videoUrl !== undefined) row.video_url = p.videoUrl;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviewsCount !== undefined) row.reviews_count = p.reviewsCount;
  if (p.isNew !== undefined) row.is_new = p.isNew;
  if (p.isFeatured !== undefined) row.is_featured = p.isFeatured;
  return row;
}

export function mapCategoryFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    image: row.image || '',
    bannerImage: row.banner_image || row.image || '',
    itemCount: row.item_count || '',
    featured: row.featured !== false,
    active: row.active !== false,
    subcategories: row.subcategories || [],
  };
}

function mapCategoryToDb(c) {
  const row = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.name !== undefined) row.name = c.name;
  if (c.tagline !== undefined) row.tagline = c.tagline;
  if (c.description !== undefined) row.description = c.description;
  if (c.image !== undefined) row.image = c.image;
  if (c.bannerImage !== undefined) row.banner_image = c.bannerImage;
  if (c.itemCount !== undefined) row.item_count = c.itemCount;
  if (c.featured !== undefined) row.featured = c.featured;
  if (c.active !== undefined) row.active = c.active;
  if (c.subcategories !== undefined) row.subcategories = c.subcategories;
  return row;
}

export function mapBannerFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    link: row.link || '/shop',
    active: row.active !== false,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapBannerToDb(b) {
  const row = {};
  if (b.title !== undefined) row.title = b.title;
  if (b.image !== undefined) row.image = b.image;
  if (b.link !== undefined) row.link = b.link;
  if (b.active !== undefined) row.active = b.active;
  if (b.sortOrder !== undefined) row.sort_order = b.sortOrder;
  return row;
}

export function mapCouponFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    discountValue: Number(row.discount_value) || 0,
    minOrder: Number(row.min_order) || 0,
    maxDiscount: row.max_discount !== null && row.max_discount !== undefined ? Number(row.max_discount) : null,
    active: row.active !== false,
  };
}

function mapCouponToDb(c) {
  const row = {};
  if (c.code !== undefined) row.code = c.code;
  if (c.type !== undefined) row.type = c.type;
  if (c.discountValue !== undefined) row.discount_value = c.discountValue;
  if (c.minOrder !== undefined) row.min_order = c.minOrder;
  if (c.maxDiscount !== undefined) row.max_discount = c.maxDiscount;
  if (c.active !== undefined) row.active = c.active;
  return row;
}

export function mapOrderFromDb(row) {
  if (!row) return row;
  const paymentMethodStr = row.payment_method || '';
  let extractedPaymentId = row.payment_id || null;
  if (!extractedPaymentId && paymentMethodStr.includes('(ID: ')) {
    extractedPaymentId = paymentMethodStr.split('(ID: ')[1]?.replace(')', '') || null;
  }

  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || '',
    address: row.address,
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    items: row.items || [],
    itemsCount: (row.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
    subtotal: Number(row.subtotal) || 0,
    deliveryCharge: Number(row.delivery_charge) || 0,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: paymentMethodStr,
    paymentId: extractedPaymentId,
    paymentStatus: row.payment_status || 'Pending',
    status: row.status || 'Pending',
    couponCode: row.coupon_code || null,
    date: row.created_at ? row.created_at.split('T')[0] : '',
    createdAt: row.created_at,
  };
}

function mapOrderToDb(o) {
  let method = o.paymentMethod || null;
  if (o.paymentId && method && !method.includes('(ID: ')) {
    method = `${method} (ID: ${o.paymentId})`;
  } else if (o.paymentId && !method) {
    method = `Razorpay (ID: ${o.paymentId})`;
  }

  return {
    id: o.id,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_email: o.customerEmail || null,
    address: o.address,
    city: o.city || null,
    state: o.state || null,
    pincode: o.pincode || null,
    items: o.items || [],
    subtotal: o.subtotal || 0,
    delivery_charge: o.deliveryCharge || 0,
    total_amount: o.totalAmount || 0,
    payment_method: method,
    payment_status: o.paymentStatus || 'Pending',
    payment_id: o.paymentId || null,
    status: o.status || 'Pending',
    coupon_code: o.couponCode || null,
  };
}

export function mapSettingsFromDb(row) {
  if (!row) return null;
  return {
    storeName: row.store_name || '',
    phone: row.phone || '',
    email: row.email || '',
    whatsapp: row.whatsapp || '',
    ownerName: row.owner_name || '',
    address: row.address || '',
    freeShippingThreshold: Number(row.free_shipping_threshold) || 0,
    gstin: row.gstin || '',
    currency: row.currency || '₹',
    announcementText: row.announcement_text ?? 'Special Offer: Free Delivery across India on orders above ₹1499 | Handcrafted 3D Gifts',
    announcementEnabled: row.announcement_enabled !== undefined ? Boolean(row.announcement_enabled) : true,
    announcementLink: row.announcement_link || '/shop',
  };
}

function mapSettingsToDb(s) {
  const row = {};
  if (s.storeName !== undefined) row.store_name = s.storeName;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.email !== undefined) row.email = s.email;
  if (s.whatsapp !== undefined) row.whatsapp = s.whatsapp;
  if (s.ownerName !== undefined) row.owner_name = s.ownerName;
  if (s.address !== undefined) row.address = s.address;
  if (s.freeShippingThreshold !== undefined) row.free_shipping_threshold = s.freeShippingThreshold;
  if (s.gstin !== undefined) row.gstin = s.gstin;
  if (s.currency !== undefined) row.currency = s.currency;
  if (s.announcementText !== undefined) row.announcement_text = s.announcementText;
  if (s.announcementEnabled !== undefined) row.announcement_enabled = s.announcementEnabled;
  if (s.announcementLink !== undefined) row.announcement_link = s.announcementLink;
  return row;
}

export function mapMessageFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    message: row.message,
    status: row.status || 'New',
    createdAt: row.created_at,
  };
}

// ============================================================================
// Products
// ============================================================================
export async function fetchProducts() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: data.map(mapProductFromDb) };
}

export async function insertProduct(product) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapProductToDb(product);
  const { data, error } = await supabase.from('products').insert([row]).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to add products.' };
  }
  return { success: true, data: mapProductFromDb(data[0]) };
}

export async function updateProductInDb(id, updates) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapProductToDb(updates);
  const { data, error } = await supabase.from('products').update(row).eq('id', id).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to edit products.' };
  }
  return { success: true, data: mapProductFromDb(data[0]) };
}

export async function deleteProductFromDb(id) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

// ============================================================================
// Categories
// ============================================================================
export async function fetchCategories() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: data.map(mapCategoryFromDb) };
}

export async function insertCategory(category) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapCategoryToDb(category);
  const { data, error } = await supabase.from('categories').insert([row]).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to add categories.' };
  }
  return { success: true, data: mapCategoryFromDb(data[0]) };
}

export async function updateCategoryInDb(id, updates) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapCategoryToDb(updates);
  const { data, error } = await supabase.from('categories').update(row).eq('id', id).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to edit categories.' };
  }
  return { success: true, data: mapCategoryFromDb(data[0]) };
}

export async function deleteCategoryFromDb(id) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

// ============================================================================
// Banners
// ============================================================================
export async function fetchBanners() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: data.map(mapBannerFromDb) };
}

export async function insertBanner(banner) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapBannerToDb(banner);
  const { data, error } = await supabase.from('banners').insert([row]).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to add banners.' };
  }
  return { success: true, data: mapBannerFromDb(data[0]) };
}

export async function updateBannerInDb(id, updates) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapBannerToDb(updates);
  const { data, error } = await supabase.from('banners').update(row).eq('id', id).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to edit banners.' };
  }
  return { success: true, data: mapBannerFromDb(data[0]) };
}

export async function deleteBannerFromDb(id) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

// ============================================================================
// Coupons
// ============================================================================
export async function fetchCoupons() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: data.map(mapCouponFromDb) };
}

export async function insertCoupon(coupon) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapCouponToDb(coupon);
  const { data, error } = await supabase.from('coupons').insert([row]).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to add coupons.' };
  }
  return { success: true, data: mapCouponFromDb(data[0]) };
}

export async function updateCouponInDb(id, updates) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const row = mapCouponToDb(updates);
  const { data, error } = await supabase.from('coupons').update(row).eq('id', id).select();
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) {
    return { success: false, message: 'Permission denied: Please sign in again to edit coupons.' };
  }
  return { success: true, data: mapCouponFromDb(data[0]) };
}

export async function deleteCouponFromDb(id) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

// ============================================================================
// Orders
// ============================================================================
export async function fetchOrders() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: data.map(mapOrderFromDb) };
}

export async function saveOrderToSupabase(orderData) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const row = mapOrderToDb(orderData);
    const { error } = await supabase.from('orders').insert([row]);
    if (error) {
      console.warn('Supabase order insert error:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: orderData };
  } catch (err) {
    console.warn('Supabase save order failed:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchOrdersByPhone(phone) {
  if (!supabase || !phone) return { success: false, data: [], message: 'Missing phone or Supabase not configured' };
  const { data, error } = await supabase.rpc('get_orders_by_phone', { p_phone: phone });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: (data || []).map(mapOrderFromDb) };
}

export async function fetchCustomerOrders({ email, phone }) {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  if (!email && !phone) return { success: true, data: [] };

  try {
    let query = supabase.from('orders').select('*');
    if (email && phone) {
      query = query.or(`customer_email.eq.${email},customer_phone.eq.${phone}`);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else if (phone) {
      query = query.eq('customer_phone', phone);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      // Fallback to RPC by phone if column-level or RLS restriction occurs
      if (phone) return fetchOrdersByPhone(phone);
      return { success: false, data: [], message: error.message };
    }
    return { success: true, data: (data || []).map(mapOrderFromDb) };
  } catch (err) {
    if (phone) return fetchOrdersByPhone(phone);
    return { success: false, data: [], message: err.message };
  }
}

export async function updateOrderStatusInDb(id, status) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) return { success: false, message: error.message };
  return { success: true, data: mapOrderFromDb(data) };
}

// ============================================================================
// Contact messages
// ============================================================================
export async function saveContactMessageToSupabase(messageData) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert([{
        name: messageData.name,
        phone: messageData.phone || null,
        email: messageData.email || null,
        message: messageData.message,
      }]);
    if (error) {
      console.warn('Supabase contact insert error:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: messageData };
  } catch (err) {
    console.warn('Supabase contact save failed:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchContactMessages() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) return { success: false, data: [], message: error.message };
  return { success: true, data: data.map(mapMessageFromDb) };
}

export async function updateMessageStatusInDb(id, status) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

// ============================================================================
// Settings (singleton row, id = 1)
// ============================================================================
export async function fetchSettings() {
  let localSaved = null;
  try {
    const raw = localStorage.getItem('infinity_frames_store_settings');
    if (raw) localSaved = JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  if (!supabase) {
    return { success: true, data: localSaved };
  }

  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (!error && data) {
      const mapped = mapSettingsFromDb(data);
      // Persist latest database settings to local storage cache for offline fallback
      try {
        localStorage.setItem('infinity_frames_store_settings', JSON.stringify(mapped));
      } catch (e) {}
      return { success: true, data: mapped };
    }
  } catch (err) {
    console.warn('Supabase fetchSettings error:', err);
  }

  if (localSaved) return { success: true, data: localSaved };
  return { success: false, data: null, message: 'Could not load settings' };
}

export async function updateSettingsInDb(updates) {
  // Always persist locally first so changes take effect immediately across all screens
  try {
    const raw = localStorage.getItem('infinity_frames_store_settings');
    const prev = raw ? JSON.parse(raw) : {};
    const merged = { ...prev, ...updates };
    localStorage.setItem('infinity_frames_store_settings', JSON.stringify(merged));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  if (!supabase) {
    return { success: true, data: updates };
  }

  try {
    const row = mapSettingsToDb(updates);
    // Upsert to ensure row 1 exists
    const { data, error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...row }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase settings update error:', error.message);
      return { success: false, message: error.message };
    }
    if (data) {
      const mapped = mapSettingsFromDb(data);
      try {
        localStorage.setItem('infinity_frames_store_settings', JSON.stringify(mapped));
      } catch (e) {}
      return { success: true, data: mapped };
    }
    return { success: false, message: 'No data returned from settings update.' };
  } catch (err) {
    console.error('Supabase updateSettingsInDb error:', err);
    return { success: false, message: err.message || 'Error updating settings in database.' };
  }
}
