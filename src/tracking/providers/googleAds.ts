import { TrackingEvent } from '../types';

/**
 * Google Ads Conversion Dispatcher
 * Strictly fires only for valid events and successful purchases.
 */
export const sendGoogleAdsConversion = (
  conversionId: string,
  conversionLabel: string,
  event: TrackingEvent
) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (!conversionId || !conversionLabel) return;

  const sendTo = `${conversionId}/${conversionLabel}`;

  if (event.name === 'purchase' && event.ecommerce) {
    window.gtag('event', 'conversion', {
      send_to: sendTo,
      value: event.ecommerce.value || 0,
      currency: event.ecommerce.currency || 'BDT',
      transaction_id: event.ecommerce.transaction_id
    });
  } else if (event.ecommerce) {
    window.gtag('event', 'conversion', {
      send_to: sendTo,
      value: event.ecommerce.value || 0,
      currency: event.ecommerce.currency || 'BDT'
    });
  }
};
