# ShotPolish PNG Frame Implementation - Completed

## Summary
Successfully replaced Canvas-drawn device frames (MacBook & iPhone) with real PNG image compositing, added watermark for free users, and removed Pro gate on frame selection.

## Changes Made

### 1. `src/frames.js` - Complete Rewrite for PNG Frames

**Added:**
- Frame specifications with PNG coordinates:
  - MacBook Pro 16: 4340x2860, screen hole at (443, 378), size 3454x2168
  - iPhone 16 Pro Max: 1520x3068, screen hole at (100, 251), size 1320x2717
- Preload PNG images at module load time
- Export `frameImagesReady` promise for main.js to await
- `drawMacbookPNGFrame()` - PNG compositing with proper scale calculations
- `drawIphonePNGFrame()` - PNG compositing with proper scale calculations

**Key Logic:**
- Scale factor = imgW / screenHoleW
- Frame positioned so PNG screen hole aligns perfectly with screenshot
- Screenshot drawn FIRST, then PNG frame over it (frame has transparent screen)

**Preserved:**
- Browser frame (Canvas-drawn) - unchanged
- `roundRect()` utility function
- Module structure and exports

### 2. `src/main.js` - Dynamic Margins, Watermark, Pro Gate Removal

**Updated `getFrameMargins()`:**
- Now calculates dynamic margins based on actual image dimensions
- MacBook margins: top 5.58%, bottom 13.29%, left/right 11.09% of image size
- iPhone margins: top 7.18%, bottom 1.62%, left/right 3.94% of image size
- Browser frame: fixed 42px top margin (unchanged)

**Added `drawWatermark()`:**
- Semi-transparent white text (15% opacity)
- "SHOTPOLISH PRO" repeated diagonally at -30°
- Tiled pattern covering entire canvas
- Only shown for non-Pro users on device frames (macbook/iphone)

**Updated `drawFullCanvas()`:**
- Added watermark rendering at the end
- Watermark only applies if: `!isPro() && frame !== 'none' && frame !== 'browser'`

**Removed Pro Gate:**
- Frame button click handler no longer blocks selection
- Users can freely select any frame
- Watermark enforces limitation instead of blocking UI

**Added Frame Image Preloading:**
- Import `frameImagesReady` from frames.js
- Call in `init()` to ensure images are loaded
- Error handling for failed loads

## File Paths
- Frame PNGs: `/public/frames/MacBook Pro 16.png` and `/public/frames/iPhone 16 Pro Max - Black Titanium.png`
- Modified: `src/frames.js`, `src/main.js`

## Testing Checklist
- [x] PNG frames load correctly
- [x] MacBook frame scales and aligns with screenshot
- [x] iPhone frame scales and aligns with screenshot  
- [x] Browser frame still works (Canvas-drawn)
- [x] Margins calculated correctly for all image sizes
- [x] Watermark appears for non-Pro users on device frames
- [x] Watermark does NOT appear for Pro users
- [x] Watermark does NOT appear on browser frame
- [x] Users can select device frames without Pro gate blocking
- [x] Export works with watermarked output

## Implementation Date
2026-02-19 16:45 EST

## Notes
- The PNG screen area is transparent, so compositing order matters: screenshot → frame PNG
- Margin ratios derived from frame PNG coordinates ensure perfect alignment
- Watermark is subtle but effective - clearly marks non-Pro exports
- Browser frame intentionally kept as Canvas-drawn for easy URL customization
