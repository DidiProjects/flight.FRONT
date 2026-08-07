import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

/**
 * Console dentro da própria página, para depurar no celular.
 *
 * No iOS não existe devtools: todo browser é WebKit por baixo, e o Web
 * Inspector do Safari exige um Mac e só enxerga o Safari — nada disso alcança
 * Opera ou Chrome no iPhone. O Eruda desenha o console na tela, então funciona
 * em qualquer um deles.
 *
 * Import dinâmico para não entrar no bundle de produção, e ligado apenas pelo
 * `start:exposed` (VITE_MOBILE_CONSOLE=1) — no desktop atrapalharia.
 */
if (import.meta.env.DEV && import.meta.env.VITE_MOBILE_CONSOLE === '1') {
  import('eruda').then(({ default: eruda }) => eruda.init())
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
