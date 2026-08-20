import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Play,
  RefreshCw,
  X
} from 'lucide-react';
import { trackingService } from '../../lib/api';
import { TrackingSettings, TrackingEventConfig } from '../../tracking/types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';
import { track } from '../../tracking/tracker';
import { getStoredAttribution } from '../../tracking/utm';

export const TrackingSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'events' | 'attribution' | 'simulator'>('providers');
  const [settings, setSettings] = useState<TrackingSettings>({
    gtm_enabled: false,
    gtm_container_id: '',
    ga4_enabled: false,
    ga4_measurement_id: '',
    google_ads_enabled: false,
    google_ads_conversion_id: '',
    google_ads_purchase_label: '',
    google_ads_cart_label: '',
    google_ads_begin_checkout_label: '',
    meta_enabled: false,
    meta_pixel_id: '',
    meta_capi_enabled: false,
    tiktok_enabled: false,
    tiktok_pixel_id: '',
    tiktok_events_api_enabled: false,
    advanced_matching_enabled: false,
    debug_mode: true,
    consent_mode_enabled: false
  });

  const [eventsConfig, setEventsConfig] = useState<TrackingEventConfig[]>([]);
  const [conversionLogs, setConversionLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResults, setValidationResults] = useState<{ type: 'success' | 'warning' | 'error'; message: string }[]>([]);
  const [simulatedOutput, setSimulatedOutput] = useState<any>(null);

  const { success, error, info } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [st, ev, logs] = await Promise.all([
        trackingService.getTrackingSettings(),
        trackingService.getTrackingEventsConfig(),
        trackingService.getRecentConversionEvents(10)
      ]);
      setSettings(st);
      setEventsConfig(ev);
      setConversionLogs(logs);
    } catch (e) {
      error('Failed to load tracking settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await trackingService.saveTrackingSettings(settings);
      if (res.success) {
        // Reinitialize client tracker
        track.init(settings);
        success('Tracking settings updated! Central tracker re-initialized.');
        validateConfig();
      } else {
        error(res.error || 'Failed to save tracking settings');
      }
    } catch (e) {
      error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEvents = async () => {
    setIsSaving(true);
    try {
      const res = await trackingService.saveTrackingEventsConfig(eventsConfig);
      if (res.success) {
        track.init(settings);
        success('Event routing rules updated successfully');
      } else {
        error(res.error || 'Failed to update event rules');
      }
    } catch (e) {
      error('Failed to save event rules');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEvent = (idx: number, key: keyof TrackingEventConfig) => {
    const updated = [...eventsConfig];
    // Protect purchase event from accidental total disable
    if (updated[idx].id === 'purchase' && key === 'enabled' && updated[idx].enabled) {
      const confirmDisable = window.confirm(
        'Warning: Disabling the Purchase event will stop tracking all conversion revenues in GA4, Meta, and Google Ads. Are you sure?'
      );
      if (!confirmDisable) return;
    }
    (updated[idx] as any)[key] = !updated[idx][key];
    setEventsConfig(updated);
  };

  const validateConfig = () => {
    const results: { type: 'success' | 'warning' | 'error'; message: string }[] = [];

    // GTM check
    if (settings.gtm_enabled) {
      if (!settings.gtm_container_id) {
        results.push({ type: 'error', message: 'GTM is enabled but Container ID is empty.' });
      } else if (!/^GTM-[A-Z0-9]+$/.test(settings.gtm_container_id.trim())) {
        results.push({ type: 'warning', message: `GTM Container ID "${settings.gtm_container_id}" might be invalid. Standard format: GTM-XXXXXXX` });
      } else {
        results.push({ type: 'success', message: `GTM Container "${settings.gtm_container_id}" is configured.` });
      }
    }

    // GA4 check
    if (settings.ga4_enabled) {
      if (!settings.ga4_measurement_id) {
        results.push({ type: 'error', message: 'GA4 is enabled but Measurement ID is empty.' });
      } else if (!/^G-[A-Z0-9]+$/.test(settings.ga4_measurement_id.trim())) {
        results.push({ type: 'warning', message: `GA4 Measurement ID "${settings.ga4_measurement_id}" should match format G-XXXXXXXXXX.` });
      } else {
        results.push({ type: 'success', message: `GA4 Measurement ID "${settings.ga4_measurement_id}" is configured.` });
      }
    }

    // Meta Pixel check
    if (settings.meta_enabled) {
      if (!settings.meta_pixel_id) {
        results.push({ type: 'error', message: 'Meta Pixel is enabled but Pixel ID is empty.' });
      } else if (!/^\d{10,20}$/.test(settings.meta_pixel_id.trim())) {
        results.push({ type: 'warning', message: `Meta Pixel ID "${settings.meta_pixel_id}" usually consists of 15-16 digits.` });
      } else {
        results.push({ type: 'success', message: `Meta Pixel "${settings.meta_pixel_id}" is configured.` });
      }
    }

    // TikTok Pixel check
    if (settings.tiktok_enabled) {
      if (!settings.tiktok_pixel_id) {
        results.push({ type: 'error', message: 'TikTok Pixel is enabled but Pixel ID is empty.' });
      } else {
        results.push({ type: 'success', message: `TikTok Pixel "${settings.tiktok_pixel_id}" is configured.` });
      }
    }

    // Google Ads check
    if (settings.google_ads_enabled) {
      if (!settings.google_ads_conversion_id || !settings.google_ads_purchase_label) {
        results.push({ type: 'warning', message: 'Google Ads is enabled: ensure both Conversion ID (AW-XXXXXX) and Purchase Conversion Label are filled.' });
      } else {
        results.push({ type: 'success', message: 'Google Ads Purchase Conversion tracking is configured.' });
      }
    }

    if (results.length === 0) {
      results.push({ type: 'warning', message: 'No tracking providers are currently enabled. Enable GTM, Meta, or GA4 to start recording.' });
    }

    setValidationResults(results);
    info('Validation complete. Review status below.');
  };

  const handleTestSimulator = (eventType: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase') => {
    const mockProduct = {
      id: 'demo-tunic-01',
      name: 'Signature Embroidered Peplum Tunic',
      price: 1850,
      compare_price: 2200,
      sku: 'WC-PEP-01',
      category_name: 'Statement Peplums',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      colors: [{ name: 'Crimson Coral', hex: '#DE4F3C' }],
      sizes: ['M (38)'],
      is_active: true,
      status: 'active' as const,
      sort_order: 1
    };

    if (eventType === 'view_item') {
      track.viewItem(mockProduct, 'Crimson Coral', 'M (38)');
    } else if (eventType === 'add_to_cart') {
      track.addToCart(mockProduct, 1, 'Crimson Coral', 'M (38)');
    } else if (eventType === 'begin_checkout') {
      track.beginCheckout(
        [{ product: mockProduct, quantity: 1, selectedColor: { name: 'Crimson Coral', hex: '#DE4F3C' }, selectedSize: 'M (38)' }],
        1850
      );
    } else if (eventType === 'purchase') {
      const mockOrderNumber = `WC-SIM-${Date.now().toString().slice(-4)}`;
      track.purchase({
        order_number: mockOrderNumber,
        customer_name: 'Test Customer',
        phone: '01700000000',
        address: 'Gulshan 2, Dhaka',
        city: 'Dhaka',
        payment_method: 'Cash on Delivery',
        subtotal: 1850,
        delivery_charge: 80,
        discount: 0,
        total: 1930,
        status: 'pending',
        items: [
          {
            product_id: mockProduct.id,
            product_name: mockProduct.name,
            quantity: 1,
            unit_price: 1850,
            subtotal: 1850,
            color_name: 'Crimson Coral',
            size: 'M (38)'
          }
        ]
      });
    }

    const latestDataLayer = typeof window !== 'undefined' ? (window.dataLayer || []).slice(-3) : [];
    setSimulatedOutput({
      eventType,
      timestamp: new Date().toLocaleTimeString(),
      recentDataLayerEvents: latestDataLayer
    });

    success(`Simulated test event "${eventType}" fired to DataLayer & active providers!`);
  };

  if (isLoading) return <AdminCardSkeleton />;

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Marketing Analytics & Conversion Stack</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Analytics & Tracking Center
          </h1>
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Centralized Google Tag Manager, GA4, Meta Pixel, TikTok Pixel & Google Ads management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={validateConfig}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral shadow-xs min-h-[44px]"
          >
            <Activity className="w-4 h-4 text-curator-coral" />
            <span>Validate Config</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            title="Refresh"
            aria-label="Refresh settings"
            className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal shadow-xs flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation Banner (If present) */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-curator-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-curator-charcoal">
              Configuration Health Check
            </h3>
            <button onClick={() => setValidationResults([])} className="text-curator-muted hover:text-curator-charcoal">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 pt-1">
            {validationResults.map((r, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 font-sans ${
                  r.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : r.type === 'warning'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {r.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">GTM</span>
            <span className={`w-2.5 h-2.5 rounded-full ${settings.gtm_enabled && settings.gtm_container_id ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <p className="text-xs font-bold text-curator-charcoal font-mono truncate">
            {settings.gtm_enabled && settings.gtm_container_id ? settings.gtm_container_id : 'Disabled'}
          </p>
          <span className="text-[10px] text-curator-muted mt-1 block">Primary Layer</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">GA4</span>
            <span className={`w-2.5 h-2.5 rounded-full ${settings.ga4_enabled && settings.ga4_measurement_id ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <p className="text-xs font-bold text-curator-charcoal font-mono truncate">
            {settings.ga4_enabled && settings.ga4_measurement_id ? settings.ga4_measurement_id : 'Disabled'}
          </p>
          <span className="text-[10px] text-curator-muted mt-1 block">Google Analytics</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">Meta</span>
            <span className={`w-2.5 h-2.5 rounded-full ${settings.meta_enabled && settings.meta_pixel_id ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <p className="text-xs font-bold text-curator-charcoal font-mono truncate">
            {settings.meta_enabled && settings.meta_pixel_id ? `${settings.meta_pixel_id.slice(0, 7)}...` : 'Disabled'}
          </p>
          <span className="text-[10px] text-curator-muted mt-1 block">Meta Pixel</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">TikTok</span>
            <span className={`w-2.5 h-2.5 rounded-full ${settings.tiktok_enabled && settings.tiktok_pixel_id ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <p className="text-xs font-bold text-curator-charcoal font-mono truncate">
            {settings.tiktok_enabled && settings.tiktok_pixel_id ? `${settings.tiktok_pixel_id.slice(0, 7)}...` : 'Disabled'}
          </p>
          <span className="text-[10px] text-curator-muted mt-1 block">TikTok Pixel</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-curator-muted">Google Ads</span>
            <span className={`w-2.5 h-2.5 rounded-full ${settings.google_ads_enabled && settings.google_ads_conversion_id ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <p className="text-xs font-bold text-curator-charcoal font-mono truncate">
            {settings.google_ads_enabled && settings.google_ads_conversion_id ? settings.google_ads_conversion_id : 'Disabled'}
          </p>
          <span className="text-[10px] text-curator-muted mt-1 block">Conversions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] ${
            activeTab === 'providers'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          Provider Configurations
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] ${
            activeTab === 'events'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          Event Routing Rules ({eventsConfig.length})
        </button>

        <button
          onClick={() => setActiveTab('attribution')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] ${
            activeTab === 'attribution'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          Attribution & Conversions ({conversionLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border min-h-[44px] ${
            activeTab === 'simulator'
              ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
              : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
          }`}
        >
          Live Debug Simulator
        </button>
      </div>

      {/* TAB 1: PROVIDER CONFIGURATIONS */}
      {activeTab === 'providers' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Google Tag Manager */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Google Tag Manager (GTM)
                </h3>
                <p className="text-xs text-curator-muted">Primary orchestration container for all browser tags</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gtm_enabled}
                  onChange={e => setSettings({ ...settings, gtm_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                GTM Container ID
              </label>
              <input
                type="text"
                value={settings.gtm_container_id || ''}
                onChange={e => setSettings({ ...settings, gtm_container_id: e.target.value.trim() })}
                placeholder="GTM-XXXXXXX"
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
              <span className="text-[10px] text-curator-muted mt-1 block">When enabled, events push directly into window.dataLayer for GTM triggers.</span>
            </div>
          </div>

          {/* Google Analytics 4 */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Google Analytics 4 (GA4)
                </h3>
                <p className="text-xs text-curator-muted">Direct fallback if GTM is not used (prevents duplicates automatically)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ga4_enabled}
                  onChange={e => setSettings({ ...settings, ga4_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={settings.ga4_measurement_id || ''}
                onChange={e => setSettings({ ...settings, ga4_measurement_id: e.target.value.trim() })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
            </div>
          </div>

          {/* Google Ads */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Google Ads Conversion Tracking
                </h3>
                <p className="text-xs text-curator-muted">Fires strictly upon verified database order creation with transaction ID</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.google_ads_enabled}
                  onChange={e => setSettings({ ...settings, google_ads_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                  Conversion ID (AW-XXXXXXX)
                </label>
                <input
                  type="text"
                  value={settings.google_ads_conversion_id || ''}
                  onChange={e => setSettings({ ...settings, google_ads_conversion_id: e.target.value.trim() })}
                  placeholder="AW-123456789"
                  className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                  Purchase Conversion Label
                </label>
                <input
                  type="text"
                  value={settings.google_ads_purchase_label || ''}
                  onChange={e => setSettings({ ...settings, google_ads_purchase_label: e.target.value.trim() })}
                  placeholder="AbCdEfGhIjKlMnOp"
                  className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
                />
              </div>
            </div>
          </div>

          {/* Meta Pixel & Conversions API */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Meta Pixel (Facebook / Instagram)
                </h3>
                <p className="text-xs text-curator-muted">Browser Pixel + shared stable event_id for Conversions API</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.meta_enabled}
                  onChange={e => setSettings({ ...settings, meta_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                Meta Pixel ID
              </label>
              <input
                type="text"
                value={settings.meta_pixel_id || ''}
                onChange={e => setSettings({ ...settings, meta_pixel_id: e.target.value.trim() })}
                placeholder="123456789012345"
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.advanced_matching_enabled}
                  onChange={e => setSettings({ ...settings, advanced_matching_enabled: e.target.checked })}
                  className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-curator-charcoal block">Advanced Matching</span>
                  <span className="text-[10px] text-curator-muted">Hash phone and city for enhanced ad attribution</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.meta_capi_enabled}
                  onChange={e => setSettings({ ...settings, meta_capi_enabled: e.target.checked })}
                  className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-curator-charcoal block">Meta Conversions API (CAPI)</span>
                  <span className="text-[10px] text-curator-muted">Client-server deduplication via stable event_id</span>
                </div>
              </label>
            </div>
          </div>

          {/* TikTok Pixel */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  TikTok Pixel & Events API
                </h3>
                <p className="text-xs text-curator-muted">Standard events with event_id deduplication</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tiktok_enabled}
                  onChange={e => setSettings({ ...settings, tiktok_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-curator-coral" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                value={settings.tiktok_pixel_id || ''}
                onChange={e => setSettings({ ...settings, tiktok_pixel_id: e.target.value.trim() })}
                placeholder="C123456789ABCDEF"
                className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
              />
            </div>
          </div>

          {/* Consent & Debugging Controls */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-curator-charcoal border-b border-curator-border pb-2">
              Consent & Developer Debugging
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.debug_mode}
                  onChange={e => setSettings({ ...settings, debug_mode: e.target.checked })}
                  className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-curator-charcoal block">Console Debug Mode</span>
                  <span className="text-[10px] text-curator-muted">Logs event payloads, IDs, and warnings to browser console</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.consent_mode_enabled}
                  onChange={e => setSettings({ ...settings, consent_mode_enabled: e.target.checked })}
                  className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-curator-charcoal block">Google Consent Mode v2</span>
                  <span className="text-[10px] text-curator-muted">Respect ad_storage and analytics_storage permissions</span>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-curator-border">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[48px]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving & Initializing...' : 'Save Tracking Stack'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: EVENT ROUTING RULES */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-curator-border pb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-curator-charcoal">
                Event Dispatch & Provider Routing
              </h3>
              <p className="text-xs text-curator-muted">Enable or disable specific ecommerce funnel events per ad network</p>
            </div>

            <button
              type="button"
              onClick={handleSaveEvents}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>Save Event Rules</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EE]/70 border-b border-curator-border font-mono text-[10px] uppercase text-curator-muted">
                <tr>
                  <th className="py-3 px-4">Event Name & Trigger</th>
                  <th className="py-3 px-3 text-center">Global Status</th>
                  <th className="py-3 px-3 text-center">GA4</th>
                  <th className="py-3 px-3 text-center">Google Ads</th>
                  <th className="py-3 px-3 text-center">Meta Pixel</th>
                  <th className="py-3 px-3 text-center">TikTok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-curator-border/60">
                {eventsConfig.map((ev, idx) => (
                  <tr key={ev.id} className="hover:bg-curator-surface-peach/20">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-curator-charcoal block">{ev.name}</span>
                      <code className="text-[10px] text-curator-muted font-mono">{ev.id}</code>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleEvent(idx, 'enabled')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono transition-colors ${
                          ev.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {ev.enabled ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={ev.ga4_enabled}
                        onChange={() => toggleEvent(idx, 'ga4_enabled')}
                        className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={ev.google_ads_enabled}
                        onChange={() => toggleEvent(idx, 'google_ads_enabled')}
                        className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={ev.meta_enabled}
                        onChange={() => toggleEvent(idx, 'meta_enabled')}
                        className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={ev.tiktok_enabled}
                        onChange={() => toggleEvent(idx, 'tiktok_enabled')}
                        className="rounded text-curator-coral focus:ring-curator-coral w-4 h-4 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTRIBUTION & CONVERSIONS */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          {/* Active Stored UTM Attribution */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 border border-curator-border shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-curator-charcoal">
              Current Browser Session Attribution
            </h3>
            <pre className="p-4 rounded-xl bg-[#FAF5EE] text-[11px] font-mono text-curator-charcoal overflow-x-auto border border-curator-border/60">
              {JSON.stringify(getStoredAttribution(), null, 2)}
            </pre>
          </div>

          {/* Recent Database Conversions */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  Recorded Conversion Events (Zero-Duplicate Audit)
                </h3>
                <p className="text-xs text-curator-muted">Logged purchases with stable transaction and event IDs</p>
              </div>
            </div>

            {conversionLogs.length === 0 ? (
              <p className="text-xs text-curator-muted py-6 text-center">No purchases recorded in this environment yet.</p>
            ) : (
              <div className="divide-y divide-curator-border/60">
                {conversionLogs.map(log => (
                  <div key={log.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-curator-charcoal">
                        {log.transaction_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-curator-muted font-mono">
                      <span>Event ID: {log.event_id}</span>
                      <span>{new Date(log.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE DEBUG SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-curator-border shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-base font-bold text-curator-charcoal">
              Live Event Simulation & DataLayer Inspector
            </h3>
            <p className="text-xs text-curator-muted mt-0.5">
              Click a test button to trigger a real normalized event through the central tracker, dataLayer, and active pixels.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => handleTestSimulator('view_item')}
              className="p-3.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/60 hover:bg-curator-surface-peach text-left space-y-1 transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-curator-charcoal">
                <Play className="w-3.5 h-3.5 text-curator-coral" />
                <span>Test view_item</span>
              </div>
              <p className="text-[10px] text-curator-muted">Simulate viewing product</p>
            </button>

            <button
              type="button"
              onClick={() => handleTestSimulator('add_to_cart')}
              className="p-3.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/60 hover:bg-curator-surface-peach text-left space-y-1 transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-curator-charcoal">
                <Play className="w-3.5 h-3.5 text-curator-coral" />
                <span>Test add_to_cart</span>
              </div>
              <p className="text-[10px] text-curator-muted">Simulate bag addition</p>
            </button>

            <button
              type="button"
              onClick={() => handleTestSimulator('begin_checkout')}
              className="p-3.5 rounded-2xl border border-curator-border bg-[#FAF5EE]/60 hover:bg-curator-surface-peach text-left space-y-1 transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-curator-charcoal">
                <Play className="w-3.5 h-3.5 text-curator-coral" />
                <span>Test begin_checkout</span>
              </div>
              <p className="text-[10px] text-curator-muted">Simulate checkout start</p>
            </button>

            <button
              type="button"
              onClick={() => handleTestSimulator('purchase')}
              className="p-3.5 rounded-2xl border border-curator-coral/40 bg-curator-coral/5 hover:bg-curator-coral/10 text-left space-y-1 transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-curator-coral">
                <Play className="w-3.5 h-3.5" />
                <span>Test purchase</span>
              </div>
              <p className="text-[10px] text-curator-muted">Simulate order conversion</p>
            </button>
          </div>

          {simulatedOutput && (
            <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-curator-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-curator-coral">
                <span>Last Fired: {simulatedOutput.eventType}</span>
                <span className="text-curator-muted text-[10px]">{simulatedOutput.timestamp}</span>
              </div>
              <pre className="p-3 rounded-xl bg-curator-charcoal text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-60">
                {JSON.stringify(simulatedOutput.recentDataLayerEvents, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
