import React, { useEffect } from 'react';
import { Users, ShoppingBag, Phone, Mail } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminCustomers() {
  const { orders, refreshOrders } = useStoreData();

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Extract unique customers from orders
  const customersMap = {};
  orders.forEach((o) => {
    const key = o.customerPhone || o.customerName;
    if (!customersMap[key]) {
      customersMap[key] = {
        name: o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail || 'n/a',
        ordersCount: 0,
        totalSpent: 0,
        lastOrder: o.date,
      };
    }
    customersMap[key].ordersCount += 1;
    customersMap[key].totalSpent += o.totalAmount;
  });

  const customerList = Object.values(customersMap);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Customer Directory ({customerList.length})</h2>
        <p className="text-xs text-gray-500 mt-0.5">Purchasing history and contact directory</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Last Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {customerList.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{c.name}</td>
                  <td className="p-4 text-gray-600 font-mono">{c.phone}</td>
                  <td className="p-4 text-gray-500">{c.email}</td>
                  <td className="p-4 font-bold text-gray-800">{c.ordersCount} Orders</td>
                  <td className="p-4 font-extrabold text-gray-900 text-sm">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-gray-500">{c.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
