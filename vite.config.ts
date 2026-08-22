import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

/**
 * Logs every request with its source IP.
 *
 * Vite does not log HTTP requests, so "the phone won't open it" has no
 * evidence: there is no telling whether traffic reaches the machine or dies
 * before it. With this, a line from a `100.x` IP proves it arrived — and the
 * absence of one proves it did not.
 *
 * Enabled only by `start:exposed`, otherwise it pollutes normal dev.
 */
function requestLogger() {
  return {
    name: 'request-logger',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (fn: (req: { method?: string; url?: string; socket: { remoteAddress?: string } }, res: unknown, next: () => void) => void) => void } }) {
      if (process.env.LOG_REQUESTS !== '1') return
      server.middlewares.use((req, _res, next) => {
        const ip = (req.socket.remoteAddress ?? '?').replace(/^::ffff:/, '')
        console.log(`  [req] ${ip}  ${req.method} ${req.url}`)
        next()
      })
    },
  }
}

/**
 * Shows JS errors on the screen itself.
 *
 * Eruda only helps once the bundle loads — if the error is in a module import
 * it never initialises and the screen stays black with no clue. This script is
 * INLINE in the <head>: it runs before any module, depends on neither network
 * nor cache, and so survives exactly the errors that blank the screen. It is
 * the only way to read the message on an iPhone, where there are no devtools.
 */
function mobileErrorOverlay() {
  return {
    name: 'mobile-error-overlay',
    apply: 'serve' as const,
    transformIndexHtml(html: string) {
      if (process.env.VITE_MOBILE_CONSOLE !== '1') return html
      const script = `<script>(function(){
  function show(title, detail) {
    var box = document.getElementById('__err__');
    if (!box) {
      box = document.createElement('pre');
      box.id = '__err__';
      box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;margin:0;padding:12px;background:#7f1d1d;color:#fff;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;max-height:60vh;overflow:auto';
      (document.body || document.documentElement).appendChild(box);
    }
    box.textContent += title + '\\n' + detail + '\\n\\n';
  }
  window.addEventListener('error', function (e) {
    show('[error] ' + (e.message || ''), (e.filename || '') + ':' + (e.lineno || ''));
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    show('[promise] ' + ((r && (r.message || r)) || 'rejeitada'), (r && r.stack) || '');
  });
})();</script>`
      return html.replace('<head>', `<head>\n    ${script}`)
    },
  }
}

export default defineConfig({
  plugins: [
    requestLogger(),
    mobileErrorOverlay(),
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
     * In development the API is served from the SAME origin as the front.
     *
     * With `VITE_API_URL=/flight` the browser only talks to the dev server and
     * the proxy talks to the API server-side, where CORS does not apply. That is
     * what lets `npm run start:exposed` work without touching the API's
     * `FRONTEND_URL`: reached over Tailscale, the front calls its own host and
     * the origin still matches.
     *
     * There is no proxy in production — CI overwrites .env with the absolute API
     * URL (`vars.VITE_API_URL`), so the build ships cross-origin and the
     * backend CORS is what rules again.
     */
    proxy: {
      '/flight': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3011',
        changeOrigin: true,
        // Admin consumes SSE (`/flight/admin/stream`). Without disabling
        // compression the response is buffered and events arrive in batches —
        // the panel looks alive but sits still.
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
