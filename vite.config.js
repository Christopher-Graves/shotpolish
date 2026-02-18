import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  define: {
    '__STRIPE_PRICE_MONTHLY__': JSON.stringify(process.env.VITE_STRIPE_PRICE_MONTHLY || ''),
    '__STRIPE_PRICE_LIFETIME__': JSON.stringify(process.env.VITE_STRIPE_PRICE_LIFETIME || ''),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
