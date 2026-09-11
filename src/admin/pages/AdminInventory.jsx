import React, { useState } from 'react';
import { PackageCheck, Plus, Minus, Search, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminInventory() {
  const { products, updateProduct } = useStoreData();
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStockChange = async (p, delta) => {
    const newStock = Math.max(0, (p.stock || 10) + delta);
    const result = await updateProduct(p.id, { stock: newStock });
    if (!result.success) window.alert(`Could not update stock: ${result.message || 'Unknown error'}`);
  };

  const handleSetStock = async (p, newStock) => {
    const validStock = Math.max(0, Number(newStock) || 0);
    const result = await updateProduct(p.id, { stock: validStock });
    if (!result.success) window.alert(`Could not update stock: ${result.message || 'Unknown error'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Inventory & Stock Controls</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage SKU stock counts, low stock thresholds, and availability</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Item & Image</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Stock Level Status</th>
                <th className="p-4 text-center">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredProducts.map((p) => {
                const stock = p.stock ?? 10;
                const isOut = stock === 0;
                const isLow = stock > 0 && stock <= 3;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg border border-gray-100 shrink-0" />
                        <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-500 text-[11px]">{p.sku || 'SKU-1001'}</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-gray-500">{p.category}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => handleSetStock(p, e.target.value)}
                        className="w-20 p-1.5 rounded-lg border border-gray-300 font-extrabold text-sm text-center focus:outline-none focus:border-[#6B1518]"
                      />
                    </td>
                    <td className="p-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> In Stock ({stock})
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStockChange(p, -1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 flex items-center justify-center"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockChange(p, 1)}
                          className="w-8 h-8 rounded-lg bg-[#6B1518] hover:bg-[#4B0F11] font-bold text-white flex items-center justify-center shadow-xs"
                          title="Increase Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
