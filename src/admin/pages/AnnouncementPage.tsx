import React, { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { marketingService } from '../../lib/api';
import { AnnouncementBar } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const AnnouncementPage: React.FC = () => {
  const [data, setData] = useState<Partial<AnnouncementBar>>({
    id: 'ann-1',
    text: '✨ Autumn Capsule 2026 Drop is Live • Free Delivery on orders over ৳2,500 with code CURATOR10',
    link_url: '#order-form',
    bg_color: '#DE4F3C',
    text_color: '#FFFFFF',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  useEffect(() => {
    marketingService.getAnnouncement().then(res => {
      if (res) setData(res);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await marketingService.saveAnnouncement(data);
      if (res.success) {
        success('Announcement bar updated! Storefront updated.');
      } else {
        error(res.error || 'Failed to update');
      }
    } catch {
      error('Failed to update announcement');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AdminCardSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl pb-20 lg:pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Marketing & Banners</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
          Top Promo Announcement Bar
        </h1>
        <p className="text-xs text-curator-muted font-sans mt-0.5">
          Shows promo headline across the very top of all customer-facing storefront pages
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-5">
        {/* Live Preview */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-2">
            Live Preview
          </label>
          <div
            className="p-3.5 rounded-2xl text-center text-xs font-semibold shadow-xs transition-all"
            style={{ backgroundColor: data.bg_color || '#DE4F3C', color: data.text_color || '#FFFFFF' }}
          >
            {data.text || 'Announcement preview text...'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
            Announcement Text
          </label>
          <input
            type="text"
            required
            value={data.text || ''}
            onChange={e => setData({ ...data, text: e.target.value })}
            placeholder="e.g. Free Delivery on orders over ৳2,500"
            className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral min-h-[48px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Banner Link Destination
            </label>
            <input
              type="text"
              value={data.link_url || ''}
              onChange={e => setData({ ...data, link_url: e.target.value })}
              placeholder="#order-form"
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Visibility Status
            </label>
            <select
              value={data.is_active ? 'active' : 'hidden'}
              onChange={e => setData({ ...data, is_active: e.target.value === 'active' })}
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none bg-white min-h-[48px]"
            >
              <option value="active">Active (Shown on Top)</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Background Color
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-curator-border">
              <input
                type="color"
                value={data.bg_color || '#DE4F3C'}
                onChange={e => setData({ ...data, bg_color: e.target.value })}
                className="w-8 h-8 rounded-xl border border-curator-border cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={data.bg_color || '#DE4F3C'}
                onChange={e => setData({ ...data, bg_color: e.target.value })}
                className="flex-1 px-2 py-1 text-xs font-mono uppercase bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Text Color
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-curator-border">
              <input
                type="color"
                value={data.text_color || '#FFFFFF'}
                onChange={e => setData({ ...data, text_color: e.target.value })}
                className="w-8 h-8 rounded-xl border border-curator-border cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={data.text_color || '#FFFFFF'}
                onChange={e => setData({ ...data, text_color: e.target.value })}
                className="flex-1 px-2 py-1 text-xs font-mono uppercase bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-curator-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Announcement'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
