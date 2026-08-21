import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Mirrors the CloudFront /api/* behaviour so `npm run dev` talks to the
      // real API without the frontend needing a different base URL locally.
      // changeOrigin rewrites the Host header, which API Gateway requires.
      '/api': {
        target: 'https://haianwilra.execute-api.eu-north-1.amazonaws.com/prod',
        changeOrigin: true,
      },
    },
  },
})
