import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, Video, Play, AlertCircle, Sparkles, Sliders, Layers } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function ProductModal({ isOpen, onClose, onSave, initialProduct, categories = [], saving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    price: '',
    oldPrice: '',
    stock: 10,
    customizable: false,
    customType: 'photo-text',
    sizes: [],
    colors: [],
    materials: [],
    frameColors: [],
    fontStyles: [],
    description: '',
    video: '',
    videoUrl: '',
    images: [],
    isFeatured: false,
    isNew: true,
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [uploadError, setUploadError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Chip input temp states
  const [tagInputs, setTagInputs] = useState({
    size: '',
    color: '',
    material: '',
    frameColor: '',
    fontStyle: '',
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        sku: initialProduct.sku || `IFN-${Math.floor(1000 + Math.random() * 9000)}`,
        category: initialProduct.category || categories[0]?.id || 'customized-gifts',
        subcategory: initialProduct.subcategory || '',
        price: initialProduct.price || '',
        oldPrice: initialProduct.oldPrice || '',
        stock: initialProduct.stock ?? 10,
        customizable: !!initialProduct.customizable,
        customType: initialProduct.customType || 'photo-text',
        sizes: Array.isArray(initialProduct.sizes) ? initialProduct.sizes : [],
        colors: Array.isArray(initialProduct.colors) ? initialProduct.colors : [],
        materials: Array.isArray(initialProduct.materials) ? initialProduct.materials : [],
        frameColors: Array.isArray(initialProduct.frameColors) ? initialProduct.frameColors : [],
        fontStyles: Array.isArray(initialProduct.fontStyles) ? initialProduct.fontStyles : [],
        description: initialProduct.description || '',
        video: initialProduct.video || '',
        videoUrl: initialProduct.videoUrl || '',
        images: Array.isArray(initialProduct.images) && initialProduct.images.length > 0
          ? initialProduct.images
          : (initialProduct.image ? [initialProduct.image] : []),
        isFeatured: !!initialProduct.isFeatured,
        isNew: initialProduct.isNew !== false,
      });
    } else {
      const defaultCat = categories[0]?.id || 'customized-gifts';
      setFormData({
        name: '',
        sku: `IFN-${Math.floor(1000 + Math.random() * 9000)}`,
        category: defaultCat,
        subcategory: '',
        price: '',
        oldPrice: '',
        stock: 20,
        customizable: true,
        customType: 'photo-text',
        sizes: ['Standard'],
        colors: ['Warm White', 'Cool White'],
        materials: ['PLA Eco 3D Filament'],
        frameColors: ['Natural Wood', 'Walnut', 'Black', 'White'],
        fontStyles: ['Style 1', 'Style 2', 'Style 3'],
        description: '',
        video: '',
        videoUrl: '',
        images: [],
        isFeatured: false,
        isNew: true,
      });
    }
    setActiveTab('basic');
    setUploadError('');
  }, [initialProduct, isOpen, categories]);

  if (!isOpen) return null;

  // Tag helper functions
  const addTag = (field, inputKey) => {
    const val = tagInputs[inputKey].trim();
    if (!val) return;
    if (!formData[field].includes(val)) {
      setFormData({ ...formData, [field]: [...formData[field], val] });
    }
    setTagInputs({ ...tagInputs, [inputKey]: '' });
  };

  const removeTag = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // Cloudinary image upload
  const handleImageUpload = async (e) => {
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

  // Cloudinary video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setUploadError('');

    const res = await uploadToCloudinary(file);
    if (res.success) {
      setFormData((prev) => ({
        ...prev,
        videoUrl: res.url,
      }));
    } else {
      setUploadError(`Failed to upload video: ${res.message}`);
    }
    setUploadingVideo(false);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const setAsMainImage = (idx) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [chosen] = newImages.splice(idx, 1);
      return { ...prev, images: [chosen, ...newImages] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setUploadError('Product name is required.');
      setActiveTab('basic');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setUploadError('Please enter a valid selling price.');
      setActiveTab('basic');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
      stock: Number(formData.stock) || 0,
      image: formData.images[0] || '',
      discount: formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
        ? `${Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100)}% OFF`
        : null,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              {initialProduct ? 'Edit 3D Product' : 'Add New 3D Gift / Product'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Infinity Frames N Catalog &bull; Custom options, variants & media
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/60 px-5 gap-4 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Basic Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customization')}
            className={`py-3 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'customization'
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Customization & Variants</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Images & Video ({formData.images.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3D Moon Lamp (12cm) or Custom Lithophane Frame"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. IFN-MOON-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1A1A1A]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Subcategory / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 12cm Moon Lamp, Wooden, LED Frames"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="799"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Strike / Old Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1199"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Product Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the 3D craftsmanship, dimensions, LED lighting details, customization instructions, and package inclusions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A] leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1A1A1A] focus:ring-0"
                  />
                  <span className="font-bold text-gray-800">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1A1A1A] focus:ring-0"
                  />
                  <span className="font-bold text-gray-800">Mark as New Arrival</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMIZATION & VARIANTS */}
          {activeTab === 'customization' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Customizer Enable Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-gray-900">Allow Customer Customization</h4>
                      <p className="text-[11px] text-gray-600">
                        Enable photo upload, custom engraved text, or personalized models for this product
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.customizable}
                    onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                    className="w-5 h-5 rounded text-[#1A1A1A] focus:ring-0 cursor-pointer"
                  />
                </div>

                {formData.customizable && (
                  <div className="pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-800 block mb-1">Customization Type</label>
                      <select
                        value={formData.customType}
                        onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                        className="w-full p-2 rounded-xl border border-amber-200 bg-white font-medium focus:outline-none"
                      >
                        <option value="photo-text">Photo & Custom Text (Both)</option>
                        <option value="photo">Photo Upload Only</option>
                        <option value="text">Engraved Text / Name Only</option>
                        <option value="3d-model">3D File / CAD Prototype</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Sizes / Dimensions */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Available Sizes / Dimensions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 10 cm, 12 cm, 8x10 inch"
                    value={tagInputs.size}
                    onChange={(e) => setTagInputs({ ...tagInputs, size: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('sizes', 'size'))}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('sizes', 'size')}
                    className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.sizes.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold"
                    >
                      {s}
                      <button type="button" onClick={() => removeTag('sizes', idx)} className="hover:text-red-600">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors / Light Modes */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Available Colors / Light Tones</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Warm White, Cool White, 16-Color RGB, Golden Glow"
                    value={tagInputs.color}
                    onChange={(e) => setTagInputs({ ...tagInputs, color: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('colors', 'color'))}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('colors', 'color')}
                    className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                    >
                      {c}
                      <button type="button" onClick={() => removeTag('colors', idx)} className="hover:text-red-600">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Frame Colors (For Photo Frames) */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Frame Color Options (For Frames)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Natural Wood, Walnut, Black, White"
                    value={tagInputs.frameColor}
                    onChange={(e) => setTagInputs({ ...tagInputs, frameColor: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('frameColors', 'frameColor'))}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('frameColors', 'frameColor')}
                    className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.frameColors.map((fc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold"
                    >
                      {fc}
                      <button type="button" onClick={() => removeTag('frameColors', idx)} className="hover:text-red-600">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Materials Used</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PLA Eco 3D Filament, Solid Wood Base, Cast Acrylic Glass"
                    value={tagInputs.material}
                    onChange={(e) => setTagInputs({ ...tagInputs, material: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('materials', 'material'))}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('materials', 'material')}
                    className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.materials.map((m, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold"
                    >
                      {m}
                      <button type="button" onClick={() => removeTag('materials', idx)} className="hover:text-red-600">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & VIDEO */}
          {activeTab === 'media' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Image Upload Box */}
              <div>
                <label className="font-bold text-gray-700 block mb-2">Product Images (Cloudinary)</label>
                <label className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-50/50">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="font-bold text-gray-800">
                    {uploadingImage ? 'Uploading to Cloudinary...' : 'Click to Upload Product Photos'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Supports JPG, PNG, WEBP (Max 10MB each)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Images Gallery */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-gray-700 block">Uploaded Images ({formData.images.length})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden border group bg-gray-50 aspect-square ${
                          idx === 0 ? 'border-amber-400 ring-2 ring-amber-300' : 'border-gray-200'
                        }`}
                      >
                        <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            Main Image
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsMainImage(idx)}
                              className="p-1.5 rounded-lg bg-white text-gray-800 text-[10px] font-bold"
                              title="Set as main image"
                            >
                              Make Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1.5 rounded-lg bg-red-600 text-white"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Section */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <label className="font-bold text-gray-700 block">3D Product Video Demo (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://res.cloudinary.com/... or upload MP4 below"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer text-xs transition-colors">
                  <Video className="w-4 h-4" />
                  <span>{uploadingVideo ? 'Uploading Video...' : 'Upload MP4 Video'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    disabled={uploadingVideo}
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingVideo}
              className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : initialProduct ? 'Update Product' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
