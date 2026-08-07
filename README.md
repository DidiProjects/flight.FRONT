# flight.FRONT

Frontend para gerenciar rotinas de monitoramento de preços de voos. O usuário cria/edita rotinas e recebe alertas quando o preço atinge a meta. Consome a flight.API (REST).

## Stack

- React 19 + TypeScript 5, build com Vite 6 (PWA via vite-plugin-pwa)
- MUI 6, React Router 7, Zod 4
- Testes: Vitest + Testing Library

## Rodar

```bash
npm install
npm start            # dev em http://localhost:3001
npm run start:exposed # dev acessível pelo celular (ver abaixo)
npm run build        # build de produção (tsc -b && vite build)
npm run preview      # preview do build
npm test             # testes (watch); test:run / test:coverage
```

### Variáveis de ambiente

Copie `.env.example` para `.env`:

```env
VITE_API_URL=/flight                     # relativo: o dev server proxia para a API
VITE_APP_URL=http://100.77.40.44:3001    # onde o app é servido
```

`VITE_API_URL` é **relativo de propósito**. O dev server faz proxy de `/flight`
para `http://localhost:3011` (ver `vite.config.ts`), então front e API ficam na
mesma origem e **não existe CORS em desenvolvimento**. Em produção o CI
sobrescreve o `.env` com a URL absoluta da API, e aí o CORS do backend é o que
vale.

## Acessar pelo celular

```bash
npm run start:exposed
```

O script lê host e porta de `VITE_APP_URL` e faz o dev server escutar **só nesse
endereço**. Basta o Tailscale ligado no celular — funciona em 4G, não precisa
estar na mesma Wi-Fi.

Não use `vite --host`: sem argumento ele escuta em *todas* as interfaces. Nesta
máquina isso publicou o dev server no adaptador de uma VPN comercial e num
loopback virtual com IP público.

Como a API é proxiada pelo mesmo endereço, **nada mais precisa mudar** — o
`.env` da flight.API não é tocado.

### Depurar no celular

No iOS não existe devtools: todo browser é WebKit por baixo, e o Web Inspector
do Safari exige um Mac e só enxerga o Safari — não alcança Opera nem Chrome no
iPhone. O `start:exposed` liga duas coisas para contornar isso:

- **Overlay de erro** — script inline no `<head>`, injetado por plugin. Roda
  antes de qualquer módulo e não depende de rede nem de cache, então aparece
  mesmo quando o erro é no import e a tela fica preta. Erros surgem numa faixa
  vermelha no topo.
- **Eruda** — console completo (log, network, elementos) desenhado na página,
  via botão flutuante. Só existe depois que o bundle carrega.

O log do servidor mostra cada requisição com o **IP de origem**, o que distingue
"não chegou ao PC" de "chegou e o app não montou" — duas causas com o mesmo
sintoma de tela preta.

> **Tela preta depois de instalar dependência nova:** o Vite reotimiza as deps e
> troca o hash (`?v=...`). Um browser com o hash antigo em cache falha no import
> e não mostra nada. Recarregue em aba anônima, ou apague `node_modules/.vite`
> e reinicie.

## Estrutura

```
src/
├── components/   # atoms, molecules, organisms, templates (Atomic Design)
├── pages/        # páginas por rota
├── routes/       # definição de rotas e guards
├── contexts/     # AuthContext, AdminUserContext
├── hooks/        # useAuth, useZodForm, useToast…
├── services/     # camada de API (ApiService base + serviços)
├── types/        # interfaces compartilhadas
├── utils/        # jwt, tokenStore, storage, schemas…
├── providers/    # composição de providers
└── theme/        # tema MUI
```

Aliases de import configurados em `vite.config.ts`: `@`, `@atomic-components`, `@services`, `@contexts`, `@hooks`, `@providers`, `@theme`, `@utils`, `@routes`, `@pages`, `@app-types`.

## Comunicação com a flight.API

Todas as chamadas passam por `ApiService` (`src/services/ApiService.ts`), que prefixa `VITE_API_URL` e injeta `Authorization: Bearer`.

- Access token: só em memória (`tokenStore`).
- Refresh token: `localStorage` na chave `flight_rt` (`storage`).
- Em `401`, `ApiService` enfileira requisições, faz um único `POST /auth/refresh` e repete a chamada; falha → evento `auth:logout`.
- `AuthContext` agenda refresh proativo antes do `exp` do JWT.

## Painel Admin de jobs em tempo real

Rota admin `/admin/jobs` (aba "Jobs"): mostra os jobs de scraping ao vivo
(status, etapa, tempo de execução), permite **interromper** um job e exibe a
timeline de eventos — tudo sem refresh.

- `RealtimeService` abre um **SSE** (`EventSource`) em `GET /flight/admin/stream`.
  Como o `EventSource` não envia header, o access token vai por query param.
- `useRealtimeJobs` mantém o mapa de jobs (snapshot inicial + deltas
  `job.upsert`/`job.removed`) e a timeline (`job.event`).
- `AdminJobsService` cobre as ações REST: `GET /admin/jobs`,
  `GET /admin/jobs/:id/events`, `POST /admin/jobs/:id/cancel`.
