export interface ColorOption {
  name: string;
  hex: string;
  bgClass?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  compare_price: number;
  image_url: string;
  secondary_image_url?: string;
  gallery: string[];
  category_id: string;
  category_name?: string;
  badge?: string;
  colors: ColorOption[];
  sizes: string[];
  fabric_details: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
  selectedSize: string;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  orderNotes: string;
  paymentMethod: 'cod' | 'bkash' | 'card';
  promoCode?: string;
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
  email: string;
  address: string;
  city: string;
  area: string;
  postal_code: string;
  notes?: string;
  payment_method: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  image: string;
  itemCount: number;
  slug: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
  productBought: string;
}
