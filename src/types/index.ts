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
