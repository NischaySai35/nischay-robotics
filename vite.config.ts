import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { prerender } from './scripts/prerender.ts'

// https://vite.dev/config/
export default defineConfig({
  // prerender: per-page HTML, sitemap.xml and the Merchant Center feed — see scripts/prerender.ts
  plugins: [react(), tailwindcss(), prerender()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

// Note: Three.js is code-split by the lazy import of DropletField in App.tsx,
// so it already lands in its own chunk — no manualChunks config needed.
