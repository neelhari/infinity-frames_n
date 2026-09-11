# Aalaya Vastra

Storefront for Aalaya Vastra — sarees, womenswear, and fabrics. React + Vite + Tailwind, WhatsApp-based ordering, no backend.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Structure

- `src/config/brand.js` — all client-specific details (name, phone, email, address, WhatsApp number). Edit here, not in components.
- `src/data/products.js` — product catalog. Currently placeholder data (names only, from the client's initial WhatsApp message) — real photos/prices/descriptions pending.
- `src/data/categories.js` — category list (Sarees, Dresses, Fabrics, Blouse Pieces, Petticoats).
- `src/pages/` — route-level pages (Home, Products, Categories, Our Story, Contact).
- `src/components/` — Navbar, Footer, CartDrawer, ProductCard, etc.

## Known gaps before launch

- Placeholder product photos, prices, and descriptions — need the real catalog from the client.
- Logo is the full business-card graphic; a transparent icon+wordmark cutout would look cleaner in dark-background spots (footer, contact page).
- WhatsApp checkout doesn't yet collect delivery address before sending the order message.
- No client-provided Instagram handle yet.
