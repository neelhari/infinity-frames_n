import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import ClothingProductModal from '../components/ClothingProductModal';

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStoreData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    setSaving(true);
    const result = editingProduct
      ? await updateProduct(editingProduct.id, formData)
      : await addProduct(formData);
    setSaving(false);

    if (!result.success) {
      window.alert(`Could not save product: ${result.message || 'Unknown error'}`);
      return false;
    }
    return true;
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clothing product?')) return;
    const result = await deleteProduct(id);
    if (!result.success) {
      window.alert(`Could not delete product: ${result.message || 'Unknown error'}`);
    }
  };

  const handleDuplicateProduct = async (p) => {
    const { id, createdDate, ...rest } = p;
    const duplicate = {
      ...rest,
      name: `${p.name} (Copy)`,
      sku: `${p.sku || 'SKU'}-COPY`,
    };
    const result = await addProduct(duplicate);
    if (!result.success) {
      window.alert(`Could not duplicate product: ${result.message || 'Unknown error'}`);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Clothing Catalog ({products.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage sarees, dresses, fabrics, and sizes</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Clothing Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-gray-200 bg-white font-semibold focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-[#6B1518]"
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">MRP</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 font-serif text-sm">
                    No clothing items found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(p.id)}
                        onChange={() => toggleSelectItem(p.id)}
                        className="rounded text-[#6B1518]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-14 object-cover rounded-xl border border-gray-100 shrink-0" />
                        <div>
                          <div className="font-bold text-gray-900 text-xs line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-gray-500 font-medium mt-0.5">{p.fabric || 'Pure Fabric'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-500 text-[11px]">{p.sku || 'SKU-1001'}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900 text-sm">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-gray-400 line-through">₹{(p.oldPrice || p.price + 500).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        (p.stock || 10) > 3
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.stock || 10} In Stock
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(p)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <ClothingProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        categories={categories}
        saving={saving}
      />
    </div>
  );
}
