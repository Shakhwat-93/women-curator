import {
  TrackingSettings,
  TrackingEventConfig,
  TrackingEvent,
  NormalizedItem,
  EcommercePayload
} from './types';
import { pushDataLayer } from './dataLayer';
import { markPurchaseTracked, getEventId } from './deduplication';
import { captureUtmParameters, getStoredAttribution } from './utm';
import { initConsentMode } from './consent';
import { initGTM } from './providers/gtm';
import { initGA4, sendGA4Event } from './providers/ga4';
import { sendGoogleAdsConversion } from './providers/googleAds';
import { initMetaPixel, sendMetaEvent } from './providers/meta';
import { initTikTokPixel, sendTikTokEvent } from './providers/tiktok';
import { Product, Order, CartItem } from '../types';
import { supabase } from '../lib/supabase';

class CentralTracker {
  private settings: TrackingSettings = {
    gtm_enabled: false,
    gtm_container_id: '',
    ga4_enabled: false,
    ga4_measurement_id: '',
    google_ads_enabled: false,
    google_ads_conversion_id: '',
    google_ads_purchase_label: '',
    meta_enabled: false,
    meta_pixel_id: '',
    meta_capi_enabled: false,
    tiktok_enabled: false,
    tiktok_pixel_id: '',
    tiktok_events_api_enabled: false,
    advanced_matching_enabled: false,
    debug_mode: true,
    consent_mode_enabled: false
  };

  private eventsConfig: Map<string, TrackingEventConfig> = new Map();
  public isReady = false;
  private lastTrackedPage = '';

  /**
   * Initialize all tracking providers and consent states from admin configuration.
   */
  public async init(customSettings?: Partial<TrackingSettings>) {
    if (typeof window === 'undefined') return;

    try {
      // 1. Fetch settings from Supabase if not passed
      if (!customSettings) {
        const { data: dbSettings } = await supabase
          .from('tracking_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (dbSettings) {
          this.settings = { ...this.settings, ...dbSettings };
        }
      } else {
        this.settings = { ...this.settings, ...customSettings };
      }

      // 2. Fetch event toggles
      const { data: dbEvents } = await supabase
        .from('tracking_events_config')
        .select('*');

      if (dbEvents && dbEvents.length > 0) {
        dbEvents.forEach((ev: TrackingEventConfig) => {
          this.eventsConfig.set(ev.id, ev);
        });
      }

      // 3. Capture UTMs & Click IDs from current URL
      captureUtmParameters();

      // 4. Initialize Google Consent Mode v2
      initConsentMode(this.settings.consent_mode_enabled);

      // 5. Initialize GTM (Primary Orchestrator)
      if (this.settings.gtm_enabled && this.settings.gtm_container_id) {
        initGTM(this.settings.gtm_container_id);
      }

      // 6. Initialize GA4 (Direct Fallback if GTM disabled)
      if (!this.settings.gtm_enabled && this.settings.ga4_enabled && this.settings.ga4_measurement_id) {
        initGA4(this.settings.ga4_measurement_id, this.settings.debug_mode);
      }

      // 7. Initialize Meta Pixel
      if (this.settings.meta_enabled && this.settings.meta_pixel_id) {
        initMetaPixel(this.settings.meta_pixel_id, this.settings.advanced_matching_enabled);
      }

      // 8. Initialize TikTok Pixel
      if (this.settings.tiktok_enabled && this.settings.tiktok_pixel_id) {
        initTikTokPixel(this.settings.tiktok_pixel_id);
      }

      this.isReady = true;

      if (this.settings.debug_mode) {
        console.log(
          '%c[Women Curator Tracking]%c Central Tracker initialized successfully with stack:',
          'background: #DE4F3C; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
          'color: #333; font-weight: bold;',
          {
            GTM: this.settings.gtm_enabled ? this.settings.gtm_container_id : 'Disabled',
            GA4: this.settings.ga4_enabled ? this.settings.ga4_measurement_id : 'Disabled',
            GoogleAds: this.settings.google_ads_enabled ? this.settings.google_ads_conversion_id : 'Disabled',
            Meta: this.settings.meta_enabled ? this.settings.meta_pixel_id : 'Disabled',
            TikTok: this.settings.tiktok_enabled ? this.settings.tiktok_pixel_id : 'Disabled',
            Attribution: getStoredAttribution()
          }
        );
      }
    } catch (e) {
      console.warn('CentralTracker init warning:', e);
    }
  }

  /**
   * Dispatches event to dataLayer and active direct providers with deduplication and validation.
   */
  private dispatch(event: TrackingEvent) {
    const config = this.eventsConfig.get(event.name);
    if (config && !config.enabled) {
      if (this.settings.debug_mode) {
        console.log(`[Tracking] Event "${event.name}" is disabled in Admin configuration.`);
      }
      return;
    }

    // 1. Push to Single DataLayer (for GTM)
    pushDataLayer({
      event: event.name,
      event_id: event.eventId,
      ecommerce: event.ecommerce || undefined,
      ...event.metadata
    });

    // 2. Direct GA4 fallback (only if GTM is disabled to prevent duplicates)
    if (!this.settings.gtm_enabled && this.settings.ga4_enabled && (config ? config.ga4_enabled : true)) {
      sendGA4Event(event);
    }

    // 3. Google Ads Purchase & Cart Conversion
    if (this.settings.google_ads_enabled && (config ? config.google_ads_enabled : true)) {
      if (event.name === 'purchase' && this.settings.google_ads_purchase_label) {
        sendGoogleAdsConversion(
          this.settings.google_ads_conversion_id,
          this.settings.google_ads_purchase_label,
          event
        );
      }
    }

    // 4. Meta Pixel
    if (this.settings.meta_enabled && (config ? config.meta_enabled : true)) {
      sendMetaEvent(event);
    }

    // 5. TikTok Pixel
    if (this.settings.tiktok_enabled && (config ? config.tiktok_enabled : true)) {
      sendTikTokEvent(event);
    }

    // 6. Debug logger
    if (this.settings.debug_mode) {
      console.groupCollapsed(
        `%c[Tracking Event]%c ${event.name} (ID: ${event.eventId})`,
        'background: #1E1B18; color: #FAF5EE; padding: 2px 6px; border-radius: 4px;',
        'color: #DE4F3C; font-weight: bold;'
      );
      console.log('Event Name:', event.name);
      console.log('Event ID:', event.eventId);
      console.log('Ecommerce Payload:', event.ecommerce);
      console.log('Metadata:', event.metadata);
      console.groupEnd();
    }
  }

  // -------------------------------------------------------------
  // NORMALIZATION HELPERS
  // -------------------------------------------------------------
  public normalizeProduct(product: Product, quantity: number = 1, color?: string, size?: string): NormalizedItem {
    return {
      item_id: product.sku || product.id,
      item_name: product.name,
      item_brand: 'Women Curator',
      item_category: product.category_name || 'Tunics',
      item_variant: [color, size].filter(Boolean).join(' / ') || undefined,
      price: Number(product.price) || 0,
      quantity: Number(quantity) || 1,
      discount: product.compare_price > product.price ? product.compare_price - product.price : 0,
      currency: 'BDT'
    };
  }

  public normalizeCartItems(items: CartItem[]): NormalizedItem[] {
    return items.map(it => this.normalizeProduct(it.product, it.quantity, it.selectedColor.name, it.selectedSize));
  }

  // -------------------------------------------------------------
  // PUBLIC E-COMMERCE FUNNEL TRACKING API
  // -------------------------------------------------------------

  /**
   * PAGE VIEW — Tracked once per route change in SPA
   */
  public pageView(path: string = window.location.pathname, title: string = document.title) {
    if (this.lastTrackedPage === path) return;
    this.lastTrackedPage = path;

    const eventId = getEventId('page_view');
    this.dispatch({
      name: 'page_view',
      eventId,
      metadata: {
        page_path: path,
        page_title: title,
        page_location: window.location.href
      }
    });
  }

  /**
   * VIEW ITEM LIST — When collection or product grid is displayed
   */
  public viewItemList(products: Product[], listName: string = 'Curated Drops', listId: string = 'curated_drops') {
    if (!products || products.length === 0) return;
    const items = products.map((p, idx) => ({ ...this.normalizeProduct(p), index: idx }));
    const eventId = getEventId('view_item_list', listId);

    this.dispatch({
      name: 'view_item_list',
      eventId,
      ecommerce: {
        currency: 'BDT',
        item_list_id: listId,
        item_list_name: listName,
        items
      }
    });
  }

  /**
   * SELECT ITEM — When a customer clicks on a product card
   */
  public selectItem(product: Product, listName: string = 'Curated Drops', listId: string = 'curated_drops') {
    const item = this.normalizeProduct(product);
    const eventId = getEventId('select_item', product.id);

    this.dispatch({
      name: 'select_item',
      eventId,
      ecommerce: {
        currency: 'BDT',
        item_list_id: listId,
        item_list_name: listName,
        items: [item]
      }
    });
  }

  /**
   * VIEW ITEM — When product modal or product detail is viewed
   */
  public viewItem(product: Product, color?: string, size?: string) {
    const item = this.normalizeProduct(product, 1, color, size);
    const eventId = getEventId('view_item', product.id);

    this.dispatch({
      name: 'view_item',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: item.price,
        items: [item]
      }
    });
  }

  /**
   * ADD TO CART — Triggered ONLY upon actual addition to bag
   */
  public addToCart(product: Product, quantity: number = 1, color?: string, size?: string) {
    const item = this.normalizeProduct(product, quantity, color, size);
    const eventId = getEventId('add_to_cart', product.id);

    this.dispatch({
      name: 'add_to_cart',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: item.price * quantity,
        items: [item]
      }
    });
  }

  /**
   * REMOVE FROM CART
   */
  public removeFromCart(product: Product, quantity: number = 1, color?: string, size?: string) {
    const item = this.normalizeProduct(product, quantity, color, size);
    const eventId = getEventId('remove_from_cart', product.id);

    this.dispatch({
      name: 'remove_from_cart',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: item.price * quantity,
        items: [item]
      }
    });
  }

  /**
   * VIEW CART — When shopping bag drawer is opened
   */
  public viewCart(cart: CartItem[], total: number) {
    const items = this.normalizeCartItems(cart);
    const eventId = getEventId('view_cart');

    this.dispatch({
      name: 'view_cart',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: total,
        items
      }
    });
  }

  /**
   * BEGIN CHECKOUT — When customer starts checkout flow
   */
  public beginCheckout(cart: CartItem[], total: number) {
    const items = this.normalizeCartItems(cart);
    const eventId = getEventId('begin_checkout');

    this.dispatch({
      name: 'begin_checkout',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: total,
        items
      }
    });
  }

  /**
   * ADD SHIPPING INFO — When delivery location / fee is calculated
   */
  public addShippingInfo(cart: CartItem[], total: number, shippingTier: string = 'Dhaka') {
    const items = this.normalizeCartItems(cart);
    const eventId = getEventId('add_shipping_info');

    this.dispatch({
      name: 'add_shipping_info',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: total,
        shipping_tier: shippingTier,
        items
      }
    });
  }

  /**
   * ADD PAYMENT INFO — When payment method is confirmed (e.g. Cash on Delivery)
   */
  public addPaymentInfo(cart: CartItem[], total: number, paymentType: string = 'cash_on_delivery') {
    const items = this.normalizeCartItems(cart);
    const eventId = getEventId('add_payment_info');

    this.dispatch({
      name: 'add_payment_info',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: total,
        payment_type: paymentType,
        items
      }
    });
  }

  /**
   * PURCHASE — STRICT VALIDATION & ZERO-DUPLICATE GUARANTEE
   * Fires ONLY after Supabase order insert is 100% verified.
   */
  public purchase(order: Order) {
    const transactionId = order.order_number || order.id;
    if (!transactionId) {
      console.error('[Tracking Error] Purchase called without valid order/transaction ID.');
      return;
    }

    // STRICT DEDUPLICATION GUARD
    const isFirstTime = markPurchaseTracked(transactionId);
    if (!isFirstTime) {
      if (this.settings.debug_mode) {
        console.warn(`[Tracking Guard] Purchase conversion for order "${transactionId}" was ALREADY tracked. Suppressing duplicate.`);
      }
      return;
    }

    const eventId = getEventId('purchase', transactionId);
    const items: NormalizedItem[] = (order.items || []).map(it => ({
      item_id: it.product_id,
      item_name: it.product_name,
      item_brand: 'Women Curator',
      item_category: 'Tunics',
      item_variant: [it.color_name, it.size].filter(Boolean).join(' / '),
      price: Number(it.unit_price) || 0,
      quantity: Number(it.quantity) || 1,
      currency: 'BDT'
    }));

    const ecommercePayload: EcommercePayload = {
      transaction_id: transactionId,
      value: Number(order.total) || 0,
      currency: 'BDT',
      shipping: Number(order.delivery_charge) || 0,
      payment_type: order.payment_method?.toLowerCase().includes('cash') ? 'cash_on_delivery' : order.payment_method,
      items
    };

    this.dispatch({
      name: 'purchase',
      eventId,
      ecommerce: ecommercePayload,
      metadata: {
        customer_city: order.city,
        customer_phone: order.phone
      }
    });

    // Record conversion idempotency in Supabase
    this.recordConversionInDb(transactionId, eventId, ecommercePayload);
  }

  /**
   * SEARCH — When user searches catalog
   */
  public search(query: string) {
    if (!query.trim()) return;
    const eventId = getEventId('search');

    this.dispatch({
      name: 'search',
      eventId,
      metadata: {
        search_term: query.trim()
      }
    });
  }

  /**
   * ADD TO WISHLIST
   */
  public addToWishlist(product: Product) {
    const item = this.normalizeProduct(product);
    const eventId = getEventId('add_to_wishlist', product.id);

    this.dispatch({
      name: 'add_to_wishlist',
      eventId,
      ecommerce: {
        currency: 'BDT',
        value: item.price,
        items: [item]
      }
    });
  }

  /**
   * NEWSLETTER SIGNUP / LEAD
   */
  public newsletterSignup(email: string) {
    const eventId = getEventId('newsletter_signup');
    this.dispatch({
      name: 'newsletter_signup',
      eventId,
      metadata: {
        lead_type: 'newsletter',
        lead_email: email
      }
    });
  }

  private async recordConversionInDb(orderId: string, eventId: string, payload: any) {
    try {
      await supabase.from('conversion_events').insert([
        {
          order_id: orderId,
          transaction_id: orderId,
          provider: 'client_tracker',
          event_name: 'purchase',
          event_id: eventId,
          status: 'success',
          payload
        }
      ]);
    } catch (e) {
      // Non-blocking log
      console.warn('Could not record conversion log to DB:', e);
    }
  }
}

export const track = new CentralTracker();
