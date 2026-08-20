import { TrackingEvent } from '../types';

let metaInitialized = false;

/**
 * Initializes Meta Pixel snippet safely with advanced matching if enabled.
 */
export const initMetaPixel = (pixelId: string, advancedMatching: boolean = false, userData?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (!pixelId || metaInitialized) return;

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  if (window.fbq) {
    if (advancedMatching && userData) {
      window.fbq('init', pixelId, userData);
    } else {
      window.fbq('init', pixelId);
    }
    metaInitialized = true;
  }
};

/**
 * Maps standard Women Curator ecommerce events to standard Meta Pixel events.
 * Attaches the stable eventID for Meta CAPI deduplication.
 */
export const sendMetaEvent = (event: TrackingEvent) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

  const eventIdObj = { eventID: event.eventId };
  const ecommerce = event.ecommerce;

  switch (event.name) {
    case 'page_view':
      window.fbq('track', 'PageView', {}, eventIdObj);
      break;

    case 'view_item':
      window.fbq(
        'track',
        'ViewContent',
        {
          content_type: 'product',
          content_ids: ecommerce?.items?.map(i => i.item_id) || [],
          content_name: ecommerce?.items?.[0]?.item_name,
          content_category: ecommerce?.items?.[0]?.item_category,
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        eventIdObj
      );
      break;

    case 'add_to_cart':
      window.fbq(
        'track',
        'AddToCart',
        {
          content_type: 'product',
          content_ids: ecommerce?.items?.map(i => i.item_id) || [],
          content_name: ecommerce?.items?.[0]?.item_name,
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        eventIdObj
      );
      break;

    case 'begin_checkout':
      window.fbq(
        'track',
        'InitiateCheckout',
        {
          content_ids: ecommerce?.items?.map(i => i.item_id) || [],
          num_items: ecommerce?.items?.length || 1,
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        eventIdObj
      );
      break;

    case 'add_payment_info':
      window.fbq(
        'track',
        'AddPaymentInfo',
        {
          content_ids: ecommerce?.items?.map(i => i.item_id) || [],
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        eventIdObj
      );
      break;

    case 'purchase':
      window.fbq(
        'track',
        'Purchase',
        {
          content_type: 'product',
          content_ids: ecommerce?.items?.map(i => i.item_id) || [],
          num_items: ecommerce?.items?.reduce((sum, it) => sum + it.quantity, 0) || 1,
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        eventIdObj
      );
      break;

    case 'search':
      window.fbq(
        'track',
        'Search',
        {
          search_string: event.metadata?.search_term
        },
        eventIdObj
      );
      break;

    case 'add_to_wishlist':
      window.fbq(
        'track',
        'AddToWishlist',
        {
          content_ids: ecommerce?.items?.map(i => i.item_id) || [],
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        eventIdObj
      );
      break;

    case 'newsletter_signup':
      window.fbq('track', 'Lead', { content_name: 'Newsletter Subscription' }, eventIdObj);
      break;

    default:
      break;
  }
};
