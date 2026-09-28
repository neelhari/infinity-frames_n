import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';

function razorpayDevApiPlugin(env) {
  return {
    name: 'razorpay-dev-api',
    configureServer(server) {
      // Ensure process.env contains Razorpay keys during Vite local development
      if (env.RAZORPAY_KEY_ID) process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
      if (env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;
      if (env.VITE_RAZORPAY_KEY_ID) process.env.VITE_RAZORPAY_KEY_ID = env.VITE_RAZORPAY_KEY_ID;

      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/api/create-order' || url === '/api/verify-payment') {
          let body = {};
          if (req.method === 'POST') {
            try {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const raw = Buffer.concat(buffers).toString();
              if (raw) {
                body = JSON.parse(raw);
              }
            } catch (err) {
              console.error('Error parsing JSON request body in Vite dev middleware:', err);
            }
          }

          req.body = body;

          res.status = function (statusCode) {
            res.statusCode = statusCode;
            return res;
          };

          res.json = function (jsonObj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(jsonObj));
            return res;
          };

          if (url === '/api/create-order') {
            return createOrderHandler(req, res);
          }
          if (url === '/api/verify-payment') {
            return verifyPaymentHandler(req, res);
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      razorpayDevApiPlugin(env),
    ],
  };
});
