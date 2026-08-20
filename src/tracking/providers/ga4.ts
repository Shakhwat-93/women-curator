import { TrackingEvent } from '../types';

let ga4Initialized = false;

/**
 * Direct GA4 initialization fallback if GTM is disabled.
 * If GTM is enabled, all GA4 events are handled through dataLayer -> GTM to prevent duplicates.
 */
export const initGA4 = (measurementId: string, debugMode: boolean = false) => {
  if (typeof window === 'undefined') return;
  if (!measurementId || !measurementId.startsWith('G-')) return;
  if (ga4Initialized) return;

  const script = document.createElement('script');
  script.id = 'ga4-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    debug_mode: debugMode,
    send_page_view: false // Managed manually via central router
  });

  ga4Initialized = true;
};

export const sendGA4Event = (event: TrackingEvent) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event.name, {
      ...event.ecommerce,
      ...event.metadata,
      event_id: event.eventId
    });
  }
};
