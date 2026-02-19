/**
 * Shot Polish — Pro Upgrade Modal
 *
 * Usage:
 *   import { showProModal } from './pro.js';
 *   const activated = await showProModal('Device Frames');
 */

import { validateLicense, isPro, clearLicense, getLicenseKey } from './license.js';

// Stripe Price IDs — set via env vars VITE_STRIPE_PRICE_MONTHLY and VITE_STRIPE_PRICE_LIFETIME
const PRICE_MONTHLY  = __STRIPE_PRICE_MONTHLY__  || '';
const PRICE_LIFETIME = __STRIPE_PRICE_LIFETIME__ || '';

function apiBase() {
  if (typeof window !== 'undefined' && window.SHOTPOLISH_API_URL) {
    return window.SHOTPOLISH_API_URL.replace(/\/$/, '');
  }
  return window.location.origin + '/api';
}

// ─── Pro Modal ─────────────────────────────────────────────────────────────────

let modalResolve = null;

/**
 * Show the Pro upgrade modal.
 * @param {string} featureName — Name of the Pro feature the user tried to use
 * @returns {Promise<boolean>} — Resolves true if user activates Pro, false if dismissed
 */
export function showProModal(featureName = 'This feature') {
  return new Promise(resolve => {
    modalResolve = resolve;
    renderModal(featureName);
  });
}

function resolveModal(activated) {
  if (modalResolve) {
    modalResolve(activated);
    modalResolve = null;
  }
  destroyModal();
}

function destroyModal() {
  const existing = document.getElementById('sp-pro-modal-overlay');
  if (existing) existing.remove();
}

function renderModal(featureName) {
  destroyModal();

  const overlay = document.createElement('div');
  overlay.id = 'sp-pro-modal-overlay';
  overlay.innerHTML = `
    <div class="sp-modal" id="sp-pro-modal" role="dialog" aria-modal="true" aria-labelledby="sp-modal-title">
      <button class="sp-modal-close" id="sp-modal-close" aria-label="Close">✕</button>

      <div class="sp-modal-header">
        <div class="sp-pro-badge-large">PRO</div>
        <h2 class="sp-modal-title" id="sp-modal-title">${featureName} is a Pro feature</h2>
        <p class="sp-modal-sub">Unlock all Pro features with a one-time $29 payment.</p>
      </div>

      <div class="sp-modal-body">

        <!-- Pricing options -->
        <div class="sp-pricing-row">
          <button class="sp-upgrade-btn sp-upgrade-lifetime" id="sp-upgrade-lifetime" style="width:100%;max-width:320px;">
            <span class="sp-upgrade-label">Lifetime License ✦</span>
            <span class="sp-upgrade-price">$29</span>
            <span class="sp-upgrade-period" style="font-size:12px;opacity:0.7;">One-time payment · No renewal</span>
          </button>
        </div>

        <div class="sp-modal-divider">
          <span>or enter existing license key</span>
        </div>

        <!-- License key entry -->
        <div class="sp-key-form">
          <input
            type="text"
            class="sp-key-input"
            id="sp-key-input"
            placeholder="SP-XXXX-XXXX-XXXX-XXXX"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="sp-key-validate-btn" id="sp-key-validate">Activate</button>
        </div>
        <div class="sp-key-status" id="sp-key-status"></div>

        <!-- Pro features list -->
        <ul class="sp-pro-features">
          <li>✓ No watermark on exports</li>
          <li>✓ 2× and 3× export scale</li>
          <li>✓ Device frames (Browser, MacBook, iPhone)</li>
          <li>✓ Mesh / blob backgrounds</li>
          <li>✓ Batch processing <span class="sp-coming-soon">soon</span></li>
          <li>✓ App store template sizes <span class="sp-coming-soon">soon</span></li>
        </ul>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Wire events
  document.getElementById('sp-modal-close').addEventListener('click', () => resolveModal(false));
  overlay.addEventListener('click', e => { if (e.target === overlay) resolveModal(false); });
  document.addEventListener('keydown', onEscKey);

  document.getElementById('sp-upgrade-lifetime').addEventListener('click', () => startCheckout(PRICE_LIFETIME));

  const keyInput    = document.getElementById('sp-key-input');
  const validateBtn = document.getElementById('sp-key-validate');
  const statusEl    = document.getElementById('sp-key-status');

  // Format input as SP-XXXX-XXXX-XXXX-XXXX while typing
  keyInput.addEventListener('input', () => {
    let val = keyInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.startsWith('SP')) val = val.slice(2);
    const chunks = [];
    for (let i = 0; i < Math.min(val.length, 16); i += 4) {
      chunks.push(val.slice(i, i + 4));
    }
    const formatted = chunks.length ? 'SP-' + chunks.join('-') : keyInput.value;
    keyInput.value = formatted;
    statusEl.textContent = '';
    statusEl.className = 'sp-key-status';
  });

  keyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') validateBtn.click();
  });

  validateBtn.addEventListener('click', async () => {
    const key = keyInput.value.trim();
    if (!key) { statusEl.textContent = 'Please enter your license key.'; return; }

    validateBtn.disabled = true;
    validateBtn.textContent = 'Checking…';
    statusEl.textContent = '';
    statusEl.className = 'sp-key-status';

    const result = await validateLicense(key);

    if (result.valid) {
      statusEl.textContent = '✓ License activated! Welcome to Pro.';
      statusEl.className = 'sp-key-status sp-key-success';
      window.dispatchEvent(new CustomEvent('sp:license-changed'));
      setTimeout(() => resolveModal(true), 900);
    } else {
      statusEl.textContent = result.error || 'Invalid license key. Please check and try again.';
      statusEl.className = 'sp-key-status sp-key-error';
      validateBtn.disabled = false;
      validateBtn.textContent = 'Activate';
    }
  });

  // Focus key input
  setTimeout(() => keyInput.focus(), 50);
}

function onEscKey(e) {
  if (e.key === 'Escape') {
    document.removeEventListener('keydown', onEscKey);
    resolveModal(false);
  }
}

async function startCheckout(priceId) {
  try {
    const btn = document.getElementById('sp-upgrade-lifetime');
    if (btn) { btn.disabled = true; btn.textContent = 'Redirecting…'; }

    const res = await fetch(`${apiBase()}/create-checkout`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/?activated=1`,
        cancelUrl:  window.location.href,
      }),
    });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || 'Could not start checkout. Please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Lifetime License ✦ — $29'; }
    }
  } catch (err) {
    alert('Network error. Please try again.');
  }
}

// ─── Account Dropdown ──────────────────────────────────────────────────────────

/**
 * Renders the account status widget in the nav bar.
 * Called by main.js on init and after license changes.
 */
export function renderAccountWidget() {
  const container = document.getElementById('sp-account-widget');
  if (!container) return;

  if (isPro()) {
    const key = getLicenseKey() || '';
    const masked = key.length > 7
      ? key.slice(0, 6) + '·'.repeat(key.length - 10) + key.slice(-4)
      : key;

    container.innerHTML = `
      <button class="sp-account-btn sp-account-pro" id="sp-account-toggle" aria-haspopup="true">
        <span class="sp-nav-pro-badge">PRO</span>
        <span>Account</span>
        <span class="sp-account-chevron">▾</span>
      </button>
      <div class="sp-account-dropdown hidden" id="sp-account-dropdown">
        <div class="sp-account-row sp-account-key">
          <span class="sp-account-label">License</span>
          <span class="sp-account-value sp-key-mono">${masked}</span>
        </div>
        <button class="sp-account-action sp-account-deactivate" id="sp-deactivate-btn">
          Deactivate / Change key
        </button>
      </div>
    `;

    document.getElementById('sp-account-toggle').addEventListener('click', toggleAccountDropdown);
    document.getElementById('sp-deactivate-btn').addEventListener('click', () => {
      if (confirm('Deactivate your Pro license on this device?')) {
        clearLicense();
        window.dispatchEvent(new CustomEvent('sp:license-changed'));
      }
    });
  } else {
    container.innerHTML = `
      <button class="sp-account-btn sp-account-free" id="sp-account-toggle" aria-haspopup="true">
        <span>Free Plan</span>
        <span class="sp-account-chevron">▾</span>
      </button>
      <div class="sp-account-dropdown hidden" id="sp-account-dropdown">
        <div class="sp-account-row">
          <span class="sp-account-label">Plan</span>
          <span class="sp-account-value">Free</span>
        </div>
        <button class="sp-account-action sp-account-upgrade" id="sp-upgrade-nav-btn">
          ✦ Upgrade to Pro — $29
        </button>
      </div>
    `;

    document.getElementById('sp-account-toggle').addEventListener('click', toggleAccountDropdown);
    document.getElementById('sp-upgrade-nav-btn').addEventListener('click', async () => {
      closeAccountDropdown();
      const activated = await showProModal('Shot Polish Pro');
      if (activated) renderAccountWidget();
    });
  }
}

function toggleAccountDropdown() {
  const dd = document.getElementById('sp-account-dropdown');
  if (!dd) return;
  const isHidden = dd.classList.contains('hidden');
  if (isHidden) {
    dd.classList.remove('hidden');
    document.addEventListener('click', closeOnOutsideClick, { once: false });
  } else {
    closeAccountDropdown();
  }
}

function closeAccountDropdown() {
  const dd = document.getElementById('sp-account-dropdown');
  if (dd) dd.classList.add('hidden');
  document.removeEventListener('click', closeOnOutsideClick);
}

function closeOnOutsideClick(e) {
  const widget = document.getElementById('sp-account-widget');
  if (widget && !widget.contains(e.target)) {
    closeAccountDropdown();
  }
}
