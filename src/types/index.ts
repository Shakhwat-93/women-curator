export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type AdminRole = 'owner' | 'admin' | 'editor';

export interface ColorOption {
  name: string;
  hex: string;
  image_url?: string;
  bgClass?: string;
}

export interface CardCustomization {
  badge?: string;
  cardDescription?: string;
  ctaText?: string;
  accentColor?: string;
  showWishlist?: boolean;
  showColorSwatches?: boolean;
  showComparePrice?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  subtitle?: string;
  description?: string;
  price: number;
  compare_price: number;
  cost_price?: number;
  stock?: number;
  low_stock_threshold?: number;
  status?: 'active' | 'draft' | 'archived';
  badge?: string;
  category_id?: string;
  category_name?: string;
  collection_id?: string;
  image_url: string;
  secondary_image_url?: string;
  gallery?: string[];
  colors: ColorOption[];
  sizes?: string[];
  fabric_details?: string;
  care_instructions?: string;
  card_settings?: CardCustomization;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  rating?: number;
  reviews_count?: number;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: ColorOption;
  selectedSize: string;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: 'Dhaka' | 'Outside Dhaka' | string;
  area?: string;
  postalCode?: string;
  orderNotes?: string;
  zone?: string;
  notes?: string;
  paymentMethod: 'cod' | 'bKash' | 'nagad' | string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id?: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  area?: string;
  postal_code?: string;
  notes?: string;
  payment_method: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  items?: OrderItem[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  courier_provider?: string;
  courier_consignment_id?: string | number;
  courier_tracking_code?: string;
  courier_status?: string;
  courier_sent_at?: string;
  courier_response?: any;
  courier_check_id?: string;
  courier_success_ratio?: number;
  courier_risk_level?: 'low' | 'medium' | 'high' | 'unknown';
  courier_total_parcels?: number;
  courier_check?: CourierCheckResult;
  created_at?: string;
  updated_at?: string;
}

export type CourierRiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export interface CourierSummary {
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

export interface CourierBreakdownItem {
  name: string;
  logo?: string;
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

export interface CourierReport {
  courier?: string;
  report?: string;
  details?: string;
  date?: string;
  reason?: string;
  status?: string;
}

export interface CourierCheckResult {
  id?: string;
  phone: string;
  status: 'checked' | 'pending' | 'failed' | 'expired' | 'no_data';
  summary_total_parcel: number;
  summary_success_parcel: number;
  summary_cancelled_parcel: number;
  summary_success_ratio: number;
  risk_level: CourierRiskLevel;
  couriers: Record<string, CourierBreakdownItem>;
  reports: CourierReport[];
  raw_response?: any;
  last_error?: string;
  retry_count?: number;
  checked_at: string;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface BdCourierSettings {
  id?: string;
  is_enabled: boolean;
  api_key: string;
  base_url: string;
  cache_duration_days: number;
  auto_check_new_orders: boolean;
  max_retries: number;
  created_at?: string;
  updated_at?: string;
}

export interface SteadfastSettings {
  id?: string;
  is_enabled: boolean;
  api_key: string;
  secret_key: string;
  base_url: string;
  default_delivery_type: number;
  default_note?: string;
  auto_send_on_confirm?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SteadfastOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  alternative_phone?: string;
  recipient_email?: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
  total_lot?: number;
  delivery_type?: number;
}

export interface SteadfastConsignment {
  consignment_id: number;
  invoice: string;
  tracking_code: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  status: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_url?: string;
  itemCount?: number;
  tagline?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  accent_color?: string;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle?: string;
  sort_order: number;
  is_enabled: boolean;
  settings?: Record<string, any>;
  updated_at?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
  sort_order: number;
  is_active: boolean;
  settings?: {
    primaryBlobColor?: string;
    secondaryBlobColor?: string;
    bgColor?: string;
  };
  created_at?: string;
}

export interface Testimonial {
  id: string;
  customer_name?: string;
  name?: string;
  role?: string;
  city?: string;
  location?: string;
  review?: string;
  comment?: string;
  rating: number;
  avatar?: string;
  avatar_url?: string;
  productBought?: string;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface AnnouncementBar {
  id?: string;
  text: string;
  link_url?: string;
  bg_color?: string;
  text_color?: string;
  is_active: boolean;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  name?: string;
  status?: string;
  created_at?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export interface FooterGroup {
  id: string;
  title: string;
  links: Array<{ label: string; url: string }>;
  sort_order: number;
}

export interface SiteSettings {
  id?: string;
  store_name: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp_number?: string;
  currency?: string;
  currency_symbol?: string;
  brand_story?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface DeliverySettings {
  id?: string;
  inside_dhaka_fee: number;
  outside_dhaka_fee: number;
  free_delivery_threshold: number;
  is_active: boolean;
  delivery_note?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
  created_at?: string;
}
