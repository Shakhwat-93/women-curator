# Women Curator — Marketing Analytics & Conversion Tracking Plan

This document defines the unified, single-source-of-truth tracking architecture for **Women Curator**.

---

## 🏛️ 1. Architecture Overview

Women Curator uses a **Centralized Tracking Layer (`src/tracking/`)** with a single global `window.dataLayer` and strict client/server deduplication.

```
                  User / Storefront Action
                            ↓
               [ Central Tracker (track.*) ]
                            ↓
       ┌────────────────────┼────────────────────┐
       ↓                    ↓                    ↓
[ window.dataLayer ]   [ Direct Fallback ]   [ Supabase DB ]
       ↓                    ↓                    ↓
  [ Google GTM ]       [ Meta / TikTok ]     [ conversion_events ]
  - GA4                - Pixel (Client)      (Idempotency Log)
  - Google Ads         - CAPI / Events API
```

---

## 💎 2. Standard Ecommerce Funnel Events Matrix

| Event Name | Trigger | GA4 Parameter / Object | Meta Event | TikTok Event | Google Ads | Stable Event ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `page_view` | SPA route changes (ignoring `/admin`) | `page_location`, `page_path`, `page_title` | `PageView` | `Page` | — | `page_view_<timestamp>` |
| `view_item_list` | Collection or product grid mounted | `item_list_id`, `item_list_name`, `items[]` | — | — | — | `view_item_list_<listId>` |
| `select_item` | Product card clicked | `item_list_id`, `items[]` | — | — | — | `select_item_<productId>` |
| `view_item` | Product modal / details opened | `currency: "BDT"`, `value`, `items[]` | `ViewContent` | `ViewContent` | — | `view_item_<productId>` |
| `add_to_cart` | Garment added to bag | `currency: "BDT"`, `value`, `items[]` | `AddToCart` | `AddToCart` | Optional | `add_to_cart_<productId>_<uid>` |
| `remove_from_cart` | Garment removed from bag | `currency: "BDT"`, `value`, `items[]` | — | — | — | `remove_from_cart_<productId>` |
| `view_cart` | Shopping bag drawer opened | `currency: "BDT"`, `value`, `items[]` | — | — | — | `view_cart_<uid>` |
| `begin_checkout` | Customer starts checkout flow | `currency: "BDT"`, `value`, `items[]` | `InitiateCheckout` | `InitiateCheckout` | Optional | `begin_checkout_<uid>` |
| `add_shipping_info` | Customer selects delivery city | `currency: "BDT"`, `value`, `shipping_tier` | — | — | — | `add_shipping_info_<uid>` |
| `add_payment_info` | Customer selects payment method | `currency: "BDT"`, `value`, `payment_type` | `AddPaymentInfo` | `AddPaymentInfo` | — | `add_payment_info_<uid>` |
| **`purchase`** | **Database order insert confirmed** | `transaction_id`, `value`, `currency: "BDT"`, `shipping`, `items[]` | **`Purchase`** | **`CompletePayment`** | **Purchase Conversion** | **`purchase_<ORDER_ID>`** |
| `search` | Storefront search query executed | `search_term` | `Search` | `Search` | — | `search_<uid>` |
| `add_to_wishlist` | Heart icon clicked | `currency: "BDT"`, `value`, `items[]` | `AddToWishlist` | `AddToWishlist` | — | `add_to_wishlist_<productId>` |
| `newsletter_signup` | Email newsletter joined | `lead_type: 'newsletter'` | `Lead` | — | — | `newsletter_signup_<uid>` |

---

## 🛡️ 3. Purchase Conversion Deduplication (Zero-Duplicate Rule)

1. **Trigger Condition**:
   - Fires **ONLY** after Supabase returns `status: 201` / `order.id` confirming the order record is committed to the database.
   - **Never** fires on button click, form validation, or component re-render.

2. **Deduplication Layers**:
   - **Layer 1: In-Memory Set**: Prevents duplicate firing in React `StrictMode` development cycles.
   - **Layer 2: Browser Storage (`localStorage` + `sessionStorage`)**:
     Key: `women_curator_purchase_tracked_<ORDER_ID>`
     Prevents duplicate firing when customer refreshes the success page, closes & reopens the tab, or navigates back and forth.
   - **Layer 3: Supabase `conversion_events` Table**:
     Unique constraint: `UNIQUE(provider, event_name, order_id)`.

3. **Event ID Consistency**:
   - Client and Server share the exact same canonical `event_id`: `purchase_<ORDER_ID>`.
   - Enables Meta CAPI and TikTok Events API to automatically deduplicate browser vs server events.

---

## 🎯 4. Marketing Attribution & UTM Parameters

- First-Touch and Last-Touch UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) and Click IDs (`gclid`, `fbclid`, `ttclid`) are captured on arrival and stored in `localStorage` and `sessionStorage`.
- When an order is placed, these attribution parameters are automatically saved with the order record in the Supabase `orders` table.
- Order details in the Admin Panel display the exact ad campaign and click ID responsible for the sale.

---

## ⚙️ 5. Admin Control Center (`/admin/settings/tracking`)

- Dynamic configuration of GTM Container ID, GA4 Measurement ID, Google Ads Conversion ID & Labels, Meta Pixel ID, and TikTok Pixel ID.
- Event Routing Matrix: Enable or mute specific events per ad network without touching code.
- Live DataLayer & Event Simulation debugger.
