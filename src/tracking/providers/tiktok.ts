import { TrackingEvent } from '../types';

let tiktokInitialized = false;

/**
 * Initializes TikTok Pixel snippet safely.
 */
export const initTikTokPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;
  if (!pixelId || tiktokInitialized) return;

  /* eslint-disable */
  (function (w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie'
    ];
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: any) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e: any, n: any) {
      var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var o = d.createElement('script');
      o.type = 'text/javascript';
      o.async = !0;
      o.src = i + '?sdkid=' + e + '&lib=' + t;
      var a = d.getElementsByTagName('script')[0];
      a.parentNode.insertBefore(o, a);
    };
  })(window, document, 'ttq');
  /* eslint-enable */

  if (window.ttq) {
    window.ttq.load(pixelId);
    window.ttq.page();
    tiktokInitialized = true;
  }
};

/**
 * Maps standard Women Curator ecommerce events to standard TikTok Pixel events.
 * Passes event_id for TikTok Events API deduplication.
 */
export const sendTikTokEvent = (event: TrackingEvent) => {
  if (typeof window === 'undefined' || !window.ttq || typeof window.ttq.track !== 'function') return;

  const ecommerce = event.ecommerce;
  const options = { event_id: event.eventId };

  switch (event.name) {
    case 'page_view':
      window.ttq.page();
      break;

    case 'view_item':
      window.ttq.track(
        'ViewContent',
        {
          contents: ecommerce?.items?.map(i => ({
            content_id: i.item_id,
            content_name: i.item_name,
            content_category: i.item_category,
            price: i.price,
            quantity: i.quantity
          })),
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        options
      );
      break;

    case 'add_to_cart':
      window.ttq.track(
        'AddToCart',
        {
          contents: ecommerce?.items?.map(i => ({
            content_id: i.item_id,
            content_name: i.item_name,
            price: i.price,
            quantity: i.quantity
          })),
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        options
      );
      break;

    case 'begin_checkout':
      window.ttq.track(
        'InitiateCheckout',
        {
          contents: ecommerce?.items?.map(i => ({
            content_id: i.item_id,
            content_name: i.item_name,
            price: i.price,
            quantity: i.quantity
          })),
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        options
      );
      break;

    case 'add_payment_info':
      window.ttq.track(
        'AddPaymentInfo',
        {
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        options
      );
      break;

    case 'purchase':
      window.ttq.track(
        'CompletePayment',
        {
          contents: ecommerce?.items?.map(i => ({
            content_id: i.item_id,
            content_name: i.item_name,
            price: i.price,
            quantity: i.quantity
          })),
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        options
      );
      break;

    case 'search':
      window.ttq.track(
        'Search',
        {
          query: event.metadata?.search_term
        },
        options
      );
      break;

    case 'add_to_wishlist':
      window.ttq.track(
        'AddToWishlist',
        {
          contents: ecommerce?.items?.map(i => ({
            content_id: i.item_id,
            content_name: i.item_name,
            price: i.price
          })),
          value: ecommerce?.value,
          currency: ecommerce?.currency || 'BDT'
        },
        options
      );
      break;

    default:
      break;
  }
};
