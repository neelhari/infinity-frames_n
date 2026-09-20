# Infinity Frames N

Production E-Commerce Storefront & Admin CMS for **Infinity Frames N** — Specializing in 3D-printed personalized gifts, photo frames, lithophanes, moon lamps, devotional lamps, and customized tokens.

---

## Architecture & Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, React Router v7.
- **Backend & Database:** Supabase (PostgreSQL, Row-Level Security, Realtime WebSockets, Authentication).
- **Media Pipeline:** Cloudinary with automatic image compression (`f_auto,q_auto,w_1200,c_limit`) and video optimization (`q_auto,vc_auto,w_720`).
- **State Management:** React Context (`StoreDataContext` with Supabase Realtime, `CartContext`, `AuthContext`, `AdminAuthContext`).

---

## Key Features

1. **Dynamic Storefront (Zero Static Fallbacks):**
   - Products, Categories, Hero Banners, and Announcement settings load dynamically from Supabase.
   - Realtime reflection: Any edits or new products in the Admin Panel appear across all customer devices immediately.
2. **Interactive 3D Product Customizer:**
   - Real-time photo preview and text engraving simulation.
   - Instant customer photo upload to Cloudinary for order fulfillment.
   - Frame colors, lighting colors, and size variant selections.
3. **Comprehensive Admin Panel (`/admin`):**
   - **Products:** Add/edit/delete 3D gifts, manage multi-photo galleries and demo videos.
   - **Categories:** Manage storefront collection tiles and taglines.
   - **Hero Banners:** Control homepage slider graphics and promotion links.
   - **Inventory:** Live SKU stock adjustments, low-stock warnings, and out-of-stock badges.
   - **Orders:** Live order tracking, inspect customer customization proofs and download high-res customer photos.
   - **Coupons:** Promotional discount management (% or flat ₹ off).
   - **Store Settings:** Top announcement bar, free shipping threshold, and workshop contact details.
4. **Checkout & Order Fulfillment:**
   - Orders write directly to Supabase `orders` table.
   - Automated WhatsApp order invoice formatting.

---

## Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```
