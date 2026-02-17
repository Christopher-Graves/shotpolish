/**
 * Shot Polish — Main Application
 * Vite + Vanilla JS — Client-side only
 */

import { GRADIENTS, SOLID_COLORS, MESH_GRADIENTS } from './presets.js';
import { drawFrameUnder, drawFrameOver } from './frames.js';
import { exportPNG } from './export.js';
import { isPro, initLicense } from './license.js';
import { showProModal, renderAccountWidget } from './pro.js';

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  image: null,       // HTMLImageElement
  bgType: 'gradient',

  // Gradient
  gradientPreset: 2,
  gradFrom: '#06b6d4',
  gradTo: '#3b82f6',
  gradAngle: 135,

  // Solid
  solidColor: '#0f172a',
  solidPreset: -1,

  // Mesh
  meshPreset: 0,

  // Controls
  padding: 60,
  radius: 12,

  // Shadow
  shadowEnabled: true,
  shadowBlur: 40,
  shadowY: 16,
  shadowOpacity: 40,

  // Frame
  frame: 'none',
  browserUrl: 'https://example.com',

  // Canvas
  ratio: 'auto',
  exportScale: 2,
};

// ─── DOM Refs ─────────────────────────────────────────────────────────────────

const uploadArea     = document.getElementById('uploadArea');
const fileInput      = document.getElementById('fileInput');
const uploadBtn      = document.getElementById('uploadBtn');
const emptyUploadBtn = document.getElementById('emptyUploadBtn');
const emptyState     = document.getElementById('emptyState');
const outputCanvas   = document.getElementById('outputCanvas');
const exportBtn      = document.getElementById('exportBtn');
const previewLabel   = document.getElementById('previewLabel');

// Gradient
const gradientGrid = document.getElementById('gradientGrid');
const gradFrom     = document.getElementById('gradFrom');
const gradTo       = document.getElementById('gradTo');
const gradAngle    = document.getElementById('gradAngle');
const gradAngleVal = document.getElementById('gradAngleVal');

// Solid
const solidPresets = document.getElementById('solidPresets');
const solidColor   = document.getElementById('solidColor');

// Mesh
const meshGrid = document.getElementById('meshGrid');

// Sliders
const paddingSlider    = document.getElementById('paddingSlider');
const paddingVal       = document.getElementById('paddingVal');
const radiusSlider     = document.getElementById('radiusSlider');
const radiusVal        = document.getElementById('radiusVal');
const shadowToggle     = document.getElementById('shadowToggle');
const shadowControls   = document.getElementById('shadowControls');
const shadowBlurEl     = document.getElementById('shadowBlur');
const shadowBlurVal    = document.getElementById('shadowBlurVal');
const shadowYEl        = document.getElementById('shadowY');
const shadowYVal       = document.getElementById('shadowYVal');
const shadowOpacityEl  = document.getElementById('shadowOpacity');
const shadowOpacityVal = document.getElementById('shadowOpacityVal');

// Frame
const frameBtns      = document.querySelectorAll('.frame-btn');
const browserUrlBar  = document.getElementById('browserUrlBar');
const browserUrlInput = document.getElementById('browserUrl');

// Ratio
const ratioBtns = document.querySelectorAll('.ratio-btn');

// Scale
const scaleBtns = document.querySelectorAll('.scale-btn');

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  buildGradientGrid();
  buildSolidPresets();
  buildMeshGrid();
  bindEvents();
  updateShadowVisibility();

  // Account widget
  renderAccountWidget();
  window.addEventListener('sp:license-changed', () => {
    renderAccountWidget();
    // Re-render canvas in case watermark status changed
    render();
  });

  // Silent background license check
  initLicense();

  // Handle post-checkout success redirect
  if (new URLSearchParams(window.location.search).get('activated') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => {
      alert('🎉 Welcome to Shot Polish Pro! Your license has been activated.');
      renderAccountWidget();
    }, 300);
  }
}

// ─── Presets Builders ─────────────────────────────────────────────────────────

function buildGradientGrid() {
  GRADIENTS.forEach((g, i) => {
    const el = document.createElement('button');
    el.className = 'gradient-swatch' + (i === state.gradientPreset ? ' active' : '');
    el.style.background = g.css;
    el.title = g.name;
    el.addEventListener('click', () => {
      document.querySelectorAll('.gradient-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      state.gradientPreset = i;
      state.gradFrom = g.from;
      state.gradTo   = g.to;
      state.gradAngle = g.angle ?? 135;
      gradFrom.value = g.from;
      gradTo.value   = g.to;
      gradAngle.value = g.angle ?? 135;
      gradAngleVal.textContent = `${state.gradAngle}°`;
      render();
    });
    gradientGrid.appendChild(el);
  });
}

function buildSolidPresets() {
  SOLID_COLORS.forEach((c, i) => {
    const el = document.createElement('button');
    el.className = 'solid-swatch';
    el.style.background = c;
    el.title = c;
    el.addEventListener('click', () => {
      document.querySelectorAll('.solid-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      state.solidColor = c;
      solidColor.value = c;
      render();
    });
    solidPresets.appendChild(el);
  });
}

function buildMeshGrid() {
  MESH_GRADIENTS.forEach((g, i) => {
    const el = document.createElement('button');
    el.className = 'mesh-swatch' + (i === 0 ? ' active' : '');
    el.style.background = g.css;
    el.title = g.name;
    el.addEventListener('click', () => {
      document.querySelectorAll('.mesh-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      state.meshPreset = i;
      render();
    });
    meshGrid.appendChild(el);
  });
}

// ─── Event Bindings ───────────────────────────────────────────────────────────

function bindEvents() {

  // ── Upload ──
  uploadBtn.addEventListener('click', () => fileInput.click());
  emptyUploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => loadImageFile(e.target.files[0]));
  uploadArea.addEventListener('click', e => {
    if (e.target === uploadBtn) return;
    fileInput.click();
  });

  // Drag & Drop on upload area
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImageFile(file);
  });

  // Global drag overlay
  const dragOverlay = createDragOverlay();
  document.addEventListener('dragenter', e => {
    if (e.dataTransfer.types.includes('Files')) dragOverlay.classList.add('active');
  });
  document.addEventListener('dragleave', e => {
    if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
      dragOverlay.classList.remove('active');
    }
  });
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    dragOverlay.classList.remove('active');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImageFile(file);
  });

  // Clipboard paste
  document.addEventListener('paste', e => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        loadImageFile(item.getAsFile());
        break;
      }
    }
  });

  // ── Background Tabs ──
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tab = btn.dataset.tab;

      // Gate: Mesh tab requires Pro
      if (tab === 'mesh' && !isPro()) {
        const activated = await showProModal('Mesh Backgrounds');
        if (!activated) return;
        renderAccountWidget();
      }

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
      state.bgType = tab;
      render();
    });
  });

  // ── Gradient Controls ──
  gradFrom.addEventListener('input', e => { state.gradFrom = e.target.value; clearGradientPreset(); render(); });
  gradTo.addEventListener('input',   e => { state.gradTo   = e.target.value; clearGradientPreset(); render(); });
  gradAngle.addEventListener('input', e => {
    state.gradAngle = parseInt(e.target.value);
    gradAngleVal.textContent = `${state.gradAngle}°`;
    render();
  });

  // ── Solid Color ──
  solidColor.addEventListener('input', e => {
    state.solidColor = e.target.value;
    document.querySelectorAll('.solid-swatch').forEach(s => s.classList.remove('active'));
    render();
  });

  // ── Padding ──
  paddingSlider.addEventListener('input', e => {
    state.padding = parseInt(e.target.value);
    paddingVal.textContent = `${state.padding}px`;
    render();
  });

  // ── Radius ──
  radiusSlider.addEventListener('input', e => {
    state.radius = parseInt(e.target.value);
    radiusVal.textContent = `${state.radius}px`;
    render();
  });

  // ── Shadow ──
  shadowToggle.addEventListener('change', () => {
    state.shadowEnabled = shadowToggle.checked;
    updateShadowVisibility();
    render();
  });
  shadowBlurEl.addEventListener('input', e => {
    state.shadowBlur = parseInt(e.target.value);
    shadowBlurVal.textContent = state.shadowBlur;
    render();
  });
  shadowYEl.addEventListener('input', e => {
    state.shadowY = parseInt(e.target.value);
    shadowYVal.textContent = state.shadowY;
    render();
  });
  shadowOpacityEl.addEventListener('input', e => {
    state.shadowOpacity = parseInt(e.target.value);
    shadowOpacityVal.textContent = `${state.shadowOpacity}%`;
    render();
  });

  // ── Frame ──
  frameBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const frame = btn.dataset.frame;

      // Gate: device frames (browser, macbook, iphone) require Pro
      if (frame !== 'none' && !isPro()) {
        const activated = await showProModal('Device Frames');
        if (!activated) return;
        renderAccountWidget();
      }

      frameBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.frame = frame;
      browserUrlBar.classList.toggle('hidden', state.frame !== 'browser');
      render();
    });
  });
  browserUrlInput.addEventListener('input', e => {
    state.browserUrl = e.target.value;
    render();
  });

  // ── Ratio ──
  ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.ratio = btn.dataset.ratio;
      render();
    });
  });

  // ── Export Scale ──
  scaleBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const scale = parseInt(btn.dataset.scale);

      // Gate: 2× and 3× require Pro
      if (scale > 1 && !isPro()) {
        const activated = await showProModal(`${scale}× Export Scale`);
        if (!activated) return;
        renderAccountWidget();
      }

      scaleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.exportScale = scale;
    });
  });

  // ── Export ──
  exportBtn.addEventListener('click', () => {
    if (!state.image) return;
    exportPNG(state, drawFullCanvas);
  });
}

function createDragOverlay() {
  const el = document.createElement('div');
  el.className = 'drag-overlay';
  el.innerHTML = '<div class="drag-overlay-text">📸 Drop image to beautify</div>';
  document.body.appendChild(el);
  return el;
}

function clearGradientPreset() {
  document.querySelectorAll('.gradient-swatch').forEach(s => s.classList.remove('active'));
  state.gradientPreset = -1;
}

function updateShadowVisibility() {
  shadowControls.style.opacity = state.shadowEnabled ? '1' : '0.4';
  shadowControls.style.pointerEvents = state.shadowEnabled ? 'auto' : 'none';
}

// ─── Image Loading ────────────────────────────────────────────────────────────

function loadImageFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      emptyState.classList.add('hidden');
      outputCanvas.classList.remove('hidden');
      exportBtn.disabled = false;
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── Canvas Render ────────────────────────────────────────────────────────────

function getCanvasDimensions() {
  const img = state.image;
  const pad = state.padding;

  // Base dimensions include the frame wrapper (if any)
  let imgW = img.width;
  let imgH = img.height;

  // Account for frame size
  const frameMargins = getFrameMargins();
  const contentW = imgW + frameMargins.left + frameMargins.right;
  const contentH = imgH + frameMargins.top + frameMargins.bottom;

  let canvasW = contentW + pad * 2;
  let canvasH = contentH + pad * 2;

  // Apply aspect ratio if set
  if (state.ratio !== 'auto') {
    const [rw, rh] = state.ratio.split(':').map(Number);
    const targetRatio = rw / rh;
    const currentRatio = canvasW / canvasH;

    if (currentRatio > targetRatio) {
      canvasH = Math.round(canvasW / targetRatio);
    } else {
      canvasW = Math.round(canvasH * targetRatio);
    }
  }

  return { canvasW, canvasH, imgW, imgH, contentW, contentH, frameMargins };
}

function getFrameMargins() {
  switch (state.frame) {
    case 'browser':  return { top: 42, right: 0, bottom: 0, left: 0 };
    case 'macbook':  return { top: 36, right: 24, bottom: 54, left: 24 };
    case 'iphone':   return { top: 60, right: 18, bottom: 60, left: 18 };
    default:         return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}

function drawFullCanvas(canvas, scale = 1) {
  const { canvasW, canvasH, imgW, imgH, contentW, contentH, frameMargins } = getCanvasDimensions();

  canvas.width  = canvasW * scale;
  canvas.height = canvasH * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // ── Background ──
  drawBackground(ctx, canvasW, canvasH);

  // ── Centered image position ──
  const x = (canvasW - contentW) / 2;
  const y = (canvasH - contentH) / 2;

  // ── Drop Shadow ──
  if (state.shadowEnabled) {
    const alpha = state.shadowOpacity / 100;
    ctx.save();
    ctx.shadowColor   = `rgba(0,0,0,${alpha})`;
    ctx.shadowBlur    = state.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = state.shadowY;

    // Use a solid black rect so the shadow is actually visible.
    // The image drawn on top will cover this rect.
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    drawRoundRect(ctx, x + frameMargins.left, y + frameMargins.top, imgW, imgH, state.radius);
    ctx.fill();
    ctx.restore();
  }

  // ── Device Frame body (under image) ──
  // Macbook and iPhone bezels are drawn FIRST so the image covers the screen area.
  if (state.frame !== 'none') {
    drawFrameUnder(ctx, state.frame, x, y, contentW, contentH, imgW, imgH, frameMargins, state, scale);
  }

  // ── Image with rounded corners ──
  ctx.save();
  ctx.beginPath();
  drawRoundRect(ctx, x + frameMargins.left, y + frameMargins.top, imgW, imgH, state.radius);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(state.image, x + frameMargins.left, y + frameMargins.top, imgW, imgH);
  ctx.restore();

  // ── Device Frame overlays (over image) ──
  // Browser title bar, camera notch, dynamic island, home bar, screen glow, etc.
  if (state.frame !== 'none') {
    drawFrameOver(ctx, state.frame, x, y, contentW, contentH, imgW, imgH, frameMargins, state, scale);
  }
}

function drawBackground(ctx, w, h) {
  switch (state.bgType) {
    case 'gradient': {
      const rad = (state.gradAngle * Math.PI) / 180;
      const cx = w / 2;
      const cy = h / 2;
      const len = Math.sqrt(w * w + h * h) / 2;
      const x0 = cx - Math.cos(rad) * len;
      const y0 = cy - Math.sin(rad) * len;
      const x1 = cx + Math.cos(rad) * len;
      const y1 = cy + Math.sin(rad) * len;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, state.gradFrom);
      grad.addColorStop(1, state.gradTo);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'solid':
      ctx.fillStyle = state.solidColor;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'mesh': {
      const mg = MESH_GRADIENTS[state.meshPreset];
      drawMeshBackground(ctx, w, h, mg);
      break;
    }
    case 'transparent':
      // clear — transparent PNG
      ctx.clearRect(0, 0, w, h);
      break;
  }
}

function drawMeshBackground(ctx, w, h, mg) {
  // Base fill
  ctx.fillStyle = mg.base;
  ctx.fillRect(0, 0, w, h);

  // Radial gradient blobs
  mg.blobs.forEach(b => {
    const gx = ctx.createRadialGradient(
      w * b.cx, h * b.cy, 0,
      w * b.cx, h * b.cy, Math.max(w, h) * b.r
    );
    gx.addColorStop(0, b.color + 'cc');
    gx.addColorStop(1, b.color + '00');
    ctx.fillStyle = gx;
    ctx.fillRect(0, 0, w, h);
  });
}

function drawRoundRect(ctx, x, y, w, h, r) {
  if (r <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
}

// ─── Live Preview Render ───────────────────────────────────────────────────────

let rafId = null;

function render() {
  if (!state.image) return;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    drawFullCanvas(outputCanvas, 1);
    const { canvasW, canvasH } = getCanvasDimensions();
    previewLabel.textContent = `Preview: ${canvasW} × ${canvasH}px  (export will be ${canvasW * state.exportScale} × ${canvasH * state.exportScale}px @ ${state.exportScale}×)`;
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

init();

// Export for export.js
export { drawFullCanvas, state, getCanvasDimensions };
