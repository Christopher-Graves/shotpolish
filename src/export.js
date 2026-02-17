/**
 * Shot Polish — PNG Export
 */

export function exportPNG(state, drawFn) {
  const scale = state.exportScale ?? 2;
  const exportCanvas = document.createElement('canvas');

  // Draw main content
  drawFn(exportCanvas, scale);

  // Add watermark after drawing (in logical coordinate space — ctx is already scaled)
  addWatermark(exportCanvas, scale);

  exportCanvas.toBlob(blob => {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `shotpolish-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}

/**
 * Draw a small "shotpolish.com" watermark in the bottom-right corner.
 * The canvas ctx is already scaled by `scale`, so we work in logical pixels.
 */
function addWatermark(canvas, scale) {
  const ctx = canvas.getContext('2d');

  // Logical (unscaled) canvas dimensions
  const logicalW = canvas.width / scale;
  const logicalH = canvas.height / scale;

  // Font size: ~1.6% of the shorter dimension, clamped to a readable range
  const fontSize = Math.max(11, Math.min(22, Math.round(Math.min(logicalW, logicalH) * 0.016)));
  const padding  = Math.round(fontSize * 0.9);

  ctx.save();

  // Subtle text shadow so the mark is legible on any background
  ctx.shadowColor  = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur   = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.font         = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle    = 'rgba(255, 255, 255, 0.38)';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'bottom';

  ctx.fillText('shotpolish.com', logicalW - padding, logicalH - padding);

  ctx.restore();
}
