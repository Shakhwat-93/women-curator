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
    <div className="space-y-6 max-w-4xl pb-20 lg:pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Brand & Contact</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
          Store Settings & Channels
        </h1>
        <p className="text-xs text-curator-muted font-sans mt-0.5">
          Manage official contact numbers, showroom address, and brand story
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
        {/* Brand Information */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                required
                value={data.store_name}
                onChange={e => setData({ ...data, store_name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral font-bold min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={data.tagline || ''}
                onChange={e => setData({ ...data, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Official Brand Story / Mission Statement
            </label>
            <textarea
              rows={3}
              value={data.brand_story || ''}
              onChange={e => setData({ ...data, brand_story: e.target.value })}
              className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none font-sans leading-relaxed"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                Customer Care Phone
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={data.phone || ''}
                onChange={e => setData({ ...data, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                WhatsApp Helpline
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={data.whatsapp_number || ''}
                onChange={e => setData({ ...data, whatsapp_number: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                Store Email
              </label>
              <input
                type="email"
                inputMode="email"
                value={data.email || ''}
                onChange={e => setData({ ...data, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Showroom / Operating Address
            </label>
            <input
              type="text"
              value={data.address || ''}
              onChange={e => setData({ ...data, address: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none min-h-[48px]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-curator-border">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
