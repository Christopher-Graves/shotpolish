/**
 * Shot Polish — PNG Export
 */

export function exportPNG(state, drawFn) {
  const scale = state.exportScale ?? 2;
  const exportCanvas = document.createElement('canvas');
  
  drawFn(exportCanvas, scale);

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
