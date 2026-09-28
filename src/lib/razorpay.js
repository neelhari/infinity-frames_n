/**
 * Razorpay Standard Web Checkout Integration for Infinity Frames N.
 *
 * Implements 3-step secure workflow:
 * 1. Backend Order Creation (POST /api/create-order)
 * 2. Razorpay Standard Checkout Modal (https://checkout.razorpay.com/v1/checkout.js)
 * 3. Backend HMAC-SHA256 Signature Verification (POST /api/verify-payment)
 */

import { BRAND } from '../config/brand';

/**
 * Loads the Razorpay checkout script dynamically if not already loaded.
 * @returns {Promise<boolean>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Creates an order on the backend API.
 * @param {Object} params
 * @param {number} params.amountInPaise
 * @param {string} params.receipt
 * @param {Object} [params.notes]
 * @returns {Promise<{ order_id: string, amount: number, currency: string }>}
 */
async function createBackendOrder({ amountInPaise, receipt, notes }) {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create order on payment server.');
  }

  return data;
}

/**
 * Verifies the payment signature on the backend API.
 * @param {Object} paymentResponse
 * @param {string} paymentResponse.razorpay_order_id
 * @param {string} paymentResponse.razorpay_payment_id
 * @param {string} paymentResponse.razorpay_signature
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function verifyBackendPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed.');
  }

  return data;
}

/**
 * Launch Razorpay Standard Web Checkout.
 *
 * @param {Object} params
 * @param {string} params.orderId - Internal store order identifier
 * @param {number} params.amount - Total order amount in INR (e.g. 1499)
 * @param {Object} params.customer - { fullName, email, phone, address, city, pincode }
 * @param {string} [params.description] - Description shown on payment modal
 * @param {Function} params.onSuccess - Callback after signature is verified on backend: ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => void
 * @param {Function} [params.onFailure] - Callback on payment error or verification failure: (error) => void
 * @param {Function} [params.onDismiss] - Callback when modal is closed by user without completing payment
 */
export async function openRazorpayCheckout({
  orderId,
  amount,
  customer,
  description = `Order ${orderId} - ${BRAND.name}`,
  onSuccess,
  onFailure,
  onDismiss,
}) {
  try {
    // 1. Ensure Razorpay checkout script is ready
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      const loadError = new Error('Razorpay SDK failed to load. Please check your internet connection and try again.');
      if (onFailure) onFailure(loadError);
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ThR8J0CBqWt4tu';
    const amountInPaise = Math.max(100, Math.round(Number(amount) * 100));

    // 2. Step 1: Call Backend to Create Razorpay Order
    const createdOrder = await createBackendOrder({
      amountInPaise,
      receipt: orderId,
      notes: {
        store_order_id: orderId,
        customer_name: customer?.fullName || '',
        customer_phone: customer?.phone || '',
      },
    });

    const razorpayOrderId = createdOrder.order_id || createdOrder.id;

    // 3. Step 2: Configure and open Razorpay Checkout modal
    const options = {
      key: keyId,
      amount: createdOrder.amount || amountInPaise,
      currency: createdOrder.currency || 'INR',
      name: BRAND.name || 'Infinity Frames N',
      description: description,
      order_id: razorpayOrderId,
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80',
      prefill: {
        name: customer?.fullName || '',
        email: customer?.email || '',
        contact: customer?.phone || '',
      },
      notes: {
        store_order_id: orderId,
        shipping_address: `${customer?.address || ''}, ${customer?.city || ''} ${customer?.pincode || ''}`.trim(),
      },
      theme: {
        color: '#B38029', // Infinity Frames N luxury gold
        backdrop_color: 'rgba(0, 0, 0, 0.7)',
      },
      modal: {
        backdropclose: false,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
      handler: async function (response) {
        // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        try {
          // 4. Step 3: Call Backend to Verify Payment Signature
          await verifyBackendPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Verification succeeded
          if (onSuccess) {
            onSuccess(response);
          }
        } catch (verifyErr) {
          console.error('[Razorpay] Signature verification error:', verifyErr);
          if (onFailure) {
            onFailure(verifyErr);
          }
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (failResponse) {
      console.warn('[Razorpay] Payment failed event:', failResponse.error);
      const errorObj = new Error(
        failResponse.error?.description || failResponse.error?.reason || 'Payment could not be completed.'
      );
      errorObj.details = failResponse.error;
      if (onFailure) onFailure(errorObj);
    });

    rzp.open();
  } catch (err) {
    console.error('[Razorpay] Checkout initialization error:', err);
    if (onFailure) onFailure(err);
  }
}
