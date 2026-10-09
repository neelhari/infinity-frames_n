/**
 * Ekart Logistics Elite API Client
 * Infinity Frames N - Serverless Integration
 */

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Fetch or reuse cached Ekart Bearer token (valid for 24h)
 */
export async function getEkartToken() {
  const now = Date.now();
  // Return cached token if valid for at least 5 more minutes
  if (cachedToken && tokenExpiresAt > now + 300 * 1000) {
    return cachedToken;
  }

  const baseUrl = process.env.EKART_BASE_URL || 'https://app.elite.ekartlogistics.in';
  const clientId = process.env.EKART_CLIENT_ID;
  const username = process.env.EKART_USERNAME;
  const password = process.env.EKART_PASSWORD;

  if (!clientId || !username || !password) {
    throw new Error('Ekart credentials missing in environment variables (EKART_CLIENT_ID, EKART_USERNAME, EKART_PASSWORD).');
  }

  const tokenUrl = `${baseUrl}/integrations/v2/auth/token/${clientId}`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ekart authentication failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('No access_token returned by Ekart auth endpoint.');
  }

  cachedToken = data.access_token;
  // expires_in is in seconds (typically 86400)
  const expiresInMs = (data.expires_in || 86400) * 1000;
  tokenExpiresAt = now + expiresInMs;

  return cachedToken;
}

/**
 * Check if a destination delivery pincode is serviceable by Ekart
 */
export async function checkEkartServiceability(pincode) {
  if (!pincode || String(pincode).trim().length < 6) {
    return {
      serviceable: false,
      remark: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const cleanPin = String(pincode).trim().replace(/\D/g, '').slice(0, 6);
  const token = await getEkartToken();
  const baseUrl = process.env.EKART_BASE_URL || 'https://app.elite.ekartlogistics.in';

  const res = await fetch(`${baseUrl}/api/v2/serviceability/${cleanPin}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      serviceable: false,
      pincode: cleanPin,
      remark: data.message || data.remark || 'Pincode check failed',
      details: null,
    };
  }

  return {
    serviceable: Boolean(data.status && data.details?.forward_drop),
    pincode: cleanPin,
    remark: data.remark || (data.status ? 'Pincode is serviceable' : 'Pincode not serviceable'),
    details: data.details || {},
  };
}

/**
 * Book / Create shipment on Ekart Logistics
 */
export async function createEkartShipment({
  order,
  packageDetails = {},
}) {
  const token = await getEkartToken();
  const baseUrl = process.env.EKART_BASE_URL || 'https://app.elite.ekartlogistics.in';

  const pickupAlias = process.env.EKART_PICKUP_ALIAS || 'infinity frames n';
  const pickupPincode = process.env.EKART_PICKUP_PINCODE || '533262';

  // Extract / sanitize customer contact & address (allow packageDetails overrides from admin dialog)
  const consigneeName = (packageDetails.consigneeName || order.customerName || order.customer_name || 'Customer').trim();
  const consigneePhone = String(packageDetails.consigneePhone || order.customerPhone || order.customer_phone || '').replace(/\D/g, '').slice(-10);
  const deliveryAddress = (packageDetails.deliveryAddress || order.address || '').trim();
  const destinationPincode = String(packageDetails.destinationPincode || order.pincode || '').replace(/\D/g, '').slice(0, 6);
  const destinationCity = (packageDetails.destinationCity || order.city || '').trim() || 'City';
  const destinationState = (packageDetails.destinationState || order.state || '').trim() || 'Andhra Pradesh';

  const isCod = Boolean(
    order.paymentMethod?.toLowerCase().includes('cod') ||
    order.payment_method?.toLowerCase().includes('cod')
  );

  const totalAmount = Number(order.totalAmount || order.total_amount || 0);
  const orderNumber = String(order.id || order.orderId || `IFN-${Date.now()}`);
  const invoiceNumber = `INV-${orderNumber}`;
  const todayDate = new Date().toISOString().split('T')[0];

  // Default weights & dimensions if not provided
  // Custom photo frames: ~500g, 30cm x 20cm x 5cm
  const weight = Number(packageDetails.weight) || 500;
  const length = Number(packageDetails.length) || 30;
  const width = Number(packageDetails.width) || 20;
  const height = Number(packageDetails.height) || 5;

  const productsSummary = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => i.name).filter(Boolean).join(', ').slice(0, 80)
    : 'Custom Photo Frame';

  const quantity = Array.isArray(order.items) && order.items.length > 0
    ? order.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
    : 1;

  const payload = {
    seller_name: 'INFINITY FRAMES N',
    seller_address: 'near bhimeasewara temple, opp mandalama chattu beside 7hills studio, Draksharamam, Andhra Pradesh',
    seller_gst_tin: process.env.EKART_GSTIN || '',
    seller_gst_amount: 0,
    consignee_gst_amount: 0,
    order_number: orderNumber,
    invoice_number: invoiceNumber,
    invoice_date: todayDate,
    consignee_name: consigneeName,
    consignee_alternate_phone: consigneePhone,
    payment_mode: isCod ? 'COD' : 'Prepaid',
    service: 'SURFACE',
    category_of_goods: 'Frames',
    products_desc: productsSummary,
    total_amount: totalAmount,
    taxable_amount: totalAmount,
    tax_value: 0,
    commodity_value: String(totalAmount),
    cod_amount: isCod ? totalAmount : 0,
    quantity: quantity,
    weight: weight,
    length: length,
    width: width,
    height: height,
    return_reason: '',
    drop_location: {
      name: consigneeName,
      phone: consigneePhone,
      address1: deliveryAddress,
      city: destinationCity,
      state: destinationState,
      pincode: destinationPincode,
    },
    pickup_location: {
      name: pickupAlias,
    },
    return_location: {
      name: pickupAlias,
    },
  };

  const res = await fetch(`${baseUrl}/api/v1/package/create`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    let detailedMsg = '';
    if (data.errors) {
      if (Array.isArray(data.errors)) {
        detailedMsg = data.errors.map(e => (typeof e === 'object' ? (e.message || e.field || JSON.stringify(e)) : e)).join('; ');
      } else if (typeof data.errors === 'object') {
        detailedMsg = Object.entries(data.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
      } else {
        detailedMsg = String(data.errors);
      }
    } else if (data.details) {
      detailedMsg = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
    } else if (data.description) {
      detailedMsg = data.description;
    } else if (data.message && data.message !== 'VALIDATOR_SCHEMA') {
      detailedMsg = data.message;
    }

    const finalMsg = detailedMsg
      ? `Ekart: ${detailedMsg}`
      : 'Ekart Schema Validation Failed: Please verify destination Pincode (must be valid 6-digit Indian PIN), Address length, and City/State.';

    throw new Error(finalMsg);
  }

  // Ekart returns tracking_id (or trackingId or id or waybill)
  const trackingId = data.tracking_id || data.trackingId || data.waybill || data.id || (data.data && (data.data.tracking_id || data.data.trackingId));

  return {
    success: true,
    trackingId: String(trackingId || ''),
    raw: data,
    trackingUrl: `https://app.elite.ekartlogistics.in/track/${trackingId}`,
  };
}

/**
 * Fetch Ekart Shipping Label (PDF)
 * Returns { pdfBase64, contentType }
 */
export async function getEkartShippingLabel(trackingId) {
  if (!trackingId) throw new Error('Tracking ID is required to download shipping label.');

  const token = await getEkartToken();
  const baseUrl = process.env.EKART_BASE_URL || 'https://app.elite.ekartlogistics.in';

  const res = await fetch(`${baseUrl}/api/v1/package/label?json_only=false`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids: [String(trackingId)],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to download shipping label (${res.status}): ${errorText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');

  return {
    success: true,
    trackingId,
    mimeType: 'application/pdf',
    dataUrl: `data:application/pdf;base64,${base64}`,
    base64,
  };
}

/**
 * Track shipment status on Ekart
 */
export async function trackEkartShipment(trackingId) {
  if (!trackingId) throw new Error('Tracking ID is required.');

  const token = await getEkartToken();
  const baseUrl = process.env.EKART_BASE_URL || 'https://app.elite.ekartlogistics.in';

  const res = await fetch(`${baseUrl}/api/v1/track/${encodeURIComponent(trackingId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.description || `Tracking lookup failed (${res.status})`);
  }

  return {
    success: true,
    trackingId,
    data,
    directUrl: `https://app.elite.ekartlogistics.in/track/${trackingId}`,
  };
}

/**
 * Cancel an unpicked shipment on Ekart
 */
export async function cancelEkartShipment(trackingId) {
  if (!trackingId) throw new Error('Tracking ID is required.');

  const token = await getEkartToken();
  const baseUrl = process.env.EKART_BASE_URL || 'https://app.elite.ekartlogistics.in';

  const res = await fetch(`${baseUrl}/api/v1/package/cancel?tracking_id=${encodeURIComponent(trackingId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.description || `Shipment cancellation failed (${res.status})`);
  }

  return {
    success: true,
    trackingId,
    data,
  };
}
