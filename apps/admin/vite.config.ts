import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@school-reviews/lib': fileURLToPath(new URL('../../packages/lib/src', import.meta.url)),
      '@school-reviews/ui': fileURLToPath(new URL('../../packages/ui/src', import.meta.url))
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5174,
    strictPort: false,
    host: true
  }
})
