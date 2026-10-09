-- ============================================================================
-- Ekart Logistics Integration — Add Tracking Columns to Orders Table
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- Add tracking columns if they do not already exist
alter table orders add column if not exists tracking_id text;
alter table orders add column if not exists courier text default 'Ekart Logistics';
alter table orders add column if not exists shipping_label text;
alter table orders add column if not exists shipped_at timestamptz;

-- Create index for quick lookup by tracking id
create index if not exists idx_orders_tracking_id on orders(tracking_id);

-- ----------------------------------------------------------------------------
-- Standard E-Commerce Product Packaging Proportions (Ekart Logistics)
-- Default: 500g, 30cm Length, 20cm Width, 5cm Height
-- ----------------------------------------------------------------------------
alter table products add column if not exists weight numeric default 500;
alter table products add column if not exists length numeric default 30;
alter table products add column if not exists width numeric default 20;
alter table products add column if not exists height numeric default 5;
