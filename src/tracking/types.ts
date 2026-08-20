export interface TrackingSettings {
  id?: string;
  gtm_enabled: boolean;
  gtm_container_id: string;
  ga4_enabled: boolean;
  ga4_measurement_id: string;
  google_ads_enabled: boolean;
  google_ads_conversion_id: string;
  google_ads_purchase_label: string;
  google_ads_cart_label?: string;
  google_ads_begin_checkout_label?: string;
  meta_enabled: boolean;
  meta_pixel_id: string;
  meta_capi_enabled: boolean;
  tiktok_enabled: boolean;
  tiktok_pixel_id: string;
  tiktok_events_api_enabled: boolean;
  advanced_matching_enabled: boolean;
  debug_mode: boolean;
  consent_mode_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrackingEventConfig {
  id: string;
  name: string;
  category: 'navigation' | 'ecommerce' | 'engagement' | 'lead';
  enabled: boolean;
  ga4_enabled: boolean;
  google_ads_enabled: boolean;
  meta_enabled: boolean;
  tiktok_enabled: boolean;
}

export interface NormalizedItem {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  item_variant?: string;
  price: number;
  quantity: number;
  discount?: number;
  currency?: string;
}

export interface EcommercePayload {
  currency: string;
  value?: number;
  transaction_id?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
  shipping_tier?: string;
  payment_type?: string;
  item_list_id?: string;
  item_list_name?: string;
  items: NormalizedItem[];
}

export interface TrackingEvent {
  name: string;
  eventId: string;
  ecommerce?: EcommercePayload;
  metadata?: Record<string, any>;
  user?: {
    email?: string;
    phone?: string;
    fullName?: string;
    city?: string;
  };
}

export interface UtmAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  landing_page?: string;
  first_seen_at?: string;
}

export interface ConsentState {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
  }
}
