import React, { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { settingsService } from '../../lib/api';
import { DeliverySettings } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const DeliverySettingsPage: React.FC = () => {
  const [data, setData] = useState<DeliverySettings>({
    inside_dhaka_fee: 80,
    outside_dhaka_fee: 150,
    free_delivery_threshold: 2500,
    is_active: true,
    delivery_note: 'পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন (ক্যাশ অন ডেলিভারি)।'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  useEffect(() => {
    settingsService.getDeliverySettings().then(res => {
      if (res) setData(res);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await settingsService.saveDeliverySettings(data);
      if (res.success) {
        success('Delivery rates updated! Storefront checkout updated dynamically.');
      } else {
        error(res.error || 'Failed to save delivery settings');
      }
    } catch {
      error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AdminCardSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl pb-20 lg:pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Checkout & Logistics</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
          Delivery Fee Settings
        </h1>
        <p className="text-xs text-curator-muted font-sans mt-0.5">
          These rates dynamically drive the customer checkout calculation on the live storefront.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Inside Dhaka Delivery Fee (৳)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-curator-coral text-sm">৳</span>
              <input
                type="number"
                inputMode="decimal"
                required
                value={data.inside_dhaka_fee}
                onChange={e => setData({ ...data, inside_dhaka_fee: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
            </div>
            <span className="text-[10px] text-curator-muted mt-1 block">Default: ৳80</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Outside Dhaka Delivery Fee (৳)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-curator-coral text-sm">৳</span>
              <input
                type="number"
                inputMode="decimal"
                required
                value={data.outside_dhaka_fee}
                onChange={e => setData({ ...data, outside_dhaka_fee: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
            </div>
            <span className="text-[10px] text-curator-muted mt-1 block">Default: ৳150</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
            Free Delivery Minimum Order Amount (৳)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-curator-coral text-sm">৳</span>
            <input
              type="number"
              inputMode="decimal"
              value={data.free_delivery_threshold}
              onChange={e => setData({ ...data, free_delivery_threshold: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
            />
          </div>
          <span className="text-[10px] text-curator-muted mt-1 block">Orders above this threshold receive ৳0 delivery charge.</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
            Delivery Notice Note (Shown on In-Page Checkout)
          </label>
          <textarea
            rows={3}
            value={data.delivery_note || ''}
            onChange={e => setData({ ...data, delivery_note: e.target.value })}
            className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-curator-border">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Delivery Rates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
