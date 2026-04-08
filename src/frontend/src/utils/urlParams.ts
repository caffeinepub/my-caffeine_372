/**
 * Utility functions for parsing and managing URL parameters.
 * Works with both hash-based and browser-based routing.
 */

export function getUrlParameter(paramName: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const regularParam = urlParams.get(paramName);
  if (regularParam !== null) return regularParam;

  const hash = window.location.hash;
  const queryStartIndex = hash.indexOf("?");
  if (queryStartIndex !== -1) {
    const hashQuery = hash.substring(queryStartIndex + 1);
    return new URLSearchParams(hashQuery).get(paramName);
  }
  return null;
}

export function storeSessionParameter(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

export function getSessionParameter(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getSecretParameter(paramName: string): string | null {
  return getSessionParameter(paramName);
}
