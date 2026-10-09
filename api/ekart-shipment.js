import {
  checkEkartServiceability,
  createEkartShipment,
  getEkartShippingLabel,
  trackEkartShipment,
  cancelEkartShipment,
} from './lib/ekart.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { action, pincode, order, packageDetails, trackingId } = req.body || {};

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: action',
      });
    }

    switch (action) {
      case 'check-serviceability': {
        if (!pincode) {
          return res.status(400).json({ success: false, error: 'pincode is required.' });
        }
        const result = await checkEkartServiceability(pincode);
        return res.status(200).json({ success: true, ...result });
      }

      case 'create-shipment': {
        if (!order || (!order.customerPhone && !order.customer_phone)) {
          return res.status(400).json({ success: false, error: 'Valid order data is required.' });
        }
        const result = await createEkartShipment({ order, packageDetails });
        return res.status(200).json(result);
      }

      case 'get-label': {
        if (!trackingId) {
          return res.status(400).json({ success: false, error: 'trackingId is required.' });
        }
        const result = await getEkartShippingLabel(trackingId);
        return res.status(200).json(result);
      }

      case 'track-shipment': {
        if (!trackingId) {
          return res.status(400).json({ success: false, error: 'trackingId is required.' });
        }
        const result = await trackEkartShipment(trackingId);
        return res.status(200).json(result);
      }

      case 'cancel-shipment': {
        if (!trackingId) {
          return res.status(400).json({ success: false, error: 'trackingId is required.' });
        }
        const result = await cancelEkartShipment(trackingId);
        return res.status(200).json(result);
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: "${action}"`,
        });
    }
  } catch (err) {
    console.error('[Ekart API Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing Ekart request.',
    });
  }
}
