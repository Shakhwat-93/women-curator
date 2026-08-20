import { initDataLayer } from '../dataLayer';

let gtmInitialized = false;
let currentContainerId = '';

/**
 * Loads Google Tag Manager container dynamically based on admin configuration.
 * Prevents multiple container insertions.
 */
export const initGTM = (containerId: string) => {
  if (typeof window === 'undefined') return;
  if (!containerId || !containerId.startsWith('GTM-')) return;
  if (gtmInitialized && currentContainerId === containerId) return;

  initDataLayer();

  // Check if GTM script element already exists in DOM
  const existingScript = document.getElementById('gtm-script');
  if (existingScript) return;

  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;

  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  gtmInitialized = true;
  currentContainerId = containerId;
};
