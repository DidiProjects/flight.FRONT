# flight.API — Contrato para o Frontend

## Visão Geral

| Ambiente | Base URL |
|----------|----------|
| Produção | `https://api.didilv93.com/flight` |
| Local    | `http://localhost:3011/flight` |

Todas as rotas autenticadas exigem o header:
```
Authorization: Bearer <accessToken>
```

---

## Ciclo de Autenticação

O frontend **nunca armazena email/senha**. O fluxo é:

```
1. POST /auth/login  →  { accessToken, refreshToken, mustChangePassword }
2. Armazenar accessToken em memória (não em localStorage)
3. Armazenar refreshToken em localStorage ou cookie HttpOnly
4. A cada requisição: enviar accessToken no header Authorization
5. Ao receber 401: chamar POST /auth/refresh para renovar o par de tokens
6. POST /auth/logout: revoga o refreshToken no servidor
```

| Token        | Validade | Armazenamento recomendado |
|--------------|----------|---------------------------|
| accessToken  | 15min    | Memória (variável de estado) |
| refreshToken | 30 dias  | localStorage ou cookie HttpOnly |

**Rotação:** cada chamada a `/auth/refresh` invalida o refreshToken anterior e emite um novo par. Nunca reutilize um refreshToken já utilizado.

---

## Formato de Erros

Todos os erros seguem um de dois formatos:

**Erro de negócio (4xx/5xx):**
```json
{ "error": "mensagem descritiva" }
```

**Erro de validação (422):**
```json
{
  "error": "Validation error",
  "issues": [
    { "path": "email", "message": "Invalid email" }
  ]
}
```

| Status | Significado |
|--------|-------------|
| 400 | Dados inválidos (regra de negócio) |
| 401 | Não autenticado / token expirado |
| 403 | Autenticado mas sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email já cadastrado) |
| 422 | Falha de validação de schema |
| 500 | Erro interno |

---

## Endpoints

### Health

#### `GET /health` — público
```json
// 200
{ "status": "ok", "db": "connected", "timestamp": "2026-04-25T12:00:00.000Z" }

// 503
{ "status": "error", "db": "disconnected" }
```

---

### Auth

#### `POST /auth/login` — público
```json
// Request
{
  "email": "usuario@email.com",
  "password": "senha123"
}

// 200
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque-token>",
  "mustChangePassword": false
}
```

Se `mustChangePassword: true`, redirecionar para a tela de troca de senha antes de qualquer outra ação.

**Erros:**
- `401` — credenciais inválidas
- `403` — conta pendente de aprovação / suspensa / senha provisória expirada

---

#### `POST /auth/refresh` — público
```json
// Request
{ "refreshToken": "<token-atual>" }

// 200
{
  "accessToken": "<novo-jwt>",
  "refreshToken": "<novo-token>"
}
```

Substituir ambos os tokens armazenados. Chamar automaticamente ao receber `401` em qualquer rota autenticada.

**Erros:**
- `401` — token inválido, já utilizado, revogado ou expirado

---

#### `POST /auth/logout` — autenticado
```json
// Request
{ "refreshToken": "<token-atual>" }

// 204 — sem corpo
```

Limpar os tokens armazenados e redirecionar para o login.

---

#### `POST /auth/change-password` — autenticado
```json
// Request
{
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123"
}

// 200 — emite novo par de tokens (mustChangePassword agora false)
{
  "accessToken": "<novo-jwt>",
  "refreshToken": "<novo-token>"
}
```

**Erros:**
- `401` — senha atual incorreta

---

#### `POST /auth/forgot-password` — público
```json
// Request
{ "email": "usuario@email.com" }

// 200
{ "message": "Se o email existir, você receberá as instruções em breve." }
```

Sempre retorna 200 (não revela se o email existe).

---

#### `POST /auth/reset-password/:token` — público
```json
// Request
{ "password": "novaSenha123" }

// 200
{ "message": "Senha redefinida com sucesso." }
```

**Erros:**
- `404` — token inválido
- `400` — token já utilizado ou expirado

---

### Users — somente admin

Todas as rotas abaixo exigem role `admin`.

#### `GET /users?page=1&limit=20` — admin
```json
// 200
{
  "users": [
    {
      "id": "uuid",
      "email": "usuario@email.com",
      "role": "user",
      "status": "active",
      "mustChangePassword": false,
      "provisionalExpiresAt": null,
      "createdAt": "2026-04-25T12:00:00.000Z",
      "updatedAt": "2026-04-25T12:00:00.000Z"
    }
  ],
  "total": 42
}
```

---

#### `POST /users` — admin
Cria um usuário com senha provisória enviada por email. O usuário nasce com `status: "pending"` e precisa ser aprovado.

```json
// Request
{ "email": "novo@email.com" }

// 201
{ "message": "Usuário criado. Email com senha provisória enviado." }
```

**Erros:**
- `409` — email já cadastrado

---

#### `GET /users/:id` — admin
```json
// 200 — mesmo shape de um item de GET /users
```

---

#### `PATCH /users/:id/approve` — admin
Aprova um usuário pendente e define seu papel.

```json
// Request
{ "role": "user" }  // "user" | "admin"

// 200
{ "message": "Usuário aprovado." }
```

**Erros:**
- `400` — usuário não está com status `pending`
- `404` — usuário não encontrado

---

#### `PATCH /users/:id` — admin
Atualiza role e/ou status de um usuário ativo.

```json
// Request (todos opcionais)
{
  "role": "admin",
  "status": "suspended"
}

// 200
{ "message": "Usuário atualizado." }
```

**Erros:**
- `403` — tentativa de editar outro administrador

---

#### `DELETE /users/:id` — admin
```
// 204 — sem corpo
```

**Erros:**
- `403` — tentativa de remover administrador ou a própria conta
- `404` — usuário não encontrado

---

### Airlines

#### `GET /airlines` — autenticado
```json
// 200
[
  { "code": "azul", "name": "Azul Linhas Aéreas", "active": true }
]
```

Usar os valores de `code` para criar rotinas.

---

### Routines

Cada usuário vê e gerencia apenas suas próprias rotinas. Limite de **10 rotinas por usuário**.

#### `GET /routines` — autenticado
```json
// 200
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Lisboa ida",
    "airline": "azul",
    "origin": "VCP",
    "destination": "LIS",
    "outboundStart": "2026-06-01",
    "outboundEnd": "2026-06-07",
    "returnStart": null,
    "returnEnd": null,
    "passengers": 1,
    "targetBrl": 2500.00,
    "targetPts": null,
    "targetHybPts": null,
    "targetHybBrl": null,
    "margin": 0.1,
    "priority": "brl",
    "notificationMode": "alert_only",
    "notificationFrequency": "hourly",
    "endOfPeriodTime": null,
    "ccEmails": [],
    "pendingRequestId": null,
    "pendingRequestAt": null,
    "isActive": true,
    "createdAt": "2026-04-25T12:00:00.000Z",
    "updatedAt": "2026-04-25T12:00:00.000Z"
  }
]
```

---

#### `POST /routines` — autenticado
```json
// Request
{
  "name": "Lisboa ida",
  "airline": "azul",           // code de GET /airlines
  "origin": "VCP",             // IATA 3 letras
  "destination": "LIS",        // IATA 3 letras
  "outboundStart": "2026-06-01",
  "outboundEnd": "2026-06-07",
  "returnStart": null,         // opcional — viagem de volta
  "returnEnd": null,
  "passengers": 1,             // 1–9
  "targetBrl": 2500.00,        // pelo menos um target obrigatório
  "targetPts": null,
  "targetHybPts": null,
  "targetHybBrl": null,
  "margin": 0.1,               // 0.0–1.0 (10% = 0.1)
  "priority": "brl",           // "brl" | "pts" | "hyb"
  "notificationMode": "alert_only",
  "notificationFrequency": "hourly",
  "endOfPeriodTime": null,     // "HH:MM" — obrigatório se mode = end_of_period
  "ccEmails": []               // até 10 emails adicionais para notificação
}

// 201 — retorna a rotina criada (mesmo shape de GET /routines)
```

**Regras de validação:**
- `targetBrl`, `targetPts` ou `targetHybPts`+`targetHybBrl` — ao menos um obrigatório
- `priority: "hyb"` requer `targetHybPts` e `targetHybBrl`
- `notificationMode: "end_of_period"` requer `endOfPeriodTime`
- `outboundStart` ≤ `outboundEnd`
- `returnStart` ≤ `returnEnd` (se informados)
- Airline deve estar na lista de `GET /airlines`

**Erros:**
- `400` — validação de negócio (datas, airline inválida)
- `403` — limite de 10 rotinas atingido
- `422` — validação de schema

---

#### `GET /routines/:id` — autenticado
```json
// 200 — mesmo shape de um item de GET /routines
```

**Erros:**
- `404` — não encontrada (ou pertence a outro usuário)

---

#### `PATCH /routines/:id` — autenticado
Todos os campos são opcionais. Mesmas regras de validação do POST.

```json
// Request — enviar apenas os campos que mudam
{ "targetBrl": 2200.00 }

// 200 — retorna a rotina atualizada
```

---

#### `DELETE /routines/:id` — autenticado
```
// 204 — sem corpo
```

---

#### `PATCH /routines/:id/activate` — autenticado
```json
// 200 — retorna a rotina com isActive: true
```

---

#### `PATCH /routines/:id/deactivate` — autenticado
```json
// 200 — retorna a rotina com isActive: false
```

---

### Unsubscribe

#### `GET /unsubscribe/:token` — público
Rota acessada via link no email de notificação. Cancela as notificações daquele email para a rotina associada ao token.

```json
// 200
{ "message": "..." }

// 404 — token inválido ou expirado
```

---

## Enums de Referência

### `priority`
| Valor | Significado |
|-------|-------------|
| `brl` | Monitorar menor preço em reais |
| `pts` | Monitorar menor preço em pontos |
| `hyb` | Monitorar menor preço em modo híbrido (pts + taxa) |

### `notificationMode`
| Valor | Comportamento |
|-------|---------------|
| `alert_only` | Notifica apenas quando o preço estiver dentro do target |
| `daily_best_and_alert` | Notifica o melhor preço do dia + alertas de target |
| `end_of_period` | Notifica ao final do período configurado (`endOfPeriodTime`) |

### `notificationFrequency`
| Valor | Frequência de busca |
|-------|---------------------|
| `hourly` | A cada hora |
| `daily` | Uma vez por dia |
| `monthly` | Uma vez por mês |

### `user.status`
| Valor | Significado |
|-------|-------------|
| `pending` | Aguardando aprovação do admin |
| `active` | Ativo |
| `suspended` | Suspenso |

---

## Fluxo de Telas Sugerido

```
Login
  ├─ mustChangePassword: true  →  Trocar Senha  →  Dashboard
  └─ mustChangePassword: false →  Dashboard

Dashboard
  ├─ /routines  →  lista de rotinas do usuário
  └─ /airlines  →  usado no formulário de criação

Admin
  └─ /users  →  gestão de usuários (approve, suspend, delete)

Esqueci a senha
  └─ /auth/forgot-password  →  email com link
       └─ /auth/reset-password/:token  →  nova senha  →  Login
```

---

## Notas de Implementação

- **Renovação automática de token:** interceptar respostas `401` e tentar `POST /auth/refresh` antes de redirecionar para o login. Se o refresh também falhar com `401`, redirecionar para o login.
- **mustChangePassword:** bloquear toda a navegação até que a senha seja trocada via `POST /auth/change-password`.
- **Paginação em `/users`:** parâmetros `page` (default 1) e `limit` (default 20, máx 100). A resposta inclui `total` para calcular o número de páginas.
- **IATA:** campos `origin` e `destination` são sempre 3 letras maiúsculas. A API converte automaticamente.
- **Datas:** formato `YYYY-MM-DD` em todos os campos de data de rotinas.
- **`isActive`:** rotinas inativas não são monitoradas pelo scheduler. Usar activate/deactivate para pausar/retomar sem deletar.
