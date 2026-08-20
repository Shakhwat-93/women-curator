import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { productService, categoryService, collectionService, mediaService } from '../../lib/api';
import { Product, Category, Collection, ColorOption } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { useAdminToast } from '../context/AdminToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useAdminToast();

  const isNew = !id || id === 'new';

  const [product, setProduct] = useState<Product>({
    id: `prod-${Date.now()}`,
    name: '',
    slug: '',
    subtitle: 'Premium fabric • Effortless style',
    description: 'A masterpiece of contemporary feminine tailoring. Features delicate artisanal details, fluted cut, and breathable luxury fabric.',
    price: 1650,
    compare_price: 2350,
    cost_price: 900,
    stock: 50,
    sku: 'WC-2026-01',
    status: 'active',
    badge: '✦ New Drop',
    category_id: '',
    category_name: 'Tunics',
    collection_id: '',
    image_url: '/assets/product-magenta-tunic.jpg',
    secondary_image_url: '/assets/model-magenta-solo-hd.jpg',
    gallery: [
      '/assets/product-magenta-tunic.jpg',
      '/assets/model-magenta-solo-hd.jpg',
      '/assets/hero-banner-3models.jpg'
    ],
    colors: [
      { name: 'Berry Magenta', hex: '#A8214D' },
      { name: 'Olive Moss', hex: '#73703E' },
      { name: 'Midnight Noir', hex: '#1E1B18' }
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    fabric_details: '100% Breathable Silk-Modal Blend with Hand-Crafted Threadwork',
    care_instructions: 'Dry clean recommended or gentle cold hand wash.',
    card_settings: {
      badge: '✦ New Drop',
      ctaText: 'Direct Order',
      showWishlist: true,
      showColorSwatches: true,
      showComparePrice: true,
      accentColor: '#DE4F3C'
    },
    is_featured: true,
    is_active: true,
    sort_order: 1
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Accordion section collapse state for mobile
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    pricing: true,
    media: true,
    colors: true,
    card: false,
    seo: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, cols] = await Promise.all([
          categoryService.getCategories(),
          collectionService.getCollections()
        ]);
        setCategories(cats);
        setCollections(cols);

        if (!isNew && id) {
          const prod = await productService.getProductById(id);
          if (prod) {
            setProduct(prod);
          } else {
            error('Product not found');
            navigate('/admin/products');
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [id, isNew, navigate, error]);

  const handleChange = (field: keyof Product, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleCardSettingChange = (field: string, value: any) => {
    setProduct(prev => ({
      ...prev,
      card_settings: {
        ...prev.card_settings,
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const res = await mediaService.uploadFile(file, 'product-images');
      if (res.success && res.url) {
        if (isGallery) {
          setProduct(prev => ({
            ...prev,
            gallery: [...(prev.gallery || []), res.url!]
          }));
          success('Gallery image uploaded to Supabase!');
        } else {
          setProduct(prev => ({
            ...prev,
            image_url: res.url!,
            gallery: prev.gallery?.length ? [res.url!, ...prev.gallery.slice(1)] : [res.url!]
          }));
          success('Primary image uploaded to Supabase!');
        }
      } else {
        error(res.error || 'Failed to upload image');
      }
    } catch (err: any) {
      error(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const addColor = () => {
    const newColor: ColorOption = { name: 'Royal Gold', hex: '#D4AF37' };
    setProduct(prev => ({
      ...prev,
      colors: [...(prev.colors || []), newColor]
    }));
  };

  const removeColor = (idx: number) => {
    setProduct(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx)
    }));
  };

  const updateColor = (idx: number, field: keyof ColorOption, val: string) => {
    setProduct(prev => {
      const updated = [...prev.colors];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, colors: updated };
    });
  };

  const toggleSize = (sizeStr: string) => {
    const current = product.sizes || [];
    if (current.includes(sizeStr)) {
      setProduct(prev => ({ ...prev, sizes: current.filter(s => s !== sizeStr) }));
    } else {
      setProduct(prev => ({ ...prev, sizes: [...current, sizeStr] }));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!product.name.trim()) {
      error('Please provide a Product Title');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Product> = {
        ...product,
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        price: Number(product.price) || 0,
        compare_price: Number(product.compare_price) || 0,
        cost_price: Number(product.cost_price) || 0,
        stock: Number(product.stock) || 0
      };

      const res = await productService.saveProduct(payload);
      if (res.success) {
        success(`Saved "${product.name}" successfully!`);
        navigate('/admin/products');
      } else {
        error(res.error || 'Failed to save product');
      }
    } catch (err: any) {
      error(err.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/products"
            className="p-2 rounded-full border border-curator-border bg-white text-curator-charcoal hover:bg-curator-surface-peach transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-curator-charcoal truncate">
              {isNew ? 'Create New Drop' : `Edit: ${product.name}`}
            </h1>
            <p className="text-xs text-curator-muted truncate">
              Configure product details, pricing, colors, and live signature card
            </p>
          </div>
        </div>

        {/* Mobile Preview Trigger Button & Desktop Save Button */}
        <div className="flex items-center gap-2">
          {/* Mobile Live Card Preview Button */}
          <button
            type="button"
            onClick={() => setIsMobilePreviewOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-white border border-curator-coral text-curator-coral text-xs font-bold shadow-xs active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          {/* Desktop Save Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 transition-all min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Product Drop'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Left Form + Right Sticky Live Preview on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Accordion / Form Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SECTION 1: Basic Information */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('general')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-sm sm:text-base font-bold text-curator-charcoal hover:bg-[#FAF5EE]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-curator-coral-light text-curator-coral font-sans text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Product Information</span>
              </div>
              {expandedSections.general ? <ChevronUp className="w-4 h-4 text-curator-muted" /> : <ChevronDown className="w-4 h-4 text-curator-muted" />}
            </button>

            {expandedSections.general && (
              <div className="p-4 sm:p-6 pt-0 space-y-4 border-t border-curator-border/40">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={product.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Embroidered Flare Tunic"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral font-serif font-bold text-curator-charcoal min-h-[48px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={product.subtitle || ''}
                      onChange={e => handleChange('subtitle', e.target.value)}
                      placeholder="e.g. Premium fabric • Effortless style"
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Category
                    </label>
                    <select
                      value={product.category_id || ''}
                      onChange={e => {
                        const cat = categories.find(c => c.id === e.target.value);
                        setProduct(prev => ({
                          ...prev,
                          category_id: e.target.value,
                          category_name: cat ? cat.name : prev.category_name
                        }));
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral bg-white min-h-[48px]"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Collection / Season
                    </label>
                    <select
                      value={product.collection_id || ''}
                      onChange={e => setProduct(prev => ({ ...prev, collection_id: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral bg-white min-h-[48px]"
                    >
                      <option value="">Select Collection...</option>
                      {collections.map(col => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Full Description & Silhouette Details
                  </label>
                  <textarea
                    rows={3}
                    value={product.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Describe tailoring details, neckline embroidery, hem flare, etc."
                    className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Pricing & Inventory */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('pricing')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-sm sm:text-base font-bold text-curator-charcoal hover:bg-[#FAF5EE]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-curator-coral-light text-curator-coral font-sans text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Pricing & Inventory</span>
              </div>
              {expandedSections.pricing ? <ChevronUp className="w-4 h-4 text-curator-muted" /> : <ChevronDown className="w-4 h-4 text-curator-muted" />}
            </button>

            {expandedSections.pricing && (
              <div className="p-4 sm:p-6 pt-0 space-y-4 border-t border-curator-border/40">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Price (৳) *
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={product.price}
                      onChange={e => handleChange('price', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-coral focus:outline-none min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Compare (৳)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={product.compare_price}
                      onChange={e => handleChange('compare_price', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono line-through text-curator-muted focus:outline-none min-h-[48px]"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={product.stock || 50}
                      onChange={e => handleChange('stock', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={product.sku || ''}
                      onChange={e => handleChange('sku', e.target.value)}
                      placeholder="WC-2026-01"
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Status
                    </label>
                    <select
                      value={product.status || 'active'}
                      onChange={e => handleChange('status', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs bg-white font-bold min-h-[48px]"
                    >
                      <option value="active">Active (Published on Store)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Photoshoot Images & Media Upload */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('media')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-sm sm:text-base font-bold text-curator-charcoal hover:bg-[#FAF5EE]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-curator-coral-light text-curator-coral font-sans text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Photoshoot Images</span>
              </div>
              {expandedSections.media ? <ChevronUp className="w-4 h-4 text-curator-muted" /> : <ChevronDown className="w-4 h-4 text-curator-muted" />}
            </button>

            {expandedSections.media && (
              <div className="p-4 sm:p-6 pt-0 space-y-4 border-t border-curator-border/40">
                {/* Primary Image Preview & Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-24 h-32 object-cover rounded-xl bg-curator-bg border border-curator-border flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-curator-charcoal">Primary Card Photo</h4>
                    <p className="text-[11px] text-curator-muted">
                      Shows as default product thumbnail on catalog and signature card.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-curator-coral text-white text-xs font-bold cursor-pointer hover:bg-curator-coral-hover min-h-[40px]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Secondary / Gallery Images */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                    Photoshoot Gallery (Lookbook)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {product.gallery?.map((imgUrl, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-curator-border bg-curator-bg aspect-[3/4]">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setProduct(prev => ({
                              ...prev,
                              gallery: prev.gallery?.filter((_, idx) => idx !== i)
                            }));
                          }}
                          aria-label="Remove image"
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-md opacity-80 group-hover:opacity-100 min-h-[28px] min-w-[28px] flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Add to Gallery Button */}
                    <label className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-curator-coral/60 hover:bg-curator-coral-light/40 cursor-pointer aspect-[3/4] text-center text-curator-coral">
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">+ Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Color Swatches & Sizes */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('colors')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-sm sm:text-base font-bold text-curator-charcoal hover:bg-[#FAF5EE]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-curator-coral-light text-curator-coral font-sans text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span>Colors & Sizes</span>
              </div>
              {expandedSections.colors ? <ChevronUp className="w-4 h-4 text-curator-muted" /> : <ChevronDown className="w-4 h-4 text-curator-muted" />}
            </button>

            {expandedSections.colors && (
              <div className="p-4 sm:p-6 pt-0 space-y-4 border-t border-curator-border/40">
                {/* Colors List with Hex Pickers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                      Color Swatches
                    </label>
                    <button
                      type="button"
                      onClick={addColor}
                      className="text-xs font-bold text-curator-coral hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Color</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {product.colors?.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-2xl border border-curator-border bg-[#FAF5EE]/40">
                        <input
                          type="color"
                          value={col.hex}
                          onChange={e => updateColor(idx, 'hex', e.target.value)}
                          className="w-9 h-9 rounded-xl border border-curator-border cursor-pointer p-0.5 bg-white flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={col.name}
                          onChange={e => updateColor(idx, 'name', e.target.value)}
                          placeholder="Color Name"
                          className="flex-1 px-3 py-2 rounded-xl border border-curator-border bg-white text-xs font-semibold focus:outline-none min-h-[40px]"
                        />
                        <span className="font-mono text-[11px] text-curator-muted">{col.hex}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(idx)}
                          aria-label="Remove color"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Pills Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                    Available Sizes
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)', 'Free Size'].map(s => {
                      const isSelected = product.sizes?.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center min-h-[44px] ${
                            isSelected
                              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
                              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: Card Customization & Overrides */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('card')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-sm sm:text-base font-bold text-curator-charcoal hover:bg-[#FAF5EE]/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-curator-coral-light text-curator-coral font-sans text-xs flex items-center justify-center font-bold">
                  5
                </span>
                <span>Product Card Appearance</span>
              </div>
              {expandedSections.card ? <ChevronUp className="w-4 h-4 text-curator-muted" /> : <ChevronDown className="w-4 h-4 text-curator-muted" />}
            </button>

            {expandedSections.card && (
              <div className="p-4 sm:p-6 pt-0 space-y-4 border-t border-curator-border/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Card Badge Text
                    </label>
                    <input
                      type="text"
                      value={product.card_settings?.badge || product.badge || ''}
                      onChange={e => {
                        handleChange('badge', e.target.value);
                        handleCardSettingChange('badge', e.target.value);
                      }}
                      placeholder="✦ New Drop"
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={product.card_settings?.ctaText || 'Direct Order'}
                      onChange={e => handleCardSettingChange('ctaText', e.target.value)}
                      placeholder="Direct Order"
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs min-h-[48px]"
                    />
                  </div>
                </div>

                {/* Checkbox toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-curator-border cursor-pointer min-h-[48px]">
                    <input
                      type="checkbox"
                      checked={product.card_settings?.showWishlist !== false}
                      onChange={e => handleCardSettingChange('showWishlist', e.target.checked)}
                      className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-curator-charcoal">Show Wishlist Heart</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-curator-border cursor-pointer min-h-[48px]">
                    <input
                      type="checkbox"
                      checked={product.card_settings?.showColorSwatches !== false}
                      onChange={e => handleCardSettingChange('showColorSwatches', e.target.checked)}
                      className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-curator-charcoal">Show Color Swatches</span>
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Desktop Sticky 1:1 Live Product Card Preview (5 cols) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-curator-coral font-bold text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Card Preview</span>
            </div>
            <span className="text-[11px] text-curator-muted font-mono">1:1 Storefront Card</span>
          </div>

          <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#FCEEE8]/50 via-white to-[#FCEEE8]/50 border border-curator-border shadow-lg">
            <ProductCard
              product={product}
              index={0}
              onQuickView={() => {}}
              onDirectOrder={() => {}}
            />
          </div>
        </div>

      </div>

      {/* MOBILE FULL-SCREEN LIVE CARD PREVIEW SHEET */}
      <AnimatePresence>
        {isMobilePreviewOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobilePreviewOpen(false)}
              className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-h-[90vh] bg-[#FAF5EE] rounded-t-[2.5rem] p-6 z-10 space-y-4 overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="w-12 h-1.5 rounded-full bg-curator-muted/30 mx-auto -mt-2 mb-2" />
              <div className="flex items-center justify-between border-b border-curator-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-curator-coral" />
                  <h3 className="font-serif text-base font-bold text-curator-charcoal">Live Product Card</h3>
                </div>
                <button
                  onClick={() => setIsMobilePreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-curator-border flex items-center justify-center text-curator-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-w-xs mx-auto pt-2">
                <ProductCard
                  product={product}
                  index={0}
                  onQuickView={() => {}}
                  onDirectOrder={() => {}}
                />
              </div>

              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="w-full py-3 rounded-full bg-curator-charcoal text-white text-xs font-bold"
              >
                Back to Edit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE FIXED BOTTOM STICKY SAVE BAR */}
      <div className="lg:hidden fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-lg border-t border-curator-border px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <Link
          to="/admin/products"
          className="px-4 py-2.5 rounded-2xl border border-curator-border text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach min-h-[44px] flex items-center justify-center"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : `Save Drop (৳${product.price})`}</span>
        </button>
      </div>
    </div>
  );
};
