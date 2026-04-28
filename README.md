# flight.FRONT

Frontend for the Flight Price Monitor — a web application that lets users create and manage routines to track airline ticket prices, receiving alerts when prices hit their targets.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 6 |
| UI library | MUI 6 (Material UI) |
| Language | TypeScript 5 |
| Validation | Zod 4 |
| Routing | React Router 7 |
| Testing | Vitest + Testing Library |
| Deploy | Netlify |

## Features

- **Authentication** — Login, registration, forgot/reset password, forced password change on first access
- **Monitoring routines** — Create, edit, activate/deactivate and delete flight price monitoring routines
- **Fare types** — Monitor by BRL price, points, or hybrid (points + airport fee), dynamically filtered per airline
- **Notifications** — Configure notification mode (on target, daily best, scheduled) and frequency (hourly, daily, monthly), with CC email support
- **Admin panel** — User management: approve pending registrations, assign roles, suspend and delete accounts
- **Admin user routines** — Admins can inspect the routines of any user

## Architecture

The project follows **Atomic Design**:

```
src/
├── components/
│   ├── atoms/          # Basic UI primitives (Logo, Spinner, StatusChip…)
│   ├── molecules/      # Composed components (RoutineCard, FormField, EmptyState…)
│   ├── organisms/      # Feature-level components (RoutineForm, UserTable, AppHeader)
│   └── templates/      # Page layout shells (AppLayout, AuthLayout)
├── pages/              # Route-level page components
├── contexts/           # React Context providers (AuthContext, AdminUserContext)
├── hooks/              # Custom hooks (useAuth, useZodForm, useToast…)
├── services/           # API layer (ApiService, AuthService, RoutinesService…)
├── types/              # Shared TypeScript interfaces
├── utils/              # Helpers (jwt, tokenStore, storage, schemas…)
├── routes/             # Route definitions and guards
├── providers/          # App-level provider composition
└── theme/              # MUI theme customization
```

### Path aliases

| Alias | Resolves to |
|---|---|
| `@atomic-components` | `src/components` |
| `@services` | `src/services` |
| `@contexts` | `src/contexts` |
| `@hooks` | `src/hooks` |
| `@providers` | `src/providers` |
| `@theme` | `src/theme` |
| `@utils` | `src/utils` |
| `@routes` | `src/routes` |
| `@pages` | `src/pages` |
| `@app-types` | `src/types` |
| `@` | `src` |

## Authentication

Token handling follows a secure-by-default pattern:

- **Access token** — stored in memory only (cleared on page reload)
- **Refresh token** — persisted in `localStorage` under the key `flight_rt`
- **Reactive refresh** — on any `401` response, `ApiService` queues concurrent requests and performs a single refresh call, then retries
- **Proactive refresh** — `AuthContext` decodes the JWT `exp` claim and schedules a `setTimeout` to refresh ~60 seconds before expiry, preventing mid-session expirations for active users

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Environment variables

Create a `.env.local` file at the project root:

```env
VITE_API_URL=http://localhost:8000
```

### Install & run

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build      # production build
npm run preview    # preview production build locally
```

### Tests

```bash
npm test               # watch mode
npm run test:run       # single run
npm run test:coverage  # coverage report
```
