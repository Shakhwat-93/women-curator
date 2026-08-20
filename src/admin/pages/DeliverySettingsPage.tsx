import React, { useState, useEffect } from 'react';
import { Save, Truck, Sparkles } from 'lucide-react';
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
    <div className="space-y-6 max-w-3xl">
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

      <form onSubmit={handleSave} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-curator-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-3">
            <div className="flex items-center gap-2 text-curator-coral font-bold text-xs">
              <Truck className="w-4 h-4" />
              <span>ঢাকার ভিতরে (Inside Dhaka)</span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Delivery Charge (৳)
              </label>
              <input
                type="number"
                required
                value={data.inside_dhaka_fee}
                onChange={e => setData({ ...data, inside_dhaka_fee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border bg-white text-base font-mono font-bold text-curator-coral focus:outline-none"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-3">
            <div className="flex items-center gap-2 text-curator-coral font-bold text-xs">
              <Truck className="w-4 h-4" />
              <span>ঢাকার বাইরে (Outside Dhaka)</span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Delivery Charge (৳)
              </label>
              <input
                type="number"
                required
                value={data.outside_dhaka_fee}
                onChange={e => setData({ ...data, outside_dhaka_fee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-curator-border bg-white text-base font-mono font-bold text-curator-coral focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
            Free Delivery Threshold (৳)
          </label>
          <input
            type="number"
            value={data.free_delivery_threshold}
            onChange={e => setData({ ...data, free_delivery_threshold: Number(e.target.value) })}
            placeholder="2500"
            className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
          />
          <p className="text-[11px] text-curator-muted mt-1">
            Orders exceeding this total will automatically get free shipping.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
            Cash on Delivery Customer Note
          </label>
          <textarea
            rows={2}
            value={data.delivery_note || ''}
            onChange={e => setData({ ...data, delivery_note: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs resize-none focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-curator-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Delivery Rates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
