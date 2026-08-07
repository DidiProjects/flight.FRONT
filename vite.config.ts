import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

/**
 * Registra cada requisição com o IP de origem.
 *
 * O Vite não loga requisições HTTP, então "o celular não abre" fica sem
 * evidência: não dá para saber se o tráfego chega à máquina ou morre antes.
 * Com isto, uma linha vinda de um IP `100.x` prova que chegou — e a ausência
 * dela prova que não.
 *
 * Ligado só pelo `start:exposed`, senão polui o dev normal.
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
 * Mostra erros de JS na própria tela.
 *
 * O Eruda só ajuda depois que o bundle carrega — se o erro é no import de um
 * módulo, ele nunca inicializa e a tela fica preta sem nenhuma pista. Este
 * script é INLINE no <head>: roda antes de qualquer módulo, não depende de
 * rede nem de cache, e por isso sobrevive justamente aos erros que apagam a
 * tela. É a única forma de ler a mensagem num iPhone, onde não há devtools.
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
