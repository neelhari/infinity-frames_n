import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Star, ShieldCheck, Plus, Minus,
  Camera, Upload, Check, ShoppingBag, Zap, Loader2, MessageCircle, X,
  Maximize2, ZoomIn, ZoomOut
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { BRAND, waLink } from '../config/brand';
import { ProductDetailSkeleton } from '../components/Shimmer';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useStoreData();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  // Find product by id from dynamic Supabase products
  const product = useMemo(() => {
    return products.find((p) => String(p.id) === String(id)) || products[0] || {};
  }, [id, products]);

  // Gallery Index & Quantity
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Variant selections
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Touch swipe & Zoom modal states (Myntra-style)
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.5);
  const galleryTouchStartX = useRef(0);
  const galleryTouchEndX = useRef(0);

  const images = useMemo(() => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.image || '/placeholder.png'];
  }, [product]);

  // Synchronize variants when product changes
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }

    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else if (product.frameColors && product.frameColors.length > 0) {
      setSelectedColor(product.frameColors[0]);
    } else {
      setSelectedColor(null);
    }
  }, [product]);

  // Clean Customer Personalization State
  const [customName, setCustomName] = useState('');
  const [customPhotoFile, setCustomPhotoFile] = useState(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const isCustomizable = product.customizable !== false;
  const customType = product.customType || 'photo-text';

  // Gallery Touch Swipe Handlers
  const handleGalleryTouchStart = (e) => {
    galleryTouchStartX.current = e.targetTouches[0].clientX;
    galleryTouchEndX.current = e.targetTouches[0].clientX;
  };

  const handleGalleryTouchMove = (e) => {
    galleryTouchEndX.current = e.targetTouches[0].clientX;
  };

  const handleGalleryTouchEnd = () => {
    const delta = galleryTouchStartX.current - galleryTouchEndX.current;
    if (delta > 40 && images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % images.length);
    } else if (delta < -40 && images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Safe Back Navigation
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/shop');
    }
  };

  // Handle customer image upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomPhotoFile(file);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setCustomPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary in background for permanent order fulfillment link
    setUploadingPhoto(true);
    const res = await uploadToCloudinary(file);
    if (res.success) {
      setCustomPhotoUrl(res.url);
    }
    setUploadingPhoto(false);
  };

  const removeCustomPhoto = () => {
    setCustomPhotoFile(null);
    setCustomPhotoPreview(null);
    setCustomPhotoUrl('');
  };

  const getCustomizedItem = () => ({
    ...product,
    customName: customName.trim() || null,
    customPhoto: customPhotoUrl || customPhotoPreview || null,
    selectedSize: selectedSize || null,
    selectedColor: selectedColor || null,
  });

  const handleAddToCart = () => {
    if (uploadingPhoto) return;
    addToCart(getCustomizedItem(), quantity, selectedColor, selectedSize);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (uploadingPhoto) return;
    addToCart(getCustomizedItem(), quantity, selectedColor, selectedSize);
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loading && (!product || !product.name)) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans">
        <ProductDetailSkeleton />
      </div>
    );
  }

  const currentImageSrc = images[selectedImage] || product.image || '/placeholder.png';

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans">
      <div className="max-w-xl mx-auto">
        {/* 1. Main Photo Gallery with Touch Swipe & Zoom Button */}
        <div
          onTouchStart={handleGalleryTouchStart}
          onTouchMove={handleGalleryTouchMove}
          onTouchEnd={handleGalleryTouchEnd}
          className="relative w-full aspect-square bg-gray-100 overflow-hidden shadow-xs select-none"
        >
          <img
            src={currentImageSrc}
            alt={product.name}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsZoomOpen(true)}
          />

          {/* Floating Back Button with Smart Fallback */}
          <button
            onClick={handleBack}
            className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Floating Action Buttons: Zoom, Wishlist & Share */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <button
              onClick={() => setIsZoomOpen(true)}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all cursor-pointer"
              title="Tap to Zoom (Inspect 3D Details)"
            >
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all cursor-pointer"
              title="Wishlist"
            >
              <Heart
                className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`}
              />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  });
                }
              }}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Dot Indicators */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    selectedImage === idx ? 'w-6 bg-[#B38029]' : 'w-2 bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {product.images && product.images.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto hide-scroll bg-white border-b border-gray-100">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  selectedImage === i ? 'border-[#B38029]' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 2. Product Info */}
        <div className="p-4 sm:p-5 space-y-4 bg-white border-b border-gray-100">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Original</span>
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold text-gray-900">{product.rating || 4.8}</span>
              </div>
              <span>({product.reviewsCount || 120}+ happy patrons)</span>
            </div>
          </div>

          {/* Price & Discount */}
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-2xl font-black text-gray-900">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
            )}
            {product.discount && (
              <span className="bg-amber-100 text-[#8C5E16] text-[10px] font-black px-2 py-0.5 rounded-full">
                {product.discount}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Variant Selectors (Sizes & Styles) */}
        {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0) || (product.frameColors && product.frameColors.length > 0)) && (
          <div className="p-4 sm:p-5 bg-white border-b border-gray-100 space-y-3.5">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#B38029] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {((product.colors && product.colors.length > 0) || (product.frameColors && product.frameColors.length > 0)) && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Style / Light Glow
                </label>
                <div className="flex flex-wrap gap-2">
                  {(product.colors && product.colors.length > 0 ? product.colors : product.frameColors).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedColor === c
                          ? 'bg-[#B38029] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Clean Personalization Section (If enabled on this product) */}
        {isCustomizable && (
          <div className="p-4 sm:p-5 bg-white border-b border-gray-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#B38029]" />
                <span>Personalize Your Gift</span>
              </h2>
              <span className="text-[10px] text-gray-400 font-medium">Optional</span>
            </div>

            {/* A. Custom Text / Name Input (if allowed) */}
            {customType !== 'photo' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Custom Text / Name to Engrave
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul & Priya / Happy Anniversary"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] bg-white text-xs text-gray-900 outline-none"
                />
              </div>
            )}

            {/* B. Photo Upload (if allowed) */}
            {customType !== 'text' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload Photo
                </label>

                {!customPhotoPreview ? (
                  <label className="border-2 border-dashed border-gray-300 hover:border-[#B38029] rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-amber-50/20 group">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#B38029] transition-colors" />
                    <span className="font-bold text-gray-800 text-xs">
                      {uploadingPhoto ? 'Uploading photo...' : 'Tap to select photo from gallery'}
                    </span>
                    <span className="text-[10px] text-gray-400">JPG, PNG supported</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                      <img src={customPhotoPreview} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-gray-900 truncate">
                        {customPhotoFile?.name || 'Photo Attached'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Ready for order
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCustomPhoto}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white cursor-pointer transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Friendly WhatsApp note */}
                <p className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Prefer WhatsApp? You can also send your photo to us on WhatsApp after ordering!</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. Quantity & Total in view */}
        <div className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-gray-800">Quantity</span>
            <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs font-bold text-gray-700 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-xs px-2 text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs font-bold text-gray-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={handleAddToCart}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin text-gray-700" /> : <ShoppingBag className="w-4 h-4 text-gray-700" />}
              <span>{uploadingPhoto ? 'Uploading...' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={handleBuyNow}
              className="flex-1 bg-[#B38029] hover:bg-[#8C5E16] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Zap className="w-4 h-4 fill-white text-white" />}
              <span>{uploadingPhoto ? 'Please wait...' : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {addedToast && (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Added to Cart!</span>
          </div>
        </div>
      )}

      {/* Full-Screen Myntra-Style Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-4xl mx-auto w-full">
            <span className="text-xs font-bold truncate max-w-[200px] sm:max-w-none">
              {product.name} ({selectedImage + 1}/{images.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(3, prev + 0.4))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(1, prev - 0.4))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsZoomOpen(false);
                  setZoomScale(1.5);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                title="Close Zoom View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable View with Touch Swipe */}
          <div
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
            className="flex-1 flex items-center justify-center overflow-hidden my-3 select-none"
          >
            <img
              src={currentImageSrc}
              alt="3D Print Layer Detail"
              style={{ transform: `scale(${zoomScale})` }}
              className="max-h-[72vh] max-w-full object-contain transition-transform duration-200 cursor-grab"
            />
          </div>

          {/* Bottom Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-xl mx-auto w-full">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === idx ? 'border-[#D4AF37]' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
