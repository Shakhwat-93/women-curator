import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Upload, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { heroService, mediaService } from '../../lib/api';
import { HeroSlide } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const HeroSlidesPage: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const data = await heroService.getSlides();
      setSlides(data);
    } catch {
      error('Failed to load hero slides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleUpdateSlide = (key: keyof HeroSlide, val: any) => {
    const updated = [...slides];
    updated[activeSlideIndex] = { ...updated[activeSlideIndex], [key]: val };
    setSlides(updated);
  };

  const handleUpdateSettings = (settingKey: string, val: string) => {
    const updated = [...slides];
    const currSettings = updated[activeSlideIndex].settings || {};
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      settings: { ...currSettings, [settingKey]: val }
    };
    setSlides(updated);
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Drop 2026',
      subtitle: 'Style • Comfort • Quality • Affordability',
      badge: 'New Drop',
      image_url: '/assets/hero-banner-3models.jpg',
      cta_text: 'Direct Order Now',
      cta_link: '#order-form',
      secondary_cta_text: 'View 4 Drops',
      secondary_cta_link: '#products',
      sort_order: slides.length + 1,
      is_active: true,
      settings: { primaryBlobColor: '#DE4F3C', secondaryBlobColor: '#F4A999', bgColor: '#FAF5EE' }
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
    success('New slide added');
  };

  const handleDeleteSlide = async (index: number) => {
    if (slides.length <= 1) {
      error('At least one hero slide must remain');
      return;
    }
    const toDelete = slides[index];
    if (toDelete.id) {
      await heroService.deleteSlide(toDelete.id);
    }
    const filtered = slides.filter((_, i) => i !== index);
    setSlides(filtered);
    setActiveSlideIndex(Math.max(0, index - 1));
    success('Slide deleted');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const res = await mediaService.uploadFile(files[0], 'hero-images');
      if (res.success && res.url) {
        handleUpdateSlide('image_url', res.url);
        success('Hero banner uploaded successfully');
      } else {
        error(res.error || 'Failed to upload image');
      }
    } catch {
      error('Failed to upload image');
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const slide of slides) {
        await heroService.saveSlide(slide);
      }
      success('All hero slides saved successfully! Live storefront updated.');
    } catch {
      error('Failed to save slides');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <AdminCardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Hero Campaign CMS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Hero Slider & Campaign Banners
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral hover:border-curator-coral transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Slides'}</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            onClick={() => setActiveSlideIndex(idx)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all whitespace-nowrap ${
              activeSlideIndex === idx
                ? 'bg-curator-coral text-white border-curator-coral shadow-sm font-bold'
                : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
            }`}
          >
            <span>Slide {idx + 1}: {s.title || 'Untitled'}</span>
            {!s.is_active && <span className="text-[10px] opacity-75">(Hidden)</span>}
          </button>
        ))}
      </div>

      {currentSlide && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Slide Configuration Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Slide Details */}
            <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-curator-border pb-2">
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Slide #{activeSlideIndex + 1} Content
                </h3>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(activeSlideIndex)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Slide</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Slide Headline
                </label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={e => handleUpdateSlide('title', e.target.value)}
                  placeholder="New Drop 2026"
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-serif font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={currentSlide.subtitle}
                  onChange={e => handleUpdateSlide('subtitle', e.target.value)}
                  placeholder="Style • Comfort • Quality • Affordability"
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-sans focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.badge || ''}
                    onChange={e => handleUpdateSlide('badge', e.target.value)}
                    placeholder="New Collection / Best Seller"
                    className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-mono focus:outline-none focus:border-curator-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Visibility
                  </label>
                  <select
                    value={currentSlide.is_active ? 'active' : 'hidden'}
                    onChange={e => handleUpdateSlide('is_active', e.target.value === 'active')}
                    className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-mono focus:outline-none focus:border-curator-coral"
                  >
                    <option value="active">Active (Visible in Carousel)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={currentSlide.cta_text || ''}
                    onChange={e => handleUpdateSlide('cta_text', e.target.value)}
                    placeholder="Direct Order Now"
                    className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-medium focus:outline-none focus:border-curator-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={currentSlide.cta_link || ''}
                    onChange={e => handleUpdateSlide('cta_link', e.target.value)}
                    placeholder="#order-form"
                    className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-mono focus:outline-none focus:border-curator-coral"
                  />
                </div>
              </div>
            </div>

            {/* Banner Image & Upload */}
            <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-curator-border pb-2">
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Hero Campaign Artwork
                </h3>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-curator-coral text-white text-xs font-semibold shadow-xs hover:bg-curator-coral-hover transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Banner</span>
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
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={currentSlide.image_url}
                  onChange={e => handleUpdateSlide('image_url', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/40 text-xs font-mono focus:outline-none focus:border-curator-coral"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {[
                  '/assets/hero-banner-3models.jpg',
                  '/assets/model-magenta-banner.jpg',
                  '/assets/model-black-banner.jpg'
                ].map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUpdateSlide('image_url', img)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      currentSlide.image_url === img
                        ? 'border-curator-coral scale-105 shadow-md'
                        : 'border-curator-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Banner" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Organic Color Tokens */}
            <div className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
                Organic Background Color Tokens
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Primary Blob Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSlide.settings?.primaryBlobColor || '#DE4F3C'}
                      onChange={e => handleUpdateSettings('primaryBlobColor', e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentSlide.settings?.primaryBlobColor || '#DE4F3C'}
                      onChange={e => handleUpdateSettings('primaryBlobColor', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-curator-border bg-white text-xs font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Secondary Blob Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSlide.settings?.secondaryBlobColor || '#F4A999'}
                      onChange={e => handleUpdateSettings('secondaryBlobColor', e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentSlide.settings?.secondaryBlobColor || '#F4A999'}
                      onChange={e => handleUpdateSettings('secondaryBlobColor', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-curator-border bg-white text-xs font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Live Hero Preview (5 cols, sticky) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-curator-border text-xs font-bold text-curator-charcoal shadow-xs">
                <Eye className="w-3.5 h-3.5 text-curator-coral" />
                <span>Live Hero Preview</span>
              </div>
              <span className="text-[11px] text-curator-muted font-sans">
                Slide #{activeSlideIndex + 1}
              </span>
            </div>

            {/* LIVE HERO BANNER CONTAINER */}
            <div className="rounded-[2.5rem] overflow-hidden border border-curator-border shadow-2xl bg-white p-3">
              <div className="relative aspect-[16/10.5] rounded-[2rem] overflow-hidden bg-[#FAF5EE]">
                <img
                  src={currentSlide.image_url}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-curator-blush/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-curator-coral animate-ping" />
                  <span className="text-[11px] font-bold text-curator-charcoal font-serif">
                    {currentSlide.badge || 'New Drop'}
                  </span>
                </div>
              </div>

              {/* Title & Actions Bar */}
              <div className="p-4 space-y-2">
                <h4 className="font-serif text-lg font-bold text-curator-charcoal">
                  {currentSlide.title}
                </h4>
                <p className="text-xs text-curator-muted font-sans">
                  {currentSlide.subtitle}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2.5 px-4 rounded-full bg-curator-coral text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>{currentSlide.cta_text || 'Direct Order Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
