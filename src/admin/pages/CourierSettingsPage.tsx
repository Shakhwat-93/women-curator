import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Search,
  Truck,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Phone
} from 'lucide-react';
import { steadfastService } from '../../lib/steadfast';
import { bdCourierService } from '../../lib/bdCourier';
import { SteadfastSettings, BdCourierSettings } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';
import { CustomerCourierHistoryCard } from '../components/CustomerCourierHistoryCard';

export const CourierSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bd_courier' | 'steadfast' | 'lookup' | 'metrics'>('bd_courier');

  // Steadfast State
  const [steadfastSettings, setSteadfastSettings] = useState<SteadfastSettings>({
    is_enabled: true,
    api_key: '',
    secret_key: '',
    base_url: 'https://portal.packzy.com/api/v1',
    default_delivery_type: 0,
    default_note: 'Please handle with care. Women Curator parcel.',
    auto_send_on_confirm: false
  });
  const [steadfastBalance, setSteadfastBalance] = useState<number | null>(null);
  const [isCheckingSteadfastBalance, setIsCheckingSteadfastBalance] = useState(false);
  const [steadfastError, setSteadfastError] = useState<string | null>(null);

  // BD Courier State
  const [bdSettings, setBdSettings] = useState<BdCourierSettings>({
    is_enabled: true,
    api_key: '',
    base_url: 'https://api.bdcourier.com',
    cache_duration_days: 7,
    auto_check_new_orders: true,
    max_retries: 3
  });
  const [bdApiKeyInput, setBdApiKeyInput] = useState('');
  const [showBdApiKey, setShowBdApiKey] = useState(false);
  const [testPhone, setTestPhone] = useState('01711111111');
  const [isTestingBd, setIsTestingBd] = useState(false);
  const [bdTestResult, setBdTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Standalone Lookup Tool State
  const [lookupPhone, setLookupPhone] = useState('');
  const [activeLookupPhone, setActiveLookupPhone] = useState('');

  // Usage Metrics State
  const [usageStats, setUsageStats] = useState<{ totalLookups: number; todayCalls: number; todayHits: number; hitRate: number }>({
    totalLookups: 0,
    todayCalls: 0,
    todayHits: 0,
    hitRate: 100
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stData, bdData, stats] = await Promise.all([
        steadfastService.getSettings(),
        bdCourierService.getSettings(),
        bdCourierService.getUsageStats()
      ]);
      setSteadfastSettings(stData);
      setBdSettings(bdData);
      setBdApiKeyInput(bdData.api_key || '');
      setUsageStats(stats);

      if (stData.api_key && stData.secret_key) {
        checkSteadfastCurrentBalance(stData.api_key, stData.secret_key);
      }
    } catch {
      error('Failed to load courier configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSteadfastCurrentBalance = async (key?: string, secret?: string) => {
    setIsCheckingSteadfastBalance(true);
    setSteadfastError(null);
    try {
      const res = await steadfastService.checkBalance(key, secret);
      if (res.success && res.balance !== undefined) {
        setSteadfastBalance(res.balance);
      } else {
        setSteadfastError(res.error || 'Failed to connect');
        setSteadfastBalance(null);
      }
    } catch (e: any) {
      setSteadfastError(e.message || 'Connection failed');
    } finally {
      setIsCheckingSteadfastBalance(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save BD Courier Settings
  const handleSaveBdSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<BdCourierSettings> = {
        ...bdSettings,
        api_key: bdApiKeyInput.trim()
      };
      const res = await bdCourierService.saveSettings(payload);
      if (res.success) {
        setBdSettings(prev => ({ ...prev, api_key: bdApiKeyInput.trim() }));
        success('BD Courier configuration & caching rules saved!');
      } else {
        error(res.error || 'Failed to save BD Courier settings');
      }
    } catch {
      error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Steadfast Settings
  const handleSaveSteadfastSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await steadfastService.saveSettings(steadfastSettings);
      if (res.success) {
        success('Steadfast Courier configuration saved!');
        if (steadfastSettings.api_key && steadfastSettings.secret_key) {
          checkSteadfastCurrentBalance(steadfastSettings.api_key, steadfastSettings.secret_key);
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

  // Test BD Courier Connection
  const handleTestBdConnection = async () => {
    if (!bdApiKeyInput.trim()) {
      error('Please provide a BD Courier API Key first');
      return;
    }
    setIsTestingBd(true);
    setBdTestResult(null);
    try {
      const res = await bdCourierService.testConnection(bdApiKeyInput.trim(), testPhone);
      if (res.success) {
        setBdTestResult({
          success: true,
          message: 'Connection Successful! BD Courier API gateway is responsive.'
        });
        success('BD Courier API authenticated successfully!');
      } else {
        setBdTestResult({
          success: false,
          message: res.error || 'Authentication failed. Please verify your API Key.'
        });
        error(res.error || 'Connection failed');
      }
    } catch (e: any) {
      setBdTestResult({
        success: false,
        message: e.message || 'Network error connecting to api.bdcourier.com'
      });
      error('Test failed');
    } finally {
      setIsTestingBd(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    setActiveLookupPhone(lookupPhone.trim());
  };

  if (isLoading) return <AdminCardSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl pb-20 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Courier Intelligence & Logistics Gateway</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Courier Integration Center
          </h1>
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Manage BD Courier customer history API, Steadfast automated parcel gateway, and phone-level cache policies
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          title="Refresh Configurations"
          className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('bd_courier')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] flex items-center gap-2 ${
            activeTab === 'bd_courier'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-curator-coral" />
          <span>BD Courier (Fraud & Success Ratio)</span>
        </button>

        <button
          onClick={() => setActiveTab('steadfast')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] flex items-center gap-2 ${
            activeTab === 'steadfast'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          <Truck className="w-4 h-4 text-curator-coral" />
          <span>Steadfast Courier (Parcel Dispatch)</span>
        </button>

        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] flex items-center gap-2 ${
            activeTab === 'lookup'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          <Search className="w-4 h-4 text-curator-coral" />
          <span>Customer Phone Lookup</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-curator-coral" />
          <span>API Efficiency & Cache Stats</span>
        </button>
      </div>

      {/* TAB 1: BD COURIER INTEGRATION */}
      {activeTab === 'bd_courier' && (
        <div className="space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block font-mono">
                API Integration
              </span>
              <p className="font-bold text-xs text-curator-charcoal mt-1 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${bdSettings.is_enabled && bdSettings.api_key ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span>{bdSettings.is_enabled && bdSettings.api_key ? 'Configured & Active' : 'Key Required'}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block font-mono">
                Phone-Level Cache
              </span>
              <p className="font-bold text-xs text-curator-charcoal mt-1">
                {bdSettings.cache_duration_days || 7} Days Retention
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block font-mono">
                Today's Cache Hits
              </span>
              <p className="font-serif font-bold text-lg text-emerald-700 mt-0.5">
                {usageStats.todayHits} Hits
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block font-mono">
                Cache Hit Efficiency
              </span>
              <p className="font-serif font-bold text-lg text-curator-coral mt-0.5">
                {usageStats.hitRate}% Safe
              </p>
            </div>
          </div>

          {/* BD Courier Configuration Form */}
          <form onSubmit={handleSaveBdSettings} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  BD Courier API Credentials & Caching
                </h3>
                <p className="text-xs text-curator-muted">
                  Endpoint: <code>POST https://api.bdcourier.com/courier-check</code>
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdSettings.is_enabled}
                  onChange={e => setBdSettings({ ...bdSettings, is_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                  BD Courier API Key (Bearer Token) <span className="text-curator-coral">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowBdApiKey(!showBdApiKey)}
                  className="text-[11px] font-bold text-curator-coral hover:underline"
                >
                  {showBdApiKey ? 'Mask Key' : 'Reveal Key'}
                </button>
              </div>
              <input
                type={showBdApiKey ? 'text' : 'password'}
                value={bdApiKeyInput}
                onChange={e => setBdApiKeyInput(e.target.value)}
                placeholder="Enter your Bearer API Key..."
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
              <span className="text-[10px] text-curator-muted mt-1 block">
                Never exposed to the public frontend. Used strictly in server-side cached lookups.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                  Cache Duration
                </label>
                <select
                  value={bdSettings.cache_duration_days}
                  onChange={e => setBdSettings({ ...bdSettings, cache_duration_days: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none bg-white min-h-[48px]"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Recommended)</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
                <span className="text-[10px] text-curator-muted mt-1 block">
                  Repeated orders or admin opens for the same customer phone use cached results with 0 API calls.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                  Auto-Check Customer on New Order
                </label>
                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bdSettings.auto_check_new_orders}
                      onChange={e => setBdSettings({ ...bdSettings, auto_check_new_orders: e.target.checked })}
                      className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-curator-charcoal block">
                        Asynchronous Background Verification
                      </span>
                      <span className="text-[10px] text-curator-muted">
                        Runs silently upon checkout without slowing customer down
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Test Connection Box */}
            <div className="p-4 rounded-2xl bg-[#FAF5EE]/80 border border-curator-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-curator-charcoal block">
                Test Gateway Connection
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="01711111111"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-curator-border bg-white text-xs font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestBdConnection}
                  disabled={isTestingBd}
                  className="py-2.5 px-6 rounded-xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingBd ? 'animate-spin text-curator-coral' : ''}`} />
                  <span>{isTestingBd ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>

              {bdTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 font-sans ${
                    bdTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {bdTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{bdTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-curator-border">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save BD Courier Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: STEADFAST COURIER INTEGRATION */}
      {activeTab === 'steadfast' && (
        <div className="space-y-6">
          {/* Steadfast Balance Card */}
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
                    {isCheckingSteadfastBalance ? (
                      <span className="text-xs text-curator-muted animate-pulse">Checking live balance...</span>
                    ) : steadfastBalance !== null ? (
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
                        ৳{steadfastBalance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-rose-600 font-medium">
                        {steadfastError || 'Not Connected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => checkSteadfastCurrentBalance(steadfastSettings.api_key, steadfastSettings.secret_key)}
                disabled={isCheckingSteadfastBalance}
                className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral shadow-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
                title="Check Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingSteadfastBalance ? 'animate-spin text-curator-coral' : ''}`} />
              </button>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-curator-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">Status</span>
                <span
                  className={`w-3 h-3 rounded-full ${
                    steadfastSettings.api_key && steadfastSettings.secret_key && steadfastBalance !== null
                      ? 'bg-emerald-500 shadow-xs'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-curator-charcoal">
                  {steadfastSettings.api_key && steadfastSettings.secret_key && steadfastBalance !== null
                    ? 'Connected & Ready'
                    : 'Credentials Needed'}
                </p>
                <span className="text-[11px] text-curator-muted">V1 API Gateway</span>
              </div>
            </div>
          </div>

          {/* Steadfast Configuration Form */}
          <form onSubmit={handleSaveSteadfastSettings} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Steadfast API Authentication Credentials
                </h3>
                <p className="text-xs text-curator-muted">
                  Found inside your Steadfast Courier Merchant Dashboard under Settings ➔ API
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={steadfastSettings.is_enabled}
                  onChange={e => setSteadfastSettings({ ...steadfastSettings, is_enabled: e.target.checked })}
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
                  value={steadfastSettings.api_key}
                  onChange={e => setSteadfastSettings({ ...steadfastSettings, api_key: e.target.value.trim() })}
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
                  value={steadfastSettings.secret_key}
                  onChange={e => setSteadfastSettings({ ...steadfastSettings, secret_key: e.target.value.trim() })}
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
                  value={steadfastSettings.base_url}
                  onChange={e => setSteadfastSettings({ ...steadfastSettings, base_url: e.target.value.trim() })}
                  placeholder="https://portal.packzy.com/api/v1"
                  className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono text-curator-charcoal focus:outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                  Default Delivery Type
                </label>
                <select
                  value={steadfastSettings.default_delivery_type}
                  onChange={e => setSteadfastSettings({ ...steadfastSettings, default_delivery_type: Number(e.target.value) })}
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
                value={steadfastSettings.default_note || ''}
                onChange={e => setSteadfastSettings({ ...steadfastSettings, default_note: e.target.value })}
                placeholder="Please handle with care. Women Curator parcel."
                className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-curator-border">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Steadfast Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: STANDALONE PHONE LOOKUP TOOL */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                Customer Phone Courier Inspector
              </h3>
              <p className="text-xs text-curator-muted">
                Enter any customer phone number to inspect delivery history, cancellation ratio, and merchant reports.
              </p>
            </div>

            <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                <input
                  type="text"
                  required
                  value={lookupPhone}
                  onChange={e => setLookupPhone(e.target.value)}
                  placeholder="e.g. 01712345678 or +8801712345678"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold focus:outline-none focus:border-curator-coral min-h-[48px]"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-2xl bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Search className="w-4 h-4" />
                <span>Inspect Courier History</span>
              </button>
            </form>
          </div>

          {activeLookupPhone && (
            <CustomerCourierHistoryCard phone={activeLookupPhone} />
          )}
        </div>
      )}

      {/* TAB 4: API CONSUMPTION & CACHE EFFICIENCY METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-curator-charcoal">
              BD Courier API Consumption & Cache Efficiency
            </h3>
            <p className="text-xs text-curator-muted">
              Monitoring external API calls vs database cache hits to prevent quota exhaustion and reduce latency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-1">
                <span className="text-[10px] font-bold text-curator-muted font-mono uppercase">
                  Today's Cache Hits (0 External Calls)
                </span>
                <p className="font-serif text-2xl font-bold text-emerald-700">
                  {usageStats.todayHits}
                </p>
                <span className="text-[10px] text-curator-muted font-mono">
                  Saved 100% external latency
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-1">
                <span className="text-[10px] font-bold text-curator-muted font-mono uppercase">
                  Today's External API Calls
                </span>
                <p className="font-serif text-2xl font-bold text-curator-charcoal">
                  {usageStats.todayCalls}
                </p>
                <span className="text-[10px] text-curator-muted font-mono">
                  New customer lookups & force refreshes
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-1">
                <span className="text-[10px] font-bold text-curator-muted font-mono uppercase">
                  Overall Cache Efficiency Rate
                </span>
                <p className="font-serif text-2xl font-bold text-curator-coral">
                  {usageStats.hitRate}%
                </p>
                <span className="text-[10px] text-curator-muted font-mono">
                  Single call per canonical phone
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
