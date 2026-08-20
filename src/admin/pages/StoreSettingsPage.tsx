import React, { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { settingsService } from '../../lib/api';
import { SiteSettings } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const StoreSettingsPage: React.FC = () => {
  const [data, setData] = useState<SiteSettings>({
    store_name: 'Women Curator',
    tagline: 'Style • Comfort • Quality • Affordability',
    phone: '01540400247',
    email: 'contact@womencurator.com',
    address: 'Gulshan, Dhaka, Bangladesh',
    whatsapp_number: '01540400247',
    currency: 'BDT',
    currency_symbol: '৳',
    brand_story: 'Women Curator is a fashion brand dedicated to bringing modern women stylish, elegant, and comfortable clothing at affordable prices.'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  useEffect(() => {
    settingsService.getSiteSettings().then(res => {
      if (res) setData(res);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await settingsService.saveSiteSettings(data);
      if (res.success) {
        success('Store settings saved! Live storefront updated.');
      } else {
        error(res.error || 'Failed to save settings');
      }
    } catch {
      error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AdminCardSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Brand & Contact</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
          Store Settings & Social Channels
        </h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-curator-border shadow-sm space-y-6">
        {/* Brand Information */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={data.store_name}
                onChange={e => setData({ ...data, store_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={data.tagline}
                onChange={e => setData({ ...data, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
              Official Brand Story / Mission Statement
            </label>
            <textarea
              rows={3}
              value={data.brand_story || ''}
              onChange={e => setData({ ...data, brand_story: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs resize-none focus:outline-none font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* Contact & Helpline */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
            Contact & Concierge Helpline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Customer Care Phone
              </label>
              <input
                type="text"
                value={data.phone}
                onChange={e => setData({ ...data, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                WhatsApp Helpline
              </label>
              <input
                type="text"
                value={data.whatsapp_number}
                onChange={e => setData({ ...data, whatsapp_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Store Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={e => setData({ ...data, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
              Studio / Showroom Address
            </label>
            <input
              type="text"
              value={data.address}
              onChange={e => setData({ ...data, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Currency & Locale */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
            Currency
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Currency Code
              </label>
              <input
                type="text"
                value={data.currency}
                onChange={e => setData({ ...data, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Symbol
              </label>
              <input
                type="text"
                value={data.currency_symbol}
                onChange={e => setData({ ...data, currency_symbol: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-serif font-bold text-curator-coral"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-curator-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
