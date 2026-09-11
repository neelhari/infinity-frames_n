import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell, ShieldCheck, UserCheck, CheckCircle2, Lock, LogOut } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { BRAND } from '../config/brand';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAdminAuth();

  const handleSignOut = async () => {
    if (!window.confirm('Sign out of the admin panel?')) return;
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  // Get view title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard & Sales Overview';
    if (path.includes('/products')) return 'Clothing Products Catalog';
    if (path.includes('/categories')) return 'Store Categories & Collections';
    if (path.includes('/inventory')) return 'Inventory & Stock Management';
    if (path.includes('/orders')) return 'Customer Orders & Fulfillment';
    if (path.includes('/customers')) return 'Customer Directory & Order Metrics';
    if (path.includes('/coupons')) return 'Coupons & Discount Promotions';
    if (path.includes('/banners')) return 'Homepage Banners & Hero Slider CMS';
    if (path.includes('/messages')) return 'Customer Contact Messages';
    if (path.includes('/settings')) return 'Store Configuration & Tax / GST Settings';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex text-gray-900 font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64 h-full">
            <AdminSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Header Bar */}
        <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#6B1518] leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Aalaya Vastra Production CMS • Store Status: <span className="text-emerald-600 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 inline" /> Live</span>
              </p>
            </div>
          </div>

          {/* Header Action Bar */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#6B1518] transition-colors"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6B1518]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-3 z-50 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-900">Notifications</span>
                    <span className="text-[10px] bg-[#F8F0F0] text-[#6B1518] font-bold px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="font-bold text-gray-800">New Order #AV-100242</p>
                      <p className="text-gray-500 text-[11px]">Priya Reddy ordered Banarasi Tissue Saree • ₹3,499</p>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                      <p className="font-bold">Low Stock Warning</p>
                      <p className="text-[11px]">Banarasi Petite Work Saree has only 2 items left!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#6B1518] text-[#D3923A] font-serif font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {user?.email?.slice(0, 2)?.toUpperCase() || 'AV'}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <span className="block text-xs font-bold text-gray-900 leading-none truncate max-w-[140px]">{user?.email || BRAND.ownerName}</span>
                <span className="text-[10px] text-gray-500 font-medium">Store Admin</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-[#6B1518] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
