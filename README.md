# flight.FRONT

Frontend para gerenciar rotinas de monitoramento de preços de voos. O usuário cria/edita rotinas e recebe alertas quando o preço atinge a meta. Consome a flight.API (REST).

## Stack

- React 19 + TypeScript 5, build com Vite 6 (PWA via vite-plugin-pwa)
- MUI 6, React Router 7, Zod 4
- Testes: Vitest + Testing Library

## Rodar

```bash
npm install
npm start          # dev em http://localhost:3000
npm run build      # build de produção (tsc -b && vite build)
npm run preview    # preview do build
npm test           # testes (watch); test:run / test:coverage
```

### Variáveis de ambiente

Copie `.env.example` para `.env`:

```env
VITE_API_URL=http://localhost:3011/flight   # base da flight.API (inclui o prefixo /flight)
VITE_APP_URL=http://localhost:3000
```

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
