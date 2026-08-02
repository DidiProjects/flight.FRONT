import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Flight — Monitoramento de Voos',
        short_name: 'Flight',
        description: 'Monitoramento de passagens aéreas e alertas de preço',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1E3A5F',
        background_color: '#F7F8FA',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 3001,
    /**
     * A API é servida pela MESMA origem do front em desenvolvimento.
     *
     * Com `VITE_API_URL=/flight`, o browser só conversa com o dev server e o
     * proxy fala com a API server-side, onde CORS não se aplica. É o que
     * permite `npm run start:exposed` funcionar sem tocar no `FRONTEND_URL` da
     * API: acessado por Tailscale, o front chama o próprio host e a origem
     * continua batendo.
     *
     * Em produção não há proxy — o CI sobrescreve o .env com a URL absoluta da
     * API (`vars.VITE_API_URL`), então o build sai com origem cruzada e o CORS
     * do backend volta a ser o que manda.
     */
    proxy: {
      '/flight': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3011',
        changeOrigin: true,
        // O Admin consome SSE (`/flight/admin/stream`). Sem desligar a
        // compressão, a resposta é bufferizada e os eventos só chegam em lote —
        // o painel fica "vivo" mas parado.
        headers: { 'Accept-Encoding': 'identity' },
      },
    },
  },
  resolve: {
    alias: {
      '@atomic-components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@providers': resolve(__dirname, 'src/providers'),
      '@theme': resolve(__dirname, 'src/theme'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@routes': resolve(__dirname, 'src/routes'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@app-types': resolve(__dirname, 'src/types'),
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
