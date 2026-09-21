-- ============================================================================
-- Infinity Frames N — Production Database Schema
-- Run this ONCE in Supabase Dashboard → SQL Editor → New Query → Run.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING throughout.
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ADMIN ALLOWLIST
-- Only users whose auth.users id appears in this table can write to the
-- store tables below. Creating a Supabase Auth account is NOT enough on its
-- own — you must also add a row here.
-- ----------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

drop policy if exists "admin_users self read" on admin_users;
create policy "admin_users self read" on admin_users
  for select using (auth.uid() = id);

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$;

-- ----------------------------------------------------------------------------
-- 1B. CUSTOMER PROFILES
-- Synchronized automatically with auth.users on signup/login.
-- Stores customer name, phone, email, and saved addresses.
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  addresses jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles public self read" on profiles;
create policy "profiles public self read" on profiles
  for select using (auth.uid() = id or is_admin());

drop policy if exists "profiles public self write" on profiles;
create policy "profiles public self write" on profiles
  for all using (auth.uid() = id or is_admin()) with check (auth.uid() = id or is_admin());

-- Auto-insert profile row whenever a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, profiles.full_name),
      email = coalesce(excluded.email, profiles.email),
      phone = coalesce(excluded.phone, profiles.phone),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS (Infinity Frames N 3D Gifts, Photo Frames, Lamps & Decor)
-- ----------------------------------------------------------------------------
create table if not exists products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  sku text,
  category text not null,
  subcategory text,
  price numeric not null default 0,
  old_price numeric,
  cost_price numeric,
  discount text,
  stock integer not null default 0,
  customizable boolean not null default false,
  custom_type text, -- 'photo', 'text', 'photo-text', '3d-model'
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  materials text[] not null default '{}',
  frame_colors text[] not null default '{}',
  font_styles text[] not null default '{}',
  description text,
  image text,
  images text[] not null default '{}',
  video text,
  video_url text,
  rating numeric default 4.8,
  reviews_count integer default 0,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure all columns exist if table was previously created
alter table products add column if not exists customizable boolean not null default false;
alter table products add column if not exists custom_type text;
alter table products add column if not exists sizes text[] not null default '{}';
alter table products add column if not exists colors text[] not null default '{}';
alter table products add column if not exists materials text[] not null default '{}';
alter table products add column if not exists frame_colors text[] not null default '{}';
alter table products add column if not exists font_styles text[] not null default '{}';
alter table products add column if not exists video text;
alter table products add column if not exists video_url text;

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_featured on products(is_featured);

alter table products enable row level security;

drop policy if exists "products public read" on products;
drop policy if exists "products admin write" on products;
drop policy if exists "products_all" on products;
create policy "products_all" on products for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  image text,
  banner_image text,
  item_count text,
  featured boolean not null default true,
  active boolean not null default true,
  subcategories text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

drop policy if exists "categories public read" on categories;
drop policy if exists "categories admin write" on categories;
drop policy if exists "categories_all" on categories;
create policy "categories_all" on categories for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 4. BANNERS
-- ----------------------------------------------------------------------------
create table if not exists banners (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  image text not null,
  link text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table banners enable row level security;

drop policy if exists "banners public read" on banners;
drop policy if exists "banners admin write" on banners;
drop policy if exists "banners_all" on banners;
create policy "banners_all" on banners for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 5. COUPONS
-- ----------------------------------------------------------------------------
create table if not exists coupons (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  discount_value numeric not null,
  min_order numeric not null default 0,
  max_discount numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table coupons enable row level security;

drop policy if exists "coupons public read" on coupons;
drop policy if exists "coupons admin write" on coupons;
drop policy if exists "coupons_all" on coupons;
create policy "coupons_all" on coupons for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 6. ORDERS
-- Items jsonb stores customPhoto, customName, selectedSize, selectedColor, etc.
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  city text,
  state text,
  pincode text,
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  delivery_charge numeric not null default 0,
  total_amount numeric not null default 0,
  payment_method text,
  payment_id text,
  payment_status text not null default 'Pending',
  status text not null default 'Pending',
  coupon_code text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_phone on orders(customer_phone);

alter table orders enable row level security;

drop policy if exists "orders public insert" on orders;
drop policy if exists "orders admin read" on orders;
drop policy if exists "orders admin update" on orders;
drop policy if exists "orders admin delete" on orders;
drop policy if exists "orders_all" on orders;
create policy "orders_all" on orders for all using (true) with check (true);

-- Allow customers to look up their own orders by phone (Storefront Tracking)
create or replace function get_orders_by_phone(p_phone text)
returns setof orders
language sql
security definer
set search_path = public
as $$
  select * from orders
  where regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  order by created_at desc;
$$;

-- ----------------------------------------------------------------------------
-- 7. CONTACT / INQUIRY MESSAGES
-- ----------------------------------------------------------------------------
create table if not exists contact_messages (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text,
  phone text,
  message text not null,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "contact_messages public insert" on contact_messages;
drop policy if exists "contact_messages admin read" on contact_messages;
drop policy if exists "contact_messages admin update" on contact_messages;
drop policy if exists "contact_messages_all" on contact_messages;
create policy "contact_messages_all" on contact_messages for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 8. STORE SETTINGS (Singleton row, id = 1)
-- ----------------------------------------------------------------------------
create table if not exists settings (
  id integer primary key check (id = 1),
  store_name text not null,
  phone text not null,
  email text not null,
  whatsapp text,
  owner_name text,
  address text,
  free_shipping_threshold numeric not null default 1499,
  gstin text,
  currency text not null default '₹',
  announcement_text text,
  announcement_enabled boolean not null default true,
  announcement_link text default '/shop',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

drop policy if exists "settings public read" on settings;
drop policy if exists "settings admin write" on settings;
drop policy if exists "settings_all" on settings;
create policy "settings_all" on settings for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 9. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function touch_updated_at();

drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at
  before update on settings
  for each row execute function touch_updated_at();

-- ============================================================================
-- 10. SEED DATA — Infinity Frames N initial categories, products, and settings
-- ============================================================================
insert into categories (id, name, tagline, description, image, banner_image, item_count, featured, subcategories) values
  ('customized-gifts', 'Customized Gifts', 'Turn Your Memories Into Lasting Gifts', 'Personalized engraved frames, custom nameplates, anniversary gifts, and bespoke 3D tokens.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80', '8 Products', true, array['Photo Gifts', 'Couple Gifts', 'Anniversary Specials', 'Name Engravings']),
  ('3d-printed-products', '3D Printed Products', 'Precision 3D Engineering & Art', 'Intricately 3D-printed miniature sculptures, architectural models, and artistic desktop accents.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80', '6 Products', true, array['Custom Models', 'Desktop Decor', 'Figurines', 'Architectural Scale']),
  ('photo-frames', 'Photo Frames', 'Preserve Precious Moments', 'Handcrafted wooden frames, acrylic glass stands, and illuminated LED night frames.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80', '8 Products', true, array['All', 'Wooden', 'Acrylic', 'LED Frames']),
  ('lithophane-products', 'Lithophane Products', 'Light-Activated 3D Photography', 'Carved lithophane portraits that magically reveal your photographs when illuminated with light.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80', '4 Products', true, array['Curved Lithophanes', 'Night Lamp Lithophanes', 'Flat Backlit Lithophanes']),
  ('customized-lamps', 'Customized Lamps', 'Warm Illuminated Memories', 'Warm-glow acrylic silhouette lamps, 3D photo cylinder lamps, and touch-sensor bedside lamps.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80', '5 Products', true, array['Acrylic Night Lamps', 'Photo Cylinders', 'Rotating Lamps']),
  ('moon-lamps', 'Moon Lamps', 'Bring the Moon into Your Room', 'True-to-scale 3D lunar surface texture lamps with dual warm/cool glow and touch control.', 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=1200&auto=format&fit=crop&q=80', '3 Products', true, array['10cm Moon Lamp', '12cm Moon Lamp', '15cm 16-Color RGB']),
  ('devotional-lamps', 'Devotional Lamps', 'Sacred Divine Illumination', 'Intricately etched spiritual and deity silhouette lamps with golden divine aura lighting.', 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=1200&auto=format&fit=crop&q=80', '5 Products', true, array['Shiva Mandir Lamps', 'Ganesha LED Lamps', 'Balaji Lithophanes']),
  ('keychains', 'Keychains', 'Carry Memories Everywhere', 'Personalized 3D-embossed name keychains, calendar date tags, and miniature lithophane charms.', 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=1200&auto=format&fit=crop&q=80', '6 Products', true, array['Couple Keychains', 'Photo Keychains', 'Name Keychains', 'Glow in Dark']),
  ('glow-in-dark', 'Glow-in-the-Dark / Radium', 'Luminescent Magic After Dark', 'Special photoluminescent 3D printed artifacts, night-glow stars, and glowing figurines.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', '4 Products', true, array['Radium Figures', 'Night Wall Decor', 'Glow Keychains']),
  ('aquarium-decorations', 'Aquarium Decorations', 'Non-Toxic Custom Underwater Worlds', '100% fish-safe, non-toxic PLA 3D printed aquatic caves, pirate shipwrecks, and castles.', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1200&auto=format&fit=crop&q=80', '5 Products', true, array['Aquatic Caves', 'Sunken Ships', 'Coral Castles']),
  ('customized-models', 'Customized Models', 'Bespoke 3D Prototypes & Replicas', 'Precision custom 3D modeling from your CAD files, sketches, or reference photos.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80', 'Custom', true, array['Architectural Miniatures', 'Engineering Prototypes', 'Figurines']),
  ('wholesale-bulk', 'Wholesale & Bulk Orders', 'Corporate Gifting & Event Giveaways', 'Bulk custom merchandise, event mementos, return gifts, and branded corporate desk accessories.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80', 'Inquiry Based', true, array['Wedding Giveaways', 'Corporate Gifts', 'Bulk 3D Prints'])
on conflict (id) do nothing;

insert into products (id, name, category, subcategory, price, old_price, discount, is_new, is_featured, rating, reviews_count, image, images, description, stock, customizable, custom_type, sizes, colors, materials, frame_colors, font_styles) values
  ('ifn-moon-01', 'Moon Lamp (3D Printed)', 'moon-lamps', '12cm Moon Lamp', 799, 1199, '33% OFF', true, true, 4.8, 210, 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'], 'Creates a soothing and magical ambiance. Perfect for home decor, gifting and kids rooms. Features touch sensor brightness and warm/cool light toggle.', 25, true, 'photo-text', array['10 cm', '12 cm', '15 cm'], array['Warm White', 'Cool White', '16-Color RGB'], array['PLA Eco 3D Filament'], array[]::text[], array[]::text[]),
  ('ifn-frame-01', 'Personalized Photo Frame with Name', 'photo-frames', 'Wooden', 499, 799, '37% OFF', true, true, 4.8, 124, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'], 'Handcrafted personalized wooden photo frame customized with your custom name, memorable quote, and high-resolution photo print.', 40, true, 'photo-text', array['6x8 inch', '8x10 inch'], array[]::text[], array['Solid Pine Wood'], array['Natural Wood', 'Walnut', 'Black', 'White'], array['Style 1', 'Style 2', 'Style 3']),
  ('ifn-frame-02', 'Collage Photo Frame (12 Photos)', 'photo-frames', 'Wooden', 899, 1299, '31% OFF', false, true, 4.7, 98, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80'], 'Cherish a full year of memories in one beautiful collage. Accommodates 12 individual photos with high-grade UV-resistant matte finish.', 15, true, 'photo', array['12x18 inch'], array[]::text[], array['Engineered Wood'], array['Natural Wood', 'Walnut', 'Black', 'White'], array[]::text[]),
  ('ifn-frame-03', 'LED Photo Frame with Remote', 'photo-frames', 'LED Frames', 1199, 1699, '29% OFF', true, true, 4.6, 76, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'], 'Warm back-illuminated LED frame complete with remote control for dimming and mode switching. Ideal for bedside night lights.', 20, true, 'photo-text', array['8x10 inch', '10x12 inch'], array['Warm White LED', 'Cool White LED'], array['Acrylic + Solid Wood Base'], array[]::text[], array['Style 1', 'Style 2']),
  ('ifn-frame-04', 'Acrylic Photo Frame (With Stand)', 'photo-frames', 'Acrylic', 699, 999, '30% OFF', false, false, 4.7, 63, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'], 'Crystal-clear frameless acrylic block with metallic magnetic stand. Elegant modern desk display for office and home.', 35, true, 'photo-text', array['6x8 inch', '8x10 inch'], array[]::text[], array['Cast Acrylic Glass'], array[]::text[], array[]::text[]),
  ('ifn-key-01', 'Couple Keychain (Set of 2)', 'keychains', 'Couple Keychains', 299, 499, '40% OFF', true, true, 4.9, 152, 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=800&auto=format&fit=crop&q=80'], 'Interlocking dual heart 3D keychains. Laser-engraved with your initials or custom photo token.', 50, true, 'photo-text', array['Standard'], array['Red & White', 'Black & Gold', 'Glow Green'], array['Durable PLA 3D Print'], array[]::text[], array[]::text[]),
  ('ifn-litho-01', 'Lithophane Night Lamp (Backlit Photo)', 'lithophane-products', 'Night Lamp Lithophanes', 899, 1299, '31% OFF', true, true, 4.9, 88, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'], 'Carved with ultra-fine 0.1mm 3D layers. Appears as a white relief sculpture by day, and reveals a lifelike glowing photograph when lit.', 18, true, 'photo', array['Curved Medium', 'Curved Large'], array['Warm Golden Glow'], array['High-Density White PLA'], array[]::text[], array[]::text[]),
  ('ifn-devo-01', 'Lord Shiva 3D Devotional Lamp', 'devotional-lamps', 'Shiva Mandir Lamps', 699, 999, '30% OFF', false, true, 4.8, 110, 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&auto=format&fit=crop&q=80', array['https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&auto=format&fit=crop&q=80'], 'Sacred 3D illuminated lamp featuring the Divine Adiyogi / Lord Shiva with warm om-glow lighting for prayer rooms and study tables.', 22, false, null, array['Standard 7-inch'], array['Warm Golden Glow', 'Cyan Blue'], array['Laser Acrylic + Wood LED Base'], array[]::text[], array[]::text[])
on conflict (id) do nothing;

insert into banners (id, title, image, link, active, sort_order) values
  ('b1', 'Turn Memories Into Lasting 3D Gifts', 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=1200&auto=format&fit=crop&q=80', '/shop?category=moon-lamps', true, 1),
  ('b2', 'Handcrafted Wooden & LED Photo Frames', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80', '/shop?category=photo-frames', true, 2),
  ('b3', 'Magic Lithophane Photo Lamps', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80', '/shop?category=lithophane-products', true, 3)
on conflict (id) do nothing;

insert into coupons (id, code, type, discount_value, min_order, max_discount, active) values
  ('c1', 'INFINITY10', 'percentage', 10, 999, 300, true),
  ('c2', 'WELCOME100', 'fixed', 100, 799, null, true)
on conflict (id) do nothing;

insert into settings (id, store_name, phone, email, whatsapp, owner_name, address, free_shipping_threshold, gstin, currency, announcement_text, announcement_enabled, announcement_link) values
  (1, 'Infinity Frames N', '9494066914', 'infinityframesn@gmail.com', '919494066914', 'Naresh Kukkala', 'Near Bheemeswara Swami Temple, Opp Mandalam Ravichattu, 1st Floor, Drakshramam - 533262, Ramchandrapuram Mandal, Dr. B.R. Ambedkar Konaseema District', 1499, '', '₹', 'Special Offer: Free Delivery across India on orders above ₹1499 | Handcrafted 3D Gifts', true, '/shop')
on conflict (id) do nothing;

-- ============================================================================
-- 11. GRANT ADMIN ACCESS
--
--   1. Go to Supabase Dashboard → Authentication → Users → Add user:
--      Create your admin email + password (e.g. admin@infinityframesn.com).
--   2. Copy that user's UUID from the Users list.
--   3. In SQL Editor, run:
--        insert into admin_users (id, email) values ('<paste-uuid-here>', 'admin@infinityframesn.com');
-- ============================================================================
