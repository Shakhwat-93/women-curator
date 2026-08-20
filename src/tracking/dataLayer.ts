/**
 * Safe Single DataLayer Initialization and Dispatcher
 * Adheres to GTM / GA4 Enhanced Ecommerce Specification
 */

export const initDataLayer = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

export const pushDataLayer = (payload: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  // Reset ecommerce object to avoid event contamination in GTM
  if (payload.ecommerce) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push(payload);
};
