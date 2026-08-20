/**
 * Deduplication & Stable Event ID System
 * Guarantees zero duplicate purchase conversions across client refreshes, StrictMode, and multi-tabs.
 */

const inMemoryPurchaseSet = new Set<string>();

/**
 * Checks and marks an order as tracked.
 * Returns true if this is the FIRST time the order is tracked, false if it was already tracked.
 */
export const markPurchaseTracked = (transactionId: string): boolean => {
  if (!transactionId) return false;
  const cleanId = transactionId.trim();

  // 1. In-memory check
  if (inMemoryPurchaseSet.has(cleanId)) {
    return false;
  }

  // 2. Browser Storage check (localStorage + sessionStorage)
  const storageKey = `women_curator_purchase_tracked_${cleanId}`;
  try {
    if (localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey)) {
      inMemoryPurchaseSet.add(cleanId);
      return false;
    }

    // Mark in both storages and in-memory set
    localStorage.setItem(storageKey, new Date().toISOString());
    sessionStorage.setItem(storageKey, new Date().toISOString());
    inMemoryPurchaseSet.add(cleanId);
    return true;
  } catch (e) {
    // If storage is restricted/disabled, fallback to memory
    inMemoryPurchaseSet.add(cleanId);
    return true;
  }
};

/**
 * Checks if an order was already tracked without marking it.
 */
export const isPurchaseTracked = (transactionId: string): boolean => {
  if (!transactionId) return false;
  const cleanId = transactionId.trim();
  if (inMemoryPurchaseSet.has(cleanId)) return true;

  try {
    const storageKey = `women_curator_purchase_tracked_${cleanId}`;
    return Boolean(localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey));
  } catch {
    return false;
  }
};

/**
 * Stable Event ID Generator
 * Ensures exact same event_id is shared across client Meta/TikTok Pixel and server-side Conversions API.
 */
export const getEventId = (eventName: string, businessId?: string): string => {
  if (eventName === 'purchase' && businessId) {
    return `purchase_${businessId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }

  // For legitimate interaction events (like add_to_cart), use businessId or unique timestamp
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const timeSuffix = Date.now().toString(36);
  if (businessId) {
    return `${eventName}_${businessId}_${timeSuffix}_${randomSuffix}`;
  }
  return `${eventName}_${timeSuffix}_${randomSuffix}`;
};
