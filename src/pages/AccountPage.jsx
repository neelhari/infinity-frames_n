import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Clock,
  ArrowLeft,
  Truck,
  ExternalLink,
  Eye,
  FileText,
  RefreshCw,
  Box
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { fetchOrdersByPhone } from '../lib/supabase';
import { BRAND, waLink } from '../config/brand';

// Demo 3D gifting orders if customer has no saved orders yet
const SAMPLE_ORDERS = [
  {
    id: 'IFN-98421',
    created_at: '2026-09-10T14:20:00Z',
    status: 'shipped',
    total_amount: 1499,
    items: [
      {
        product_name: '3D Rotating Moon Lamp (15cm) with Touch Sensor & Wooden Stand',
        image_url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600&auto=format&fit=crop&q=80',
        size: '15 cm',
        color: 'Warm White & Moonlight',
        quantity: 1,
        price: 1499,
        custom_text: 'Forever & Always ❤️ - 10th Anniversary',
        custom_photo: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&auto=format&fit=crop&q=80'
      }
    ],
    tracking_number: 'BLUEDART-88392104',
    estimated_delivery: 'Tomorrow by 5:00 PM',
    shipping_address: 'Main Road, Drakshramam, Andhra Pradesh - 533262'
  },
  {
    id: 'IFN-98418',
    created_at: '2026-09-06T10:15:00Z',
    status: 'delivered',
    total_amount: 899,
    items: [
      {
        product_name: 'Personalized Acrylic LED Plaque - Couple Silhouette',
        image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
        size: 'A5 (8x6 inch)',
        color: 'Warm Golden LED',
        quantity: 1,
        price: 899,
        custom_text: 'Best Dad In The World 🏆',
        custom_photo: null
      }
    ],
    tracking_number: 'DELHIVERY-44910283',
    delivered_on: 'Sep 8, 2026',
    shipping_address: 'Main Road, Drakshramam, Andhra Pradesh - 533262'
  },
  {
    id: 'IFN-98412',
    created_at: '2026-09-11T09:30:00Z',
    status: 'processing',
    total_amount: 1899,
    items: [
      {
        product_name: 'Customized 4-Sided Lithophane Night Lamp',
        image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
        size: 'Square 12x12 cm',
        color: 'Ivory Relief Filament',
        quantity: 1,
        price: 1899,
        custom_text: 'Family Memories 2026',
        custom_photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80'
      }
    ],
    tracking_stage: 'High-Precision 3D Printing in Progress (68% completed)',
    shipping_address: 'Main Road, Drakshramam, Andhra Pradesh - 533262'
  }
];

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const { user, isAuthenticated, logout, openLoginModal, addAddress } = useAuth();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'orders'); // 'orders' | 'addresses' | 'creations' | 'profile'
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all' | 'processing' | 'shipped' | 'delivered'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  const [newAddr, setNewAddr] = useState({
    name: user?.name || 'Naresh Kukkala',
    phone: user?.phone || '9494066914',
    addressLine: 'Near Bhimeswara Swamy Temple, Main Road',
    city: 'Drakshramam',
    state: 'Andhra Pradesh',
    pincode: '533262',
    type: 'Home',
  });

  const [dbOrders, setDbOrders] = useState([]);

  useEffect(() => {
    if (!user?.phone) {
      setDbOrders([]);
      return;
    }
    let active = true;
    fetchOrdersByPhone(user.phone).then((res) => {
      if (active && res.success && res.data?.length > 0) {
        setDbOrders(res.data);
      }
    });
    return () => { active = false; };
  }, [user?.phone]);

  // Combine real DB orders with sample orders so user always sees full Screen 10 interface
  const displayedOrders = dbOrders.length > 0 ? dbOrders : SAMPLE_ORDERS;

  const filteredOrders = displayedOrders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    return order.status?.toLowerCase() === orderStatusFilter;
  });

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.addressLine || !newAddr.pincode) return;
    addAddress(newAddr);
    setShowAddressModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'processing':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5" /> 3D Printing / In Studio
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Clean Top Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#B38029] py-1.5 px-3 rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Store</span>
          </button>
          <span className="text-xs font-bold text-[#B38029] bg-[#FAF5EB] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Infinity Frames N Customer Portal
          </span>
        </div>

        {/* Screen 9: Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#D4AF37]/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#B38029] to-[#F3E5AB] flex items-center justify-center text-2xl sm:text-3xl font-serif font-black text-gray-950 shrink-0 shadow-lg border-2 border-white/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {user?.name || 'Naresh Kukkala'}
                  </h1>
                  <span className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    ★ Infinity Gold Member
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  +91 {user?.phone || '9494066914'}
                </p>
                <p className="text-[11px] text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {user?.email || 'naresh.kukkala@infinityframesn.com'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={waLink(`Hi Naresh, I need assistance with my Infinity Frames N account.`)}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-[#25D366]/40 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className="hidden sm:inline">WhatsApp Help</span>
              </a>

              {isAuthenticated && (
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
              )}
            </div>
          </div>

          {/* Golden glow decoration */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/20'
                : 'bg-white/80 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</span>
              <Package className="w-4 h-4 text-[#B38029]" />
            </div>
            <p className="font-serif text-2xl font-bold text-gray-900 mt-1">{displayedOrders.length}</p>
            <span className="text-[10px] text-amber-700 font-semibold">Active & Delivered</span>
          </button>

          <Link
            to="/wishlist"
            className="p-4 rounded-2xl bg-white/80 border border-gray-200 hover:border-gray-300 text-left transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wishlist</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="font-serif text-2xl font-bold text-gray-900 mt-1">{wishlistItems?.length || 4}</p>
            <span className="text-[10px] text-rose-600 font-semibold">Saved Creations</span>
          </Link>

          <button
            onClick={() => setActiveTab('creations')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'creations'
                ? 'bg-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/20'
                : 'bg-white/80 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">3D Designs</span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="font-serif text-2xl font-bold text-gray-900 mt-1">3</p>
            <span className="text-[10px] text-gray-500 font-semibold">Customized Previews</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/20'
                : 'bg-white/80 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-gray-900 mt-1">{user?.addresses?.length || 1}</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Drakshramam Hub</span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📦 My Orders & 3D Tracking
          </button>

          <button
            onClick={() => setActiveTab('creations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'creations'
                ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            ✨ Saved 3D Customizations
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📍 Delivery Addresses
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            👤 Profile Details
          </button>
        </div>

        {/* TAB 1: SCREEN 10 - MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Screen 10: Status Filter Chips */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-gray-200 shadow-xs">
                {[
                  { key: 'all', label: 'All Orders', count: displayedOrders.length },
                  { key: 'processing', label: '3D Printing', count: displayedOrders.filter(o => o.status === 'processing').length },
                  { key: 'shipped', label: 'Shipped', count: displayedOrders.filter(o => o.status === 'shipped').length },
                  { key: 'delivered', label: 'Delivered', count: displayedOrders.filter(o => o.status === 'delivered').length },
                ].map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => setOrderStatusFilter(chip.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      orderStatusFilter === chip.key
                        ? 'bg-[#D4AF37] text-gray-950 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderStatusFilter === chip.key ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                Showing {filteredOrders.length} personalized {filteredOrders.length === 1 ? 'gift' : 'gifts'}
              </span>
            </div>

            {/* Orders Cards List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-4">
                <Box className="w-12 h-12 text-gray-300 mx-auto" />
                <div>
                  <h3 className="font-bold text-gray-800 text-base">No orders found in this filter</h3>
                  <p className="text-xs text-gray-500 mt-1">Explore our 3D Moon Lamps and customized frames</p>
                </div>
                <Link
                  to="/shop"
                  className="inline-block bg-gradient-to-r from-[#B38029] to-[#D4AF37] text-gray-950 text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:brightness-105"
                >
                  Explore 3D Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, idx) => (
                  <div
                    key={order.id || idx}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37]/50 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-gray-900">
                          #{order.id}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="font-serif font-bold text-base text-gray-900">
                          ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {(order.items || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-4 items-start">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                            <img
                              src={item.image_url || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300'}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                            {item.custom_photo && (
                              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-tl-lg bg-black/60 border-t border-l border-white/50 overflow-hidden" title="Custom Photo Uploaded">
                                <img src={item.custom_photo} alt="Upload" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-bold text-sm text-gray-900 leading-snug truncate">
                              {item.product_name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>• Style: {item.color}</span>}
                              <span>• Qty: {item.quantity || 1}</span>
                            </div>

                            {/* Customization Details */}
                            {item.custom_text && (
                              <div className="inline-flex items-center gap-1.5 bg-[#FAF5EB] border border-[#D4AF37]/30 px-2.5 py-1 rounded-md text-[11px] text-[#B38029] font-medium">
                                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                <span>Engraved: "{item.custom_text}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate max-w-xs">{order.shipping_address || 'Drakshramam, Andhra Pradesh'}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Track 3D Progress</span>
                        </button>

                        <a
                          href={waLink(`Hi Naresh, regarding my order #${order.id} (${order.items?.[0]?.product_name}). Could you share an update?`)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-800 rounded-lg font-bold flex items-center gap-1 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>WhatsApp Update</span>
                        </a>

                        <button
                          onClick={() => alert(`Invoice for Order #${order.id} will be generated & sent to WhatsApp!`)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED 3D CUSTOMIZATIONS */}
        {activeTab === 'creations' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">Your Customized 3D Designs</h3>
                  <p className="text-xs text-gray-500">Live previews created with your uploaded memories</p>
                </div>
                <Link
                  to="/product/moon-lamp-15cm"
                  className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] text-gray-950 text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:brightness-105"
                >
                  + Create New 3D Gift
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  {
                    title: "Moon Lamp 15cm",
                    text: "Forever & Always ❤️",
                    img: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400",
                    price: "₹1,499",
                    id: "moon-lamp-15cm"
                  },
                  {
                    title: "Acrylic LED Plaque",
                    text: "Best Dad In The World 🏆",
                    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400",
                    price: "₹849",
                    id: "acrylic-led-frame"
                  },
                  {
                    title: "Lithophane Cube",
                    text: "Family Memories 2026",
                    img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400",
                    price: "₹1,899",
                    id: "lithophane-night-lamp"
                  }
                ].map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#D4AF37] transition-all bg-gray-50 p-3 space-y-3">
                    <div className="aspect-square rounded-lg overflow-hidden relative bg-black/5">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-[#D4AF37] text-gray-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        Live Preview
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                      <p className="text-xs text-[#B38029] font-medium truncate mt-0.5">"{item.text}"</p>
                      <p className="text-xs font-bold text-gray-900 mt-1">{item.price}</p>
                    </div>
                    <Link
                      to={`/product/${item.id}`}
                      className="block text-center w-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Re-open in Customizer
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">Delivery Addresses</h3>
                <p className="text-xs text-gray-500">Manage addresses for safe 3D gift deliveries across India</p>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-[#1A1A1A] hover:bg-gray-800 text-[#D4AF37] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-[#D4AF37]/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border-2 border-[#D4AF37] shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#FAF5EB] text-[#B38029] border border-[#D4AF37]/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Default Home
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <h4 className="font-bold text-sm text-gray-900">Naresh Kukkala</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Near Bhimeswara Swamy Temple, Main Road<br />
                  Drakshramam, Andhra Pradesh - 533262
                </p>
                <p className="text-xs text-gray-700 font-mono mt-2 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#B38029]" /> +91 9494066914
                </p>
              </div>

              {user?.addresses?.map((addr, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {addr.type || 'Secondary'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{addr.name}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {addr.addressLine}<br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-700 font-mono mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" /> +91 {addr.phone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">Account & Security</h3>
              <p className="text-xs text-gray-500">Your customer identity with Infinity Frames N</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || 'Naresh Kukkala'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Registered Mobile (WhatsApp)</label>
                <input
                  type="text"
                  readOnly
                  value={`+91 ${user?.phone || '9494066914'}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Email Address</label>
                <input
                  type="text"
                  readOnly
                  value={user?.email || 'naresh.kukkala@infinityframesn.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Workshop & Studio Hub</label>
                <input
                  type="text"
                  readOnly
                  value="Drakshramam, Andhra Pradesh - 533262"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FAF5EB] rounded-xl border border-[#D4AF37]/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B38029] shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Encrypted Customer Data & Photo Privacy</p>
                <p className="text-amber-800/80">
                  All photos uploaded for 3D Moon Lamps and Lithophanes are processed exclusively for 3D slicing in our Drakshramam studio and are automatically purged after order delivery.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Track 3D Progress Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#B38029] uppercase tracking-wider">Live Order Timeline</span>
                <h3 className="font-serif font-bold text-lg text-gray-900">Order #{selectedOrderForTracking.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4">
              {[
                { title: 'Order Placed & Photo Verified', desc: 'High-res image received & approved by designer', done: true },
                { title: '3D CAD Slicing & Lithophane Mapping', desc: 'Converted to 0.12mm precision micro-layers', done: true },
                {
                  title: selectedOrderForTracking.status === 'processing' ? '3D Printing in Progress (Drakshramam Studio)' : '3D Printing Completed & Quality Checked',
                  desc: selectedOrderForTracking.status === 'processing' ? 'Currently on 3D printer bed at 210°C' : 'Passed light diffusion & durability test',
                  done: true,
                  active: selectedOrderForTracking.status === 'processing'
                },
                {
                  title: selectedOrderForTracking.status === 'delivered' ? 'Dispatched & Delivered' : 'Express Courier Dispatch',
                  desc: selectedOrderForTracking.tracking_number ? `Tracking ID: ${selectedOrderForTracking.tracking_number}` : 'Handover to Bluedart Express',
                  done: selectedOrderForTracking.status === 'shipped' || selectedOrderForTracking.status === 'delivered',
                  active: selectedOrderForTracking.status === 'shipped'
                }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.active
                        ? 'bg-[#D4AF37] text-gray-950 ring-4 ring-[#D4AF37]/30 animate-pulse'
                        : step.done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.done && !step.active ? '✓' : idx + 1}
                    </div>
                    {idx < 3 && <div className={`w-0.5 h-10 ${step.done ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${step.active ? 'text-[#B38029]' : 'text-gray-900'}`}>{step.title}</h5>
                    <p className="text-[11px] text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF5EB] p-4 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900">Need Customization Changes?</p>
                <p className="text-[11px] text-amber-800/80">Message Naresh directly on WhatsApp before dispatch</p>
              </div>
              <a
                href={waLink(`Hi Naresh, quick question about my 3D order #${selectedOrderForTracking.id}`)}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddAddress} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-base text-gray-900">Add New Delivery Address</h3>
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
                <label className="font-bold text-gray-700">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">House / Street / Landmark</label>
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
