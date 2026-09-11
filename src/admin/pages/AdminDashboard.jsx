import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { products, orders, refreshOrders } = useStoreData();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Compute REAL metrics from StoreDataContext
  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed').length;
  const lowStockProducts = products.filter((p) => (p.stock || 5) <= 3);

  const kpis = [
    {
      title: "Total Revenue",
      value: `₹${totalSales.toLocaleString('en-IN')}`,
      change: "+18.4%",
      isPositive: true,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      title: "Total Orders",
      value: orders.length,
      change: "+12.2%",
      isPositive: true,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Clothing Products",
      value: products.length,
      change: "Active Catalog",
      isPositive: true,
      icon: ShoppingBag,
      color: "bg-[#F8F0F0] text-[#6B1518] border-[#EADEDF]",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockProducts.length,
      change: "Action Required",
      isPositive: false,
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Welcome Back, Harini! 👋</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Here is what's happening with Aalaya Vastra store today.
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 self-start sm:self-auto">
          {['today', '7', '30', '90'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                timeRange === range
                  ? 'bg-[#6B1518] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === 'today' ? 'Today' : `${range} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border bg-white shadow-2xs flex flex-col justify-between space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
                <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                  {kpi.isPositive ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3.5 h-3.5" /> {kpi.change}</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-0.5"><AlertTriangle className="w-3.5 h-3.5" /> {kpi.change}</span>
                  )}
                  <span className="text-gray-400">vs last period</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">Recent Customer Orders</h3>
              <p className="text-xs text-gray-500">Live order fulfillment stream</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-[#6B1518] hover:underline"
            >
              View All Orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-y border-gray-100">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#6B1518]">{order.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{order.customerName}</div>
                      <div className="text-[10px] text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{order.date}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Low Stock Alerts & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Warning Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Items
              </h3>
              <button
                onClick={() => navigate('/admin/inventory')}
                className="text-xs font-bold text-[#6B1518] hover:underline"
              >
                Manage Stock
              </button>
            </div>

            <div className="space-y-3">
              {lowStockProducts.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Stock Left: {item.stock || 2} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-[#6B1518] text-white p-6 rounded-3xl space-y-4 shadow-md">
            <h3 className="font-serif text-lg font-bold">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/products')}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>+ Add New Saree or Dress</span>
                <span>→</span>
              </button>
              <button
                onClick={() => navigate('/admin/coupons')}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>+ Create Discount Coupon</span>
                <span>→</span>
              </button>
              <button
                onClick={() => navigate('/admin/banners')}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>+ Update Hero Banners</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
