# flight.FRONT

React + Vite + MUI. Interface do monitoramento de voos. Dev server na 3001, com
proxy de `/flight` para a API na 3011 (ver `vite.config.ts`).

Regras gerais (autonomia, commits, testes, comentários) vivem em `~/.claude/`.
Aqui só o que é armadilha **deste** repositório.

## Armadilhas medidas

- **Zod 4 aqui, Zod 3 no flight.API.** No 4 o segundo argumento do `.refine`
  **não aceita função** — mensagem dinâmica vira `"Invalid input"` e mascara o
  erro real. Portar validação da API exige separar em refines com texto
  estático.
- **`routines.currency` é a unidade do ALVO, sempre Real** — não é a moeda da
  tarifa. Rotular preço com ela mostra `R$ 26` para uma tarifa de `£ 25,99`. A
  moeda de exibição vem do que a API devolveu (`summary.currency ?? fallback`),
  como no `RoutineCard` e no `PriceHistoryPanel`.
- **`NUMERIC` chega como string da API.** Coagir antes de somar ou comparar,
  senão a comparação vira lexicográfica.
- **`.env` é obrigatório e não é versionado.** Sem `VITE_API_URL` o
  `ApiService` chama `undefined/auth/login` — não há fallback. Copiar de
  `.env.example`.

## Testes

`npm run test:run`. O `PriceHistoryPanel.test.tsx` é sensível a carga: sob
máquina ocupada estoura o timeout de 5s e o teste seguinte acha "multiple
elements" por DOM não desmontado. Antes de tratar como regressão, rodar o
arquivo isolado.

## Build

`npm run build` é `tsc -b && vite build` — erro de tipo impede o bundle de ser
gerado. Rodar o build, não só os testes, antes de dizer que está pronto.
