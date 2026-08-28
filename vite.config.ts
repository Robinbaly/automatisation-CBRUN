import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // In local dev, `vercel dev` normally serves /api itself.
      // This proxy is only used if you run `vite` directly against an already-running `vercel dev`.
      '/api': 'http://localhost:3000',
    },
  },
})
