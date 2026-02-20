/**
 * Shot Polish — Device Frame Renderers
 * Realistic device mockups drawn with Canvas 2D API (no external images)
 *
 * Frames are split into two phases:
 *  drawFrameUnder — device body drawn BEFORE the screenshot image
 *  drawFrameOver  — overlays drawn AFTER the screenshot image (notch, buttons, etc.)
 */

// ─── Frame PNG Image Loading ──────────────────────────────────────────────────

const FRAME_SPECS = {
  macbook: {
    path: '/frames/MacBook Pro 16.png',
    totalW: 4340,
    totalH: 2860,
    screenX: 443,
    screenY: 378,
    screenW: 3454,
    screenH: 2168,
  },
  iphone: {
    path: '/frames/iPhone 16 Pro Max - Black Titanium.png',
    totalW: 1520,
    totalH: 3068,
    screenX: 100,
    screenY: 251,
    screenW: 1320,
    screenH: 2717,
  }
};

const frameImages = {};
const imageLoaders = [];

for (const [key, spec] of Object.entries(FRAME_SPECS)) {
  const img = new Image();
  const promise = new Promise((resolve, reject) => {
    img.onload = () => resolve(key);
    img.onerror = () => reject(new Error(`Failed to load ${spec.path}`));
  });
  img.src = spec.path;
  frameImages[key] = img;
  imageLoaders.push(promise);
}

export const frameImagesReady = Promise.all(imageLoaders);

// ─── Public API ───────────────────────────────────────────────────────────────

export function drawFrameUnder(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale = 1) {
  // For PNG frames (macbook/iphone), we don't draw anything under — the screenshot goes first
  // The frame PNG is drawn over the screenshot with transparent screen area
}

export function drawFrameOver(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale = 1) {
  switch (frameType) {
    case 'browser': drawBrowserFrame(ctx, x, y, contentW, contentH, state); break;
    case 'macbook': drawMacbookPNGFrame(ctx, x, y, imgW, imgH, margins); break;
    case 'iphone':  drawIphonePNGFrame(ctx, x, y, imgW, imgH, margins); break;
  }
}

export function drawFrame(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale = 1) {
  drawFrameOver(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale);
}


// ═══════════════════════════════════════════════════════════════════════════════
// BROWSER WINDOW
// ═══════════════════════════════════════════════════════════════════════════════

function drawBrowserFrame(ctx, x, y, contentW, contentH, state) {
  const barH = 42;
  const r = 12;

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, contentH, r);
  ctx.clip();

  // Title bar
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(x, y, contentW, barH);

  // Traffic lights
  const dotY = y + barH / 2;
  const dotX0 = x + 18;
  ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(dotX0 + i * 20, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  // Address bar
  const urlBarX = x + 90;
  const urlBarW = contentW - 120;
  const urlBarH = 24;
  const urlBarY = y + (barH - urlBarH) / 2;
  ctx.beginPath();
  roundRect(ctx, urlBarX, urlBarY, urlBarW, urlBarH, 6);
  ctx.fillStyle = '#2a2a3e';
  ctx.fill();

  ctx.fillStyle = '#9090b0';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.browserUrl || 'https://example.com').substring(0, 60), urlBarX + urlBarW / 2, urlBarY + urlBarH / 2);
  ctx.restore();

  // Separator
  ctx.strokeStyle = '#2e2e48';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + barH);
  ctx.lineTo(x + contentW, y + barH);
  ctx.stroke();

  // Outer border
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, contentH, r);
  ctx.strokeStyle = '#3d3d5c';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════════
// MACBOOK PRO — PNG Frame Rendering
// ═══════════════════════════════════════════════════════════════════════════════

function drawMacbookPNGFrame(ctx, x, y, imgW, imgH, margins) {
  const spec = FRAME_SPECS.macbook;
  const img = frameImages.macbook;
  
  if (!img.complete) return; // Image not loaded yet
  
  // Calculate scale factor: frame PNG needs to scale so its screen hole matches the screenshot size
  const scaleFactor = imgW / spec.screenW;
  
  // Calculate frame draw position so the screen hole aligns with the screenshot position
  // Screenshot is at (x + margins.left, y + margins.top)
  // Screen hole in PNG starts at (spec.screenX, spec.screenY)
  const frameDrawX = (x + margins.left) - (spec.screenX * scaleFactor);
  const frameDrawY = (y + margins.top) - (spec.screenY * scaleFactor);
  const frameDrawW = spec.totalW * scaleFactor;
  const frameDrawH = spec.totalH * scaleFactor;
  
  ctx.save();
  ctx.drawImage(img, frameDrawX, frameDrawY, frameDrawW, frameDrawH);
  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════════
// iPHONE 16 PRO MAX — PNG Frame Rendering
// ═══════════════════════════════════════════════════════════════════════════════

function drawIphonePNGFrame(ctx, x, y, imgW, imgH, margins) {
  const spec = FRAME_SPECS.iphone;
  const img = frameImages.iphone;
  
  if (!img.complete) return; // Image not loaded yet
  
  // Calculate scale factor: frame PNG needs to scale so its screen hole matches the screenshot size
  const scaleFactor = imgW / spec.screenW;
  
  // Calculate frame draw position so the screen hole aligns with the screenshot position
  // Screenshot is at (x + margins.left, y + margins.top)
  // Screen hole in PNG starts at (spec.screenX, spec.screenY)
  const frameDrawX = (x + margins.left) - (spec.screenX * scaleFactor);
  const frameDrawY = (y + margins.top) - (spec.screenY * scaleFactor);
  const frameDrawW = spec.totalW * scaleFactor;
  const frameDrawH = spec.totalH * scaleFactor;
  
  ctx.save();
  ctx.drawImage(img, frameDrawX, frameDrawY, frameDrawW, frameDrawH);
  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════════════════════

function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
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
    ctx.closePath();
  }
}
