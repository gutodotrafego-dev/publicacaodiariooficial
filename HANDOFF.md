# HANDOFF — Central de Publicações (Landing Page)

> Documento de transferência de contexto entre sessões do Claude Code.
> Gerado por inspeção direta do código-fonte em 2026-07-06.
> Não contém valores reais de segredos/credenciais — apenas nomes de variáveis e propósito.

Caminho do projeto: `/Users/augustobianchini/Desktop/Fourteam/Claude/Code/central-de-publicacoes/`
(Não existe diretório `src/` — `app/`, `components/`, `config/`, `lib/`, `types/`, `public/` estão na raiz do projeto.)

---

## 1. Contexto do Projeto

Landing page de geração de leads ("lead-gen") para a **Central de Publicações**, empresa que
intermedia publicações legais/oficiais (Diário Oficial da União, Diários Oficiais Estaduais,
jornais privados, editais/licitações, balanços/atas/convocações).

- **Objetivo**: converter tráfego pago (Google Ads / Meta Ads) em leads via formulário, com
  continuidade da conversa no WhatsApp. **Não é** um site institucional tradicional — cada rota é
  uma landing page de conversão com uma única CTA principal.
- **Cores oficiais da marca (imutáveis)**: verde `#058421` e vermelho `#FF0302`
  (ver `lib/brand-colors.ts` e `tailwind.config.ts`, tokens `brand.green` / `brand.red`).
- **Conceito visual**: "Editorial Legal-Tech Institucional" — transmitir credibilidade,
  experiência, organização, atendimento humano, segurança e especialização, sem parecer órgão
  público (nenhum brasão, selo ou símbolo que sugira vínculo governamental).

---

## 2. Estado Atual

### Stack confirmada (`package.json`)
- Next.js `^15.3.4` (App Router), React `^19.0.0`, TypeScript `^5`
- Tailwind CSS `^3.4.17`
- `react-hook-form` `^7.54.2` + `@hookform/resolvers` `^3.9.1` + `zod` `^3.24.1`
- `lucide-react` `^0.511.0`
- `server-only` `^0.0.1` (usado em `lib/lead-service.ts` e `lib/google-places.ts` para garantir
  que código sensível nunca seja incluído no bundle do cliente)

### Scripts confirmados (`package.json`)
```
dev:       next dev
build:     next build
start:     next start
lint:      next lint
typecheck: tsc --noEmit
```

### Rotas (App Router, todas em `app/`)
- `/` (`app/page.tsx`) — home, usa `landingPages.home`
- `/diario-oficial-uniao`
- `/diario-oficial-estado`
- `/publicar-edital`
- `/publicacao-legal`
- `/orcamento-publicacao`
- `/politica-de-privacidade` — conteúdo placeholder, marcado `noindex`, fora do sitemap
- `/termos-de-uso` — conteúdo placeholder, marcado `noindex`, fora do sitemap
- `/api/leads` (`app/api/leads/route.ts`) — único endpoint de API, `POST` (lead) e `GET` (405)

Todas as landing pages de conteúdo (exceto legais) são geradas a partir de `config/landing-pages.ts`
(`landingPages: Record<string, LandingPageConfig>`) e renderizadas por
`components/landing/landing-page.tsx`. Cada rota de página apenas seleciona a config e chama
`<LandingPage config={...} />` — confirmado nos arquivos de rota (`app/page.tsx` e equivalentes).

### SEO / metadados
- `app/sitemap.ts` — gera o sitemap a partir de `landingPages`, exclui as páginas legais
  enquanto o conteúdo delas for placeholder.
- `app/robots.ts` — existe (não lido em detalhe nesta sessão, mas confirmado presente).
- `app/icon.tsx` e `app/opengraph-image.tsx` — geram favicon e imagem OG dinamicamente como
  **placeholders funcionais**, com comentário explícito `[CONFIRMAR COM A EMPRESA]` pedindo
  substituição pela arte oficial.
- `buildPageMetadata()` em `config/landing-pages.ts` gera `title`, `description`, `canonical` e
  Open Graph por rota (SEO por página, não genérico).

### Formulário de lead (`components/landing/lead-form.tsx`)
- Campos visíveis no máximo: **nome, WhatsApp, e-mail, necessidade de publicação** (select) — 4 campos.
- Em landing pages com `defaultPublicationNeed` definido (ex.: `/diario-oficial-uniao`), o campo de
  necessidade fica oculto (`<input type="hidden">`) e é pré-preenchido — confirmado em
  `lead-form.tsx` linhas 234-245 e em `config/landing-pages.ts`.
- Sem multi-step. Sem upload de documento no primeiro contato (o FAQ informa explicitamente que o
  envio de documento acontece depois, pelo WhatsApp).
- E-mail é opcional (schema Zod aceita string vazia).

### Fluxo de conversão (confirmado em `lead-form.tsx` + `app/api/leads/route.ts`)
1. Validação client-side com `leadFormSchema` (Zod + `react-hook-form`).
2. `POST /api/leads` com payload incluindo dados de atribuição.
3. Backend revalida com `leadApiSchema` (mais estrito: normaliza telefone, trunca campos de
   atribuição, valida enum de necessidade).
4. Honeypot (`company`): se preenchido, retorna sucesso genérico **sem** encaminhar ao webhook
   (não revela a proteção ao bot).
5. Tempo mínimo de preenchimento: `MIN_FILL_TIME_MS = 2000`ms desde a montagem do formulário —
   abaixo disso, retorna erro `suspicious_submission`.
6. Rate limiting em memória por IP (`lib/rate-limit.ts`): 5 requisições/minuto por chave IP.
7. Encaminhamento ao webhook (`lib/lead-service.ts`), timeout de 8s (`AbortController`), header
   `X-Webhook-Secret` opcional.
8. Somente após resposta `200` do backend, o frontend chama `trackEvent('quote_form_success', ...)`
   e depois `window.location.assign(getWhatsappRedirectUrl(...))` — **o WhatsApp não abre antes da
   confirmação do backend** (confirmado: não há `window.open` nem redirecionamento antes do
   `await fetch(...)` resolver com sucesso).
9. Em caso de erro, o formulário permanece preenchido (nenhum reset de estado) e exibe um bloco de
   erro com dois botões: "Tentar novamente" e "Continuar pelo WhatsApp" (mensagem alternativa via
   `buildWhatsappErrorMessage`, usando `window.location.assign`, não `window.open`).

### Proteções confirmadas no código
- Honeypot (`company`, campo invisível, `tabIndex={-1}`, `aria-hidden`).
- Tempo mínimo plausível de preenchimento (2000ms).
- Rate limiting em memória (`lib/rate-limit.ts`) — **limitação conhecida**: por ser em memória,
  não é compartilhado entre instâncias serverless (comentário no próprio arquivo já documenta isso
  como algo a revisar se o tráfego crescer).
- Validação Zod dupla (client + server), com schema server mais estrito.
- Normalização de telefone (`onlyDigits`, `toWhatsappE164`) e de e-mail (trim + lowercase).
- Sanitização de campos de atribuição via `optionalText(max)` (trim + slice) no schema server.
- Timeout de 8s no `fetch` do webhook, com tratamento de `AbortError`.
- Em falha do webhook, o visitante nunca vê mensagem técnica (mensagens de erro genéricas em
  português, códigos técnicos ficam só no `error.code` da resposta JSON e em `console.error`).

### Atribuição capturada (`lib/attribution.ts`)
Capturada uma única vez por sessão (`sessionStorage`, chave `cdp_attribution_v1`), sem sobrescrever
uma atribuição já existente: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
`gclid`, `fbclid`, `referrer`, `entryUrl` (URL de entrada), `firstVisitAt`. Falha silenciosamente se
`sessionStorage` não estiver disponível (ex.: navegação privada).

### Eventos de analytics confirmados no código (`lib/analytics.ts` + grep em `components/`)
Todos via `trackEvent()` → `window.dataLayer.push(...)` (GTM). **Confirmado por leitura direta do
código**: nenhum evento envia nome, telefone, e-mail ou texto de avaliação — os parâmetros aceitos
pelo tipo `AnalyticsParams` são apenas identificadores/categorias (`page_path`,
`landing_page_type`, `publication_need`, `button_location`, `traffic_source`, `campaign`,
`review_position`).

Lista real de eventos disparados (não há eventos `phone_click` ou `email_click` no código atual —
não presumir que existem):
- `landing_page_view` — `page-view-tracker.tsx`, no mount de cada página
- `hero_whatsapp_click` — `hero.tsx`, botão "Falar diretamente pelo WhatsApp"
- `floating_whatsapp_click` — `floating-whatsapp.tsx`
- `service_card_click` — disparado em vários pontos com `button_location` diferente:
  `header.tsx` ('header'), `final-cta.tsx` ('final_cta'), `urgency-section.tsx`
  ('urgency_section'), `publication-types.tsx` ('publication_types_cta'),
  `publication-channels.tsx` (com `publication_need` em vez de `button_location`)
- `quote_form_start` — `lead-form.tsx`, no primeiro foco do campo nome
- `quote_form_submit` — `lead-form.tsx`, ao submeter
- `quote_form_success` — `lead-form.tsx`, após confirmação do backend
- `quote_form_error` — `lead-form.tsx`, em qualquer falha do fluxo de envio
- `whatsapp_redirect` — `lead-form.tsx`, antes do redirecionamento pós-sucesso
- `faq_open` — `faq.tsx`, com `button_location: faq_{index}`
- `google_review_expand`, `google_reviews_section_view`, `google_reviews_profile_click`,
  `google_review_submission_click` — `google-reviews.tsx`

### Seção de avaliações do Google (`components/landing/google-reviews.tsx` + `config/google-reviews.ts`)
- Suporta avaliações reais via array estático `googleReviews` em `config/google-reviews.ts`
  (atualmente **vazio** — apenas um exemplo comentado como referência de formato).
- Integração opcional com Google Places API (`lib/google-places.ts`, roda só no servidor, chave
  nunca exposta ao cliente): se `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID` não estiverem
  configurados, ou a chamada falhar, retorna `null` silenciosamente.
- `getOfficialGoogleReviews()` (server) é chamado em `landing-page.tsx`; se `null`, cai para o
  array estático `staticGoogleReviews`.
- A seção inteira fica **oculta automaticamente** quando não há nenhuma avaliação (array vazio e
  API não configurada/retornando vazio) — não há avaliações fictícias no código.
- Dois links distintos e independentes: `NEXT_PUBLIC_GOOGLE_REVIEW_URL` (CTA "Deixar uma avaliação
  no Google", já preenchido com `https://g.page/r/Ce8evMwiD456EBM/review` como valor padrão no
  próprio `contactConfig`) e `NEXT_PUBLIC_GOOGLE_MAPS_PROFILE_URL` (CTA "Ver avaliações no
  Google" — fica oculto se vazio).

### Estrutura visual (confirmada em `components/landing/landing-page.tsx`)
Ordem real de seções na página: `PageViewTracker` (invisível) → `Header` (barra verde + header
branco institucional + CTA vermelho) → `Hero` (editorial, com card de formulário destacado) →
`TrustBar` → `PublicationChannels` → `GoogleReviews` (condicional) → `HowItWorks` →
`PublicationTypes` → `Benefits` → `UrgencySection` → `Faq` → `FinalCta` → `Footer` →
`FloatingWhatsapp`.

---

## 3. Principais Arquivos

### Config
- `config/site.ts` — nome do site, descrição, URL pública, dados do logo (`src`, `alt`, `width`,
  `height`), `trust` (anos de experiência, edições publicadas, clientes atendidos).
- `config/contact.ts` — fonte única de dados de contato (WhatsApp, telefones, e-mails, endereço,
  horário, redes sociais, links legais). Usa o marcador `[CONFIRMAR COM A EMPRESA]` +
  `isPendingConfirmation()` para impedir que dados não confirmados sejam renderizados (ex.: evita
  `<a href="tel:[CONFIRMAR COM A EMPRESA]">` quebrado em produção).
- `config/landing-pages.ts` — definição de cada landing page (`LandingPageConfig`): headline,
  subheadline, benefícios, CTA, FAQ, necessidade de publicação padrão, contexto da mensagem de
  WhatsApp, tipo de landing page para analytics. Também exporta `PUBLICATION_NEED_OPTIONS`,
  `getPublicationNeedLabel()` e `buildPageMetadata()`.
- `config/google-reviews.ts` — array estático de avaliações reais (vazio hoje) + flag
  `showGoogleReviews` para desligar a seção manualmente sem apagar dados.

### Backend / Integrações
- `app/api/leads/route.ts` — único endpoint de API. Content-Type check, rate limit, parse JSON,
  validação Zod, honeypot, tempo mínimo de preenchimento, montagem do payload, encaminhamento ao
  webhook, tratamento de erros (503 se webhook não configurado, 502 em falha de envio).
- `lib/lead-service.ts` — `forwardLeadToWebhook()`, chamada HTTP ao `LEAD_WEBHOOK_URL` com timeout
  de 8s e header opcional `X-Webhook-Secret`. Roda apenas no servidor (`import 'server-only'`).
- `lib/google-places.ts` — integração opcional e somente-servidor com a Google Places API,
  cache/revalidação de 1h via `next: { revalidate: 3600 }`.
- `lib/rate-limit.ts` — rate limiting em memória (`Map`), 5 req/min por chave.

### Validação / Utilitários
- `lib/validations.ts` — `leadFormSchema` (client) e `leadApiSchema` (server, mais estrito).
- `lib/phone.ts` — `onlyDigits`, `isValidBrazilianPhone`, `maskBrazilianPhone`, `toWhatsappE164`.
- `lib/whatsapp.ts` — construção de mensagens (sucesso, erro, contato direto, botão flutuante) e
  `getWhatsappRedirectUrl()`.
- `lib/attribution.ts` — captura e leitura de UTMs/gclid/fbclid via `sessionStorage`.
- `lib/analytics.ts` — `trackEvent()`, único ponto de integração com `window.dataLayer` (GTM).
- `lib/form-bus.ts` — barramento de eventos DOM (`CustomEvent`) para permitir que cards de
  serviço, FAQ e blocos de urgência "rolem até o formulário" e pré-selecionem a necessidade de
  publicação, sem acoplamento direto entre componentes.
- `lib/brand-colors.ts` — fonte única dos hex oficiais de marca, consumida por
  `tailwind.config.ts`.
- `lib/cn.ts` — utilitário de concatenação de classes **simples** (`classes.filter(Boolean).join('
  ')`), **não é** `tailwind-merge` — não resolve conflitos de classes Tailwind por
  precedência lógica, apenas concatena. Overrides de classes conflitantes precisam do modificador
  `!important` do Tailwind (ex.: `!w-auto`) para vencer de forma confiável.

### Componentes principais
- `components/landing/landing-page.tsx` — orquestra a ordem de todas as seções da página.
- `components/landing/hero.tsx` — headline com destaque opcional em vermelho, lista de
  benefícios, CTA de WhatsApp direto (condicional a `whatsappConfigured`), card do formulário.
- `components/landing/lead-form.tsx` — formulário completo (ver seção 2).
- `components/layout/header.tsx` — barra verde superior (`TopBar`, telefone/horário/redes
  sociais condicionais a dados confirmados) + header branco com logo e CTA.
- `components/layout/footer.tsx` — rodapé institucional com contato, atendimento, redes sociais e
  links legais, todos condicionais a `isPendingConfirmation()`.
- `components/landing/floating-whatsapp.tsx` — botão flutuante, só renderiza se
  `NEXT_PUBLIC_WHATSAPP_NUMBER` estiver configurado.
- `components/landing/google-reviews.tsx` — grade de avaliações com truncamento/expansão e
  tracking de scroll-into-view via `IntersectionObserver`.
- `components/landing/faq.tsx` — usa `components/ui/accordion.tsx`, dispara `faq_open` por item.
- `components/ui/button.tsx` — componente base de botão; classe base inclui
  `w-full sm:w-auto` (todos os botões são full-width em mobile por padrão, salvo override com
  `!important`).

---

## 4. Decisões Importantes (não regressar)

1. Formulário multi-etapa (2 passos): etapa 1 seleciona a necessidade de publicação via cards
   acessíveis; etapa 2 mostra os dados pessoais e o submit. Em páginas com `defaultPublicationNeed`,
   a etapa 1 é pulada e os dados pessoais aparecem direto (atualizado em 2026-07-06, revoga a
   decisão anterior de formulário em passo único).
2. Máximo de 4 campos visíveis no formulário da página principal (nome, WhatsApp, e-mail,
   necessidade de publicação).
3. Campo de e-mail é opcional.
4. Em landing pages com necessidade de publicação pré-definida (`defaultPublicationNeed`), o campo
   de necessidade fica oculto e pré-preenchido — não reexibir esse select nessas rotas.
5. Sem upload de documento no primeiro contato — o envio de documento acontece depois, via
   WhatsApp (conforme o próprio FAQ do site já comunica ao visitante).
6. O lead **precisa** estar registrado no backend (resposta de sucesso da `/api/leads`) antes de
   abrir o WhatsApp — nunca reverter para abrir o WhatsApp antes da confirmação do backend.
7. Nunca usar `window.open` para o redirecionamento principal pós-sucesso — o código atual usa
   `window.location.assign`, com um pequeno delay (350ms) apenas para permitir que o evento de
   analytics seja registrado antes de sair da página.
8. Nunca simular sucesso de envio sem um webhook configurado — se `LEAD_WEBHOOK_URL` não estiver
   definida, a API retorna `503` com `webhook_not_configured` (não fabricar sucesso local).
9. Nunca expor mensagens técnicas ao visitante — mensagens de erro do frontend/backend são sempre
   genéricas em português; detalhes técnicos ficam em `error.code` (JSON) e `console.error`
   (servidor), nunca na UI.
10. Nunca enviar dados pessoais (nome, telefone, e-mail, texto de avaliação) para o
    `dataLayer`/analytics — confirmado pelo tipo `AnalyticsParams`, que só aceita identificadores.
11. Nunca inventar avaliações, notas ou clientes — `config/google-reviews.ts` só deve conter
    avaliações reais e verificadas, copiadas literalmente do perfil do Google.
12. Nunca exibir a seção de avaliações do Google sem avaliações reais cadastradas (o próprio
    componente já oculta a seção automaticamente quando o array está vazio — não forçar exibição).
13. Nunca usar símbolos que sugiram vínculo com órgão público/governo (brasões, selos oficiais
    etc.) — o serviço é privado, de intermediação.
14. Nunca substituir as cores oficiais da marca `#058421` (verde) e `#FF0302` (vermelho) — ver
    `lib/brand-colors.ts` como fonte única.
15. Nunca recriar o projeto do zero — a base já está implementada e testada; ajustes devem ser
    incrementais.
16. Em ajustes puramente visuais/de layout, não tocar no backend, nas UTMs/atribuição, nos eventos
    de analytics ou no fluxo de WhatsApp — são camadas independentes e já validadas.
17. Nunca rodar `npm run dev` e `npm run build` simultaneamente apontando para o mesmo diretório
    `.next` — isso corrompeu o manifest do dev server durante os testes desta sessão (ver seção 6),
    causando 404 temporário nos chunks JS/CSS. Se acontecer, parar e reiniciar o servidor de dev
    resolve (não é bug de código).
18. Cabeçalho (2026-07-06): topbar vermelha (`bg-brand-red`) compacta com tagline + telefone/horário
    (via `isPendingConfirmation`, nunca inventar dado) + redes sociais; header branco com logo maior
    (`h-8 sm:h-10 lg:h-12`) e CTA verde (`variant="green"`, novo em `components/ui/button.tsx`). Botão
    usa texto responsivo (`Orçamento` no mobile, `Solicitar orçamento` a partir de `sm:`) para evitar
    overflow horizontal em telas de 320px — não reverter para o texto único mais longo sem testar
    320px novamente.
19. Hero (2026-07-06): headline agora suporta dois destaques (`headlineHighlight` em vermelho e novo
    campo opcional `headlineHighlightGreen` em `config/landing-pages.ts`) — usado apenas na página
    `home`. Composição decorativa (`EditorialComposition` em `hero.tsx`) é puramente CSS/JSX (sem
    imagens externas, sem brasões), oculta abaixo de `lg:`. Conteúdo sempre vem antes do formulário no
    DOM (mobile-first), com formulário à direita no desktop — não reintroduzir `order-*` que inverta
    isso no mobile. "Solicitação sem compromisso." aparece sempre abaixo do formulário, independente de
    o WhatsApp direto estar configurado.
20. Faixa de autoridade (2026-07-06): fundo vermelho institucional (`bg-brand-red`), números brancos
    em `font-mono`, sem cards individuais, separadores discretos via `divide-y`/`divide-x`. Não
    reintroduzir cores variadas por item nem animação de contagem.

---

## 5. Testes Realizados

Executados e confirmados nesta sessão, a partir do diretório do projeto:

- `npm run typecheck` — **passou sem erros**.
- `npm run lint` — **passou sem erros**.
- `npm run build` — **passou sem erros** (build de produção completo).
- Revisão visual em 5 breakpoints via servidor de desenvolvimento (MCP Preview): 1440×900,
  1280×800, 768×1024, 390×844, 375×812.
- Rota testada em detalhe: `/diario-oficial-uniao`.

### Bugs reais encontrados e corrigidos nesta sessão

1. **Overflow horizontal no header mobile (390px e 375px)**
   - Causa raiz: o componente base `Button` tem `w-full sm:w-auto` na classe base; o botão do CTA
     no header tinha apenas `flex-shrink-0`, e como `lib/cn.ts` não faz merge de classes Tailwind
     conflitantes (apenas concatena), o botão permanecia full-width ao lado do logo em uma linha
     flex sem quebra.
   - Correção: `className="flex-shrink-0 !w-auto"` no botão do header
     (`components/layout/header.tsx`).
   - Overflow residual de 9px a 375px, após a correção do botão: causa raiz era o logo (180px em
     `h-10`) + botão (172px) + padding do container excedendo a largura útil de 375px.
   - Correção: logo reduzido para `h-8` no menor breakpoint (`className="h-8 sm:h-10 lg:h-11"`),
     mantendo `h-10`/`h-11` a partir de `sm:`/`lg:`.

2. **Conteúdo duplicado no Hero** ("mais de 28 anos de experiência" aparecia duas vezes: uma vez
   na lista de benefícios e outra vez em um selo separado logo abaixo). Corrigido removendo o
   selo redundante e o import não utilizado (`ShieldCheck`, `siteConfig`) em
   `components/landing/hero.tsx`.

3. **Aviso de console sobre aspect-ratio da imagem do logo** (Next.js `<Image>` com `width`/
   `height` fixos e classe CSS de altura, sem `width: auto` correspondente). Corrigido adicionando
   `style={{ width: 'auto' }}` em `components/layout/header.tsx` e `components/layout/footer.tsx`.

4. **Página `/diario-oficial-uniao` aparentemente "quebrada"** (sem estilos, botões com aparência
   padrão do navegador) — investigado via `preview_network`: requisições a `layout.css`,
   `main-app.js` e `app-pages-internals.js` retornando 404. Causa raiz confirmada: `npm run build`
   havia sido executado enquanto o servidor `next dev` estava ativo, usando o mesmo diretório
   `.next`, corrompendo o manifest de desenvolvimento. **Não era bug de código.** Corrigido
   reiniciando o servidor de desenvolvimento.

Nenhum outro bug funcional foi identificado nos breakpoints testados. Não foi testada a submissão
real do formulário contra um webhook de produção (depende de `LEAD_WEBHOOK_URL` real — ver seção 7).

### Sessão adicional (2026-07-06) — Cabeçalho, Hero e Faixa de Autoridade

Escopo: melhorias somente visuais em `components/layout/header.tsx`, `components/landing/hero.tsx`,
`components/landing/trust-bar.tsx`, `components/ui/button.tsx` (novo variant `green`) e
`config/landing-pages.ts` (novo campo opcional `headlineHighlightGreen` + copy da página `home`).
Formulário, backend, webhook, UTMs, analytics e Google Reviews não foram tocados.

- `npm run typecheck` — **passou sem erros**.
- `npm run lint` — **passou sem erros**.
- Verificado sem overflow horizontal (`scrollWidth` vs `clientWidth`) em 320, 375, 390, 768, 1280 e
  1440px, nas rotas `/` e `/diario-oficial-uniao`.
- Console verificado em ambas as rotas: apenas os dois avisos esperados (placeholder do logo sem
  `width`/`height` correspondentes e `NEXT_PUBLIC_WHATSAPP_NUMBER` não configurado) — nenhum erro novo.
- Verificação de layout feita via `getBoundingClientRect()`/`getComputedStyle()` (DOM), não apenas
  screenshot: header sticky corretamente fixado no topo (`top: 36` a `117` em 1440×900, alinhado
  logo após a topbar de 36px), faixa de autoridade com `background-color: rgb(255, 3, 2)` e os três
  valores corretos (“+28 anos”, “+12 mil”, “+9 mil”).

**Bug real encontrado e corrigido**: overflow horizontal em 320px (366px vs 320px) causado pelo botão
"Solicitar orçamento" (CTA verde) somado ao logo maior no header. Corrigido com logo `h-8` no menor
breakpoint e texto do botão responsivo (“Orçamento” abaixo de `sm:`, “Solicitar orçamento” a partir de
`sm:`) — ver decisão 18.

**Observação sobre ferramenta de teste (não é bug de código)**: `preview_screenshot` (MCP Preview)
retornou imagens inconsistentes/desatualizadas após `window.scrollTo()` via `preview_eval` em
1440×900 (mostrando o header em posição incompatível com a rolagem real). Medições diretas via
`getBoundingClientRect()` confirmaram que o layout real está correto. Se isso se repetir em sessões
futuras, preferir verificação via `preview_eval` (DOM) a `preview_screenshot` para páginas com header
`sticky`.

---

## 6. Variáveis de Ambiente (`.env.example`, sem valores reais)

| Variável | Propósito |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada em metadata, sitemap e robots. Valor padrão de fallback no código: `https://www.centraldepublicacoes.com.br`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp para redirecionamento pós-lead e botão flutuante. Formato esperado: apenas dígitos, com DDI+DDD (ex.: `5548999999999`). **Marcado `[CONFIRMAR COM A EMPRESA]` — pendente.** Sem esse valor, o botão flutuante e o link direto do Hero ficam ocultos (`whatsappConfigured` = false). |
| `LEAD_WEBHOOK_URL` | Endpoint que recebe os leads validados, chamado por `lib/lead-service.ts`. **Marcado `[CONFIRMAR COM A EMPRESA]` — pendente.** Sem ele, a API retorna `503 webhook_not_configured` para toda submissão. |
| `LEAD_WEBHOOK_SECRET` | Segredo opcional enviado no header `X-Webhook-Secret` da chamada ao webhook. **Pendente**, mesma marcação. |
| `NEXT_PUBLIC_GTM_ID` | ID do Google Tag Manager (opcional). Se ausente, os scripts do GTM não são injetados em `app/layout.tsx`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID do Meta Pixel (opcional). Se ausente, o script do Pixel não é injetado. |
| `GOOGLE_PLACES_API_KEY` | Chave da Google Places API para avaliações reais (opcional, somente servidor). Sem ela, `getOfficialGoogleReviews()` retorna `null` e o site usa apenas o array estático de `config/google-reviews.ts`. |
| `GOOGLE_PLACE_ID` | ID do local no Google Places, usado junto com a chave acima. |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | Link fixo para o CTA "Deixar uma avaliação no Google". Já vem com valor padrão configurado no `.env.example` e replicado como fallback em `config/contact.ts`: `https://g.page/r/Ce8evMwiD456EBM/review`. |
| `NEXT_PUBLIC_GOOGLE_MAPS_PROFILE_URL` | URL pública do perfil no Google Maps, usada no CTA "Ver avaliações no Google". Se vazia, esse CTA fica oculto. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Conversion ID do Google Ads (formato `AW-XXXXXXXXX`), usado para injetar o gtag.js em `app/layout.tsx`. Se ausente, o script não é carregado. **Configurado em produção**: `AW-11546328844`. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Conversion Label da ação "Lead [ORÇAMENTO]" no Google Ads. Junto com o ID acima, forma o `send_to` do evento de conversão disparado em `quote_form_success`. **Configurado em produção**: `GL-OCPHGiYcaEIz-24Er`. |

---

## 7. Pendências que dependem de dados reais do cliente

Confirmadas por busca de `[CONFIRMAR COM A EMPRESA]` no código (`config/contact.ts`,
`config/site.ts`, `app/icon.tsx`, `app/opengraph-image.tsx`):

- `NEXT_PUBLIC_WHATSAPP_NUMBER` (número real de WhatsApp)
- `LEAD_WEBHOOK_URL` / `LEAD_WEBHOOK_SECRET` (endpoint real de recebimento de leads)
- Razão social (`contactConfig.legalName`), CNPJ, endereço, telefones, e-mails, horário de
  atendimento (todos `'[CONFIRMAR COM A EMPRESA]'` em `config/contact.ts`)
- Links de redes sociais (Instagram/Facebook/LinkedIn — todos vazios em `contactConfig.socialLinks`)
- Logo real (hoje usa `public/logo-placeholder.svg`, um placeholder funcional com o texto
  "CENTRAL DE PUBLICAÇÕES" sobre fundo vermelho)
- Imagem de Open Graph real (`app/opengraph-image.tsx` gera um placeholder funcional)
- Favicon real (`app/icon.tsx` gera um placeholder funcional)
- Conteúdo oficial da Política de Privacidade e dos Termos de Uso (ambas as páginas têm texto
  placeholder explícito e estão marcadas `noindex`/fora do sitemap até serem substituídas)
- Avaliações reais do Google (`config/google-reviews.ts` está vazio; a seção fica oculta até haver
  avaliações reais cadastradas ou a integração via `GOOGLE_PLACES_API_KEY`/`GOOGLE_PLACE_ID`)
- `NEXT_PUBLIC_GOOGLE_MAPS_PROFILE_URL` (perfil público no Google Maps)

## 8. Estado do Git

Confirmado via `git status` e `git rev-parse --show-toplevel` executados dentro do diretório do
projeto: a raiz do repositório Git aponta incorretamente para o diretório home do usuário
(`/Users/augustobianchini`), sem nenhum commit, e com uma longa lista de arquivos não relacionados
ao projeto (arquivos de configuração do usuário, `.zsh_history`, `Library/`, etc.) como untracked.
Isso significa que **não existe controle de versão real para este projeto ainda** — nenhuma
alteração feita até agora está commitada. Este HANDOFF.md não inicializa nem altera o Git; a
decisão sobre como configurar um repositório correto (provavelmente `git init` dentro da própria
pasta `central-de-publicacoes/`) deve ser tomada explicitamente pelo usuário.

---

## 9. Sessão (2026-07-06) — Melhoria da seção de Avaliações do Google e reordenação

Escopo: somente a seção de avaliações do Google e sua posição na landing page. Formulário,
backend, webhook, UTMs, analytics, header, hero, trust bar e páginas legais **não foram tocados**.

### O que foi implementado

**`lib/google-places.ts`**: `getOfficialGoogleReviews()` agora retorna `GoogleReviewsSummary`
(`{ reviews, averageRating, totalCount }`) em vez de apenas o array de reviews. `averageRating` e
`totalCount` vêm diretamente dos campos `rating`/`user_ratings_total` da própria resposta da Google
Places API (nível do local) — nenhum valor calculado ou inventado nesta camada.

**`types/google-review.ts`**: novo tipo `GoogleReviewsSummary`.

**`config/contact.ts` / `.env.example`**: `googleMapsProfileUrl` agora usa como valor padrão o link
público fornecido pelo usuário, `https://maps.app.goo.gl/dWEhvonwia8HTWV86`, mantendo
`NEXT_PUBLIC_GOOGLE_MAPS_PROFILE_URL` como override via variável de ambiente (mesmo padrão já usado
por `googleReviewUrl`).

**`components/landing/google-reviews.tsx`** (reescrito):
- Título "Quem publica com a Central recomenda" / subtítulo "Veja as experiências compartilhadas
  por nossos clientes."
- Exibe nota média (`averageRating.toFixed(1)`, com estrelas) e quantidade de avaliações
  (`totalCount`) sempre que houver avaliações reais visíveis — nunca inventados: vêm da API oficial
  quando configurada, ou são calculados a partir do array estático real (`googleReviews`) quando
  não há API (média das avaliações cadastradas, quantidade = tamanho do array).
- Exibe de 3 a 6 depoimentos (`reviews.slice(0, 6)`), cada um com nome, nota, texto (com
  truncamento/expansão já existente), data e indicação "Avaliação no Google" (badge discreto com
  ponto verde `#058421`).
- Visual: fundo `bg-surface-50` (off-white, já existente), cards brancos com um detalhe discreto de
  borda superior em `border-t-brand-red/30`; grade `sm:grid-cols-2 lg:grid-cols-3` (3 colunas no
  desktop) e 1 coluna no mobile (`grid-cols-1` padrão); sem carrossel automático (grade estática,
  como já era).
- CTA "Ver todas as avaliações no Google" (link vermelho `text-brand-red`, usa
  `contactConfig.googleMapsProfileUrl`, `target="_blank" rel="noopener noreferrer"`) e CTA
  secundário "Deixar uma avaliação no Google" (link verde `text-brand-green`, usa
  `contactConfig.googleReviewUrl`) — dois links distintos preservados.
- Atribuição ao Google mantida: nota "Avaliações reais exibidas a partir do perfil do Google..."
  quando `isOfficialSource` é verdadeiro.
- Seção retorna `null` (sem renderizar nada, sem espaço vazio) quando `!show` ou não há avaliações
  reais — comportamento já existente, preservado e testado.

**`components/landing/landing-page.tsx`**: `GoogleReviews` movido para logo após `TrustBar` (antes
de `PublicationChannels`), calculando `averageRating`/`totalCount` reais (API oficial ou derivados
do array estático) e repassando como novas props ao componente. Nova ordem confirmada em tempo de
execução (`main > section`):

1. Hero (formulário)
2. Faixa de autoridade (`TrustBar`)
3. Avaliações do Google (`GoogleReviews`, condicional)
4. Onde publicamos (`PublicationChannels`)
5. Como funciona (`HowItWorks`)
6. Tipos de publicação (`PublicationTypes`)
7. Diferenciais (`Benefits`)
8. Seção de prazo (`UrgencySection`)
9. FAQ
10. CTA final (`FinalCta`)

### Testes realizados nesta sessão

- `npm run typecheck` — **passou sem erros**.
- `npm run lint` — **passou sem erros** (após implementação e após reverter os dados de teste).
- Teste com dados temporários (3 avaliações fictícias marcadas claramente como "DADO TEMPORÁRIO
  PARA TESTE VISUAL", inseridas e depois **removidas** de `config/google-reviews.ts`, que voltou ao
  estado real vazio):
  - Desktop (1440×900): grade em 3 colunas confirmada via `getComputedStyle(...).gridTemplateColumns`,
    ordem das seções confirmada via DOM, sem overflow horizontal
    (`scrollWidth === clientWidth`).
  - Mobile (375×812): grade em 1 coluna confirmada, sem overflow horizontal, nota média calculada
    corretamente a partir dos dados reais exibidos (4.7 = média de 5/4/5), link do botão "Ver todas
    as avaliações no Google" apontando para `https://maps.app.goo.gl/dWEhvonwia8HTWV86`.
  - Confirmado via `preview_snapshot` (árvore de acessibilidade): título, subtítulo, nota média,
    quantidade, badge "Avaliação no Google" por card e os dois CTAs com hrefs corretos.
- Teste do estado oculto (array `googleReviews` real, vazio, sem `GOOGLE_PLACES_API_KEY`
  configurada): seção não aparece no DOM (`hasSection: false`), sem espaço vazio — a sequência de
  `main > section` vai direto de "Números da Central de Publicações" (faixa de autoridade) para
  "Publicações nos principais veículos" (onde publicamos), sem overflow horizontal.
- Console verificado em ambos os estados: nenhum erro/aviso novo — apenas os dois avisos
  pré-existentes já documentados (logo placeholder sem `width`/`height` correspondentes e
  `NEXT_PUBLIC_WHATSAPP_NUMBER` não configurado).
- **Observação sobre ferramenta de teste**: `preview_screenshot` voltou a apresentar a
  inconsistência já documentada na seção 5 (não reflete `window.scrollTo()` corretamente com header
  `sticky`) — verificação feita via `preview_eval` (DOM) e `preview_snapshot` em vez de screenshot,
  conforme já recomendado.

### Decisão registrada (adicionar à seção 4 mentalmente para próximas sessões)

21. Avaliações do Google (2026-07-06): nota média e quantidade exibidas na seção **sempre são
    calculadas a partir de dados reais** — da API oficial (`rating`/`user_ratings_total` do Google
    Places) quando configurada, ou da média/contagem do array estático real
    `config/google-reviews.ts` como fallback. Nunca fabricar esses números. Link
    `https://maps.app.goo.gl/dWEhvonwia8HTWV86` é o valor padrão de
    `NEXT_PUBLIC_GOOGLE_MAPS_PROFILE_URL` (override via env continua funcionando). Máximo de 6
    depoimentos exibidos por vez (`reviews.slice(0, 6)`), mesmo que existam mais.

### Arquivos alterados nesta sessão

`lib/google-places.ts`, `types/google-review.ts`, `config/contact.ts`, `.env.example`,
`components/landing/google-reviews.tsx`, `components/landing/landing-page.tsx`, `HANDOFF.md`.

### Pendências reais remanescentes (sem alteração nesta sessão)

- `config/google-reviews.ts` continua **vazio** — nenhuma avaliação real foi cadastrada (não é
  permitido inventar). A seção permanecerá oculta em produção até que avaliações reais sejam
  copiadas literalmente do perfil do Google ou até que `GOOGLE_PLACES_API_KEY` +
  `GOOGLE_PLACE_ID` sejam configurados.
- Demais pendências de dados reais da empresa seguem as mesmas da seção 7 (não alteradas nesta
  sessão).

### Verificação de continuidade (2026-07-06, nova sessão)

Reaberta a sessão para continuar exatamente por esta pendência (avaliações reais do Google, link
público do perfil, reordenação). Verificação direta do código confirmou que a implementação acima
já estava presente e correta — nenhuma alteração de código foi necessária nesta passagem. Testes
re-executados para confirmar que nada regrediu:

- `npm run typecheck` — **passou sem erros**.
- `npm run lint` — **passou sem erros**.
- `config/contact.ts` relido: `googleMapsProfileUrl` confirmado com fallback
  `https://maps.app.goo.gl/dWEhvonwia8HTWV86`.
- Estado oculto reconfirmado em mobile (375×812) via `preview_eval`: `hasGoogleSection: false`,
  sem overflow horizontal (`scrollWidth === clientWidth === 375`), ordem de seções intacta
  (`TrustBar` → `PublicationChannels` direto, pulando a seção oculta).
- Console verificado (`level: "error"`) em 375×812: nenhum erro.

## 10. Sessão (2026-07-07) — Contatos reais e rodapé

Escopo: configurar contatos reais fornecidos pela empresa (WhatsApp, telefones, e-mails, endereço)
e atualizar o rodapé. Backend, webhook, UTMs, analytics, validações e o link de Política de
Privacidade dentro do formulário **não foram tocados**.

### O que foi implementado

**`config/contact.ts`**:
- `whatsappNumber` permanece lido de `NEXT_PUBLIC_WHATSAPP_NUMBER` (sem hardcode).
- `phones`: array de objetos `{ display, href }` com os 3 números reais — `(48) 3257-3200`
  (`tel:+554832573200`), `(48) 3257-3500` (`tel:+554832573500`), `(48) 3257-0020`
  (`tel:+554832570020`). Primeiro item é o contato principal (usado na topbar do header).
- `emails`: array de objetos `{ label, address }` — Comercial, Prefeituras, Financeiro
  (domínio `centraldiariooficial.com.br`).
- `address`: array de strings (uma por linha) com o endereço real (Rua Vereador Arthur Manoel
  Mariano, nº 362 — Comercial Vitória Center, Sala 312 — Forquilhinhas, São José/SC — CEP
  88106-500).
- `legalName`, `cnpj`, `businessHours` seguem `[CONFIRMAR COM A EMPRESA]` (não fornecidos nesta
  tarefa, não inventados).

**`components/layout/header.tsx`**: `TopBar` agora usa `contactConfig.phones[0]` diretamente
(`phone.href`/`phone.display`) em vez do `find` sobre string simples — adaptado à nova estrutura
de objeto. Nenhuma mudança visual ou de comportamento na topbar além disso.

**`components/layout/footer.tsx`** (reescrito):
- Coluna "Contato": WhatsApp (link `wa.me`, mensagem padrão preservada) + os 3 telefones (`tel:`).
- Nova coluna "E-mails": os 3 e-mails com rótulo (`Comercial: ...`, etc.), todos `mailto:`.
- Coluna "Endereço": endereço completo (uma linha por `<span className="block">`, boa leitura em
  qualquer largura), horário de atendimento (permanece oculto, pendente), razão social/CNPJ
  (permanecem ocultos, pendentes) e redes sociais (ocultas — nenhuma configurada).
- Removidos os links "Política de Privacidade" e "Termos de Uso" do rodapé (apenas visualmente —
  rotas `/politica-de-privacidade` e `/termos-de-uso` continuam existindo e indexadas como antes;
  o link de Política de Privacidade dentro do formulário de lead não foi alterado).

**`.env.example`**: comentário do `NEXT_PUBLIC_WHATSAPP_NUMBER` atualizado (exemplo agora usa o
formato real, `[CONFIRMAR COM A EMPRESA]` removido pois o dado já foi fornecido). Variável
continua vazia no arquivo versionado.

**`.env.local`** (não versionado, criado nesta sessão): `NEXT_PUBLIC_WHATSAPP_NUMBER=554832573500`
para permitir teste local do redirecionamento real.

### Testes realizados

- `npm run typecheck` — passou sem erros.
- `npm run lint` — passou sem erros.
- Servidor de preview reiniciado (necessário para carregar `.env.local`).
- Desktop (1440×900) e mobile (375×812) via `preview_eval`: sem overflow horizontal em nenhuma
  largura (`scrollWidth === clientWidth`).
- Confirmado via DOM que o rodapé gera exatamente os `href` esperados: 3× `tel:+55...`, 3×
  `mailto:...`, 1× `https://wa.me/554832573500?text=...` (mensagem `FLOATING_WHATSAPP_MESSAGE`
  preservada).
- Confirmado que "Política de Privacidade" e "Termos de Uso" não aparecem mais no texto do rodapé.
- Confirmado que a topbar do header exibe o telefone principal `(48) 3257-3200` com `tel:` correto.
- Console verificado (`level: "error"`): nenhum erro.
- Fluxo do formulário de lead (`lead-form.tsx`) não foi alterado nesta sessão — redirecionamento ao
  WhatsApp pós-sucesso continua usando `getWhatsappRedirectUrl()`, que agora resolve para
  `554832573500` a partir de `contactConfig.whatsappNumber`. Não foi feito envio real ao webhook.

### Arquivos alterados nesta sessão

`config/contact.ts`, `components/layout/header.tsx`, `components/layout/footer.tsx`,
`.env.example`, `.env.local` (não versionado), `HANDOFF.md`.

### Pendências reais remanescentes

- Razão social (`legalName`) e CNPJ: ainda `[CONFIRMAR COM A EMPRESA]`.
- Horário de atendimento (`businessHours`): ainda `[CONFIRMAR COM A EMPRESA]`.
- Redes sociais (`socialLinks`): nenhuma configurada — seção correspondente permanece oculta.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` em produção (Vercel) ainda precisa ser configurado manualmente com
  `554832573500` — `.env.local` só cobre o ambiente local.

Nenhum arquivo de código foi alterado nesta passagem — apenas este HANDOFF.md.

## 11. Sessão (2026-07-07) — Validação do webhook e remoção dos CTAs de WhatsApp direto

### Validação do fluxo de lead (sem alteração de código)

`LEAD_WEBHOOK_URL` não está configurada (nem em `.env.local` nem em produção) — por isso o
formulário estava caindo no estado de erro ("Não foi possível registrar sua solicitação..."),
exatamente como projetado (ver decisão 8 da seção 4: nunca abrir o WhatsApp sem confirmação do
backend). Validado ponta a ponta com um webhook de teste temporário (webhook.site, configurado só
em `.env.local`, nunca versionado, revertido ao final):
- `POST /api/leads` → `200 OK`, payload completo e correto recebido pelo endpoint de teste.
- Frontend avançou para o estado de sucesso ("Solicitação registrada. Abrindo o WhatsApp.").
- Confirma que o código está correto; falta apenas a URL real do webhook (planilha, a ser
  configurada pelo usuário após a hospedagem do site).

### Remoção dos CTAs de WhatsApp direto (mudança de produto solicitada pelo usuário)

Objetivo: obrigar o visitante a preencher o formulário antes de qualquer redirecionamento ao
WhatsApp — nenhum botão deve abrir o WhatsApp sem passar pelo formulário primeiro.

Removidos:
- **Hero** (`components/landing/hero.tsx`): botão "Falar diretamente pelo WhatsApp" (link direto
  `wa.me`, condicional a `whatsappConfigured`) e todo o código associado (`Button`, `trackEvent`,
  `buildDirectWhatsappMessage`, `getWhatsappRedirectUrl`, `contactConfig`, `onlyDigits` — imports
  agora não utilizados removidos).
- **Rodapé** (`components/layout/footer.tsx`): link "WhatsApp" (ícone `MessageCircle` + `wa.me`) na
  coluna "Contato". Mantidos os 3 telefones (`tel:`) e os 3 e-mails (`mailto:`).
- **Botão flutuante** (`components/landing/floating-whatsapp.tsx`): componente inteiro **excluído**
  (não usado em nenhum outro lugar) e removido de `components/landing/landing-page.tsx`
  (import + `<FloatingWhatsapp />`).
- **`lib/whatsapp.ts`**: `FLOATING_WHATSAPP_MESSAGE` e `buildDirectWhatsappMessage()` removidos por
  ficarem sem nenhum consumidor após as remoções acima.

Preservado sem alteração (fora do escopo do pedido):
- Fluxo principal do formulário (`lead-form.tsx`): submissão → sucesso do backend → redirecionamento
  automático ao WhatsApp após 350ms — continua sendo o único caminho normal para abrir o WhatsApp.
- Botão de recuperação "Continuar pelo WhatsApp" no estado de erro do formulário
  (`handleAlternativeWhatsapp` em `lead-form.tsx`) — só aparece **depois** de uma tentativa de envio
  que falhou, não é um atalho para pular o formulário, então não foi removido.
- `evento_whatsapp_click` (`hero_whatsapp_click`, `floating_whatsapp_click`) deixam de ser
  disparados (os elementos que os disparavam não existem mais) — nenhuma limpeza adicional de
  analytics foi necessária além da remoção dos próprios componentes.

### Testes realizados

- `npm run typecheck` — passou sem erros.
- `npm run lint` — passou sem erros.
- Confirmado via DOM (`preview_eval`, após reload) em desktop: nenhum link `wa.me` no rodapé,
  nenhum texto "Falar diretamente pelo WhatsApp" na página, nenhum botão flutuante
  (`.bg-whatsapp[aria-label*="WhatsApp"]`) presente.
- Confirmado o mesmo em mobile (375×812), sem overflow horizontal (`scrollWidth === clientWidth`).
- Console verificado (`level: "error"`): nenhum erro em nenhum dos dois breakpoints.

### Sessão (2026-07-07) — Google Ads: gtag.js + evento de conversão

Objetivo: rastrear a conversão de lead qualificado (envio bem-sucedido do formulário) no Google Ads.

Decisão de abordagem: o site já usa GTM (`NEXT_PUBLIC_GTM_ID`) e já dispara `quote_form_success` no
`dataLayer` sem PII. A opção mais simples (configurar a tag de conversão direto no GTM, sem código)
foi oferecida ao usuário, mas ele optou por instalar o gtag.js do Google Ads diretamente no código,
em paralelo ao GTM (mesmo padrão já usado para o Meta Pixel). Os dois coexistem sem conflito — ambos
usam `window.dataLayer`, mas com formatos de push diferentes (objetos com `event` vs. `arguments`).

O que foi implementado:
- **`app/layout.tsx`**: lê `NEXT_PUBLIC_GOOGLE_ADS_ID`; se presente, injeta o script
  `https://www.googletagmanager.com/gtag/js?id=...` + script de init (`gtag('js', ...)`,
  `gtag('config', ...)`), seguindo o mesmo padrão condicional do GTM/Meta Pixel (não injeta nada se
  a env var estiver ausente).
- **`lib/analytics.ts`**: adicionado `window.gtag` ao tipo global e a função
  `trackGoogleAdsConversion()`, que só dispara se `window.gtag` existir e as duas env vars
  (`NEXT_PUBLIC_GOOGLE_ADS_ID` e `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`) estiverem configuradas.
  Chama `gtag('event', 'conversion', { send_to: '<id>/<label>' })` — sem nenhum dado pessoal.
- **`components/landing/lead-form.tsx`**: `trackGoogleAdsConversion()` chamada logo após
  `trackEvent('quote_form_success', ...)`, ou seja, só dispara quando o backend confirma o
  recebimento do lead (mesmo ponto de disparo do evento de sucesso do GTM).
- **`.env.example`**: adicionadas `NEXT_PUBLIC_GOOGLE_ADS_ID` e
  `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` (vazias, com comentário explicativo).

Valores reais fornecidos pelo usuário (já configurados em `.env.local`, não versionado):
- Conversion ID: `AW-11546328844`
- Conversion Label: `GL-OCPHGiYcaEIz-24Er` (ação "Lead [ORÇAMENTO]")

**Pendente**: adicionar as duas variáveis acima nas Environment Variables do projeto na Vercel
(mesmo fluxo já usado para `LEAD_WEBHOOK_URL`) para que a conversão dispare em produção.

### Testes realizados

- `npm run typecheck` e `npm run lint` — passaram sem erros.
- Confirmado via `preview_eval` que `window.gtag` é injetado e funcional quando as env vars estão
  presentes (script `google-ads-gtag-src` e `google-ads-gtag-init` no DOM).
- Simulado o fluxo completo do formulário (radio → Continuar → preencher nome/telefone/e-mail →
  enviar), com `window.fetch` interceptado para simular resposta `200` do backend (sem depender de
  webhook real configurado localmente). Capturada a chamada real disparada:
  `gtag('event', 'conversion', { send_to: 'AW-11546328844/GL-OCPHGiYcaEIz-24Er' })`.
- Nenhum erro no console durante o fluxo.

### Arquivos alterados nesta sessão

`components/landing/hero.tsx`, `components/layout/footer.tsx`, `components/landing/landing-page.tsx`,
`lib/whatsapp.ts`, `HANDOFF.md`. Arquivo excluído: `components/landing/floating-whatsapp.tsx`.
`.env.local` foi temporariamente alterado para teste e revertido ao estado original antes do fim da
sessão (nenhuma alteração real permanece nele).

### Pendências reais remanescentes

- `LEAD_WEBHOOK_URL` (planilha) — configurar quando o site for hospedado.
- Demais pendências (razão social, CNPJ, horário de atendimento, redes sociais,
  `NEXT_PUBLIC_WHATSAPP_NUMBER` em produção) seguem as mesmas das seções 7 e 10.
