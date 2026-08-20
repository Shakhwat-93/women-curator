import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Trash2, Sparkles, Eye } from 'lucide-react';
import { productService, categoryService, collectionService, mediaService } from '../../lib/api';
import { Product, ColorOption, Category, Collection } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const ProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { success, error } = useAdminToast();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [, setCategories] = useState<Category[]>([]);
  const [, setCollections] = useState<Collection[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    id: isNew ? `wc-${Date.now()}` : id,
    name: 'New Fashion Tunic',
    slug: 'new-fashion-tunic',
    subtitle: 'Premium fabric • Effortless style',
    description: 'Handcrafted signature tunic with delicate embroidery and refined relaxed fit.',
    price: 1650,
    compare_price: 2350,
    cost_price: 950,
    stock: 50,
    low_stock_threshold: 5,
    status: 'active',
    badge: 'New Drop',
    category_name: 'Tunics',
    category_id: 'cat-tunics',
    collection_id: 'col-autumn-2026',
    image_url: '/assets/product-magenta-tunic.jpg',
    gallery: ['/assets/product-magenta-tunic.jpg'],
    colors: [
      { name: 'Berry Magenta', hex: '#DE4F3C' },
      { name: 'Midnight Noir', hex: '#201C1A' },
      { name: 'Olive Moss', hex: '#6B705C' }
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    card_settings: {
      badge: 'New Drop',
      cardDescription: 'Premium fabric • Effortless style',
      ctaText: 'Shop Now',
      accentColor: '#DE4F3C',
      showWishlist: true,
      showColorSwatches: true,
      showComparePrice: true
    },
    is_featured: true,
    seo_title: '',
    seo_description: ''
  });

  // Load existing product if editing
  useEffect(() => {
    async function init() {
      try {
        const [cats, cols] = await Promise.all([
          categoryService.getCategories(),
          collectionService.getCollections()
        ]);
        setCategories(cats);
        setCollections(cols);

        if (!isNew && id) {
          const existing = await productService.getProductById(id);
          if (existing) {
            setFormData({
              ...existing,
              card_settings: existing.card_settings || {
                badge: existing.badge || 'New Drop',
                cardDescription: existing.subtitle || 'Premium fabric • Effortless style',
                ctaText: 'Shop Now',
                accentColor: '#DE4F3C',
                showWishlist: true,
                showColorSwatches: true,
                showComparePrice: true
              }
            });
          }
        }
      } catch {
        error('Error initializing editor');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [id, isNew]);

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const res = await mediaService.uploadFile(file, 'product-images');
      if (res.success && res.url) {
        const uploadedUrl = res.url;
        setFormData(prev => ({
          ...prev,
          image_url: uploadedUrl,
          gallery: [uploadedUrl, ...(prev.gallery || [])]
        }));
        success('Image uploaded successfully');
      } else {
        error(res.error || 'Failed to upload image');
      }
    } catch {
      error('Failed to upload image');
    }
  };

  // Color Swatch Operations
  const handleAddColor = () => {
    const newColor: ColorOption = { name: 'New Color', hex: '#DE4F3C' };
    setFormData(prev => ({
      ...prev,
      colors: [...(prev.colors || []), newColor]
    }));
  };

  const handleUpdateColor = (index: number, key: keyof ColorOption, val: string) => {
    const updated = [...(formData.colors || [])];
    updated[index] = { ...updated[index], [key]: val };
    setFormData(prev => ({ ...prev, colors: updated }));
  };

  const handleRemoveColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== index)
    }));
  };

  // Save Product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      error('Product name is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await productService.saveProduct(formData);
      if (res.success) {
        success(isNew ? 'Product created successfully' : 'Product updated successfully');
        navigate('/admin/products');
      } else {
        error(res.error || 'Failed to save product');
      }
    } catch {
      error('Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminCardSkeleton />
      </div>
    );
  }

  // Live product representation for the real ProductCard preview
  const previewProduct: Product = {
    id: formData.id || 'preview-id',
    name: formData.name || 'Untitled Tunic',
    slug: formData.slug || 'untitled',
    subtitle: formData.card_settings?.cardDescription || formData.subtitle || 'Premium fabric • Effortless style',
    description: formData.description || '',
    price: Number(formData.price) || 0,
    compare_price: Number(formData.compare_price) || 0,
    image_url: formData.image_url || '/assets/product-magenta-tunic.jpg',
    gallery: formData.gallery || [],
    category_id: formData.category_id || '',
    category_name: formData.category_name || 'Tunics',
    badge: formData.card_settings?.badge || formData.badge || 'New Drop',
    colors: formData.colors || [],
    sizes: formData.sizes || ['S', 'M', 'L', 'XL'],
    fabric_details: formData.fabric_details || '100% Silk-Modal',
    is_featured: formData.is_featured ?? true,
    is_active: formData.status === 'active',
    sort_order: formData.sort_order || 0
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2.5 rounded-full bg-white border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>{isNew ? 'New Drop' : 'Edit Drop'}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
              {formData.name || 'Untitled Product'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-full border border-curator-border bg-white text-xs font-semibold text-curator-charcoal hover:bg-curator-surface-peach transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form Editor (7 cols) + Right Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Complete Shopify-like Product Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Basic Information */}
          <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
              1. Basic Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Product Title <span className="text-curator-coral">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Embroidered Flare Tunic"
                className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all font-sans font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Subtitle / Card Hook
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Premium fabric • Effortless style"
                className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Category
                </label>
                <select
                  value={formData.category_name}
                  onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs focus:outline-none focus:border-curator-coral"
                >
                  <option value="Tunics">Tunics & Kurtis</option>
                  <option value="Peplums">Statement Peplums</option>
                  <option value="Shirts">Casual Shirts</option>
                  <option value="Co-ords">Co-ord Sets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={e => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="New Drop / Best Seller"
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-mono focus:outline-none focus:border-curator-coral"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Full Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed fabric craft, silhouette, drapery..."
                className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all resize-none font-sans"
              />
            </div>
          </div>

          {/* 2. Pricing & Inventory */}
          <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
              2. Pricing & Stock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Price (৳) <span className="text-curator-coral">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-mono font-bold text-curator-coral focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Compare Price (৳)
                </label>
                <input
                  type="number"
                  value={formData.compare_price}
                  onChange={e => setFormData({ ...formData, compare_price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-mono text-curator-muted focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-mono focus:outline-none focus:border-curator-coral"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  SKU (Item Code)
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="WC-DR-001"
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-mono focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-mono focus:outline-none focus:border-curator-coral"
                >
                  <option value="active">Active (Published on Live Site)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Product Images */}
          <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-2">
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                3. Photoshoot Images
              </h3>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-curator-coral text-white text-xs font-semibold shadow-xs hover:bg-curator-coral-hover transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Primary Image URL
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-mono focus:outline-none focus:border-curator-coral"
              />
            </div>

            {/* Quick Image Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-curator-muted uppercase tracking-wider">
                Or Select from Existing Drops:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  '/assets/product-magenta-tunic.jpg',
                  '/assets/product-black-tunic.jpg',
                  '/assets/product-olive-peplum.jpg',
                  '/assets/model-magenta-banner.jpg',
                  '/assets/model-black-banner.jpg'
                ].map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: img })}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      formData.image_url === img
                        ? 'border-curator-coral scale-105 shadow-md'
                        : 'border-curator-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Color Swatches & Sizes */}
          <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-2">
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                4. Color Swatches & Sizes
              </h3>
              <button
                type="button"
                onClick={handleAddColor}
                className="inline-flex items-center gap-1 text-xs font-bold text-curator-coral hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.colors?.map((col, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border">
                  <input
                    type="color"
                    value={col.hex}
                    onChange={e => handleUpdateColor(idx, 'hex', e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={col.name}
                    onChange={e => handleUpdateColor(idx, 'name', e.target.value)}
                    placeholder="Color Name (e.g. Berry Magenta)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-curator-border bg-white text-xs font-medium focus:outline-none"
                  />
                  <input
                    type="text"
                    value={col.hex}
                    onChange={e => handleUpdateColor(idx, 'hex', e.target.value)}
                    placeholder="#DE4F3C"
                    className="w-24 px-3 py-1.5 rounded-xl border border-curator-border bg-white text-xs font-mono uppercase focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="p-1.5 rounded-lg text-curator-muted hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sizes */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {['S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'].map(sz => {
                  const isSelected = formData.sizes?.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        const current = formData.sizes || [];
                        const next = isSelected
                          ? current.filter(s => s !== sz)
                          : [...current, sz];
                        setFormData({ ...formData, sizes: next });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-curator-charcoal text-white border-curator-charcoal'
                          : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
                      }`}
                    >
                      {sz} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Product Card Settings */}
          <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
              5. Product Card Display Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Card CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.card_settings?.ctaText || 'Shop Now'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      card_settings: {
                        ...formData.card_settings,
                        ctaText: e.target.value
                      }
                    })
                  }
                  placeholder="Shop Now"
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Card Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.card_settings?.accentColor || '#DE4F3C'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        card_settings: {
                          ...formData.card_settings,
                          accentColor: e.target.value
                        }
                      })
                    }
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.card_settings?.accentColor || '#DE4F3C'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        card_settings: {
                          ...formData.card_settings,
                          accentColor: e.target.value
                        }
                      })
                    }
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Real-Time Live Product Card Preview (5 cols, sticky) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-curator-border text-xs font-bold text-curator-charcoal shadow-xs">
              <Eye className="w-3.5 h-3.5 text-curator-coral" />
              <span>Live Card Preview</span>
            </div>
            <span className="text-[11px] text-curator-muted font-sans">
              Matches live storefront 1:1
            </span>
          </div>

          {/* EXACT PRODUCT CARD PREVIEW CONTAINER */}
          <div className="p-4 rounded-[2.5rem] bg-[#FAF5EE] border border-curator-border shadow-xl">
            <ProductCard
              product={previewProduct}
              index={0}
              onQuickView={() => {}}
              onDirectOrder={() => {}}
            />
          </div>

          <div className="p-4 rounded-2xl bg-white border border-curator-border text-xs text-curator-muted space-y-1">
            <p className="font-semibold text-curator-charcoal">✦ Realtime Card Tuning Tips:</p>
            <p>• Edit Title, Badges, Prices, and Swatches on the left to see live changes above.</p>
            <p>• Click <strong>Save Product</strong> above to publish directly to Supabase.</p>
          </div>
        </div>

      </div>
    </form>
  );
};
