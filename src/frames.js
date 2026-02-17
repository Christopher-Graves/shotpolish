/**
 * Shot Polish — Device Frame Renderers
 * Each frame is drawn with canvas 2D API (no external images needed)
 */

export function drawFrame(ctx, frameType, x, y, contentW, contentH, imgW, imgH, margins, state, scale = 1) {
  switch (frameType) {
    case 'browser': drawBrowserFrame(ctx, x, y, contentW, contentH, imgW, imgH, state); break;
    case 'macbook': drawMacbookFrame(ctx, x, y, contentW, contentH, imgW, imgH); break;
    case 'iphone':  drawIphoneFrame(ctx, x, y, contentW, contentH, imgW, imgH); break;
  }
}

// ─── Browser Window Frame ─────────────────────────────────────────────────────

function drawBrowserFrame(ctx, x, y, contentW, contentH, imgW, imgH, state) {
  const barH  = 42;
  const barY  = y;
  const barX  = x;
  const r     = 12; // window corner radius
  const bw    = contentW;
  const bh    = contentH;

  // Window background (title bar)
  ctx.save();
  ctx.beginPath();
  // Full rounded rect for the outer frame
  roundRect(ctx, barX, barY, bw, bh, r);
  ctx.clip();

  // Title bar fill
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(barX, barY, bw, barH);

  // Window chrome dots
  const dotY  = barY + barH / 2;
  const dotX0 = barX + 18;
  const dotColors = ['#ef4444', '#f59e0b', '#22c55e'];
  dotColors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(dotX0 + i * 20, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Address bar
  const urlBarX = barX + 90;
  const urlBarW = bw - 120;
  const urlBarH = 24;
  const urlBarY = barY + (barH - urlBarH) / 2;
  ctx.fillStyle = '#2a2a3e';
  roundRect(ctx, urlBarX, urlBarY, urlBarW, urlBarH, 6);
  ctx.fill();

  // URL text
  ctx.fillStyle = '#9090b0';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const urlText = (state.browserUrl || 'https://example.com').substring(0, 60);
  ctx.fillText(urlText, urlBarX + urlBarW / 2, urlBarY + urlBarH / 2);

  ctx.restore();

  // Bottom border (subtle separator between bar and content)
  ctx.strokeStyle = '#2e2e48';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(barX, barY + barH);
  ctx.lineTo(barX + bw, barY + barH);
  ctx.stroke();

  // Outer border
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, barX, barY, bw, bh, r);
  ctx.strokeStyle = '#3d3d5c';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// ─── MacBook Frame ────────────────────────────────────────────────────────────

function drawMacbookFrame(ctx, x, y, contentW, contentH, imgW, imgH) {
  const margins = { top: 36, right: 24, bottom: 54, left: 24 };
  const outerR  = 14;
  const screenR = 4;

  // Laptop body
  ctx.save();

  // Screen bezel
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, contentH - margins.bottom, outerR);

  // Silver gradient fill
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + contentH);
  bodyGrad.addColorStop(0, '#2a2a2a');
  bodyGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Screen bezel border
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Camera notch area at top (thin strip)
  const notchW = 10;
  const notchH = 10;
  const notchX = x + contentW / 2 - notchW / 2;
  const notchY = y + 12;
  ctx.beginPath();
  ctx.arc(notchX + notchW / 2, notchY + notchH / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Camera dot
  ctx.beginPath();
  ctx.arc(notchX + notchW / 2, notchY + notchH / 2, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#2a2a2a';
  ctx.fill();

  // Screen area (clip the screenshot — already drawn before frame)
  // Just need the screen glow/sheen
  const screenX = x + margins.left;
  const screenY = y + margins.top;
  const screenW = contentW - margins.left - margins.right;
  const screenH = contentH - margins.top - margins.bottom;

  ctx.beginPath();
  roundRect(ctx, screenX, screenY, screenW, screenH, screenR);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Screen glare overlay
  const glare = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH * 0.4);
  glare.addColorStop(0, 'rgba(255,255,255,0.03)');
  glare.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fill();

  ctx.restore();

  // ── Base / keyboard ──
  const baseX = x - 10;
  const baseY = y + contentH - margins.bottom;
  const baseW = contentW + 20;
  const baseH = margins.bottom;

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, baseX, baseY, baseW, baseH, 4);
  const baseGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseH);
  baseGrad.addColorStop(0, '#2e2e2e');
  baseGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = baseGrad;
  ctx.fill();
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hinge line
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + baseW, baseY);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Trackpad
  const tpW = Math.min(100, baseW * 0.3);
  const tpH = 14;
  const tpX = baseX + (baseW - tpW) / 2;
  const tpY = baseY + (baseH - tpH) / 2;
  ctx.beginPath();
  roundRect(ctx, tpX, tpY, tpW, tpH, 4);
  ctx.fillStyle = '#262626';
  ctx.fill();
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

// ─── iPhone Frame ─────────────────────────────────────────────────────────────

function drawIphoneFrame(ctx, x, y, contentW, contentH, imgW, imgH) {
  const r = Math.min(36, contentW * 0.1);

  ctx.save();

  // Phone body
  ctx.beginPath();
  roundRect(ctx, x, y, contentW, contentH, r);

  const bodyGrad = ctx.createLinearGradient(x, y, x + contentW, y + contentH);
  bodyGrad.addColorStop(0, '#2a2a2e');
  bodyGrad.addColorStop(0.5, '#1e1e24');
  bodyGrad.addColorStop(1, '#2a2a2e');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = '#3d3d50';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dynamic Island / notch
  const diW  = contentW * 0.28;
  const diH  = 22;
  const diX  = x + (contentW - diW) / 2;
  const diY  = y + 18;
  ctx.beginPath();
  roundRect(ctx, diX, diY, diW, diH, diH / 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  // Side buttons (right side)
  const btnX = x + contentW - 2;
  const btnConfigs = [
    { by: y + contentH * 0.28, bh: 50 },
    { by: y + contentH * 0.42, bh: 50 },
  ];
  btnConfigs.forEach(({ by, bh }) => {
    ctx.beginPath();
    ctx.roundRect(btnX, by, 4, bh, 2);
    ctx.fillStyle = '#1a1a1e';
    ctx.fill();
    ctx.strokeStyle = '#3d3d50';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Left button (power/lock)
  const pwrX = x - 2;
  ctx.beginPath();
  ctx.roundRect(pwrX, y + contentH * 0.32, 4, 60, 2);
  ctx.fillStyle = '#1a1a1e';
  ctx.fill();
  ctx.strokeStyle = '#3d3d50';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Bottom home bar
  const hbW = contentW * 0.35;
  const hbH = 4;
  const hbX = x + (contentW - hbW) / 2;
  const hbY = y + contentH - 16;
  ctx.beginPath();
  roundRect(ctx, hbX, hbY, hbW, hbH, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  // Screen border glow
  const margins = { top: 60, right: 18, bottom: 60, left: 18 };
  ctx.beginPath();
  roundRect(
    ctx,
    x + margins.left, y + margins.top,
    contentW - margins.left - margins.right,
    contentH - margins.top - margins.bottom,
    8
  );
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// ─── Utility ──────────────────────────────────────────────────────────────────

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
