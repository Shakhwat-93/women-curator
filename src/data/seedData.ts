import { Product, Category, Testimonial } from '../types';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-new-arrivals',
    name: 'New Arrivals',
    tagline: 'Fresh drops from the latest Autumn/Spring runway edit',
    image: '/assets/model-magenta-solo-hd.jpg',
    itemCount: 12,
    slug: 'new-arrivals'
  },
  {
    id: 'cat-elegant-tunics',
    name: 'Elegant Tunics',
    tagline: 'Flowing silhouettes tailored with artisanal precision',
    image: '/assets/product-magenta-tunic.jpg',
    itemCount: 18,
    slug: 'elegant-tunics'
  },
  {
    id: 'cat-everyday-edit',
    name: 'Everyday Edit',
    tagline: 'Elevated daytime essentials crafted in breathable silks & cottons',
    image: '/assets/product-black-tunic.jpg',
    itemCount: 15,
    slug: 'everyday-edit'
  },
  {
    id: 'cat-statement-pieces',
    name: 'Statement Pieces',
    tagline: 'Contoured cuts, peplum flares and distinctive heritage borders',
    image: '/assets/product-olive-peplum.jpg',
    itemCount: 9,
    slug: 'statement-pieces'
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Embroidered Flare Tunic',
    slug: 'embroidered-flare-tunic',
    subtitle: 'Premium fabric • Effortless style',
    description: 'A masterpiece of contemporary feminine tailoring. Features delicate floral neckline embroidery, concealed button placket, tailored fluted hem with subtle pleating, and lightweight luxury modal fabric designed for effortless movement.',
    price: 1650,
    compare_price: 2350,
    image_url: '/assets/product-magenta-tunic.jpg',
    secondary_image_url: '/assets/model-magenta-solo-hd.jpg',
    gallery: [
      '/assets/product-magenta-tunic.jpg',
      '/assets/model-magenta-solo-hd.jpg',
      '/assets/hero-banner-3models.jpg'
    ],
    category_id: 'cat-elegant-tunics',
    category_name: 'Elegant Tunics',
    badge: '✦ New Drop',
    colors: [
      { name: 'Berry Magenta', hex: '#A8214D', bgClass: 'bg-[#A8214D]' },
      { name: 'Olive Moss', hex: '#73703E', bgClass: 'bg-[#73703E]' },
      { name: 'Midnight Noir', hex: '#1E1B18', bgClass: 'bg-[#1E1B18]' }
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    fabric_details: '100% Breathable Silk-Modal Blend with Hand-Crafted Threadwork',
    is_featured: true,
    is_active: true,
    sort_order: 1,
    rating: 4.9,
    reviews_count: 38
  },
  {
    id: 'prod-002',
    name: 'Monochrome Cuff Noir Tunic',
    slug: 'monochrome-cuff-noir-tunic',
    subtitle: 'Geometric motif • Modern silhouette',
    description: 'Striking jet-black relaxed-fit tunic accentuated with monochrome geometric heritage cuffs and collar trim. Styled with side vent slits for fluid drapery and high-contrast elegance.',
    price: 1750,
    compare_price: 2450,
    image_url: '/assets/product-black-tunic.jpg',
    secondary_image_url: '/assets/model-black-solo-hd.jpg',
    gallery: [
      '/assets/product-black-tunic.jpg',
      '/assets/model-black-solo-hd.jpg',
      '/assets/hero-banner-3models.jpg'
    ],
    category_id: 'cat-statement-pieces',
    category_name: 'Statement Pieces',
    badge: '✦ Curated Exclusive',
    colors: [
      { name: 'Noir & Chalk', hex: '#201C1A', bgClass: 'bg-[#201C1A]' },
      { name: 'Warm Terracotta', hex: '#C25946', bgClass: 'bg-[#C25946]' }
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    fabric_details: 'Premium Cotton Georgette with Embroidered Jacquard Trims',
    is_featured: true,
    is_active: true,
    sort_order: 2,
    rating: 5.0,
    reviews_count: 24
  },
  {
    id: 'prod-003',
    name: 'Artisan Floral Peplum Tunic',
    slug: 'artisan-floral-peplum-tunic',
    subtitle: 'Fluted waist • Puff sleeves',
    description: 'An ethereal earth-toned micro-print tunic featuring a tailored cinched waistline that cascades into a graceful peplum flare. Finished with bishop puff sleeves and a delicate tie-neck bow.',
    price: 1590,
    compare_price: 2250,
    image_url: '/assets/product-olive-peplum.jpg',
    secondary_image_url: '/assets/hero-banner-3models.jpg',
    gallery: [
      '/assets/product-olive-peplum.jpg',
      '/assets/hero-banner-3models.jpg'
    ],
    category_id: 'cat-everyday-edit',
    category_name: 'Everyday Edit',
    badge: '✦ Best Seller',
    colors: [
      { name: 'Olive Khaki', hex: '#635E44', bgClass: 'bg-[#635E44]' },
      { name: 'Rose Petal', hex: '#D27976', bgClass: 'bg-[#D27976]' }
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    fabric_details: 'Pure Organic Slub Cotton with Hand-Blocked Motif',
    is_featured: true,
    is_active: true,
    sort_order: 3,
    rating: 4.8,
    reviews_count: 42
  },
  {
    id: 'prod-004',
    name: 'Pleated Coral Blossom Shirt',
    slug: 'pleated-coral-blossom-shirt',
    subtitle: 'Soft lustre • Tailored collar',
    description: 'Cut from fluid coral-blush silk-cotton with fine vertical front pleats. Versatile tailored spread collar and cuff detailing that effortlessly transitions from boardroom meetings to evening celebrations.',
    price: 1850,
    compare_price: 2600,
    image_url: '/assets/model-magenta-solo-hd.jpg',
    secondary_image_url: '/assets/product-magenta-tunic.jpg',
    gallery: [
      '/assets/model-magenta-solo-hd.jpg',
      '/assets/product-magenta-tunic.jpg'
    ],
    category_id: 'cat-new-arrivals',
    category_name: 'New Arrivals',
    badge: '✦ Limited Edition',
    colors: [
      { name: 'Coral Blush', hex: '#DE4F3C', bgClass: 'bg-[#DE4F3C]' },
      { name: 'Desert Sand', hex: '#D4B89B', bgClass: 'bg-[#D4B89B]' },
      { name: 'Rosewood', hex: '#9E4753', bgClass: 'bg-[#9E4753]' }
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    fabric_details: 'Lustrous Silk-Touch Viscose with Mother-of-Pearl Buttons',
    is_featured: true,
    is_active: true,
    sort_order: 4,
    rating: 4.9,
    reviews_count: 19
  }
];

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Nadia Rahman',
    role: 'Creative Director',
    location: 'Dhaka, Gulshan',
    comment: 'The fabric quality and fall of the Embroidered Flare Tunic is beyond anything I have experienced locally. It feels like high-fashion luxury yet remains exceptionally comfortable for full-day wear.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    productBought: 'Embroidered Flare Tunic'
  },
  {
    id: 't-2',
    name: 'Samira Khan',
    role: 'Fashion Stylist',
    location: 'Dhaka, Banani',
    comment: 'Women Curator has redefined contemporary Bangladeshi fashion. The attention to finishing details, sleeve geometry, and signature color tones is impeccable. 10/10 recommendation.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    productBought: 'Monochrome Cuff Noir Tunic'
  },
  {
    id: 't-3',
    name: 'Dr. Tasnim Zafar',
    role: 'Consultant & Curator',
    location: 'Chittagong',
    comment: 'Ordered through the express checkout — delivery was fast and the packaging was editorial grade. The peplum flare fits like it was custom tailored for me!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    productBought: 'Artisan Floral Peplum Tunic'
  }
];
