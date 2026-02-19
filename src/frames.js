/**
 * Shot Polish — Device Frame Renderers
 * Realistic device mockups drawn with Canvas 2D API (no external images)
 *
 * Frames are split into two phases:
 *  drawFrameUnder — device body drawn BEFORE the screenshot image
 *  drawFrameOver  — overlays drawn AFTER the screenshot image (notch, buttons, etc.)
 */

// ─── Public API ───────────────────────────────────────────────────────────────

export function drawFrameUnder(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale = 1) {
  switch (frameType) {
    case 'macbook': drawMacbookUnder(ctx, x, y, contentW, contentH); break;
    case 'iphone':  drawIphoneUnder(ctx, x, y, contentW, contentH); break;
  }
}

export function drawFrameOver(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale = 1) {
  switch (frameType) {
    case 'browser': drawBrowserFrame(ctx, x, y, contentW, contentH, state); break;
    case 'macbook': drawMacbookOver(ctx, x, y, contentW, contentH); break;
    case 'iphone':  drawIphoneOver(ctx, x, y, contentW, contentH); break;
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
// MACBOOK PRO — Realistic Space Black / Silver
// ═══════════════════════════════════════════════════════════════════════════════

function drawMacbookUnder(ctx, x, y, contentW, contentH) {
  const M = { top: 36, right: 24, bottom: 54, left: 24 };
  const lidH = contentH - M.bottom;
  const lidR = 14;

  ctx.save();

  // ── Lid (display housing) ──
  // Outer shell gradient — metallic silver/space gray look
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, lidH, lidR);
  const lidGrad = ctx.createLinearGradient(x, y, x, y + lidH);
  lidGrad.addColorStop(0, '#3a3a3c');
  lidGrad.addColorStop(0.02, '#2c2c2e');
  lidGrad.addColorStop(0.5, '#1c1c1e');
  lidGrad.addColorStop(0.98, '#2c2c2e');
  lidGrad.addColorStop(1, '#3a3a3c');
  ctx.fillStyle = lidGrad;
  ctx.fill();

  // Lid outer edge highlight (top)
  ctx.beginPath();
  ctx.moveTo(x + lidR, y + 0.5);
  ctx.lineTo(x + contentW - lidR, y + 0.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Lid border
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, lidH, lidR);
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Screen bezel (inner black border around screen) ──
  const bezelInset = 4;
  const screenX = x + M.left - bezelInset;
  const screenY = y + M.top - bezelInset;
  const screenW = contentW - M.left - M.right + bezelInset * 2;
  const screenH = lidH - M.top + bezelInset;
  ctx.beginPath();
  roundRect(ctx, screenX, screenY, screenW, screenH, 6);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // ── Base (keyboard deck) ──
  const baseX = x - 16;
  const baseY = y + lidH;
  const baseW = contentW + 32;
  const baseH = M.bottom;

  // Base body
  ctx.beginPath();
  // Only round bottom corners
  const br = 6;
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + baseW, baseY);
  ctx.lineTo(baseX + baseW, baseY + baseH - br);
  ctx.arcTo(baseX + baseW, baseY + baseH, baseX + baseW - br, baseY + baseH, br);
  ctx.lineTo(baseX + br, baseY + baseH);
  ctx.arcTo(baseX, baseY + baseH, baseX, baseY + baseH - br, br);
  ctx.closePath();

  const baseGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseH);
  baseGrad.addColorStop(0, '#2c2c2e');
  baseGrad.addColorStop(0.1, '#232325');
  baseGrad.addColorStop(0.9, '#1a1a1c');
  baseGrad.addColorStop(1, '#151517');
  ctx.fillStyle = baseGrad;
  ctx.fill();
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hinge — the connection between lid and base
  ctx.beginPath();
  ctx.moveTo(baseX + 2, baseY);
  ctx.lineTo(baseX + baseW - 2, baseY);
  const hingeGrad = ctx.createLinearGradient(baseX, baseY - 2, baseX, baseY + 3);
  hingeGrad.addColorStop(0, '#444446');
  hingeGrad.addColorStop(0.5, '#2a2a2c');
  hingeGrad.addColorStop(1, '#1a1a1c');
  ctx.strokeStyle = hingeGrad;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Trackpad
  const tpW = baseW * 0.38;
  const tpH = baseH * 0.55;
  const tpX = baseX + (baseW - tpW) / 2;
  const tpY = baseY + (baseH - tpH) / 2 + 2;
  ctx.beginPath();
  roundRect(ctx, tpX, tpY, tpW, tpH, 8);
  ctx.fillStyle = '#1e1e20';
  ctx.fill();
  ctx.strokeStyle = '#3a3a3c';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Subtle trackpad inner shadow
  const tpInner = ctx.createLinearGradient(tpX, tpY, tpX, tpY + tpH);
  tpInner.addColorStop(0, 'rgba(0,0,0,0.15)');
  tpInner.addColorStop(0.1, 'rgba(0,0,0,0)');
  tpInner.addColorStop(0.9, 'rgba(0,0,0,0)');
  tpInner.addColorStop(1, 'rgba(255,255,255,0.03)');
  ctx.fillStyle = tpInner;
  ctx.beginPath();
  roundRect(ctx, tpX, tpY, tpW, tpH, 8);
  ctx.fill();

  ctx.restore();
}

function drawMacbookOver(ctx, x, y, contentW, contentH) {
  const M = { top: 36, right: 24, bottom: 54, left: 24 };
  ctx.save();

  // Camera / notch area (modern MacBook Pro style notch)
  const notchW = 56;
  const notchH = 18;
  const notchX = x + contentW / 2 - notchW / 2;
  const notchY = y + M.top - notchH - 2;
  const notchR = 6;

  // Notch shape
  ctx.beginPath();
  ctx.moveTo(notchX, notchY);
  ctx.lineTo(notchX + notchW, notchY);
  ctx.lineTo(notchX + notchW, notchY + notchH - notchR);
  ctx.arcTo(notchX + notchW, notchY + notchH, notchX + notchW - notchR, notchY + notchH, notchR);
  ctx.lineTo(notchX + notchR, notchY + notchH);
  ctx.arcTo(notchX, notchY + notchH, notchX, notchY + notchH - notchR, notchR);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Camera dot (centered in notch)
  ctx.beginPath();
  ctx.arc(x + contentW / 2, notchY + notchH / 2 + 1, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + contentW / 2, notchY + notchH / 2 + 1, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0d1f3c';
  ctx.fill();

  // Subtle screen reflection
  const screenX = x + M.left;
  const screenY = y + M.top;
  const screenW = contentW - M.left - M.right;
  const screenH = contentH - M.top - M.bottom;
  const glare = ctx.createLinearGradient(screenX, screenY, screenX + screenW * 0.7, screenY + screenH * 0.3);
  glare.addColorStop(0, 'rgba(255,255,255,0.02)');
  glare.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  roundRect(ctx, screenX, screenY, screenW, screenH, 4);
  ctx.fillStyle = glare;
  ctx.fill();

  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════════
// iPHONE 15 PRO — Realistic Titanium
// ═══════════════════════════════════════════════════════════════════════════════

function drawIphoneUnder(ctx, x, y, contentW, contentH) {
  const r = Math.min(52, contentW * 0.14);
  const innerR = Math.max(r - 8, 4);

  ctx.save();

  // ── Outer titanium body ──
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, contentH, r);

  // Titanium gradient
  const bodyGrad = ctx.createLinearGradient(x, y, x + contentW, y + contentH);
  bodyGrad.addColorStop(0, '#48484a');
  bodyGrad.addColorStop(0.15, '#3a3a3c');
  bodyGrad.addColorStop(0.5, '#2c2c2e');
  bodyGrad.addColorStop(0.85, '#3a3a3c');
  bodyGrad.addColorStop(1, '#48484a');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Outer edge (chamfered titanium look)
  ctx.strokeStyle = '#58585a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner edge
  ctx.beginPath();
  roundRect(ctx, x + 1.5, y + 1.5, contentW - 3, contentH - 3, r - 1);
  ctx.strokeStyle = '#1c1c1e';
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Screen bezel (black area around screen) ──
  const bezelX = x + 6;
  const bezelY = y + 6;
  const bezelW = contentW - 12;
  const bezelH = contentH - 12;

  ctx.beginPath();
  roundRect(ctx, bezelX, bezelY, bezelW, bezelH, innerR);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // ── Antenna lines (subtle horizontal lines near top and bottom) ──
  ctx.strokeStyle = 'rgba(80, 80, 82, 0.4)';
  ctx.lineWidth = 0.5;

  // Top antenna line
  ctx.beginPath();
  ctx.moveTo(x, y + contentH * 0.15);
  ctx.lineTo(x + 3, y + contentH * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + contentW - 3, y + contentH * 0.15);
  ctx.lineTo(x + contentW, y + contentH * 0.15);
  ctx.stroke();

  // Bottom antenna line
  ctx.beginPath();
  ctx.moveTo(x, y + contentH * 0.85);
  ctx.lineTo(x + 3, y + contentH * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + contentW - 3, y + contentH * 0.85);
  ctx.lineTo(x + contentW, y + contentH * 0.85);
  ctx.stroke();

  ctx.restore();
}

function drawIphoneOver(ctx, x, y, contentW, contentH) {
  ctx.save();

  // ── Dynamic Island ──
  const diW = contentW * 0.28;
  const diH = 28;
  const diX = x + (contentW - diW) / 2;
  const diY = y + 18;

  ctx.beginPath();
  roundRect(ctx, diX, diY, diW, diH, diH / 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Camera lens in Dynamic Island (left side)
  const camX = diX + diW * 0.3;
  const camY = diY + diH / 2;
  ctx.beginPath();
  ctx.arc(camX, camY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a14';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(camX, camY, 2.5, 0, Math.PI * 2);
  const lensGrad = ctx.createRadialGradient(camX - 0.5, camY - 0.5, 0, camX, camY, 2.5);
  lensGrad.addColorStop(0, '#1a1a3a');
  lensGrad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = lensGrad;
  ctx.fill();

  // ── Side buttons ──

  // Right side — power button
  const pwrX = x + contentW;
  const pwrY = y + contentH * 0.25;
  const pwrH = 65;
  ctx.beginPath();
  roundRect(ctx, pwrX - 1, pwrY, 3, pwrH, 1.5);
  const pwrGrad = ctx.createLinearGradient(pwrX - 1, pwrY, pwrX + 2, pwrY);
  pwrGrad.addColorStop(0, '#48484a');
  pwrGrad.addColorStop(0.5, '#58585a');
  pwrGrad.addColorStop(1, '#3a3a3c');
  ctx.fillStyle = pwrGrad;
  ctx.fill();

  // Left side — volume up
  const volUpY = y + contentH * 0.22;
  ctx.beginPath();
  roundRect(ctx, x - 2, volUpY, 3, 40, 1.5);
  const volGrad = ctx.createLinearGradient(x - 2, volUpY, x + 1, volUpY);
  volGrad.addColorStop(0, '#3a3a3c');
  volGrad.addColorStop(0.5, '#58585a');
  volGrad.addColorStop(1, '#48484a');
  ctx.fillStyle = volGrad;
  ctx.fill();

  // Left side — volume down
  const volDnY = volUpY + 52;
  ctx.beginPath();
  roundRect(ctx, x - 2, volDnY, 3, 40, 1.5);
  ctx.fillStyle = volGrad;
  ctx.fill();

  // Left side — action button (small, above volume)
  const actY = volUpY - 28;
  ctx.beginPath();
  roundRect(ctx, x - 2, actY, 3, 18, 1.5);
  ctx.fillStyle = volGrad;
  ctx.fill();

  // ── Home bar indicator ──
  const hbW = contentW * 0.35;
  const hbH = 5;
  const hbX = x + (contentW - hbW) / 2;
  const hbY = y + contentH - 20;
  ctx.beginPath();
  roundRect(ctx, hbX, hbY, hbW, hbH, 2.5);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();

  // ── Subtle screen reflection ──
  const screenX = x + 6;
  const screenY = y + 6;
  const screenW = contentW - 12;
  const screenH = contentH - 12;
  const innerR = Math.max(Math.min(52, contentW * 0.14) - 8, 4);

  const glare = ctx.createLinearGradient(screenX, screenY, screenX + screenW * 0.6, screenY + screenH * 0.3);
  glare.addColorStop(0, 'rgba(255,255,255,0.015)');
  glare.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  roundRect(ctx, screenX, screenY, screenW, screenH, innerR);
  ctx.fillStyle = glare;
  ctx.fill();

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
