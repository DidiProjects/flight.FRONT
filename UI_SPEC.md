# flight.FRONT — UI Spec & Implementation Guide

> Documento operacional. Use isto como **fonte de verdade** ao ajustar qualquer tela do projeto. Ao final há um checklist de verificação por tela.
>
> Princípio geral: a UI atual já reflete a direção de design correta. Esta spec **trava** essa direção, padroniza o que ainda diverge entre telas e fecha as lacunas de **responsividade**. Não introduzir novos conceitos visuais sem atualizar este doc primeiro.

---

## 1. Stack & restrições

- React 19 + TypeScript + Vite + MUI v6 (Emotion). Roteamento com React Router 7. Toasts via notistack (`toastEmitter`).
- Atomic Design já estabelecido: `atoms / molecules / organisms / templates / pages`. Manter essa hierarquia ao criar componentes.
- Estilização: `sx` ou `style.ts` co-localizado por componente. **Não** introduzir Tailwind, CSS Modules ou styled-components avulsos.
- Tokens de cor vivem em `src/theme/palette.ts` — **toda cor da UI deve referenciar o tema** (`'primary.main'`, `'text.secondary'` etc.). Hex literal só dentro de `palette.ts`.

---

## 2. Tokens visuais (travados)

### 2.1 Cores (espelhar `src/theme/palette.ts`)

| Token | Uso |
|---|---|
| `primary.main` `#1E3A5F` | Header, botões primários, ações principais |
| `primary.light` `#2E5B8A` | Hover de itens nav |
| `secondary.main` `#4A90D9` | Ícones de rota, links, acentos |
| `background.default` `#F7F8FA` | Fundo de página autenticada |
| `background.paper` `#FFFFFF` | Cards, dialogs, drawers, inputs |
| `text.primary` `#1A1A2E` | Títulos e valores |
| `text.secondary` `#5A6478` | Labels, captions, descrições |
| `text.disabled` `#9BA5B4` | Placeholders, estados inativos |
| `divider` `#E4E8EF` | Bordas e separadores |
| `success.main` `#2D9B6B` / `success.light` `#E8F7F1` | Status "Ativa", target atingido |
| `warning.main` `#D9860A` / `warning.light` `#FEF3E2` | Status "Pendente", "Deve trocar senha" |
| `error.main` `#D94040` / `error.light` `#FDEAEA` | Status "Suspenso", botões destrutivos |
| `info.main` `#4A90D9` / `info.light` `#EBF3FC` | Badges de companhia, ícones em chips |

### 2.2 Tipografia

- Fonte: padrão MUI (Roboto/system) — não trocar sem revisar todo o `palette` + `typography`.
- Pesos: **400 (regular)** e **500 (medium)**. Evitar 600/700 — pesa demais contra o tom navy/cinza claro.
- Escala em uso (manter):
  - `h2` → títulos de página (Dashboard, Admin, Login). 20px / 500.
  - `h5` → títulos de drawer/dialog. 17px / 500.
  - `body2` → texto corrente em cards e tabelas. 13px / 400.
  - `caption` → labels e helper text. 11–12px.
  - IATAs (origem/destino): 18px / 500 com `letter-spacing: 0.5px`, sempre maiúsculo.

### 2.3 Espaçamento, radius e sombras

- Espaçamento: múltiplos do `theme.spacing` (8px). Verticais grossos em `rem` quando fizer sentido (`mb: 3` = 24px).
- Border radius:
  - `8px` para botões, inputs, chips, pills de status, badges.
  - `12px` para cards (`RoutineCard`), tabelas (Paper).
  - `16px` para o card de auth (login/registro).
- **Sombras: nenhuma.** Hierarquia se constrói com bordas `1px solid divider` (ou `0.5px` em divisões internas) e contraste `paper` vs `default`. Único shadow permitido: focus ring nativo do MUI.
- Animações: somente `fadeInDown 0.4s` no logo e `fadeInUp 0.4s 0.1s` no card auth (já existe). Não acrescentar transições novas sem atualizar este doc.

---

## 3. Breakpoints & regras globais de responsividade

MUI defaults: `xs=0 / sm=600 / md=900 / lg=1200 / xl=1536`.

| Categoria | xs (mobile) | sm (≥600) | md (≥900) | lg (≥1200) | xl (≥1536) |
|---|---|---|---|---|---|
| Container max-width | full | 600 | 900 | 1200 | 1280 |
| Padding lateral página | `16px` | `24px` | `32px` | `32px` | `40px` |
| Grid de RoutineCard | 1 col | 2 col | 2 col | 2 col | 3 col |
| Drawer RoutineForm | fullscreen | 480px | 520px | 560px | 560px |
| Header nav text | esconde rótulo "Rotinas/Admin" | mostra | mostra | mostra | mostra |
| Auth card padding | 24px | 32px | 32px | 32px | 32px |
| Tabela Admin | colapsa em cards | tabela | tabela | tabela | tabela |

Regras universais:
- Nada de `position: fixed` que não seja AppBar (`position: sticky` continua válido).
- Toques em mobile: alvos clicáveis ≥ 40×40 (já é default do MUI `IconButton`). Evitar `size="small"` em controles primários no mobile.
- Texto não deve usar `nowrap` em conteúdo do usuário (nome de rotina, email). Usar `overflow: hidden; text-overflow: ellipsis` quando o container puder cortar.
- Imagens/SVGs decorativos: `aria-hidden`. Ícones com função: `aria-label`.

---

## 4. Padrões transversais

### 4.1 AppHeader (organism)

- `AppBar position="sticky" elevation={0}` com `backgroundColor: 'primary.main'`.
- Toolbar: logo (botão para `/dashboard`), navegação central, ações à direita (admin shortcut + logout).
- **Mobile (xs)**: navegação vira ícones-only ou itens condensados; itens textuais "Rotinas/Admin" escondem `display: { xs: 'none', sm: 'flex' }`. Ícone de admin e logout permanecem visíveis.
- Item ativo: fundo `rgba(255,255,255,0.12)` + texto branco. Inativo: texto `rgba(255,255,255,0.7)`. Hover: opacidade do texto sobe a 0.9 + fundo `rgba(255,255,255,0.06)`.
- Logout abre Menu de confirmação (já implementado) — manter.

### 4.2 AppLayout / AuthLayout

- `AppLayout`: header sticky + `<main>` com `bgcolor: 'background.default'`, padding responsivo (tabela §3).
- `AuthLayout`: container `maxWidth="sm"` centralizado, logo acima do card. Fundo com gradiente radial leve já em `style.ts` — manter.

### 4.3 Toasts (notistack)

- 4 variantes: `success` / `error` / `warning` / `info`. Sempre via `toastEmitter.{variant}('mensagem')`.
- Mensagens em **português, frase imperativa ou afirmação curta** ("Rotina criada!", "Credenciais inválidas.", "Usuário aprovado."). Sem stack traces ou jargões técnicos.
- Toasts não substituem confirmação destrutiva — operações irreversíveis sempre passam por `ConfirmDialog`.

### 4.4 Loading

- Carregamento de página/lista: `LinearProgress` com `borderRadius: '4px'` no topo do conteúdo, abaixo do header da página.
- Carregamento dentro de botão: `CircularProgress size={16-18} color="inherit"` como `startIcon`.
- **Não** usar overlays bloqueantes em telas autenticadas.

### 4.5 EmptyState (molecule)

- Padrão único: ícone circular `info.light` 56×56 com cor `info.dark`, título 16/500, descrição 13/400 `text.secondary`, botão primário.
- Reutilizar para Dashboard sem rotinas, Admin sem usuários e qualquer tela futura sem dados.

### 4.6 ConfirmDialog (molecule)

- `maxWidth="xs"`, `fullWidth`, título 16/500, mensagem `body2 text.secondary`.
- Botões: `Cancelar` (outlined) à esquerda, ação destrutiva (contained `color="error"` ou `color="success"` quando aprovação) à direita. Spinner no botão durante `loading`.
- Sempre exigido para excluir, suspender e qualquer mudança de estado irreversível.

---

## 5. Telas — especificação por página

> Para cada tela: estrutura, campos/estados, regras responsivas e checklist próprio. Os IDs `[L1]`, `[D3]` etc. servem de referência cruzada nos commits.

### 5.1 Login `[L]`

- **L1** Layout: `AuthLayout`. Card branco 100% até `sm`, depois 480px max.
- **L2** Conteúdo: título "Entrar" h2, subtítulo "Acesse seu painel de monitoramento" body2 secondary, dois `FormField` (Email, Senha), link "Esqueci minha senha" alinhado à esquerda, botão primário 100% width "Entrar", link inferior centralizado "Não tem conta? Solicitar acesso".
- **L3** Estados: enquanto `loading`, botão exibe spinner e fica desabilitado. Erro 401 → `toastEmitter.error('Credenciais inválidas.')` (sem inline error nos campos).
- **L4** Pós-login: se `mustChangePassword` → redirect `/change-password`, senão `from || /dashboard`.
- **L5** Mobile: padding do card 24px, campos ocupam 100%, links permanecem dentro do card.

### 5.2 Register `[R]`

- Mesma moldura do Login. Campos mínimos: Email + (opcional) Nome. Mensagem de sucesso pós-submit instrui usuário a aguardar aprovação.
- Link inferior: "Já tem conta? Entrar".
- Status do usuário criado: `pending` (aguarda admin).

### 5.3 ForgotPassword `[FP]`

- `AuthLayout`. Um único campo Email. Botão "Enviar instruções". Toast de sucesso genérico ("Se este email existir, enviaremos instruções.") — **nunca confirmar existência do email** (anti-enumeration).
- Link inferior: "Voltar ao login".

### 5.4 ResetPassword `[RP]`

- `AuthLayout`. Token vem por query string. Dois campos: Nova senha, Confirmar nova senha (com indicação de match). Botão "Definir nova senha". Sucesso → toast + redirect `/login`.
- Validação: comprimento mínimo 8, mostra critério em helper text quando inválido.

### 5.5 ChangePassword `[CP]`

- `AppLayout` (autenticado). Mesmo layout dos campos de ResetPassword + campo "Senha atual".
- Acessível a partir do fluxo `mustChangePassword` (forçado, sem header de navegação? — manter header normal mas bloquear navegação até concluir? **Decisão: header normal continua, redirect automático no `ProtectedRoute` até `mustChangePassword=false`**).

### 5.6 Unsubscribe `[U]`

- `AuthLayout` mesmo quando deslogado (a página é acionada por link de email).
- Mostra rotina identificada pelo token, botão "Pausar notificações desta rotina" + link "Cancelar".

### 5.7 Dashboard / Rotinas `[D]`

- **D1** Header da página: título h2 "Minhas rotinas", subtítulo `${count} rotina(s) cadastrada(s) · limite de 10`, botão "Nova rotina" primário com `<AddIcon />`. Botão **desabilita** quando `count >= 10` e ganha tooltip "Limite de 10 rotinas atingido".
- **D2** Loading: `LinearProgress` no topo, mantém o cabeçalho.
- **D3** Empty: `EmptyState` com `FlightTakeoffIcon`, título "Nenhuma rotina ainda", botão "Criar primeira rotina".
- **D4** Grid de `RoutineCard`: `Grid container spacing={2}`. Tamanhos: `xs:12 sm:6 xl:4`. Paginação client-side de 10 itens, `Pagination shape="rounded"` centralizada abaixo.
- **D5** Edição: clicar lápis no card abre `RoutineForm` em modo edit. Toggle ativa/pausa otimista.
- **D6** Mobile: header empilha — título acima, botão "Nova rotina" 100% width abaixo. Cards passam a 1 coluna.

#### RoutineCard `[D-Card]`

- Ordem fixa do conteúdo (top→bottom):
  1. Linha `airline badge` (esquerda) + status pill com bullet (direita).
  2. Bloco "rota hero": IATA origem · seta · IATA destino (e seta volta + IATA origem se houver volta).
  3. Nome da rotina (`body2 secondary`, abaixo da rota).
  4. Grid 2 colunas com Ida, Volta (ou "Somente ida"), Passageiros, Frequência.
  5. Linha full-width com Target (formatação por prioridade: BRL `Intl currency`, pts `toLocaleString` + " pts", híbrido "X pts + R$ Y,YY").
  6. Linha full-width Prioridade.
- Footer: switch ativa/pausada à esquerda + ícones Editar/Excluir à direita.
- **Card pausado**: opacidade do conteúdo cai a 0.85 e badge de companhia fica em escala de cinza. Switch e ícones permanecem 100%.
- Padding interno: 14–16px. Gap entre seções: 10–12px.

### 5.8 RoutineForm Drawer `[F]`

- **F1** Tipo: `Drawer anchor="right"`. **xs: fullscreen** (`sx={{ '& .MuiDrawer-paper': { width: '100%' } }}`). `sm`: 480px. `md+`: 520–560px.
- **F2** Estrutura: header (título + close), body com 4 sections separadas por `Divider`, footer fixo (Cancelar + ação primária).
  1. **Rota** — Nome, Companhia, Origem ✈ Destino (DebouncedField 300ms; IATAs com `text-transform: uppercase`, `maxLength=3`, `letter-spacing: 0.15em`).
  2. **Período** — Ida (obrigatório, 2 datas), Volta (opcional, 2 datas, label com tag "opcional").
  3. **Target de preço** — Passageiros (1–9), Margem % (0–100), Prioridade select (BRL/pts/híbrido), campos de target que **mudam dinamicamente** conforme prioridade.
  4. **Notificações** — Modo (alert_only / daily_best_and_alert / end_of_period), Frequência (hourly/daily/monthly), Horário se `end_of_period`, CC emails (chips, máx. 10), card de "Rotina ativa" com switch.
- **F3** Validação: submit bloqueado até campos obrigatórios estarem preenchidos (`name`, `airline`, `origin`, `destination`, `outboundStart`, `outboundEnd`).
- **F4** Em edição: header muda para "Editar rotina" + subtítulo "Atualize os parâmetros…", botão final "Salvar alterações".
- **F5** Mobile: footer com botões empilhados (Cancelar full-width acima, primário full-width abaixo). Sections mantêm ícone + título à esquerda. Sub-rows que estavam em flex viram column (`flexDirection: { xs: 'column', sm: 'row' }`).

### 5.9 Admin `[A]`

- **A1** Disponível só com `role === 'admin'`. `AdminRoute` redireciona não-admin para `/dashboard`.
- **A2** Header de página: título h2 "Usuários", subtítulo `${total} usuário(s) cadastrado(s)`, botão "Novo usuário" primário com `<PersonAddAltIcon />`.
- **A3** Conteúdo:
  - Empty: `EmptyState` com `GroupOutlinedIcon`.
  - Lista (≥sm): `Paper variant="outlined"` envolvendo `UserTable`. Colunas: Email, Role, Status (`StatusChip`), Criado em, Ações (alinhado à direita).
  - Lista (xs): tabela colapsa em **lista de cards** (cada usuário vira um card com email + role chip + status pill + data + menu kebab). Manter mesmo conjunto de ações.
- **A4** Ações por status:
  - `pending` → ícone check verde direto (abre dialog de aprovar com select de role).
  - `active` → kebab → Suspender (warning), Excluir (error).
  - `suspended` → kebab → Reativar (success), Excluir (error).
- **A5** Paginação server-side `LIMIT=20`. Componente `Pagination` igual ao Dashboard.
- **A6** "Deve trocar senha" aparece como caption `warning.main` abaixo do email na linha.

### 5.10 Modais transversais `[M]`

- **M1 Criar usuário**: `Dialog maxWidth="xs"`. Campo Email + helperText "Uma senha provisória será enviada para este email.". Botões: Cancelar (outlined), Criar (contained, primary).
- **M2 Aprovar/Reativar**: `Dialog maxWidth="xs"`. Mostra email do usuário. Se `pending`: `FormField select` com Role (Usuário/Admin). Botão Confirmar contained `color="success"`.
- **M3 Confirmação de exclusão (`ConfirmDialog`)**: padrão §4.6.

---

## 6. Atoms & Molecules — comportamento

### FormField

- Wrapper de `TextField` com label sempre por cima (não floating). `size="medium"` por padrão. `helperText` reservado para hint/erro — não sumir o espaço quando vazio (evita layout shift). Para selects, usar prop `select` + `<MenuItem>` filhos.

### Logo

- Tamanhos: `sm` (header autenticado) ≈ 22px ícone + texto 15px. `lg` (auth) ≈ 36px ícone + texto 22px. Cor herda do contexto (branco no header navy, primary nas auth).

### StatusChip

- Mapeamento status → cor:
  - `active` → success (`E8F7F1` bg, `1E7050` texto, bullet `2D9B6B`).
  - `pending` → warning (`FEF3E2` / `A86308` / `D9860A`).
  - `suspended` → error (`FDEAEA` / `A82E2E` / `D94040`).
  - `paused` (rotina) → neutro (`F1EFE8` / `5F5E5A` / `9BA5B4`).
- Sempre bullet 6×6 + label. `border-radius: 99px`.

### Spinner / ActiveBadge

- `Spinner`: `CircularProgress` com tamanho controlado por prop. Cor `inherit` quando dentro de botão.
- `ActiveBadge`: bullet + texto. Não duplicar com `StatusChip` em uma mesma linha.

---

## 7. Acessibilidade (mínimo obrigatório)

- Toda ação por ícone usa `aria-label` em pt-BR.
- Inputs sempre dentro de `<label>` ou com `aria-labelledby`. `FormField` já trata.
- Foco visível: confiar no MUI default (anel de outline) — não removê-lo.
- Contraste: textos secundários precisam respeitar AA contra `background.default` e `background.paper`. `text.disabled` só para placeholders/itens inativos, nunca para conteúdo.
- Navegação por teclado: `Drawer` e `Dialog` mantêm trap focus do MUI.
- `prefers-reduced-motion`: as animações `fadeInDown/fadeInUp` devem ser suprimidas via media query no `style.ts` do `AuthLayout`.

---

## 8. Checklist de verificação por tela

Marcar cada item antes de considerar a tela "conforme spec".

### Login `[L]`
- [ ] L1 Card respeita largura responsiva (full xs, 480 ≥sm).
- [ ] L2 Hierarquia visual idêntica ao protótipo.
- [ ] L3 Erro 401 dispara toast (não inline), botão volta ao estado normal.
- [ ] L4 Redirecionamentos pós-login corretos.
- [ ] L5 Em viewport 360px, formulário não cria scroll horizontal.

### Register `[R]`
- [ ] Layout idêntico ao Login.
- [ ] Toast pós-submit informa aprovação pendente.

### ForgotPassword `[FP]`
- [ ] Mensagem genérica (anti-enumeration) confirmada.
- [ ] Link "Voltar ao login" presente.

### ResetPassword `[RP]`
- [ ] Validação de senha mínima e match entre os dois campos.
- [ ] Token inválido/expirado mostra estado de erro com CTA para "Solicitar novo link".

### ChangePassword `[CP]`
- [ ] Acesso forçado quando `mustChangePassword=true` — `ProtectedRoute` redireciona até concluir.
- [ ] Header de aplicação visível, mas navegação para outras rotas autenticadas redireciona de volta enquanto pendente.

### Unsubscribe `[U]`
- [ ] Funciona deslogado.
- [ ] Mostra dados da rotina identificada.

### Dashboard `[D]`
- [ ] D1 Botão "Nova rotina" desabilita em count≥10 com tooltip.
- [ ] D2 LinearProgress no topo durante load.
- [ ] D3 EmptyState aparece quando count=0.
- [ ] D4 Grid xs:1 / sm:2 / xl:3 confirmado em DevTools (320, 600, 1200, 1536).
- [ ] D5 Toggle ativa/pausa atualiza otimisticamente.
- [ ] D6 Em xs, header empilha e botão fica 100%.
- [ ] D-Card Pausada → opacidade 0.85 e badge dessaturado.
- [ ] D-Card Target formata corretamente nas 3 prioridades.

### RoutineForm `[F]`
- [ ] F1 Drawer fullscreen em xs, 480px em sm.
- [ ] F2 Sections com ícone + Divider entre elas.
- [ ] F3 Submit bloqueado com campo obrigatório vazio.
- [ ] F4 Modo edit muda título, subtítulo e label do botão.
- [ ] F5 Em xs, footer com botões empilhados; rows responsivas viram column.

### Admin `[A]`
- [ ] A1 Não-admin é redirecionado.
- [ ] A2 Header com contagem.
- [ ] A3 Em xs, tabela vira lista de cards (mesma informação, mesmas ações).
- [ ] A4 Ícone direto para aprovar pending; kebab para active/suspended.
- [ ] A5 Paginação aparece quando `total > LIMIT`.
- [ ] A6 "Deve trocar senha" aparece como caption warning.

### Modais `[M]`
- [ ] M1/M2/M3 maxWidth="xs", botões com spinner em loading, foco inicial no primeiro campo.
- [ ] Dialog ESC e clique fora fecham — exceto durante loading.

### Acessibilidade
- [ ] Todos os IconButton com aria-label.
- [ ] Tab order natural em cada tela.
- [ ] Reduced-motion respeitado nas animações de auth.

### Responsividade global
- [ ] Sem scroll horizontal em nenhuma tela a 360px de largura.
- [ ] Header mantém legibilidade em todos os breakpoints.
- [ ] Drawer e Dialog ocupam viewport corretamente em xs.

---

## 9. Como aplicar uma mudança nesta spec

1. Atualizar a seção correspondente neste documento **antes** de tocar código.
2. Implementar.
3. Marcar os itens do checklist (§8) afetados.
4. Em PRs/commits, citar o ID (`[D-Card] target hyb formatting`).

## 10. Onde está o que (referência rápida)

- Tema: `src/theme/palette.ts`, `typography.ts`, `components.ts`, `index.ts`.
- Layouts: `src/components/templates/{AppLayout,AuthLayout}/`.
- Header: `src/components/organisms/AppHeader/`.
- Cards/forms/tabela: `src/components/molecules/RoutineCard/`, `src/components/organisms/{RoutineForm,UserTable}/`.
- Páginas: `src/pages/{Login,Register,ForgotPassword,ResetPassword,ChangePassword,Unsubscribe,Dashboard,Admin}/`.
- Rotas: `src/routes/{index,ProtectedRoute,AdminRoute}.tsx`.
- Services (sem UI): `src/services/`.
