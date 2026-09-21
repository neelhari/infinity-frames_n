import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Package,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { fetchCustomerOrders } from '../lib/supabase';
import { BRAND, waLink } from '../config/brand';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openLoginModal, addAddress, removeAddress } = useAuth();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();

  const [activeSection, setActiveSection] = useState('orders'); // 'orders' | 'addresses'
  const [dbOrders, setDbOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
  });

  // Fetch real customer orders matching authenticated user email or phone
  useEffect(() => {
    if (!user?.email && !user?.phone) {
      setDbOrders([]);
      return;
    }
    let active = true;
    setLoadingOrders(true);
    fetchCustomerOrders({ email: user?.email, phone: user?.phone }).then((res) => {
      if (active) {
        setLoadingOrders(false);
        if (res.success && res.data) {
          setDbOrders(res.data);
        }
      }
    });
    return () => { active = false; };
  }, [user?.email, user?.phone]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.addressLine || !newAddr.pincode) return;
    addAddress(newAddr);
    setShowAddressModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 1. PROFILE CARD - STARTS IMMEDIATELY UNDER HEADER (NO BACK TO STORE, NO BADGE, REAL AUTH) */}
        <div className="bg-gradient-to-r from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#D4AF37]/20">
          {isAuthenticated && user ? (
            /* Logged In Real User State */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#B38029] to-[#F3E5AB] flex items-center justify-center text-2xl sm:text-3xl font-serif font-black text-gray-950 shrink-0 shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      {user.name || 'Valued Patron'}
                    </h1>
                    <span className="bg-[#D4AF37] text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Member
                    </span>
                  </div>
                  {user.phone && (
                    <p className="text-xs text-amber-200/90 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      +91 {user.phone}
                    </p>
                  )}
                  {user.email && (
                    <p className="text-[11px] text-gray-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={waLink(`Hi Naresh, I need assistance with my Infinity Frames N account.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-[#25D366]/40 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out?')) {
                      logout();
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Guest / Not Logged In State - SHOW LOGIN AND SIGN UP BUTTONS */
            <div className="relative z-10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-white shrink-0">
                    <User className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                      Welcome to {BRAND.name}
                    </h2>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Log in to view your orders, saved 3D creations, and fast checkout.
                    </p>
                  </div>
                </div>

                <a
                  href={waLink("Hello Naresh, I would like assistance with my order.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-[#25D366]/15 hover:bg-[#25D366]/25 px-3 py-1.5 rounded-xl border border-[#25D366]/30 transition-all self-start sm:self-auto"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Help</span>
                </a>
              </div>

              {/* REAL LOGIN & SIGN UP BUTTONS ON THE PROFILE CARD */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/signup"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          )}

          <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
        </div>

        {/* 2. CLEAN STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveSection('orders')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeSection === 'orders'
                ? 'bg-white border-[#D4AF37] shadow-xs ring-2 ring-[#D4AF37]/15'
                : 'bg-white/80 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[10.5px] font-bold uppercase tracking-wider">My Orders</span>
              <Package className="w-4 h-4 text-[#B38029]" />
            </div>
            <p className="font-serif text-xl font-bold text-gray-900 mt-1">{dbOrders.length}</p>
          </button>

          <Link
            to="/wishlist"
            className="p-3.5 rounded-2xl bg-white/80 border border-gray-200 hover:border-gray-300 text-left transition-all"
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[10.5px] font-bold uppercase tracking-wider">Wishlist</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="font-serif text-xl font-bold text-gray-900 mt-1">{wishlistItems.length}</p>
          </Link>

          <button
            onClick={() => setActiveSection('addresses')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeSection === 'addresses'
                ? 'bg-white border-[#D4AF37] shadow-xs ring-2 ring-[#D4AF37]/15'
                : 'bg-white/80 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[10.5px] font-bold uppercase tracking-wider">Addresses</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-serif text-xl font-bold text-gray-900 mt-1">{user?.addresses?.length || 0}</p>
          </button>

          <a
            href={waLink("Hello Naresh, I would like to inquire about my order status.")}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-white/80 border border-gray-200 hover:border-gray-300 text-left transition-all"
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[10.5px] font-bold uppercase tracking-wider">Support</span>
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
            </div>
            <p className="text-xs font-bold text-[#25D366] mt-2">WhatsApp</p>
          </a>
        </div>

        {/* 3. ORDERS SECTION - NO FAKE DUMMY ORDERS, CLEAN & STRESS-FREE */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-gray-900">Your Orders</h3>
              <span className="text-xs text-gray-400 font-medium">
                {dbOrders.length} {dbOrders.length === 1 ? 'order' : 'orders'} placed
              </span>
            </div>

            {loadingOrders ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 text-xs text-gray-500">
                Checking order records...
              </div>
            ) : dbOrders.length === 0 ? (
              /* Clean, Stress-Free Empty Orders State */
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-200 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#B38029]">
                  <Package className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base sm:text-lg text-gray-900">No Orders Yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Your personalized 3D Moon Lamps and photo frame orders will appear here once placed.
                  </p>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <span>Explore 3D Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* Real Orders List (when present in DB) */
              <div className="space-y-3">
                {dbOrders.map((order, idx) => {
                  const orderTotal = order.totalAmount ?? order.total_amount ?? 0;
                  const firstItem = order.items?.[0] || {};
                  const itemName = firstItem.name || firstItem.product_name || 'Custom 3D Product';
                  const extraCount = (order.items?.length || 1) - 1;
                  const orderDate = order.createdAt || order.createdDate || order.created_at;

                  return (
                    <div
                      key={order.id || idx}
                      className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <span className="font-mono text-xs font-bold text-gray-900">#{order.id}</span>
                        <span className="font-serif font-bold text-sm text-gray-900">
                          ₹{orderTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="font-semibold text-gray-800">
                          {itemName}
                          {extraCount > 0 && <span className="text-gray-500 font-normal"> + {extraCount} more</span>}
                          {firstItem.customName && <span className="text-[#B38029] font-medium block text-[11px] mt-0.5">&ldquo;{firstItem.customName}&rdquo;</span>}
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          Placed on {new Date(orderDate || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          {order.status || 'Received'}
                        </span>
                        <a
                          href={waLink(`Hi Naresh, regarding my order #${order.id}. Could you share an update?`)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#25D366] flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Update</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. ADDRESSES SECTION */}
        {activeSection === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">Saved Addresses</h3>
                <p className="text-xs text-gray-500">Delivery addresses for your 3D gifts</p>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-[#1A1A1A] hover:bg-gray-800 text-[#D4AF37] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-[#D4AF37]/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr, idx) => (
                  <div key={addr.id || idx} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-1 text-xs relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B38029] uppercase bg-[#FAF5EB] px-2 py-0.5 rounded">
                        {addr.type || 'Home'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete address for ${addr.name}?`)) {
                            removeAddress(addr.id);
                          }
                        }}
                        className="p-1 text-gray-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-gray-900 pt-1">{addr.name}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {addr.addressLine}, {addr.city} - {addr.pincode}
                    </p>
                    <p className="text-gray-500 font-mono pt-1">+91 {addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-xs text-gray-500 space-y-2">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto" />
                <p>No addresses saved yet.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddAddress} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-base text-gray-900">Add New Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">Phone</label>
                <input
                  type="text"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">Address</label>
                <textarea
                  required
                  rows={2}
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Pincode</label>
                  <input
                    type="text"
                    required
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#1A1A1A] text-[#D4AF37] text-xs font-bold hover:bg-gray-800"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
