import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function ProductModal({ isOpen, onClose, onSave, initialProduct, categories = [], saving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    oldPrice: '',
    stock: 20,
    description: '',
    images: [],
    customizable: true,
    customType: 'photo-text',
    isFeatured: false,
    isNew: true,
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        category: initialProduct.category || categories[0]?.id || 'photo-frames',
        subcategory: initialProduct.subcategory || '',
        price: initialProduct.price || '',
        oldPrice: initialProduct.oldPrice || '',
        stock: initialProduct.stock ?? 20,
        description: initialProduct.description || '',
        images: Array.isArray(initialProduct.images) && initialProduct.images.length > 0
          ? initialProduct.images
          : (initialProduct.image ? [initialProduct.image] : []),
        customizable: initialProduct.customizable !== false,
        customType: initialProduct.customType || 'photo-text',
        isFeatured: !!initialProduct.isFeatured,
        isNew: initialProduct.isNew !== false,
      });
    } else {
      const defaultCat = categories[0]?.id || 'photo-frames';
      setFormData({
        name: '',
        category: defaultCat,
        subcategory: '',
        price: '',
        oldPrice: '',
        stock: 20,
        description: '',
        images: [],
        customizable: true,
        customType: 'photo-text',
        isFeatured: false,
        isNew: true,
      });
    }
    setImageUrlInput('');
    setUploadError('');
  }, [initialProduct, isOpen, categories]);

  if (!isOpen) return null;

  // Cloudinary image file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    setUploadError('');

    for (const file of files) {
      const res = await uploadToCloudinary(file);
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.url],
        }));
      } else {
        setUploadError(`Failed to upload ${file.name}: ${res.message}`);
        break;
      }
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  // Add image by direct URL
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setImageUrlInput('');
  };

  const removeImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setUploadError('Please enter Product Name.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setUploadError('Please enter a valid Price.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
      stock: Number(formData.stock) || 0,
      image: formData.images[0] || '',
      images: formData.images,
      discount: formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
        ? `${Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100)}% OFF`
        : null,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn font-sans">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in the basic product details and upload photos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Single Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {uploadError}
            </div>
          )}

          {/* 1. Basic Details */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Product Title / Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 3D Customized Moon Lamp with Touch Sensor"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] bg-white text-xs text-gray-900 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Subcategory <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g. LED Frames, 15cm Lamp"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] bg-white text-xs text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Price & Inventory */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="₹849"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] bg-white text-xs font-bold text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                MRP / Old Price (₹) <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.oldPrice}
                onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                placeholder="₹1299"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] bg-white text-xs text-gray-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="20"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] bg-white text-xs text-gray-700 outline-none"
              />
            </div>
          </div>

          {/* 3. Product Images Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-800">
              Product Images <span className="text-gray-400 font-normal">(First image is main display)</span>
            </label>

            {/* Upload Area */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 border-2 border-dashed border-gray-300 hover:border-[#B38029] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-white group">
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#B38029] transition-colors" />
                <span className="font-bold text-gray-700 text-xs">
                  {uploadingImage ? 'Uploading to Cloudinary...' : 'Click to Upload Images'}
                </span>
                <span className="text-[10px] text-gray-400">JPG, PNG, WEBP supported</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Paste URL directly */}
              <div className="sm:w-64 flex flex-col justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="font-bold text-gray-700 text-[11px]">Or paste Image URL:</span>
                <div className="flex gap-1.5 mt-1.5">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 p-2 bg-white rounded-lg border border-gray-300 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 bg-gray-900 text-white rounded-lg font-bold text-xs hover:bg-black cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Images Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Description */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Description <span className="text-gray-400 font-normal">(Details, size, dimensions, what's included)</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Handcrafted 3D photo frame made with premium finish. Perfect gift for birthdays, anniversaries, and weddings."
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] bg-white text-xs text-gray-900 outline-none resize-none"
            />
          </div>

          {/* 5. Simple Customization Checkbox */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.customizable}
                onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-[#B38029] rounded"
              />
              <div>
                <span className="font-bold text-gray-900 block text-xs">
                  Require Customer Photo or Text Customization?
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  When checked, customers can upload their photo and enter custom text on the product page.
                </p>
              </div>
            </label>

            {formData.customizable && (
              <div className="pt-2 pl-7 flex items-center gap-3">
                <span className="font-semibold text-gray-700 text-[11px]">Allow:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="customType"
                    value="photo-text"
                    checked={formData.customType === 'photo-text'}
                    onChange={() => setFormData({ ...formData, customType: 'photo-text' })}
                    className="accent-[#B38029]"
                  />
                  <span>Photo & Text (Both)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="customType"
                    value="photo"
                    checked={formData.customType === 'photo'}
                    onChange={() => setFormData({ ...formData, customType: 'photo' })}
                    className="accent-[#B38029]"
                  />
                  <span>Photo Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="customType"
                    value="text"
                    checked={formData.customType === 'text'}
                    onChange={() => setFormData({ ...formData, customType: 'text' })}
                    className="accent-[#B38029]"
                  />
                  <span>Text Only</span>
                </label>
              </div>
            )}
          </div>

          {/* 6. Badges */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="accent-[#B38029] rounded"
              />
              <span className="font-bold text-gray-700">Feature on Home Page</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="accent-[#B38029] rounded"
              />
              <span className="font-bold text-gray-700">New Arrival Badge</span>
            </label>
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-2.5 rounded-xl bg-[#B38029] hover:bg-[#8C5E16] disabled:opacity-50 text-white font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : (initialProduct ? 'Update Product' : 'Add to Catalog')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
