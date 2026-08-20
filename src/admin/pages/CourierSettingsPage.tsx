import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { steadfastService } from '../../lib/steadfast';
import { SteadfastSettings } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const CourierSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SteadfastSettings>({
    is_enabled: true,
    api_key: '',
    secret_key: '',
    base_url: 'https://portal.packzy.com/api/v1',
    default_delivery_type: 0,
    default_note: 'Please handle with care. Women Curator parcel.',
    auto_send_on_confirm: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await steadfastService.getSettings();
      setSettings(data);
      if (data.api_key && data.secret_key) {
        checkCurrentBalance(data.api_key, data.secret_key);
      }
    } catch {
      error('Failed to load courier settings');
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentBalance = async (key?: string, secret?: string) => {
    setIsCheckingBalance(true);
    setBalanceError(null);
    try {
      const res = await steadfastService.checkBalance(key, secret);
      if (res.success && res.balance !== undefined) {
        setBalance(res.balance);
      } else {
        setBalanceError(res.error || 'Failed to connect');
        setBalance(null);
      }
    } catch (e: any) {
      setBalanceError(e.message || 'Connection failed');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await steadfastService.saveSettings(settings);
      if (res.success) {
        success('Steadfast Courier configuration saved!');
        if (settings.api_key && settings.secret_key) {
          checkCurrentBalance(settings.api_key, settings.secret_key);
        }
      } else {
        error(res.error || 'Failed to save configuration');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Logistics & Automation</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Steadfast Courier Integration
          </h1>
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Direct 1-click parcel consignment creation, live tracking code assignment, and automatic status updates
          </p>
        </div>

        <a
          href="https://portal.steadfast.com.bd"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral hover:border-curator-coral shadow-xs transition-colors self-start sm:self-auto min-h-[44px]"
        >
          <span>Steadfast Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Wallet Balance & Connection Health Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-gradient-to-br from-white to-[#FAF5EE] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-curator-border shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-curator-coral-light text-curator-coral flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted block">
                Steadfast Account Balance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                {isCheckingBalance ? (
                  <span className="text-xs text-curator-muted animate-pulse">Checking live balance...</span>
                ) : balance !== null ? (
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
                    ৳{balance.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-xs text-rose-600 font-medium">
                    {balanceError || 'Not Connected (Enter API Key below)'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => checkCurrentBalance(settings.api_key, settings.secret_key)}
            disabled={isCheckingBalance}
            className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral shadow-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
            title="Check Balance"
            aria-label="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingBalance ? 'animate-spin text-curator-coral' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-curator-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">Status</span>
            <span
              className={`w-3 h-3 rounded-full ${
                settings.api_key && settings.secret_key && balance !== null
                  ? 'bg-emerald-500 shadow-xs'
                  : 'bg-amber-400'
              }`}
            />
          </div>
          <div>
            <p className="font-serif text-base font-bold text-curator-charcoal">
              {settings.api_key && settings.secret_key && balance !== null
                ? 'Connected & Ready'
                : 'Credentials Needed'}
            </p>
            <span className="text-[11px] text-curator-muted">V1 API Gateway</span>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-curator-border pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-curator-charcoal">
              API Authentication Credentials
            </h3>
            <p className="text-xs text-curator-muted">Found inside your Steadfast Courier Merchant Dashboard under Settings ➔ API</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.is_enabled}
              onChange={e => setSettings({ ...settings, is_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Api-Key <span className="text-curator-coral">*</span>
            </label>
            <input
              type="text"
              required
              value={settings.api_key}
              onChange={e => setSettings({ ...settings, api_key: e.target.value.trim() })}
              placeholder="e.g. 1m9mwrrwsjbrg0w"
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Secret-Key <span className="text-curator-coral">*</span>
            </label>
            <input
              type="password"
              required
              value={settings.secret_key}
              onChange={e => setSettings({ ...settings, secret_key: e.target.value.trim() })}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              API Base URL
            </label>
            <input
              type="text"
              value={settings.base_url}
              onChange={e => setSettings({ ...settings, base_url: e.target.value.trim() })}
              placeholder="https://portal.packzy.com/api/v1"
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono text-curator-charcoal focus:outline-none min-h-[48px]"
            />
            <span className="text-[10px] text-curator-muted mt-1 block">Default: https://portal.packzy.com/api/v1</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
              Default Delivery Type
            </label>
            <select
              value={settings.default_delivery_type}
              onChange={e => setSettings({ ...settings, default_delivery_type: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none bg-white min-h-[48px]"
            >
              <option value={0}>Home Delivery (0)</option>
              <option value={1}>Point Delivery / Hub Pickup (1)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
            Default Parcel Delivery Note / Special Instruction
          </label>
          <textarea
            rows={2}
            value={settings.default_note || ''}
            onChange={e => setSettings({ ...settings, default_note: e.target.value })}
            placeholder="Please handle with care. Women Curator parcel."
            className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-curator-border">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Courier Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
