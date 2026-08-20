import { supabase } from './supabase';
import {
  BdCourierSettings,
  CourierCheckResult,
  CourierRiskLevel,
  CourierBreakdownItem,
  CourierReport,
  CourierSummary
} from '../types';

/**
 * Normalizes any Bangladeshi phone number input into canonical 11-digit string (e.g. 01712345678)
 */
export function normalizeBangladeshPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.toString().replace(/\D/g, '');

  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('88')) {
    digits = digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }

  return digits;
}

/**
 * Computes internal risk assessment level based on parcel history
 */
export function calculateRiskLevel(successRatio: number, totalParcels: number): CourierRiskLevel {
  if (!totalParcels || totalParcels === 0) return 'unknown';
  if (successRatio >= 85) return 'low';
  if (successRatio >= 70) return 'medium';
  return 'high';
}

export const bdCourierService = {
  /**
   * Fetch BD Courier configuration
   */
  async getSettings(): Promise<BdCourierSettings> {
    try {
      const { data, error } = await supabase
        .from('bd_courier_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('getBdCourierSettings error:', err);
    }
    return {
      id: 'default',
      is_enabled: true,
      api_key: '',
      base_url: 'https://api.bdcourier.com',
      cache_duration_days: 7,
      auto_check_new_orders: true,
      max_retries: 3
    };
  },

  /**
   * Save BD Courier configuration
   */
  async saveSettings(settings: Partial<BdCourierSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bd_courier_settings')
        .upsert({
          ...settings,
          id: 'default',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Retrieve cached courier history by canonical phone
   */
  async getCachedCourierCheck(phone: string): Promise<CourierCheckResult | null> {
    const canonicalPhone = normalizeBangladeshPhone(phone);
    if (!canonicalPhone || canonicalPhone.length !== 11) return null;

    try {
      const { data, error } = await supabase
        .from('courier_check_cache')
        .select('*')
        .eq('phone', canonicalPhone)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('getCachedCourierCheck error:', err);
      return null;
    }
  },

  /**
   * Primary Courier Check:
   * 1. Normalizes phone.
   * 2. Checks phone-level cache (if valid, returns cached with 0 external API calls).
   * 3. Claims atomic lock to prevent concurrent duplicate external calls.
   * 4. Calls external BD Courier API.
   * 5. Saves cache & links with order (if orderId provided).
   */
  async checkCustomerCourier(
    rawPhone: string,
    options?: {
      orderId?: string;
      forceRefresh?: boolean;
    }
  ): Promise<{
    success: boolean;
    data?: CourierCheckResult;
    isCached?: boolean;
    error?: string;
  }> {
    const canonicalPhone = normalizeBangladeshPhone(rawPhone);

    if (!canonicalPhone || canonicalPhone.length !== 11) {
      return {
        success: false,
        error: `Invalid Bangladeshi mobile number (${rawPhone}). Must be 11 digits.`
      };
    }

    const settings = await this.getSettings();

    // ─── STEP 1: PHONE-LEVEL CACHE CHECK ───
    if (!options?.forceRefresh) {
      const cached = await this.getCachedCourierCheck(canonicalPhone);
      if (cached) {
        const isExpired = new Date(cached.expires_at) <= new Date();

        if (!isExpired) {
          // Log cache hit asynchronously
          this.logApiActivity(canonicalPhone, options?.orderId, 'cache_hit', 'success', 0);

          // Associate with order if needed
          if (options?.orderId) {
            this.associateOrderWithCache(options.orderId, cached);
          }

          return {
            success: true,
            data: cached,
            isCached: true
          };
        }
      }
    }

    // ─── STEP 2: VERIFY API KEY ───
    if (!settings.is_enabled) {
      return { success: false, error: 'BD Courier integration is currently disabled in settings.' };
    }

    if (!settings.api_key || settings.api_key.trim() === '') {
      return {
        success: false,
        error: 'BD Courier API Key is not configured. Please add your API Key in Admin Settings.'
      };
    }

    // ─── STEP 3: ATOMIC CONCURRENCY CLAIM LOCK ───
    const lockClaimed = await this.claimCheckLock(canonicalPhone);
    if (!lockClaimed && !options?.forceRefresh) {
      // Another worker is actively querying BD Courier for this phone, wait and fetch result
      await new Promise(r => setTimeout(r, 1500));
      const secondCheck = await this.getCachedCourierCheck(canonicalPhone);
      if (secondCheck) {
        return { success: true, data: secondCheck, isCached: true };
      }
    }

    // ─── STEP 4: CALL EXTERNAL BD COURIER API ───
    const startTime = Date.now();
    const baseUrl = settings.base_url?.replace(/\/+$/, '') || 'https://api.bdcourier.com';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      const response = await fetch(`${baseUrl}/courier-check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.api_key.trim()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ phone: canonicalPhone }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errText = await response.text();
        this.logApiActivity(canonicalPhone, options?.orderId, options?.forceRefresh ? 'force_refresh' : 'external_api_call', 'failed', latency);
        return {
          success: false,
          error: `BD Courier API HTTP error ${response.status}: ${errText.slice(0, 150)}`
        };
      }

      const json = await response.json();

      // ─── STEP 5: NORMALIZE API RESPONSE ───
      const rawData = json.data || json;
      const reports: CourierReport[] = Array.isArray(json.reports)
        ? json.reports
        : Array.isArray(rawData.reports)
        ? rawData.reports
        : [];

      // Extract courier breakdown
      const couriers: Record<string, CourierBreakdownItem> = {};
      let totalAll = 0;
      let successAll = 0;
      let cancelledAll = 0;

      for (const [key, value] of Object.entries(rawData)) {
        if (key === 'summary' || key === 'reports' || typeof value !== 'object' || value === null) continue;
        const item: any = value;
        if (item && (item.total_parcel !== undefined || item.success_parcel !== undefined)) {
          const t = Number(item.total_parcel) || 0;
          const s = Number(item.success_parcel) || 0;
          const c = Number(item.cancelled_parcel) || 0;
          const r = t > 0 ? Number(item.success_ratio ?? ((s / t) * 100).toFixed(2)) : 0;

          couriers[key] = {
            name: item.name || key.toUpperCase(),
            logo: item.logo || '',
            total_parcel: t,
            success_parcel: s,
            cancelled_parcel: c,
            success_ratio: r
          };

          totalAll += t;
          successAll += s;
          cancelledAll += c;
        }
      }

      // Summary
      let summary: CourierSummary;
      if (rawData.summary && typeof rawData.summary === 'object') {
        const sumObj = rawData.summary;
        const st = Number(sumObj.total_parcel) || totalAll;
        const ss = Number(sumObj.success_parcel) || successAll;
        const sc = Number(sumObj.cancelled_parcel) || cancelledAll;
        const sr = st > 0 ? Number(sumObj.success_ratio ?? ((ss / st) * 100).toFixed(2)) : 0;
        summary = { total_parcel: st, success_parcel: ss, cancelled_parcel: sc, success_ratio: sr };
      } else {
        const sr = totalAll > 0 ? Number(((successAll / totalAll) * 100).toFixed(2)) : 0;
        summary = { total_parcel: totalAll, success_parcel: successAll, cancelled_parcel: cancelledAll, success_ratio: sr };
      }

      const riskLevel = calculateRiskLevel(summary.success_ratio, summary.total_parcel);
      const cacheDays = settings.cache_duration_days || 7;
      const checkedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + cacheDays * 24 * 60 * 60 * 1000).toISOString();

      const cachePayload: Omit<CourierCheckResult, 'id'> = {
        phone: canonicalPhone,
        status: summary.total_parcel > 0 ? 'checked' : 'no_data',
        summary_total_parcel: summary.total_parcel,
        summary_success_parcel: summary.success_parcel,
        summary_cancelled_parcel: summary.cancelled_parcel,
        summary_success_ratio: summary.success_ratio,
        risk_level: riskLevel,
        couriers,
        reports,
        raw_response: json,
        last_error: undefined,
        retry_count: 0,
        checked_at: checkedAt,
        expires_at: expiresAt
      };

      // ─── STEP 6: UPSERT PHONE CACHE TO SUPABASE ───
      const { data: savedRecord, error: upsertError } = await supabase
        .from('courier_check_cache')
        .upsert(
          {
            ...cachePayload,
            checking_status: 'idle',
            checking_started_at: null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (upsertError) {
        console.error('Failed to save courier check cache:', upsertError);
      }

      const finalResult: CourierCheckResult = (savedRecord as CourierCheckResult) || {
        ...cachePayload,
        id: `local-${Date.now()}`
      };

      // ─── STEP 7: ASSOCIATE RESULT WITH ORDER ───
      if (options?.orderId) {
        this.associateOrderWithCache(options.orderId, finalResult);
      }

      // Log success activity
      this.logApiActivity(
        canonicalPhone,
        options?.orderId,
        options?.forceRefresh ? 'force_refresh' : 'external_api_call',
        'success',
        latency
      );

      return {
        success: true,
        data: finalResult,
        isCached: false
      };
    } catch (err: any) {
      const latency = Date.now() - startTime;
      const errMsg = err.name === 'AbortError' ? 'BD Courier API request timed out (12s)' : err.message || 'Network error';

      this.logApiActivity(
        canonicalPhone,
        options?.orderId,
        options?.forceRefresh ? 'force_refresh' : 'external_api_call',
        err.name === 'AbortError' ? 'timeout' : 'failed',
        latency
      );

      // Release lock and mark failed
      await supabase
        .from('courier_check_cache')
        .upsert(
          {
            phone: canonicalPhone,
            status: 'failed',
            last_error: errMsg,
            checking_status: 'idle',
            checking_started_at: null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'phone' }
        );

      return { success: false, error: errMsg };
    }
  },

  /**
   * Concurrency Lock: Prevents duplicate simultaneous API calls for the same phone
   */
  async claimCheckLock(phone: string): Promise<boolean> {
    try {
      const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();
      const { data } = await supabase
        .from('courier_check_cache')
        .select('checking_status, checking_started_at')
        .eq('phone', phone)
        .maybeSingle();

      if (data && data.checking_status === 'in_progress' && data.checking_started_at > fifteenSecondsAgo) {
        return false; // Lock active
      }

      await supabase
        .from('courier_check_cache')
        .upsert(
          {
            phone,
            checking_status: 'in_progress',
            checking_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'phone' }
        );

      return true;
    } catch {
      return true;
    }
  },

  /**
   * Associate an order with a courier cache record in Supabase
   */
  async associateOrderWithCache(orderIdOrNumber: string, cache: CourierCheckResult) {
    try {
      const updateData = {
        courier_check_id: cache.id,
        courier_success_ratio: cache.summary_success_ratio,
        courier_risk_level: cache.risk_level,
        courier_total_parcels: cache.summary_total_parcel
      };

      await supabase
        .from('orders')
        .update(updateData)
        .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`);
    } catch (err) {
      console.warn('associateOrderWithCache error:', err);
    }
  },

  /**
   * Log an API query or cache hit in audit logs
   */
  async logApiActivity(
    phone: string,
    orderId: string | undefined,
    source: 'cache_hit' | 'external_api_call' | 'force_refresh' | 'test_connection',
    status: 'success' | 'failed' | 'timeout' | 'no_data',
    latencyMs: number
  ) {
    try {
      await supabase.from('courier_api_logs').insert({
        phone,
        order_id: orderId || null,
        source,
        status,
        latency_ms: latencyMs
      });
    } catch {
      // ignore logging failures
    }
  },

  /**
   * Test Connection with BD Courier API using test phone number
   */
  async testConnection(apiKey: string, testPhone: string = '01711111111'): Promise<{ success: boolean; data?: any; error?: string }> {
    const canonicalPhone = normalizeBangladeshPhone(testPhone);
    const baseUrl = 'https://api.bdcourier.com';

    if (!apiKey.trim()) {
      return { success: false, error: 'Please enter a valid API Key.' };
    }

    try {
      const res = await fetch(`${baseUrl}/courier-check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: canonicalPhone })
      });

      if (res.status === 401 || res.status === 403) {
        return { success: false, error: 'Authentication failed. Invalid API Key provided.' };
      }

      if (!res.ok) {
        return { success: false, error: `BD Courier returned HTTP status ${res.status}.` };
      }

      const json = await res.json();
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to BD Courier endpoint.' };
    }
  },

  /**
   * Get API efficiency and cache hit stats
   */
  async getUsageStats(): Promise<{
    totalLookups: number;
    todayCalls: number;
    todayHits: number;
    hitRate: number;
  }> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('courier_api_logs')
        .select('source, created_at')
        .gte('created_at', todayStart.toISOString());

      const todayLogs = logs || [];
      const todayHits = todayLogs.filter(l => l.source === 'cache_hit').length;
      const todayCalls = todayLogs.filter(l => l.source === 'external_api_call' || l.source === 'force_refresh').length;
      const totalLookups = todayHits + todayCalls;
      const hitRate = totalLookups > 0 ? Number(((todayHits / totalLookups) * 100).toFixed(1)) : 100;

      return { totalLookups, todayCalls, todayHits, hitRate };
    } catch {
      return { totalLookups: 0, todayCalls: 0, todayHits: 0, hitRate: 100 };
    }
  }
};
