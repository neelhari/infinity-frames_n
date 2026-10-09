import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Eye, CheckCircle2, Clock, Truck, XCircle, Search, Filter, Loader2,
  Printer, ExternalLink, AlertCircle, Copy, Check, Box
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { TableSkeleton } from '../../components/Shimmer';

export default function AdminOrders() {
  const { orders, products, updateOrderStatus, updateOrderShipment, refreshOrders } = useStoreData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ekart Shipping State
  const [shippingModalOrder, setShippingModalOrder] = useState(null);
  const [packageWeight, setPackageWeight] = useState(500); // grams
  const [packageLength, setPackageLength] = useState(30); // cm
  const [packageWidth, setPackageWidth] = useState(20); // cm
  const [packageHeight, setPackageHeight] = useState(5); // cm
  const [isBookingShipment, setIsBookingShipment] = useState(false);
  const [shipmentError, setShipmentError] = useState('');
  const [labelLoadingId, setLabelLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    refreshOrders().finally(() => setLoading(false));
  }, [refreshOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      (o.trackingId && o.trackingId.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenShipDialog = (order) => {
    setShippingModalOrder(order);
    setShipmentError('');

    // Standard E-Commerce: calculate total parcel weight & packaging proportions from order items
    let calculatedWeight = 0;
    let maxLength = 30;
    let maxWidth = 20;
    let totalHeight = 0;

    if (Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.id || p.name === item.name);
        const qty = Number(item.quantity) || 1;

        const w = Number(prod?.weight) || 500;
        const l = Number(prod?.length) || 30;
        const width = Number(prod?.width) || 20;
        const h = Number(prod?.height) || 5;

        calculatedWeight += w * qty;
        if (l > maxLength) maxLength = l;
        if (width > maxWidth) maxWidth = width;
        totalHeight += h * qty;
      });
    } else {
      calculatedWeight = 500;
      totalHeight = 5;
    }

    setPackageWeight(Math.round(calculatedWeight || 500));
    setPackageLength(Math.round(maxLength || 30));
    setPackageWidth(Math.round(maxWidth || 20));
    setPackageHeight(Math.max(5, Math.min(Math.round(totalHeight || 5), 60)));
  };

  const handleBookShipment = async (e) => {
    e.preventDefault();
    if (!shippingModalOrder) return;
    setIsBookingShipment(true);
    setShipmentError('');

    try {
      const res = await fetch('/api/ekart-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-shipment',
          order: shippingModalOrder,
          packageDetails: {
            weight: Number(packageWeight) || 500,
            length: Number(packageLength) || 30,
            width: Number(packageWidth) || 20,
            height: Number(packageHeight) || 5,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.trackingId) {
        throw new Error(data.error || 'Failed to book shipment on Ekart.');
      }

      const bookedTrackingId = data.trackingId;

      if (updateOrderShipment) {
        await updateOrderShipment(shippingModalOrder.id, {
          trackingId: bookedTrackingId,
          courier: 'Ekart Logistics',
          status: 'Shipped',
        });
      } else {
        await updateOrderStatus(shippingModalOrder.id, 'Shipped');
      }

      if (selectedOrder && selectedOrder.id === shippingModalOrder.id) {
        setSelectedOrder((prev) => ({
          ...prev,
          trackingId: bookedTrackingId,
          courier: 'Ekart Logistics',
          status: 'Shipped',
        }));
      }

      setShippingModalOrder(null);
      // Auto-trigger label download
      handleDownloadLabel(bookedTrackingId);
    } catch (err) {
      console.error('Shipment booking error:', err);
      setShipmentError(err.message || 'Error booking shipment on Ekart');
    } finally {
      setIsBookingShipment(false);
    }
  };

  const handleDownloadLabel = async (trackingId) => {
    if (!trackingId) return;
    setLabelLoadingId(trackingId);

    try {
      const res = await fetch('/api/ekart-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-label',
          trackingId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.base64) {
        throw new Error(data.error || 'Failed to retrieve shipping label PDF.');
      }

      const byteCharacters = atob(data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ekart-label-${trackingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(`Label Download Failed: ${err.message}`);
    } finally {
      setLabelLoadingId(null);
    }
  };

  const handleCopyTracking = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCustomerPhoto = (photoUrl, fileName = 'customer-photo.jpg') => {
    if (!photoUrl) return;
    if (photoUrl.startsWith('data:')) {
      try {
        const parts = photoUrl.split(';base64,');
        const contentType = parts[0].split(':')[1] || 'image/jpeg';
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch (e) {
        window.open(photoUrl, '_blank');
      }
    } else {
      window.open(photoUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Customer Orders ({orders.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track, fulfill, and ship orders directly via Ekart Logistics</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, or AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Order Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment & Courier</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 font-serif text-sm">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#1A1A1A] text-sm">{ord.id}</div>
                        {ord.items && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{ord.customerName}</div>
                        <div className="text-[10px] text-gray-500 max-w-[220px] truncate">
                          {ord.customerPhone} • {ord.address}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-medium">
                        {ord.createdDate || (ord.createdAt ? ord.createdAt.split('T')[0] : 'Recent')}
                      </td>
                      <td className="p-4 font-extrabold text-gray-900 text-sm">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              ord.paymentStatus === 'Paid' ||
                              (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes('paid'))
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus === 'Paid' ? 'PAID' : 'PENDING'}
                          </span>
                          <span className="text-[11px] font-medium text-gray-700 truncate max-w-[140px]" title={ord.paymentMethod}>
                            {ord.paymentMethod || 'Online'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : ord.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : ord.status === 'Confirmed'
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* Ekart Logistics Status & Quick Actions */}
                          {ord.trackingId ? (
                            <div className="flex items-center gap-1">
                              <span
                                className="text-[9.5px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                                title="Click to copy tracking ID"
                                onClick={() => handleCopyTracking(ord.trackingId)}
                              >
                                <Truck className="w-2.5 h-2.5" />
                                {ord.trackingId}
                              </span>
                              <button
                                onClick={() => handleDownloadLabel(ord.trackingId)}
                                disabled={labelLoadingId === ord.trackingId}
                                className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-black cursor-pointer"
                                title="Print / Download Ekart Label"
                              >
                                {labelLoadingId === ord.trackingId ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                ) : (
                                  <Printer className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={`https://app.elite.ekartlogistics.in/track/${ord.trackingId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-black"
                                title="Track live on Ekart"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenShipDialog(ord)}
                              className="text-[10px] font-bold text-white bg-[#1A1A1A] hover:bg-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                            >
                              <Truck className="w-3 h-3 text-[#D4AF37]" />
                              <span>Ship with Ekart</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-2 rounded-xl text-[#1A1A1A] hover:bg-[#F8F0F0] font-bold cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Ekart Booking Dialog */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Ship Order via Ekart</h3>
                  <p className="text-[11px] text-gray-500">Order ID: {shippingModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShippingModalOrder(null)}
                disabled={isBookingShipment}
                className="text-gray-400 hover:text-gray-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {shipmentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{shipmentError}</span>
              </div>
            )}

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1.5 text-[11px]">
              <div className="text-gray-500 font-medium">Customer Destination:</div>
              <div className="font-bold text-gray-900">{shippingModalOrder.customerName} ({shippingModalOrder.customerPhone})</div>
              <div className="text-gray-600 leading-relaxed">{shippingModalOrder.address}</div>
              <div className="font-mono text-gray-700 font-semibold pt-1">
                PIN: {shippingModalOrder.pincode || 'Not specified'}
              </div>
            </div>

            <form onSubmit={handleBookShipment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Parcel Weight (grams)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">grams</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Standard photo frame: ~500g • Acrylic/Large frame: ~800g–1200g
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Box Dimensions (Length × Width × Height in cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder="Length"
                      value={packageLength}
                      onChange={(e) => setPackageLength(e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-200 text-center font-mono font-bold"
                    />
                    <span className="block text-center text-[9px] text-gray-400 mt-0.5">Length (cm)</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Width"
                      value={packageWidth}
                      onChange={(e) => setPackageWidth(e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-200 text-center font-mono font-bold"
                    />
                    <span className="block text-center text-[9px] text-gray-400 mt-0.5">Width (cm)</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Height"
                      value={packageHeight}
                      onChange={(e) => setPackageHeight(e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-200 text-center font-mono font-bold"
                    />
                    <span className="block text-center text-[9px] text-gray-400 mt-0.5">Height (cm)</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl text-[10.5px] text-amber-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Pickup from Draksharamam (533262) • Surface Mode</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  disabled={isBookingShipment}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBookingShipment}
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#D4AF37] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  {isBookingShipment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Booking Courier...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>Generate Waybill & Label</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Order Details ({selectedOrder.id})</h3>
                <p className="text-[11px] text-gray-500">
                  Placed on {selectedOrder.createdDate || (selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : 'Recent')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="font-bold text-gray-400 hover:text-gray-700 text-sm cursor-pointer">✕</button>
            </div>

            {/* Ekart Logistics Shipping Section */}
            <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-700" />
                  <span className="font-extrabold text-blue-900 uppercase text-[10.5px] tracking-wider">
                    Ekart Logistics Delivery
                  </span>
                </div>
                {selectedOrder.trackingId && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Waybill Generated
                  </span>
                )}
              </div>

              {selectedOrder.trackingId ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Waybill / Tracking Number:</span>
                      <span className="font-mono font-bold text-sm text-gray-900">{selectedOrder.trackingId}</span>
                    </div>
                    <button
                      onClick={() => handleCopyTracking(selectedOrder.trackingId)}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedId === selectedOrder.trackingId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === selectedOrder.trackingId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadLabel(selectedOrder.trackingId)}
                      disabled={labelLoadingId === selectedOrder.trackingId}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      {labelLoadingId === selectedOrder.trackingId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Printer className="w-3.5 h-3.5" />
                      )}
                      <span>Download Shipping Label (PDF)</span>
                    </button>

                    <a
                      href={`https://app.elite.ekartlogistics.in/track/${selectedOrder.trackingId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl border border-blue-300 hover:bg-white text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-blue-800">
                    Ready to pack? Click to book Ekart pickup and get the waybill label.
                  </p>
                  <button
                    onClick={() => handleOpenShipDialog(selectedOrder)}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-[11px] cursor-pointer shadow-2xs transition-all shrink-0"
                  >
                    <Truck className="w-3 h-3" />
                    <span>Ship Now</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-400 block text-[10px]">Customer Name</span><span className="font-bold text-gray-900">{selectedOrder.customerName}</span></div>
                <div><span className="text-gray-400 block text-[10px]">Phone Number</span><span className="font-bold text-gray-900">{selectedOrder.customerPhone}</span></div>
              </div>
              <div><span className="text-gray-400 block text-[10px]">Delivery Address</span><span className="font-bold text-gray-900">{selectedOrder.address}</span></div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[10px]">Payment Method</span>
                  <span className="font-bold text-gray-900">{selectedOrder.paymentMethod || 'Razorpay'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Payment Status</span>
                  <span className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded ${
                    selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.paymentStatus || 'Pending'}
                  </span>
                </div>
                {selectedOrder.paymentId && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[10px]">Razorpay Payment ID</span>
                    <span className="font-mono font-bold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded inline-block">
                      {selectedOrder.paymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <span className="font-extrabold uppercase text-gray-900 text-[10px] tracking-wider">Ordered Items</span>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {(item.customPhoto || item.image) && (
                        <img src={item.customPhoto || item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block text-xs">{item.name}</span>
                        <span className="text-[10px] text-gray-500">Qty: {item.quantity} • Unit: ₹{item.price}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Customization Details (Custom Photo, Engraved Text, Frame, Size) */}
                  {(item.customPhoto || item.customName || item.selectedSize || item.selectedColor || item.selectedFrameColor || item.selectedFontStyle) && (
                    <div className="pt-2 border-t border-gray-200/60 bg-white p-2.5 rounded-lg text-[11px] space-y-1.5">
                      <div className="font-bold text-amber-900 flex items-center gap-1">
                        <span>✨ Custom Personalization:</span>
                      </div>

                      {item.customPhoto && (
                        <div className="flex items-center gap-2">
                          <img src={item.customPhoto} alt="Customer Upload" className="w-10 h-10 object-cover rounded border border-gray-300" />
                          <button
                            type="button"
                            onClick={() => handleOpenCustomerPhoto(item.customPhoto, `order-${selectedOrder.id}-item-${idx + 1}-photo.jpg`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>📷 View / Download Customer Photo</span>
                          </button>
                        </div>
                      )}

                      {item.customName && (
                        <div className="text-gray-800">
                          <span className="font-bold text-gray-500">Custom Text / Name: </span>
                          <span className="font-bold text-gray-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">"{item.customName}"</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-600">
                        {item.selectedSize && <span><span className="font-bold">Size:</span> {item.selectedSize}</span>}
                        {item.selectedColor && <span><span className="font-bold">Light/Color:</span> {item.selectedColor}</span>}
                        {item.selectedFrameColor && <span><span className="font-bold">Frame:</span> {item.selectedFrameColor}</span>}
                        {item.selectedFontStyle && <span><span className="font-bold">Font:</span> {item.selectedFontStyle}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between font-extrabold text-sm">
              <span>Total Paid / Payable</span>
              <span className="text-[#1A1A1A] text-base">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/91${selectedOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  selectedOrder.trackingId
                    ? `Hello ${selectedOrder.customerName}, your order #${selectedOrder.id} has been dispatched with Ekart Logistics! You can track your parcel here: https://app.elite.ekartlogistics.in/track/${selectedOrder.trackingId} (Tracking ID: ${selectedOrder.trackingId})`
                    : `Hello ${selectedOrder.customerName}, this is regarding your order ${selectedOrder.id} at Infinity Frames N. Your order status is currently: ${selectedOrder.status}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>💬 WhatsApp Customer</span>
              </a>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-[#1A1A1A] text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-black transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
