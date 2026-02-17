# ✦ Shot Polish

**Make your screenshots look gorgeous — free, no signup, runs entirely in your browser.**

Shot Polish is a client-side screenshot beautifier built with Vite + vanilla HTML/CSS/JS. No server, no API keys, no data leaves your machine.

![Shot Polish Preview](https://shotpolish.app/og-image.png)

## Features

- 📸 **Upload screenshots** — drag & drop, file picker, or paste from clipboard (Ctrl+V)
- 🎨 **Background options** — 16 gradient presets, solid colors, mesh/blob gradients, or transparent
- 📐 **Padding control** — adjustable with a slider (0–200px)
- 🔲 **Corner radius** — rounded screenshot corners (0–40px)
- 💫 **Drop shadow** — adjustable blur, offset, and opacity
- 🖥️ **Device frames** — browser window, MacBook, iPhone (all drawn with Canvas API, no external images)
- ↗️ **Export PNG** — 1×, 2×, or 3× resolution
- 📱 **Responsive** — works great on desktop browsers

## Tech Stack

- **Build tool:** Vite 7
- **Language:** Vanilla HTML/CSS/JS (ES Modules)
- **Rendering:** HTML Canvas 2D API
- **No runtime dependencies** — zero npm packages at runtime

## Getting Started

```bash
# Install dev dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment (Cloudflare Pages)

This is a pure static site. Deploy with:

**Build command:** `npm run build`
**Build output directory:** `dist`
**Node.js version:** 18 or 20

Or connect your GitHub repo to Cloudflare Pages and it auto-detects the Vite setup.

## Project Structure

```
shotpolish/
├── public/
│   └── favicon.svg          # SVG favicon
├── src/
│   ├── main.js              # App entry point, state, render loop
│   ├── style.css            # All styles (dark mode, responsive)
│   ├── presets.js           # Gradient, solid, mesh color presets
│   ├── frames.js            # Device frame renderers (Canvas 2D)
│   └── export.js            # PNG export logic
├── index.html               # Landing page + tool UI
├── vite.config.js
├── package.json
└── README.md
```

## How It Works

All rendering is done on a `<canvas>` element:

1. **Background** — drawn first (gradient / solid / mesh blob / transparent)
2. **Shadow** — canvas shadow filter applied before drawing the image
3. **Screenshot** — clipped with a rounded rect, drawn at center with padding
4. **Device frame** — drawn on top using pure Canvas 2D paths (no SVG/images needed)

Export creates an offscreen canvas at the chosen scale (2× default) and triggers a PNG download.

## SEO Keywords

screenshot beautifier, screenshot cleaner, app store screenshots, screenshot background, screenshot editor, beautify screenshot, screenshot tool, screenshot framer, screenshot mockup

## License

MIT — do whatever you want.
