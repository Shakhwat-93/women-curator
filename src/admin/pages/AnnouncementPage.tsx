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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Marketing & Banners</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
          Top Announcement Bar
        </h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-curator-border shadow-sm space-y-5">
        {/* Live Preview */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-2">
            Live Preview
          </label>
          <div
            className="p-3 rounded-2xl text-center text-xs font-semibold shadow-sm transition-all"
            style={{ backgroundColor: data.bg_color || '#DE4F3C', color: data.text_color || '#FFFFFF' }}
          >
            {data.text || 'Announcement preview text...'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
            Announcement Text
          </label>
          <input
            type="text"
            required
            value={data.text || ''}
            onChange={e => setData({ ...data, text: e.target.value })}
            placeholder="e.g. Free Delivery on orders over ৳2500"
            className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
              Banner Link
            </label>
            <input
              type="text"
              value={data.link_url || ''}
              onChange={e => setData({ ...data, link_url: e.target.value })}
              placeholder="#order-form"
              className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
              Visibility
            </label>
            <select
              value={data.is_active ? 'active' : 'hidden'}
              onChange={e => setData({ ...data, is_active: e.target.value === 'active' })}
              className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none"
            >
              <option value="active">Active (Shown on Top)</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.bg_color || '#DE4F3C'}
                onChange={e => setData({ ...data, bg_color: e.target.value })}
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={data.bg_color || '#DE4F3C'}
                onChange={e => setData({ ...data, bg_color: e.target.value })}
                className="flex-1 px-4 py-2 rounded-xl border border-curator-border text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.text_color || '#FFFFFF'}
                onChange={e => setData({ ...data, text_color: e.target.value })}
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={data.text_color || '#FFFFFF'}
                onChange={e => setData({ ...data, text_color: e.target.value })}
                className="flex-1 px-4 py-2 rounded-xl border border-curator-border text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-curator-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Announcement'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
