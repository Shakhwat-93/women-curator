import { UtmAttribution } from './types';

const UTM_FIRST_TOUCH_KEY = 'women_curator_utm_first_touch';
const UTM_LAST_TOUCH_KEY = 'women_curator_utm_last_touch';

/**
 * Parses query parameters and captures UTM + Click IDs (gclid, fbclid, ttclid).
 * Preserves both First-Touch and Last-Touch attribution models safely.
 */
export const captureUtmParameters = (): UtmAttribution => {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const hasUtm =
      params.has('utm_source') ||
      params.has('utm_medium') ||
      params.has('utm_campaign') ||
      params.has('gclid') ||
      params.has('fbclid') ||
      params.has('ttclid');

    if (!hasUtm) {
      return getStoredAttribution();
    }

    const current: UtmAttribution = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
      gclid: params.get('gclid') || undefined,
      fbclid: params.get('fbclid') || undefined,
      ttclid: params.get('ttclid') || undefined,
      landing_page: window.location.pathname,
      first_seen_at: new Date().toISOString()
    };

    // 1. Store First-Touch if not set yet
    if (!localStorage.getItem(UTM_FIRST_TOUCH_KEY)) {
      localStorage.setItem(UTM_FIRST_TOUCH_KEY, JSON.stringify(current));
    }

    // 2. Always update Last-Touch
    localStorage.setItem(UTM_LAST_TOUCH_KEY, JSON.stringify(current));
    sessionStorage.setItem(UTM_LAST_TOUCH_KEY, JSON.stringify(current));

    return current;
  } catch (e) {
    console.warn('Failed to capture UTM parameters:', e);
    return {};
  }
};

/**
 * Returns the effective attribution for order creation (Last-Touch preferred, fallback to First-Touch).
 */
export const getStoredAttribution = (): UtmAttribution => {
  if (typeof window === 'undefined') return {};
  try {
    const lastTouch = sessionStorage.getItem(UTM_LAST_TOUCH_KEY) || localStorage.getItem(UTM_LAST_TOUCH_KEY);
    if (lastTouch) return JSON.parse(lastTouch);

    const firstTouch = localStorage.getItem(UTM_FIRST_TOUCH_KEY);
    if (firstTouch) return JSON.parse(firstTouch);
  } catch (e) {
    console.warn('Error reading stored attribution:', e);
  }
  return {};
};
