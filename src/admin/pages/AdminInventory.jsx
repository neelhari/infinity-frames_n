import React, { useState } from 'react';
import { PackageCheck, Plus, Minus, Search, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { TableSkeleton } from '../../components/Shimmer';

export default function AdminInventory() {
  const { products, updateProduct, loading } = useStoreData();
  const [search, setSearch] = useState('');
  const [pendingStock, setPendingStock] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const getEffectiveStock = (p) => {
    return pendingStock[p.id] !== undefined ? pendingStock[p.id] : (p.stock ?? 10);
  };

  const handleStockChange = (p, delta) => {
    const current = getEffectiveStock(p);
    const updated = Math.max(0, current + delta);
    setPendingStock((prev) => ({ ...prev, [p.id]: updated }));
  };

  const handleSetStock = (p, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPendingStock((prev) => ({ ...prev, [p.id]: num }));
  };

  const handleSaveStock = async (p) => {
    const newStock = getEffectiveStock(p);
    setSavingId(p.id);
    const result = await updateProduct(p.id, { stock: newStock });
    setSavingId(null);
    if (!result.success) {
      window.alert(`Could not update stock: ${result.message || 'Unknown error'}`);
    } else {
      setSavedId(p.id);
      setTimeout(() => setSavedId(null), 2000);
      setPendingStock((prev) => {
        const copy = { ...prev };
        delete copy[p.id];
        return copy;
      });
    }
  };

  const modifiedCount = Object.keys(pendingStock).filter((id) => {
    const prod = products.find((p) => p.id === id);
    return prod && pendingStock[id] !== (prod.stock ?? 10);
  }).length;

  const handleSaveAll = async () => {
    for (const [id, stockVal] of Object.entries(pendingStock)) {
      const prod = products.find((p) => p.id === id);
      if (prod && stockVal !== (prod.stock ?? 10)) {
        await updateProduct(id, { stock: stockVal });
      }
    }
    setPendingStock({});
    window.alert('All stock adjustments saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Inventory & Stock Controls</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage SKU stock counts, low stock thresholds, and availability</p>
        </div>

        <div className="flex items-center gap-3">
          {modifiedCount > 0 && (
            <button
              onClick={handleSaveAll}
              className="bg-gradient-to-r from-[#B38029] to-[#D4AF37] hover:brightness-105 text-gray-950 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save All Changes ({modifiedCount})</span>
            </button>
          )}

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
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
                <th className="p-4 text-center">Adjust & Save</th>
              </tr>
            </thead>
            {loading && products.length === 0 ? (
              <TableSkeleton rows={6} cols={6} />
            ) : (
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400 font-serif text-sm">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const stock = getEffectiveStock(p);
                    const originalStock = p.stock ?? 10;
                    const isModified = pendingStock[p.id] !== undefined && pendingStock[p.id] !== originalStock;
                    const isSaving = savingId === p.id;
                    const isSaved = savedId === p.id;
                    const isOut = stock === 0;
                    const isLow = stock > 0 && stock <= 3;

                    return (
                      <tr key={p.id} className={`hover:bg-gray-50/80 transition-colors ${isModified ? 'bg-amber-50/30' : ''}`}>
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
                            className={`w-20 p-1.5 rounded-lg border font-extrabold text-sm text-center focus:outline-none ${
                              isModified
                                ? 'border-[#B38029] bg-amber-50 text-[#B38029] ring-2 ring-[#B38029]/20'
                                : 'border-gray-300 text-gray-900 focus:border-[#1A1A1A]'
                            }`}
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
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 flex items-center justify-center cursor-pointer active:scale-95"
                              title="Decrease Stock"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStockChange(p, 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 flex items-center justify-center cursor-pointer active:scale-95"
                              title="Increase Stock"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* Explicit Save Button with Visual Confirmation */}
                            <button
                              onClick={() => handleSaveStock(p)}
                              disabled={isSaving}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSaved
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : isSaving
                                  ? 'bg-gray-400 text-white cursor-wait'
                                  : isModified
                                  ? 'bg-[#1A1A1A] hover:bg-black text-[#D4AF37] border border-[#D4AF37]/50 shadow-md scale-105'
                                  : 'bg-gray-50 text-gray-400 border border-gray-200 hover:text-gray-700'
                              }`}
                              title="Save Stock Level"
                            >
                              {isSaved ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  <span>Saved</span>
                                </>
                              ) : isSaving ? (
                                <span>Saving...</span>
                              ) : (
                                <span>Save</span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
