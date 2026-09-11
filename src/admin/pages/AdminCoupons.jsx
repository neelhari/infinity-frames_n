import React, { useState } from 'react';
import { Tag, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');

  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || saving) return;

    setSaving(true);
    const result = await addCoupon({
      code: code.toUpperCase().trim(),
      type,
      discountValue: Number(discountValue),
      minOrder: Number(minOrder) || 0,
      active: true,
    });
    setSaving(false);

    if (!result.success) {
      window.alert(`Could not save coupon: ${result.message || 'Unknown error'}`);
      return;
    }

    setCode('');
    setDiscountValue('');
    setMinOrder('');
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteCoupon(id);
    if (!result.success) {
      window.alert(`Could not delete coupon: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Discount Coupons ({coupons.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage promotional codes active during checkout</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-mono font-extrabold text-base bg-[#F8F0F0] text-[#6B1518] border border-[#EADEDF] px-3 py-1 rounded-xl tracking-wider">
                {c.code}
              </span>
              <button
                onClick={async () => {
                  const result = await updateCoupon(c.id, { active: !c.active });
                  if (!result.success) window.alert(`Could not update coupon: ${result.message || 'Unknown error'}`);
                }}
                className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                  c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.active ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-extrabold text-gray-900">
                {c.type === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
              </div>
              <p className="text-xs text-gray-500">
                Min Order: <strong className="text-gray-800">₹{(c.minOrder || 0).toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[10px]">Storefront Checkout Ready</span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#6B1518]">Create Coupon Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="font-bold text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder={type === 'percentage' ? '15' : '300'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  placeholder="1999"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="bg-[#6B1518] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold">
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
