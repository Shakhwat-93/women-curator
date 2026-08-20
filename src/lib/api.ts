import { supabase } from './supabase';
import {
  Product,
  Order,
  Category,
  Collection,
  HomepageSection,
  HeroSlide,
  Testimonial,
  AnnouncementBar,
  NewsletterSubscriber,
  NavigationItem,
  SiteSettings,
  DeliverySettings
} from '../types';
import { SEED_PRODUCTS } from '../data/seedData';

// -------------------------------------------------------------
// 1. PRODUCT SERVICE
// -------------------------------------------------------------
export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data as Product[];
    } catch (err) {
      console.warn('Supabase getProducts failed, using seed data fallback:', err);
    }
    return SEED_PRODUCTS;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as Product[];
    } catch (err) {
      console.warn('Supabase getFeaturedProducts error:', err);
    }
    return SEED_PRODUCTS.filter(p => p.is_featured);
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) return data as Product;
    } catch (err) {
      console.warn(`Supabase getProductById(${id}) error:`, err);
    }
    return SEED_PRODUCTS.find(p => p.id === id) || null;
  },

  async saveProduct(product: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
      const payload: Record<string, any> = {
        id: product.id || `prod-${Date.now()}`,
        name: product.name,
        slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '',
        sku: product.sku || null,
        subtitle: product.subtitle || null,
        description: product.description || null,
        price: Number(product.price) || 0,
        compare_price: Number(product.compare_price) || 0,
        cost_price: product.cost_price ? Number(product.cost_price) : null,
        stock: product.stock !== undefined ? Number(product.stock) : 50,
        low_stock_threshold: product.low_stock_threshold ? Number(product.low_stock_threshold) : 5,
        status: product.status || 'active',
        badge: product.badge || null,
        category_name: product.category_name || null,
        category_id: product.category_id || null,
        collection_id: product.collection_id || null,
        image_url: product.image_url || '',
        gallery: product.gallery || [],
        colors: product.colors || [],
        sizes: product.sizes || ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
        fabric_details: product.fabric_details || null,
        care_instructions: product.care_instructions || null,
        card_settings: product.card_settings || {},
        is_featured: product.is_featured ?? true,
        is_active: product.status === 'active',
        sort_order: product.sort_order || 0,
        seo_title: product.seo_title || null,
        seo_description: product.seo_description || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Product };
    } catch (err: any) {
      console.error('Save product error:', err);
      return { success: false, error: err.message || 'Failed to save product' };
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete product' };
    }
  }
};

// -------------------------------------------------------------
// 2. ORDER SERVICE
// -------------------------------------------------------------
export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          courier_check:courier_check_cache(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) return data as Order[];
    } catch (err) {
      console.warn('Supabase getOrders error, falling back to localStorage:', err);
    }

    const localOrders = localStorage.getItem('women_curator_orders');
    return localOrders ? JSON.parse(localOrders) : [];
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          courier_check:courier_check_cache(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) return data as Order;
    } catch (err) {
      console.warn(`Supabase getOrderById(${id}) error:`, err);
    }
    return null;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update order status' };
    }
  },

  async createOrder(order: Partial<Order>): Promise<{ success: boolean; orderId?: string; order?: Order; error?: string }> {
    try {
      // Capture stored UTM & Click attribution
      let attribution: any = {};
      try {
        const lastTouch = sessionStorage.getItem('women_curator_utm_last_touch') || localStorage.getItem('women_curator_utm_last_touch');
        if (lastTouch) attribution = JSON.parse(lastTouch);
      } catch (e) {}

      const orderPayload = {
        order_number: order.order_number || `WC-${Date.now().toString().slice(-6)}`,
        customer_name: order.customer_name,
        phone: order.phone,
        email: order.email || '',
        address: order.address,
        city: order.city,
        area: order.area || '',
        postal_code: order.postal_code || '',
        notes: order.notes || '',
        payment_method: order.payment_method || 'Cash on Delivery',
        subtotal: order.subtotal || 0,
        delivery_charge: order.delivery_charge || 0,
        discount: order.discount || 0,
        total: order.total || 0,
        status: order.status || 'pending',
        utm_source: order.utm_source || attribution.utm_source || null,
        utm_medium: order.utm_medium || attribution.utm_medium || null,
        utm_campaign: order.utm_campaign || attribution.utm_campaign || null,
        utm_term: order.utm_term || attribution.utm_term || null,
        utm_content: order.utm_content || attribution.utm_content || null,
        gclid: order.gclid || attribution.gclid || null,
        fbclid: order.fbclid || attribution.fbclid || null,
        ttclid: order.ttclid || attribution.ttclid || null
      };

      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      let createdItems = order.items || [];
      if (order.items && order.items.length > 0 && insertedOrder?.id) {
        const itemRows = order.items.map(it => ({
          order_id: insertedOrder.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_image: it.product_image || '',
          color_name: it.color_name || '',
          size: it.size || '',
          quantity: it.quantity || 1,
          unit_price: it.unit_price,
          subtotal: it.subtotal
        }));

        const { data: insertedItems } = await supabase
          .from('order_items')
          .insert(itemRows)
          .select();

        if (insertedItems && insertedItems.length > 0) {
          createdItems = insertedItems;
        }
      }

      const fullOrder: Order = {
        ...insertedOrder,
        items: createdItems
      };

      // Asynchronous background courier check (without blocking customer checkout)
      if (fullOrder.phone) {
        import('./bdCourier').then(({ bdCourierService }) => {
          bdCourierService.checkCustomerCourier(fullOrder.phone, {
            orderId: fullOrder.id || fullOrder.order_number
          }).catch(err => {
            console.warn('Background courier check failed:', err);
          });
        });
      }

      // Sync local backup
      const current = JSON.parse(localStorage.getItem('women_curator_orders') || '[]');
      localStorage.setItem('women_curator_orders', JSON.stringify([fullOrder, ...current]));

      return { success: true, orderId: fullOrder.order_number, order: fullOrder };
    } catch (err: any) {
      console.error('Supabase createOrder failed, storing locally:', err);
      const fallbackNumber = order.order_number || `WC-${Date.now().toString().slice(-6)}`;
      const fallbackOrder: Order = {
        ...order,
        id: `local-${Date.now()}`,
        order_number: fallbackNumber,
        customer_name: order.customer_name || 'Guest',
        phone: order.phone || '',
        address: order.address || '',
        city: order.city || 'Dhaka',
        payment_method: order.payment_method || 'Cash on Delivery',
        subtotal: order.subtotal || 0,
        delivery_charge: order.delivery_charge || 0,
        discount: order.discount || 0,
        total: order.total || 0,
        status: (order.status as any) || 'pending',
        items: order.items || [],
        created_at: new Date().toISOString()
      };
      const current = JSON.parse(localStorage.getItem('women_curator_orders') || '[]');
      localStorage.setItem('women_curator_orders', JSON.stringify([fallbackOrder, ...current]));
      return { success: true, orderId: fallbackNumber, order: fallbackOrder };
    }
  }
};

// -------------------------------------------------------------
// 3. CATEGORY & COLLECTION SERVICES
// -------------------------------------------------------------
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as Category[];
    } catch (err) {
      console.warn('getCategories error:', err);
    }
    return [
      { id: 'cat-tunics', name: 'Tunics & Kurtis', slug: 'tunics', sort_order: 1, is_active: true },
      { id: 'cat-peplums', name: 'Statement Peplums', slug: 'peplums', sort_order: 2, is_active: true },
      { id: 'cat-shirts', name: 'Casual Shirts', slug: 'shirts', sort_order: 3, is_active: true },
      { id: 'cat-coords', name: 'Co-ord Sets', slug: 'coords', sort_order: 4, is_active: true }
    ];
  },

  async saveCategory(category: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Category };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

export const collectionService = {
  async getCollections(): Promise<Collection[]> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as Collection[];
    } catch (err) {
      console.warn('getCollections error:', err);
    }
    return [
      { id: 'col-autumn-2026', name: 'Autumn Capsule 2026', slug: 'autumn-2026', accent_color: '#DE4F3C', is_featured: true, is_active: true, sort_order: 1 },
      { id: 'col-festive', name: 'Festive Muse Edition', slug: 'festive-muse', accent_color: '#BD4857', is_featured: true, is_active: true, sort_order: 2 }
    ];
  },

  async saveCollection(collection: Partial<Collection>): Promise<{ success: boolean; data?: Collection; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .upsert(collection)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Collection };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 4. HOMEPAGE SECTION CMS SERVICE
// -------------------------------------------------------------
export const homepageService = {
  async getSections(): Promise<HomepageSection[]> {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as HomepageSection[];
    } catch (err) {
      console.warn('getSections error:', err);
    }
    return [
      { id: 'sec-hero', section_key: 'hero', title: 'Hero Carousel & Banner', subtitle: 'New Drop 2026 Showcase', sort_order: 1, is_enabled: true },
      { id: 'sec-products', section_key: 'products', title: 'Curated 4 Drops', subtitle: 'Signature Collection Grid', sort_order: 2, is_enabled: true },
      { id: 'sec-order', section_key: 'direct_order', title: 'Express Direct Checkout', subtitle: 'Cash on Delivery In-Page Order Form', sort_order: 3, is_enabled: true },
      { id: 'sec-editorial', section_key: 'editorial', title: 'Brand Story & Detail Spread', subtitle: 'Silhouette, Fabric & Quality', sort_order: 4, is_enabled: true },
      { id: 'sec-benefits', section_key: 'benefits', title: 'Why Women Curator', subtitle: 'Value Pillars & Guarantees', sort_order: 5, is_enabled: true },
      { id: 'sec-testimonials', section_key: 'testimonials', title: 'Voices of the Muse', subtitle: 'Verified Customer Reviews', sort_order: 6, is_enabled: true }
    ];
  },

  async updateSectionsOrder(sections: HomepageSection[]): Promise<{ success: boolean; error?: string }> {
    try {
      const updates = sections.map((s, idx) => ({
        ...s,
        sort_order: idx + 1,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('homepage_sections')
        .upsert(updates);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 5. HERO SLIDES SERVICE
// -------------------------------------------------------------
export const heroService = {
  async getSlides(): Promise<HeroSlide[]> {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as HeroSlide[];
    } catch (err) {
      console.warn('getSlides error:', err);
    }
    return [
      {
        id: 'slide-1',
        title: 'New Drop 2026',
        subtitle: 'Style • Comfort • Quality • Affordability',
        badge: 'New Drop',
        image_url: '/assets/hero-banner-3models.jpg',
        cta_text: 'Direct Order Now',
        cta_link: '#order-form',
        secondary_cta_text: 'View 4 Drops',
        secondary_cta_link: '#products',
        sort_order: 1,
        is_active: true,
        settings: { primaryBlobColor: '#DE4F3C', secondaryBlobColor: '#F4A999', bgColor: '#FAF5EE' }
      },
      {
        id: 'slide-2',
        title: 'Embroidered Flare Tunic',
        subtitle: 'Effortlessly Beautiful & Comfortable',
        badge: 'Trending',
        image_url: '/assets/model-magenta-banner.jpg',
        cta_text: 'Direct Order Now',
        cta_link: '#order-form',
        secondary_cta_text: 'View 4 Drops',
        secondary_cta_link: '#products',
        sort_order: 2,
        is_active: true,
        settings: { primaryBlobColor: '#DE4F3C', secondaryBlobColor: '#F4A999', bgColor: '#FAF5EE' }
      },
      {
        id: 'slide-3',
        title: 'Monochrome Noir Tunic',
        subtitle: 'Carefully Curated Details',
        badge: 'Exclusive',
        image_url: '/assets/model-black-banner.jpg',
        cta_text: 'Direct Order Now',
        cta_link: '#order-form',
        secondary_cta_text: 'View 4 Drops',
        secondary_cta_link: '#products',
        sort_order: 3,
        is_active: true,
        settings: { primaryBlobColor: '#201C1A', secondaryBlobColor: '#FAF5EE', bgColor: '#FAF5EE' }
      }
    ];
  },

  async saveSlide(slide: Partial<HeroSlide>): Promise<{ success: boolean; data?: HeroSlide; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .upsert(slide)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as HeroSlide };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteSlide(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 6. TESTIMONIAL SERVICE
// -------------------------------------------------------------
export const testimonialService = {
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as Testimonial[];
    } catch (err) {
      console.warn('getTestimonials error:', err);
    }
    return [
      {
        id: 'test-1',
        customer_name: 'Ayesha Siddika',
        city: 'Dhaka',
        review: 'অর্ডারের পরের দিনই ডেলিভারি পেয়েছি। ফেব্রিকের কোয়ালিটি এবং জামার ফিটিং এক কথায় অসাধারণ! বিশেষ করে হাতা ও গলার সুতার কাজ খুবই নিখুঁত।',
        rating: 5.0,
        is_featured: true,
        is_active: true,
        sort_order: 1
      },
      {
        id: 'test-2',
        customer_name: 'Nusrat Jahan',
        city: 'Chittagong',
        review: 'The fabric is so breathable and luxurious. Exactly as shown in the photoshoot. Will definitely order from the next drop as well!',
        rating: 5.0,
        is_featured: true,
        is_active: true,
        sort_order: 2
      },
      {
        id: 'test-3',
        customer_name: 'Samira Rahman',
        city: 'Sylhet',
        review: 'ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার সুযোগ থাকায় নির্ভয়ে অর্ডার করেছিলাম। কালার ও ফিটিং পারফেক্ট। ১০০% রেকমেন্ডেড!',
        rating: 5.0,
        is_featured: true,
        is_active: true,
        sort_order: 3
      }
    ];
  },

  async saveTestimonial(testimonial: Partial<Testimonial>): Promise<{ success: boolean; data?: Testimonial; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .upsert(testimonial)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Testimonial };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 7. MARKETING & ANNOUNCEMENTS
// -------------------------------------------------------------
export const marketingService = {
  async getAnnouncement(): Promise<AnnouncementBar | null> {
    try {
      const { data, error } = await supabase
        .from('announcement_bar')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as AnnouncementBar;
    } catch (err) {
      console.warn('getAnnouncement error:', err);
    }
    return {
      id: 'ann-1',
      text: '✨ Autumn Capsule 2026 Drop is Live • Free Delivery on orders over ৳2,500 with code CURATOR10',
      link_url: '#order-form',
      bg_color: '#DE4F3C',
      text_color: '#FFFFFF',
      is_active: true
    };
  },

  async saveAnnouncement(bar: Partial<AnnouncementBar>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('announcement_bar')
        .upsert(bar);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) return data as NewsletterSubscriber[];
    } catch (err) {
      console.warn('getSubscribers error:', err);
    }
    return [];
  },

  async subscribe(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, name, status: 'subscribed' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 8. NAVIGATION SERVICE
// -------------------------------------------------------------
export const navigationService = {
  async getNavigation(): Promise<NavigationItem[]> {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data as NavigationItem[];
    } catch (err) {
      console.warn('getNavigation error:', err);
    }
    return [
      { id: '1', label: 'New Collection', url: '#products', sort_order: 1, is_active: true },
      { id: '2', label: 'Fabric & Details', url: '#editorial', sort_order: 2, is_active: true },
      { id: '3', label: 'Customer Reviews', url: '#reviews', sort_order: 3, is_active: true },
      { id: '4', label: 'Direct Order', url: '#order-form', sort_order: 4, is_active: true }
    ];
  },

  async saveNavigation(items: NavigationItem[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .upsert(items);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 9. SITE SETTINGS & DELIVERY SERVICE
// -------------------------------------------------------------
export const settingsService = {
  async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as SiteSettings;
    } catch (err) {
      console.warn('getSiteSettings error:', err);
    }
    return {
      store_name: 'Women Curator',
      tagline: 'Style • Comfort • Quality • Affordability',
      phone: '01540400247',
      email: 'contact@womencurator.com',
      address: 'Gulshan, Dhaka, Bangladesh',
      whatsapp_number: '01540400247',
      currency: 'BDT',
      currency_symbol: '৳',
      brand_story: 'Women Curator is a fashion brand dedicated to bringing modern women stylish, elegant, and comfortable clothing at affordable prices.'
    };
  },

  async saveSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ ...settings, id: 'global-settings' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getDeliverySettings(): Promise<DeliverySettings | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as DeliverySettings;
    } catch (err) {
      console.warn('getDeliverySettings error:', err);
    }
    return {
      inside_dhaka_fee: 80,
      outside_dhaka_fee: 150,
      free_delivery_threshold: 2500,
      is_active: true,
      delivery_note: 'পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন (ক্যাশ অন ডেলিভারি)।'
    };
  },

  async saveDeliverySettings(settings: Partial<DeliverySettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('delivery_settings')
        .upsert({ ...settings, id: 'delivery-config' });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// -------------------------------------------------------------
// 10. STORAGE & MEDIA SERVICE
// -------------------------------------------------------------
export const mediaService = {
  async uploadFile(file: File, bucket: 'product-images' | 'hero-images' | 'site-assets' = 'product-images'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err: any) {
      console.error('File upload error:', err);
      return { success: false, error: err.message || 'Upload failed' };
    }
  },

  async listMedia(bucket: 'product-images' | 'hero-images' | 'site-assets' = 'product-images') {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

      if (error) throw error;
      return (data || []).map(f => ({
        name: f.name,
        size: f.metadata?.size || 0,
        created_at: f.created_at,
        url: supabase.storage.from(bucket).getPublicUrl(f.name).data.publicUrl
      }));
    } catch (err) {
      console.warn('listMedia error:', err);
      return [];
    }
  }
};

// -------------------------------------------------------------
// 11. TRACKING & ANALYTICS SERVICE
// -------------------------------------------------------------
export const trackingService = {
  async getTrackingSettings() {
    try {
      const { data, error } = await supabase
        .from('tracking_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('getTrackingSettings error:', err);
    }
    return {
      id: 'default',
      gtm_enabled: false,
      gtm_container_id: '',
      ga4_enabled: false,
      ga4_measurement_id: '',
      google_ads_enabled: false,
      google_ads_conversion_id: '',
      google_ads_purchase_label: '',
      google_ads_cart_label: '',
      google_ads_begin_checkout_label: '',
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
  },

  async saveTrackingSettings(settings: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tracking_settings')
        .upsert({ ...settings, id: 'default', updated_at: new Date().toISOString() });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getTrackingEventsConfig() {
    try {
      const { data, error } = await supabase
        .from('tracking_events_config')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('getTrackingEventsConfig error:', err);
    }
    return [
      { id: 'page_view', name: 'Page View', category: 'navigation', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'view_item_list', name: 'View Item List (Collections)', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'select_item', name: 'Select Item (Product Click)', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'view_item', name: 'View Item (Product Detail)', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'add_to_cart', name: 'Add to Cart', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: true, meta_enabled: true, tiktok_enabled: true },
      { id: 'remove_from_cart', name: 'Remove from Cart', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: false },
      { id: 'view_cart', name: 'View Cart', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'begin_checkout', name: 'Begin Checkout (Initiate Checkout)', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: true, meta_enabled: true, tiktok_enabled: true },
      { id: 'add_shipping_info', name: 'Add Shipping Info', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: false },
      { id: 'add_payment_info', name: 'Add Payment Info', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'purchase', name: 'Purchase (Order Confirmation)', category: 'ecommerce', enabled: true, ga4_enabled: true, google_ads_enabled: true, meta_enabled: true, tiktok_enabled: true },
      { id: 'search', name: 'Search Catalog', category: 'engagement', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'add_to_wishlist', name: 'Add to Wishlist', category: 'engagement', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true },
      { id: 'newsletter_signup', name: 'Newsletter Subscription (Lead)', category: 'lead', enabled: true, ga4_enabled: true, google_ads_enabled: false, meta_enabled: true, tiktok_enabled: true }
    ];
  },

  async saveTrackingEventsConfig(events: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tracking_events_config')
        .upsert(events);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getRecentConversionEvents(limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('conversion_events')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('getRecentConversionEvents error:', err);
      return [];
    }
  }
};

