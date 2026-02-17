/**
 * Shot Polish — License Management
 *
 * Usage:
 *   import { isPro, validateLicense, clearLicense, initLicense } from './license.js';
 */

const STORAGE_KEY   = 'sp_license_key';
const STORAGE_VALID = 'sp_license_valid';

// API base: same origin /api/ in production, or override via global
function apiBase() {
  if (typeof window !== 'undefined' && window.SHOTPOLISH_API_URL) {
    return window.SHOTPOLISH_API_URL.replace(/\/$/, '');
  }
  return window.location.origin + '/api';
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true if the user has an active Pro license in localStorage.
 */
export function isPro() {
  return localStorage.getItem(STORAGE_VALID) === 'true';
}

/**
 * Returns the stored license key, or null.
 */
export function getLicenseKey() {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Validates a license key against the Worker API.
 * On success, stores the key + valid flag in localStorage.
 * On failure, clears any stored key.
 *
 * @param {string} key
 * @returns {Promise<{ valid: boolean, email?: string, error?: string }>}
 */
export async function validateLicense(key) {
  try {
    const res = await fetch(`${apiBase()}/validate-license`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ key: key.trim().toUpperCase() }),
    });
    const data = await res.json();

    if (data.valid) {
      localStorage.setItem(STORAGE_KEY, key.trim().toUpperCase());
      localStorage.setItem(STORAGE_VALID, 'true');
    } else {
      clearLicense();
    }

    return data;
  } catch (err) {
    // Network error — keep existing status, return failure
    return { valid: false, error: `Network error: ${err.message}` };
  }
}

/**
 * Removes any stored license key and marks the user as free.
 */
export function clearLicense() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_VALID);
}

/**
 * On page load: silently re-validates the stored key in the background.
 * Does NOT block UI. If validation fails (network error) keeps the stored status.
 * If the API says the key is invalid, clears it.
 */
export async function initLicense() {
  const key = getLicenseKey();
  if (!key) return;

  try {
    const res = await fetch(`${apiBase()}/validate-license`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ key }),
    });
    const data = await res.json();

    if (data.valid) {
      localStorage.setItem(STORAGE_VALID, 'true');
    } else {
      // API explicitly says key is invalid — clear it
      clearLicense();
      // Notify account UI if present
      window.dispatchEvent(new CustomEvent('sp:license-changed'));
    }
  } catch {
    // Network error — leave existing status alone (offline tolerance)
  }
}
