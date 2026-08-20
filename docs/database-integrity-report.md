# 🏛️ Women Curator — Master Database Integrity & Schema Audit Report

**Report Date:** 2026-08-20  
**Target Database:** Supabase Tokyo Project (`tryylliobpikarotyxru`)  
**Audit Scope:** Full Live Postgres Schema, Automated Update Triggers, Foreign Keys, RLS Policies, Realtime Publications, Storage Buckets, and Admin ↔ Supabase Contract Alignment.

---

## 1. 📊 Live Schema & Table Inventory

The live Supabase database serves as the single source of truth. All **22 tables** have been audited, validated, and synchronized:

| Table Name | Columns | Primary Key | Foreign Keys | RLS Active | Auto `updated_at` Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `orders` | 36 | `id` (UUID) | `courier_check_id -> courier_check_cache.id` | ✅ Yes | ✅ `trg_set_updated_at` |
| `order_items` | 11 | `id` (UUID) | `order_id -> orders.id` | ✅ Yes | Immutable transaction |
| `products` | 33 | `id` (TEXT) | `category_id -> categories.id`, `collection_id -> collections.id` | ✅ Yes | ✅ `trg_set_updated_at` |
| `categories` | 9 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `collections` | 11 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `homepage_sections`| 9 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `hero_slides` | 15 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `testimonials` | 11 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `announcement_bar` | 8 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `navigation_items` | 8 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `footer_groups` | 7 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `site_settings` | 20 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `delivery_settings`| 8 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `admin_profiles` | 7 | `id` (UUID) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `courier_check_cache`| 19 | `id` (UUID) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `bd_courier_settings`| 9 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `steadfast_settings` | 10 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `tracking_settings` | 21 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `tracking_events_config` | 10 | `id` (TEXT) | None | ✅ Yes | ✅ `trg_set_updated_at` |
| `conversion_events` | 11 | `id` (UUID) | None | ✅ Yes | Immutable audit |
| `courier_api_logs` | 7 | `id` (UUID) | None | ✅ Yes | Immutable audit |
| `newsletter_subscribers` | 5 | `id` (UUID) | None | ✅ Yes | Immutable lead |

---

## 2. ⚡ Timestamp Standardization & PostgreSQL Automatic Triggers

### PostgreSQL Function:
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Attached Triggers:
Attached `BEFORE UPDATE ON <table> FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()` across all 18 mutable tables.
- **Frontend Independence**: The frontend code no longer needs to manually mutate `updated_at`. PostgreSQL automatically updates it upon every database modification, guaranteeing complete database integrity and eliminating schema cache mismatches.

---

## 3. 🛡️ Relationship & Foreign Key Integrity

- `order_items.order_id` ➔ `orders.id` (`ON DELETE CASCADE`)
- `order_items.product_id` ➔ `products.id` (`ON DELETE SET NULL` — ensures historical order data remains intact if products are deleted)
- `orders.courier_check_id` ➔ `courier_check_cache.id` (`ON DELETE SET NULL`)
- `products.category_id` ➔ `categories.id` (`ON DELETE SET NULL`)
- `products.collection_id` ➔ `collections.id` (`ON DELETE SET NULL`)

---

## 4. 🚀 Performance Indexes

The following indexes are active to optimize read speeds and avoid full table scans:
- `idx_orders_created_at` on `orders(created_at DESC)`
- `idx_orders_status` on `orders(status)`
- `idx_orders_phone` on `orders(phone)`
- `idx_orders_courier_risk` on `orders(courier_risk_level)`
- `idx_order_items_order_id` on `order_items(order_id)`
- `idx_products_slug` on `products(slug)`
- `idx_products_status` on `products(status)`
- `idx_products_sort_order` on `products(sort_order)`
- `idx_categories_slug` on `categories(slug)`
- `idx_collections_slug` on `collections(slug)`
- `idx_courier_cache_phone` on `courier_check_cache(phone)`
- `idx_courier_logs_phone` on `courier_api_logs(phone)`

---

## 5. 📡 Realtime & Supabase Storage

- **Realtime Publication**: `orders` and `order_items` are registered to the `supabase_realtime` publication for instant live order updates without manual polling.
- **Storage Buckets**: `products`, `cms`, and `site` buckets are configured with public read access and authenticated upload/delete policies.

---

## 6. 🩺 Admin System Diagnostics Page

A dedicated **System Diagnostics & Database Health** dashboard is now available at:
👉 **`/admin/settings/health`**

It provides:
- Live latency and connection status.
- Realtime WebSocket heartbeat.
- Table Row counts & RLS protection status.
- One-click schema binding verification.
