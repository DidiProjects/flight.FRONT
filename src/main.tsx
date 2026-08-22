import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

/**
 * A console inside the page itself, to debug on mobile.
 *
 * iOS has no devtools: every browser is WebKit underneath, and Safari Web
 * Inspector needs a Mac and only sees Safari — none of that reaches Opera or
 * Chrome on an iPhone. Eruda draws the console on screen, so it works in any
 * of them.
 *
 * Dynamically imported to stay out of the production bundle, and enabled only
 * by `start:exposed` (VITE_MOBILE_CONSOLE=1) — on desktop it gets in the way.
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
