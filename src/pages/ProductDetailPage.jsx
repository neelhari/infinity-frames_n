import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Star, ShieldCheck, Plus, Minus,
  Camera, Upload, Check, ChevronRight, ShoppingBag, Sparkles, Zap, Loader2
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND } from '../config/brand';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useStoreData();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find product by id from dynamic Supabase products
  const product = useMemo(() => {
    return products.find((p) => String(p.id) === String(id)) || products[0] || {};
  }, [id, products]);

  // Size, Color, Quantity, Gallery Index
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('12 cm');
  const [selectedColor, setSelectedColor] = useState('Warm White');
  const [quantity, setQuantity] = useState(1);

  // Sync variants when product changes
  React.useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  // Customizer Mode States
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customName, setCustomName] = useState('Best Dad Ever');
  const [customPhoto, setCustomPhoto] = useState(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFrameColor, setSelectedFrameColor] = useState('Natural Wood');
  const [selectedFontStyle, setSelectedFontStyle] = useState('Style 1');
  const [addedToast, setAddedToast] = useState(false);

  const inWishlist = isInWishlist(product.id);

  // Handle customer image upload & Cloudinary upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomPhoto(file);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setCustomPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary in background for order fulfillment
    setUploadingPhoto(true);
    const res = await uploadToCloudinary(file);
    if (res.success) {
      setCustomPhotoUrl(res.url);
    }
    setUploadingPhoto(false);
  };

  const frameColors = [
    { name: 'Natural Wood', color: '#D2B48C', border: 'border-amber-300' },
    { name: 'Walnut', color: '#5C4033', border: 'border-amber-900' },
    { name: 'Black', color: '#1A1A1A', border: 'border-gray-900' },
    { name: 'White', color: '#FFFFFF', border: 'border-gray-300' },
  ];

  const fontStyles = ['Style 1', 'Style 2', 'Style 3'];

  const getCustomizedItem = () => ({
    ...product,
    selectedSize,
    selectedColor,
    customName: showCustomizer ? customName : null,
    customPhoto: showCustomizer
      ? (customPhotoUrl || (customPhotoPreview && customPhotoPreview.startsWith('http') ? customPhotoPreview : null))
      : null,
    selectedFrameColor: showCustomizer ? selectedFrameColor : null,
    selectedFontStyle: showCustomizer ? selectedFontStyle : null,
  });

  const handleAddToCart = () => {
    if (uploadingPhoto) return;
    addToCart(getCustomizedItem(), quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (uploadingPhoto) return;
    addToCart(getCustomizedItem(), quantity);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-32 font-sans">
      {/* CUSTOMIZER MODE */}
      {showCustomizer ? (
        <div className="max-w-xl mx-auto px-4 py-3 animate-fadeIn">
          {/* Customizer Header */}
          <div className="sticky top-0 z-30 bg-[#FAF9F6] py-2 flex items-center justify-between border-b border-gray-200 mb-4">
            <button
              onClick={() => setShowCustomizer(false)}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Product</span>
            </button>
            <h1 className="font-serif text-base font-bold text-gray-900">
              Customize Your Product
            </h1>
            <div className="w-8" />
          </div>

          {/* Interactive Frame Mockup with Live Uploaded Photo & Text Preview */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md mb-6 flex flex-col items-center text-center">
            <div
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-2xl p-4 flex flex-col items-center justify-between shadow-inner transition-colors duration-300 ${
                selectedFrameColor === 'Natural Wood'
                  ? 'bg-[#E8D5B7] border-8 border-[#C9B086]'
                  : selectedFrameColor === 'Walnut'
                  ? 'bg-[#4A3525] border-8 border-[#382618]'
                  : selectedFrameColor === 'Black'
                  ? 'bg-[#222222] border-8 border-[#111111]'
                  : 'bg-[#F5F5F5] border-8 border-[#E0E0E0]'
              }`}
            >
              {/* Custom Name / Text engraved at top */}
              <div
                className={`text-sm sm:text-base font-bold tracking-wide transition-all ${
                  selectedFrameColor === 'Walnut' || selectedFrameColor === 'Black'
                    ? 'text-amber-100'
                    : 'text-[#6B4423]'
                } ${
                  selectedFontStyle === 'Style 1'
                    ? 'font-serif italic'
                    : selectedFontStyle === 'Style 2'
                    ? 'font-mono uppercase'
                    : 'font-sans font-extrabold'
                }`}
              >
                {customName || 'Your Custom Text Here'}
              </div>

              {/* Photo Area */}
              <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl overflow-hidden bg-gray-200 relative border-2 border-white shadow-xs group">
                <img
                  src={customPhotoPreview}
                  alt="Custom Preview"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
                  <Camera className="w-6 h-6 mb-1" />
                  <span>Change Photo</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Subtle bottom motto */}
              <span
                className={`text-[10px] italic ${
                  selectedFrameColor === 'Walnut' || selectedFrameColor === 'Black'
                    ? 'text-gray-300'
                    : 'text-gray-600'
                }`}
              >
                Infinity Frames 3D Handcrafted
              </span>
            </div>

            <p className="text-[11px] text-gray-500 mt-3 font-medium">
              Live Preview: Your uploaded photo and chosen text engraved on the frame.
            </p>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4 text-xs">
            {/* 1. Custom Text Input */}
            <div>
              <label className="block font-bold text-gray-800 mb-1.5">Custom Text / Engraved Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Best Dad Ever or Anniversary Date"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#B38029] focus:ring-1 focus:ring-[#B38029] outline-none text-xs"
              />
            </div>

            {/* 2. Photo Upload Box */}
            <div>
              <label className="block font-bold text-gray-800 mb-1.5">Photo Upload</label>
              <label className="border-2 border-dashed border-gray-200 hover:border-[#B38029] rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-gray-50/50">
                <Camera className="w-6 h-6 text-[#B38029]" />
                <span className="font-bold text-gray-800">Tap to upload photo</span>
                <span className="text-[10px] text-gray-400">(JPG, PNG)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. Frame Color Swatches */}
            <div>
              <label className="block font-bold text-gray-800 mb-2">Frame Color</label>
              <div className="flex items-center gap-4">
                {frameColors.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFrameColor(f.name)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <div
                      style={{ backgroundColor: f.color }}
                      className={`w-9 h-9 rounded-full border-2 ${f.border} shadow-xs flex items-center justify-center transition-transform ${
                        selectedFrameColor === f.name ? 'ring-2 ring-[#B38029] scale-110' : ''
                      }`}
                    >
                      {selectedFrameColor === f.name && (
                        <Check
                          className={`w-4 h-4 ${
                            f.name === 'White' || f.name === 'Natural Wood' ? 'text-gray-900' : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Font Style Selector */}
            <div>
              <label className="block font-bold text-gray-800 mb-2">Font Style</label>
              <div className="flex items-center gap-2.5">
                {fontStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedFontStyle(style)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedFontStyle === style
                        ? 'bg-[#B38029] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Quantity Stepper */}
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-gray-800">Quantity</span>
              <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs font-bold text-gray-700 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs font-bold text-gray-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Symmetrical Dual Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                disabled={uploadingPhoto}
                onClick={handleAddToCart}
                className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin text-gray-700" /> : <ShoppingBag className="w-4 h-4 text-gray-700" />}
                <span>{uploadingPhoto ? 'Compressing...' : 'Add'}</span>
              </button>
              <button
                disabled={uploadingPhoto}
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B38029] hover:from-[#C89B3C] hover:to-[#8C5E16] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin fill-white" /> : <Zap className="w-4 h-4 fill-white" />}
                <span>{uploadingPhoto ? 'Please wait...' : 'Buy Now'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD PRODUCT DETAIL VIEW */
        <div className="max-w-xl mx-auto">
          {/* Main Photo Gallery */}
          <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
            <img
              src={(product.images && product.images[selectedImage]) || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Floating Back Button on top left */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Floating Wishlist & Share buttons on top right */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
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
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {(product.images || [product.image]).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    selectedImage === idx ? 'w-6 bg-[#B38029]' : 'w-2 bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto hide-scroll bg-white border-b border-gray-100">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === i ? 'border-[#B38029]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Info Block */}
          <div className="p-4 space-y-4 bg-white border-b border-gray-100">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Trusted Seller</span>
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-gray-900">{product.rating || 4.8}</span>
                </div>
                <span>({product.reviewsCount || 210} Reviews)</span>
              </div>
            </div>

            {/* Price & Discount */}
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-gray-900">₹{product.price}</span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
              )}
              {product.discount && (
                <span className="bg-amber-100 text-[#8C5E16] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {product.discount}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Size</label>
                <div className="flex items-center gap-2.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">LED Light / Color</label>
                <div className="flex items-center gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedColor === c
                          ? 'bg-amber-50 border-[#B38029] text-[#B38029] font-bold'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-gray-800">Quantity</span>
              <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs font-bold text-gray-700 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-xs font-bold text-gray-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* In-Page Action Buttons: ADD & BUY NOW */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              {product.customizable && (
                <button
                  onClick={() => setShowCustomizer(true)}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-[#B38029] border border-amber-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#B38029]" />
                  <span>Customize Photo & Text</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs uppercase tracking-wider active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-gray-700" />
                  <span>Add</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B38029] hover:brightness-105 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer text-xs uppercase tracking-wider active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* FIXED BOTTOM ACTION BAR - Always visible on mobile */}
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3.5 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.1)]">
            <div className="max-w-xl mx-auto flex items-center gap-2.5">
              <button
                onClick={() => toggleWishlist(product)}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center text-[9px] font-bold text-gray-600 transition-colors shrink-0 cursor-pointer"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`}
                />
                <span className="text-[8px] mt-0.5">Wishlist</span>
              </button>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs uppercase tracking-wider active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-gray-700" />
                <span>Add</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B38029] hover:brightness-105 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Added Toast */}
      {addedToast && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-50 pointer-events-none animate-fadeIn">
          <div className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-[#C89B3C]">
            <Check className="w-4 h-4 text-[#C89B3C]" />
            <span>Added to Cart!</span>
          </div>
        </div>
      )}
    </div>
  );
}
