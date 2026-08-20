import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Upload, Sparkles, Eye, ArrowRight, X } from 'lucide-react';
import { heroService, mediaService } from '../../lib/api';
import { HeroSlide } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroSlidesPage: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
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
    const currSettings = updated[activeSlideIndex]?.settings || {};
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
      secondary_cta_text: 'View Collection',
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
      error('Storefront needs at least 1 hero banner slide');
      return;
    }
    const targetSlide = slides[index];
    if (targetSlide.id) {
      await heroService.deleteSlide(targetSlide.id);
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setActiveSlideIndex(0);
    success('Slide deleted');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const res = await mediaService.uploadFile(file, 'hero-images');
      if (res.success && res.url) {
        handleUpdateSlide('image_url', res.url);
        success('Hero banner uploaded to Supabase storage!');
      } else {
        error(res.error || 'Upload failed');
      }
    } catch (err: any) {
      error(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const slide of slides) {
        await heroService.saveSlide(slide);
      }
      success('All Hero slides saved successfully!');
    } catch {
      error('Failed to save slides');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Storefront Artwork</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Hero Slides & Banners
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Preview Trigger */}
          <button
            type="button"
            onClick={() => setIsMobilePreviewOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-white border border-curator-coral text-curator-coral text-xs font-bold shadow-xs active:scale-95 min-h-[40px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Slides'}</span>
          </button>
        </div>
      </div>

      {/* Slide Selector Tabs (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {slides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            type="button"
            onClick={() => setActiveSlideIndex(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border min-h-[44px] ${
              activeSlideIndex === idx
                ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
                : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
            }`}
          >
            <span>Slide #{idx + 1}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeSlideIndex === idx ? 'bg-white/20 text-white' : 'bg-curator-surface-peach text-curator-coral'
            }`}>
              {slide.badge || 'Banner'}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={handleAddSlide}
          className="px-4 py-2.5 rounded-2xl border border-dashed border-curator-coral text-curator-coral hover:bg-curator-coral-light text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Slide</span>
        </button>
      </div>

      {isLoading ? (
        <AdminCardSkeleton />
      ) : !currentSlide ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Slide Editor Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Banner Media & Upload */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-curator-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  1. Hero Banner Image
                </h3>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(activeSlideIndex)}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 min-h-[36px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Slide</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border">
                <img
                  src={currentSlide.image_url}
                  alt={currentSlide.title}
                  className="w-full sm:w-44 h-32 object-cover rounded-xl bg-curator-bg border border-curator-border flex-shrink-0"
                />

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <h4 className="text-xs font-bold text-curator-charcoal">High-Resolution Photoshoot</h4>
                  <p className="text-[11px] text-curator-muted">
                    Recommended 1920×1080px landscape photo for responsive screens.
                  </p>
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold cursor-pointer hover:bg-curator-coral-hover min-h-[44px] w-full sm:w-auto">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading to Supabase...' : 'Upload New Banner'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Headlines & Badge */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-curator-border shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                2. Headline & Badges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={e => handleUpdateSlide('title', e.target.value)}
                    placeholder="New Drop 2026"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-serif font-bold text-curator-charcoal min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Floating Badge
                  </label>
                  <input
                    type="text"
                    value={currentSlide.badge || ''}
                    onChange={e => handleUpdateSlide('badge', e.target.value)}
                    placeholder="✦ New Drop"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={currentSlide.subtitle || ''}
                  onChange={e => handleUpdateSlide('subtitle', e.target.value)}
                  placeholder="Style • Comfort • Quality • Affordability"
                  className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs min-h-[48px]"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-curator-border shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                3. Call-to-Action Buttons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={currentSlide.cta_text || ''}
                    onChange={e => handleUpdateSlide('cta_text', e.target.value)}
                    placeholder="Direct Order Now"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    value={currentSlide.secondary_cta_text || ''}
                    onChange={e => handleUpdateSlide('secondary_cta_text', e.target.value)}
                    placeholder="View Collection"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs min-h-[48px]"
                  />
                </div>
              </div>
            </div>

            {/* Organic Blob Colors */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-curator-border shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                4. Background Organic Blobs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Primary Blob Color
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-2xl border border-curator-border bg-[#FAF5EE]/40">
                    <input
                      type="color"
                      value={currentSlide.settings?.primaryBlobColor || '#DE4F3C'}
                      onChange={e => handleUpdateSettings('primaryBlobColor', e.target.value)}
                      className="w-9 h-9 rounded-xl border border-curator-border cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={currentSlide.settings?.primaryBlobColor || '#DE4F3C'}
                      onChange={e => handleUpdateSettings('primaryBlobColor', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-curator-border bg-white text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Secondary Blob Color
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-2xl border border-curator-border bg-[#FAF5EE]/40">
                    <input
                      type="color"
                      value={currentSlide.settings?.secondaryBlobColor || '#F4A999'}
                      onChange={e => handleUpdateSettings('secondaryBlobColor', e.target.value)}
                      className="w-9 h-9 rounded-xl border border-curator-border cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={currentSlide.settings?.secondaryBlobColor || '#F4A999'}
                      onChange={e => handleUpdateSettings('secondaryBlobColor', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-curator-border bg-white text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Desktop Sticky Live Preview (5 cols) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-curator-border text-xs font-bold text-curator-charcoal shadow-xs">
                <Eye className="w-3.5 h-3.5 text-curator-coral" />
                <span>Live Hero Preview</span>
              </div>
              <span className="text-[11px] text-curator-muted font-sans">
                Slide #{activeSlideIndex + 1}
              </span>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border border-curator-border shadow-2xl bg-white p-3">
              <div className="relative aspect-[16/10.5] rounded-[2rem] overflow-hidden bg-[#FAF5EE]">
                <img
                  src={currentSlide.image_url}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-curator-blush/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-curator-coral animate-ping" />
                  <span className="text-[11px] font-bold text-curator-charcoal font-serif">
                    {currentSlide.badge || 'New Drop'}
                  </span>
                </div>
              </div>

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

      {/* MOBILE FULL-SCREEN HERO PREVIEW MODAL */}
      <AnimatePresence>
        {isMobilePreviewOpen && currentSlide && (
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
                  <h3 className="font-serif text-base font-bold text-curator-charcoal">Hero Banner Preview</h3>
                </div>
                <button
                  onClick={() => setIsMobilePreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-curator-border flex items-center justify-center text-curator-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-curator-border bg-white p-3 shadow-md">
                <div className="relative aspect-[16/11] rounded-xl overflow-hidden bg-curator-bg">
                  <img
                    src={currentSlide.image_url}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full shadow-sm text-[10px] font-bold text-curator-charcoal font-serif">
                    {currentSlide.badge || 'New Drop'}
                  </div>
                </div>

                <div className="p-3 space-y-1.5">
                  <h4 className="font-serif text-base font-bold text-curator-charcoal">
                    {currentSlide.title}
                  </h4>
                  <p className="text-xs text-curator-muted font-sans">
                    {currentSlide.subtitle}
                  </p>
                  <div className="pt-2">
                    <button className="w-full py-3 rounded-full bg-curator-coral text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                      <span>{currentSlide.cta_text || 'Direct Order Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="w-full py-3 rounded-full bg-curator-charcoal text-white text-xs font-bold min-h-[48px]"
              >
                Back to Edit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
