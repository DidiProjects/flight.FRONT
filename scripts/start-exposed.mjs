/**
 * Sobe o dev server no endereço da tailnet, para acessar do celular.
 *
 * O host e a porta saem de `VITE_APP_URL` — a env que já existe para dizer onde
 * o app é servido. Uma fonte só, declarada, sem descoberta em runtime.
 *
 * Por que não `vite --host`: sem argumento ele escuta em TODAS as interfaces.
 * Nesta máquina isso publicou o dev server no adaptador da VPN comercial e num
 * loopback virtual com IP público — expor HMR e um token de sessão em interface
 * que ninguém auditou não vale a conveniência.
 *
 * A API não precisa de ajuste nenhum: `VITE_API_URL=/flight` faz o browser
 * chamar o próprio dev server, que repassa server-side (ver vite.config.ts).
 * Sem origem cruzada, sem CORS, sem tocar no .env da API.
 */
import { spawn } from 'node:child_process'
import { loadEnv } from 'vite'

// '' como prefixo carrega tudo, não só as VITE_*, e respeita .env.local.
const appUrl = loadEnv('development', process.cwd(), '').VITE_APP_URL

if (!appUrl) {
  console.error('\n  VITE_APP_URL não está definida no .env.\n')
  process.exit(1)
}

let url
try {
  url = new URL(appUrl)
} catch {
  console.error(`\n  VITE_APP_URL não é uma URL válida: "${appUrl}"\n`)
  process.exit(1)
}

const host = url.hostname
const port = url.port || '3001'

if (['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.warn(`
  VITE_APP_URL aponta para ${host} — o dev server vai subir, mas só responde
  nesta máquina. Para acessar do celular, troque no .env pelo IP da tailnet.
`)
}

console.log(`
  Acesse do celular com o Tailscale ligado:

    ${url.origin}

  Funciona fora de casa: o Tailscale é VPN mesh, não depende da mesma Wi-Fi.
  A API é proxiada por este mesmo endereço, então nada mais precisa mudar.
`)

// `--host <ip>` restringe o bind a esse endereço, e a mais nenhum.
const vite = spawn('npx', ['vite', '--host', host, '--port', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

vite.on('exit', (code) => process.exit(code ?? 0))
