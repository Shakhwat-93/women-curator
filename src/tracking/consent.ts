import { ConsentState } from './types';
import { pushDataLayer } from './dataLayer';

const CONSENT_STORAGE_KEY = 'women_curator_cookie_consent';

export const defaultConsentState: ConsentState = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted'
};

export const initConsentMode = (enabled: boolean = false) => {
  if (typeof window === 'undefined') return;

  if (!enabled) {
    // If consent mode is disabled by admin, set all to granted
    updateConsent(defaultConsentState);
    return;
  }

  const stored = getStoredConsent();
  updateConsent(stored || defaultConsentState);
};

export const updateConsent = (consent: ConsentState) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (e) {
    console.warn('Failed to save consent state:', e);
  }

  // Push Google Consent Mode v2 update to dataLayer
  pushDataLayer({
    event: 'consent_update',
    ...consent
  });
};

export const getStoredConsent = (): ConsentState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
