/**
 * Shot Polish — Background Presets
 */

export const GRADIENTS = [
  { name: 'Indigo Dream',   from: '#6366f1', to: '#8b5cf6', angle: 135, css: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { name: 'Rose Gold',      from: '#f43f5e', to: '#fb923c', angle: 135, css: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
  { name: 'Ocean Breeze',   from: '#06b6d4', to: '#3b82f6', angle: 135, css: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { name: 'Emerald',        from: '#10b981', to: '#059669', angle: 135, css: 'linear-gradient(135deg, #10b981, #059669)' },
  { name: 'Sunset',         from: '#f59e0b', to: '#ef4444', angle: 135, css: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { name: 'Midnight',       from: '#1e1b4b', to: '#312e81', angle: 135, css: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  { name: 'Peach',          from: '#fda4af', to: '#fb923c', angle: 135, css: 'linear-gradient(135deg, #fda4af, #fb923c)' },
  { name: 'Cotton Candy',   from: '#e879f9', to: '#818cf8', angle: 135, css: 'linear-gradient(135deg, #e879f9, #818cf8)' },
  { name: 'Forest',         from: '#166534', to: '#15803d', angle: 160, css: 'linear-gradient(160deg, #166534, #15803d)' },
  { name: 'Deep Space',     from: '#0f0c29', to: '#302b63', angle: 135, css: 'linear-gradient(135deg, #0f0c29, #302b63)' },
  { name: 'Aurora',         from: '#00c9ff', to: '#92fe9d', angle: 120, css: 'linear-gradient(120deg, #00c9ff, #92fe9d)' },
  { name: 'Flamingo',       from: '#f953c6', to: '#b91d73', angle: 135, css: 'linear-gradient(135deg, #f953c6, #b91d73)' },
  { name: 'Arctic',         from: '#243b55', to: '#141e30', angle: 135, css: 'linear-gradient(135deg, #243b55, #141e30)' },
  { name: 'Lemon Lime',     from: '#f7971e', to: '#ffd200', angle: 135, css: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { name: 'Purple Haze',    from: '#4776e6', to: '#8e54e9', angle: 135, css: 'linear-gradient(135deg, #4776e6, #8e54e9)' },
  { name: 'Mint',           from: '#00b09b', to: '#96c93d', angle: 135, css: 'linear-gradient(135deg, #00b09b, #96c93d)' },
];

export const SOLID_COLORS = [
  '#0d0d12', '#14141e', '#1a1a2e', '#1e1e30',
  '#0f172a', '#1e293b', '#0c1a2e', '#0a192f',
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#111827', '#1f2937', '#374151', '#6b7280',
  '#0f0c29', '#200122', '#1a0a2e', '#09093d',
];

export const MESH_GRADIENTS = [
  {
    name: 'Purple Haze',
    base: '#0d0d1f',
    css: 'radial-gradient(ellipse at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #8b5cf6 0%, transparent 60%), #0d0d1f',
    blobs: [
      { cx: 0.2,  cy: 0.5, r: 0.6, color: '#6366f1' },
      { cx: 0.8,  cy: 0.2, r: 0.5, color: '#8b5cf6' },
      { cx: 0.5,  cy: 0.8, r: 0.4, color: '#4f46e5' },
    ],
  },
  {
    name: 'Ocean Mesh',
    base: '#0a1628',
    css: 'radial-gradient(ellipse at 30% 40%, #06b6d4 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, #3b82f6 0%, transparent 60%), #0a1628',
    blobs: [
      { cx: 0.3,  cy: 0.4, r: 0.6, color: '#06b6d4' },
      { cx: 0.7,  cy: 0.6, r: 0.5, color: '#3b82f6' },
      { cx: 0.1,  cy: 0.9, r: 0.4, color: '#0284c7' },
    ],
  },
  {
    name: 'Rose Mesh',
    base: '#1a0a14',
    css: 'radial-gradient(ellipse at 60% 30%, #f43f5e 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, #ec4899 0%, transparent 60%), #1a0a14',
    blobs: [
      { cx: 0.6,  cy: 0.3, r: 0.6, color: '#f43f5e' },
      { cx: 0.2,  cy: 0.7, r: 0.5, color: '#ec4899' },
      { cx: 0.9,  cy: 0.8, r: 0.4, color: '#db2777' },
    ],
  },
  {
    name: 'Emerald Mesh',
    base: '#021a10',
    css: 'radial-gradient(ellipse at 40% 60%, #10b981 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #059669 0%, transparent 60%), #021a10',
    blobs: [
      { cx: 0.4,  cy: 0.6, r: 0.6, color: '#10b981' },
      { cx: 0.8,  cy: 0.2, r: 0.5, color: '#059669' },
      { cx: 0.1,  cy: 0.3, r: 0.4, color: '#34d399' },
    ],
  },
  {
    name: 'Golden Hour',
    base: '#1a100a',
    css: 'radial-gradient(ellipse at 50% 50%, #f59e0b 0%, transparent 60%), radial-gradient(ellipse at 90% 10%, #ef4444 0%, transparent 60%), #1a100a',
    blobs: [
      { cx: 0.5,  cy: 0.5, r: 0.7, color: '#f59e0b' },
      { cx: 0.9,  cy: 0.1, r: 0.4, color: '#ef4444' },
      { cx: 0.1,  cy: 0.9, r: 0.4, color: '#fb923c' },
    ],
  },
  {
    name: 'Cool Dark',
    base: '#050510',
    css: 'radial-gradient(ellipse at 30% 30%, #1e40af 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, #312e81 0%, transparent 60%), #050510',
    blobs: [
      { cx: 0.3,  cy: 0.3, r: 0.6, color: '#1e40af' },
      { cx: 0.7,  cy: 0.7, r: 0.5, color: '#312e81' },
      { cx: 0.8,  cy: 0.2, r: 0.3, color: '#4f46e5' },
    ],
  },
  {
    name: 'Cotton Candy',
    base: '#1a0a1f',
    css: 'radial-gradient(ellipse at 20% 30%, #e879f9 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, #818cf8 0%, transparent 60%), #1a0a1f',
    blobs: [
      { cx: 0.2,  cy: 0.3, r: 0.6, color: '#e879f9' },
      { cx: 0.8,  cy: 0.7, r: 0.5, color: '#818cf8' },
      { cx: 0.5,  cy: 1.0, r: 0.4, color: '#c084fc' },
    ],
  },
  {
    name: 'Aurora',
    base: '#010f0a',
    css: 'radial-gradient(ellipse at 50% 0%, #00c9ff 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, #92fe9d 0%, transparent 50%), #010f0a',
    blobs: [
      { cx: 0.5,  cy: 0.0, r: 0.6, color: '#00c9ff' },
      { cx: 0.0,  cy: 1.0, r: 0.6, color: '#92fe9d' },
      { cx: 1.0,  cy: 0.5, r: 0.4, color: '#38bdf8' },
    ],
  },
];
