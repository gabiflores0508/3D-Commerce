# CHECKPOINT — 3DCommerce

Data do checkpoint: **2026-07-01 (pós-R10)**
Última rodada concluída: **R10 — Segurança, Auditoria Final e Deploy Prep**
Próxima rodada sugerida: **R11 — Gateway de pagamento e integrações externas (fase 2)**

> Deploy real **não foi executado** nesta rodada (fora do escopo por instrução explícita). Este checkpoint documenta o estado após hardening de segurança e auditoria.

---

## 1. Status geral

Projeto **funcional end-to-end com integração fechada**:

- Backend Express + Prisma + PostgreSQL (Neon) rodando com todos os módulos de negócio.
- Frontend React + Vite conectado via `VITE_API_URL`, com auth JWT real, carrinho real, checkout real, orçamento real com upload de arquivos, e admin real com upload real de imagens.
- **Uploads Base64 críticos migrados para endpoints Multer reais** em Products, Banners e Settings.
- **Novas páginas admin** para Orçamentos (`/admin/orcamentos`) e Depoimentos (`/admin/depoimentos`).
- **Seção de depoimentos na home pública** (renderiza só se ativos).
- **`PUT /api/me`** para edição de perfil do cliente (name/phone).
- Ambos os builds passando limpos.
- Smoke tests curl validam todos os endpoints principais.

Nível de maturidade: **MVP com hardening de segurança aplicado (R10), pronto para deploy em staging.** Falta apenas storage externo de uploads e gateway de pagamento para produção real com clientes pagantes — ver seção 15.

---

## 2. Stack

### Frontend
- **React 18** + **Vite 5** + **TypeScript strict**
- **Tailwind CSS** com tokens próprios
- **Framer Motion**
- **Zustand** com `persist`
- **React Router v6** (`createBrowserRouter` + `React.lazy`)
- **React Hook Form + Zod**
- **Lucide React**, **react-hot-toast**, **clsx + tailwind-merge**, **slugify**

### Backend
- **Node 18+** + **Express 4** + **TypeScript 5**
- **Prisma 6.2** + **PostgreSQL** (Neon)
- **JWT** (`jsonwebtoken`) + **bcryptjs** (rounds 10)
- **Zod**, **Multer**, **cors**, **dotenv**, **tsx**

---

## 3. Arquivos principais

### Documentação (raiz)
| Arquivo | Conteúdo |
|---|---|
| `README.md` | Visão geral |
| `CHECKPOINT.md` | **Este arquivo** |
| `CHECKLIST-DEPLOY.md` | Deploy estático |
| `CHECKLIST-ENTREGA.md` | Checklist pré-entrega |
| `INSTRUCOES-ADMIN.md` | Manual do painel |
| `RESUMO-COMERCIAL.md` | Argumentos comerciais |
| `ROADMAP-FASE-2.md` | Evolução |
| `ROTEIRO-DEMO.md` | Roteiro apresentação |
| `CLAUDE.md` | Instruções G-Rec |

### Frontend

```
3dCommerce/
├── .env                        → VITE_API_URL=http://localhost:3333 (dev)
├── .env.example
├── src/
│   ├── App.tsx                 → Boot: init stores + refresh + listener auth:expired
│   ├── main.tsx
│   ├── vite-env.d.ts           → Tipos Vite + ImportMetaEnv
│   ├── config/site.ts          → Constantes marca (SEM credencial admin fixa)
│   ├── services/               → API layer (R9)
│   │   ├── api.ts              → Cliente HTTP central
│   │   ├── types.ts            → DTOs do backend
│   │   ├── adapters.ts         → DTO ↔ tipos internos + placeholder SVG
│   │   ├── authService.ts      → + updateMe (R9B)
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   ├── quoteService.ts
│   │   ├── settingsService.ts
│   │   ├── bannerService.ts
│   │   ├── testimonialService.ts
│   │   └── dashboardService.ts
│   ├── store/
│   │   ├── useCustomerAuthStore.ts  → updateCustomer async chama PUT /api/me
│   │   ├── useAdminAuthStore.ts
│   │   ├── useCartStore.ts
│   │   ├── useAdminDataStore.ts
│   │   └── useUIStore.ts
│   ├── pages/
│   │   ├── public/         → 20 páginas
│   │   └── admin/          → 11 páginas (+ Quotes e Testimonials na R9B)
│   ├── components/
│   │   ├── layout/         → Header, Footer, Topbar, PublicLayout, AdminLayout, AdminSidebar (+ Orçamentos, Depoimentos)
│   │   ├── ui/             → Button, Input, Modal, Drawer, Badge, Carousel, Logo
│   │   ├── product/
│   │   ├── home/           → + Testimonials.tsx (R9B)
│   │   ├── cart/
│   │   └── admin/
│   │       ├── ImageUploader.tsx     → LEGADO (Base64) — só SeasonalCategory ainda usa
│   │       ├── RemoteImageUploader.tsx  → NOVO (R9B) — sobe arquivo real
│   │       └── StatusBadge.tsx
│   ├── data/               → blogPosts, faqs (locais; sem endpoint)
│   ├── hooks/
│   ├── routes/AppRoutes.tsx  → + /admin/orcamentos e /admin/depoimentos (R9B)
│   ├── types/
│   └── utils/
```

### Backend

```
backend/
├── .env
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── migrations/20260701064817_init/
│   └── seed.ts
├── uploads/
│   ├── products/
│   ├── quotes/
│   └── site/
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/env.ts
    ├── lib/
    │   ├── prisma.ts
    │   └── upload.ts       → productImagesUpload, quoteFilesUpload, siteImageUpload
    ├── middlewares/
    │   ├── authMiddleware.ts
    │   ├── adminMiddleware.ts
    │   ├── optionalAuthMiddleware.ts
    │   ├── errorHandler.ts
    │   ├── notFoundHandler.ts
    │   └── requestLogger.ts
    ├── modules/
    │   ├── auth/
    │   ├── users/              → GET/PUT /api/me (R9B)
    │   ├── categories/
    │   ├── products/
    │   ├── cart/
    │   ├── orders/
    │   ├── quotes/
    │   ├── settings/
    │   ├── banners/
    │   ├── testimonials/
    │   └── dashboard/
    ├── routes/
    ├── types/
    │   └── express.d.ts
    └── utils/
```

---

## 4. Rotas do backend

### Health
- `GET /health`
- `GET /api/health`

### Auth (R3)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users (R9B)
- `GET /api/me` — perfil autenticado (alias)
- `PUT /api/me` — atualiza name/phone (Zod refine "envie ao menos um"; email/role/senha bloqueados)

### Categorias (R4)
- `GET /api/public/categories`
- `GET/POST/PUT/DELETE /api/admin/categories[/:id]`

### Produtos (R4)
- `GET /api/public/products` (filtros + paginação)
- `GET /api/public/products/featured`
- `GET /api/public/products/:slug`
- `GET/POST/PUT/DELETE /api/admin/products[/:id]`
- `POST /api/admin/products/:id/images` (Multer, `images`, 10 arquivos × 5MB)
- `DELETE /api/admin/products/images/:imageId`

### Cart (R5)
- `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart`

### Orders (R5)
- `POST /api/orders`
- `GET /api/me/orders[/:id]`
- `GET/PUT /api/admin/orders[/:id]`
- `PUT /api/admin/orders/:id/status`

### Quotes (R6)
- `POST /api/quotes` (auth opcional), `POST /api/quotes/:id/files` (25MB × 10)
- `GET /api/me/quotes[/:id]`
- `GET/PUT /api/admin/quotes[/:id]`
- `PUT /api/admin/quotes/:id/status`

### Dashboard (R7)
- `GET /api/admin/dashboard`
- `GET /api/admin/ping` — deprecated

### Settings (R8)
- `GET /api/public/settings`
- `GET/PUT /api/admin/settings`
- `POST /api/admin/settings/logo` (Multer, `logo`)

### Banners (R8)
- `GET /api/public/banners`
- `GET/POST/PUT/DELETE /api/admin/banners[/:id]`
- `POST /api/admin/banners/:id/image` (Multer, `image`)

### Testimonials (R8)
- `GET /api/public/testimonials`
- `GET/POST/PUT/DELETE /api/admin/testimonials[/:id]`
- `POST /api/admin/testimonials/:id/avatar` (Multer, `avatar`)

---

## 5. Módulos concluídos

| Rodada | Escopo | Status |
|---|---|---|
| R1 | Fundação backend | ✅ |
| R2 / R2B | Schema Prisma + migration + seed no Neon | ✅ |
| R3 | Auth JWT + middlewares | ✅ |
| R4 | Catálogo + upload imagens produto | ✅ |
| R5 | Carrinho + Pedidos com transação e snapshots | ✅ |
| R6 | Orçamentos anônimo/autenticado + upload STL/OBJ/ZIP/PDF | ✅ |
| R7 | Dashboard admin com métricas + distribuições | ✅ |
| R8 | Settings, Banners, Testimonials + upload de site (SVG bloqueado) | ✅ |
| R9 | Integração frontend + backend (services + stores conectados) | ✅ |
| **R9B** | **Fechamento: uploads reais, Admin Quotes/Testimonials, Home Testimonials, PUT /api/me** | ✅ |
| **R10** | **Segurança: Helmet, rate limiting, auditoria de uploads/auth/passwordHash, smoke tests, DEPLOY.md** | ✅ |

---

## 6. Bugs corrigidos ao longo do desenvolvimento

### R2/R3/R7
- `groupBy` do Prisma v6 exige `orderBy` — adicionado em todos.
- `_count: true` (número simples) resolve tipagem estável de `groupBy`.

### R6
- `estimatedValue` no Zod: `z.union([z.coerce.number(), z.null()])` estava na ordem errada — coerce transformava `null → 0`. Corrigido colocando `z.null()` primeiro.

### R8
- SVG bloqueado propositalmente por XSS.
- `safeUnlinkSiteImage` com guard contra path traversal (`/` e `\\`).

### R9
- Backticks em JSDoc de `types.ts` causavam TS1443 → substituídos por comentário simples.
- Faltava `vite-env.d.ts` para tipos de `import.meta.env`.
- `onSubmit` sem `await` em `CustomerLogin`/`CustomerRegister` após stores virarem async.

### R9B
- Sem bugs novos — todos os builds passaram limpos de primeira depois dos refactors de upload.
- Descoberto que `ProductForm` precisava refetch do produto ao entrar em edição para pegar `imageId` reais (adicionado `useEffect` que chama `productService.getPublicBySlug`).

---

## 7. Alterações da R9B (detalhes)

### Arquivos criados (4)
- `src/components/admin/RemoteImageUploader.tsx` — uploader que dispara upload direto para endpoint via callbacks `onUpload`/`onUploadMany`/`onRemove`, com preview do backend via `apiAssetUrl`, `busy` state, ~5MB máx.
- `src/pages/admin/Quotes.tsx` — página `/admin/orcamentos`: tabela + filtro por status + busca + drawer de detalhes com edição de `estimatedValue`/`adminNotes` + mudança de status + links para arquivos.
- `src/pages/admin/Testimonials.tsx` — página `/admin/depoimentos`: grid de cards + criar/editar/ativar/remover/upload de avatar (modal com estrelas clicáveis).
- `src/components/home/Testimonials.tsx` — seção pública na home consumindo `GET /api/public/testimonials`. Não renderiza se vazio.

### Arquivos alterados
- `backend/src/modules/users/users.routes.ts` — implementados `GET /api/me` e `PUT /api/me`.
- `src/services/authService.ts` — + `updateMe(input)`.
- `src/store/useCustomerAuthStore.ts` — `updateCustomer` agora `async`; chama `authService.updateMe` para name/phone; endereço padrão fica local.
- `src/pages/admin/ProductForm.tsx` — troca `ImageUploader` por `RemoteImageUploader`; images guardam `{id, url}`; refetch do produto ao editar; `productService.addImages`/`removeImage` no upload/remove.
- `src/pages/admin/Banners.tsx` — troca por `RemoteImageUploader`; cria banner via `addBanner` do store se novo, depois `bannerService.uploadImage`.
- `src/pages/admin/Settings.tsx` — troca por `RemoteImageUploader`; upload via `settingsService.uploadLogo`; remove via `update({ logoUrl: null })`.
- `src/routes/AppRoutes.tsx` — + rotas `/admin/orcamentos` e `/admin/depoimentos` com lazy.
- `src/components/layout/AdminSidebar.tsx` — + itens "Orçamentos" (FileText) e "Depoimentos" (MessageSquareQuote).
- `src/pages/public/Home.tsx` — inclui `<Testimonials />` entre `<WhyBuy />` e `<PhysicalStore />`.

### Decisões técnicas tomadas na R9B

1. **`RemoteImageUploader` como componente novo em vez de mutar o legado** — evita quebrar `SeasonalCategory` (única página que ainda usa `ImageUploader` Base64). Os dois coexistem por enquanto.
2. **ProductForm faz refetch ao editar** — o `useAdminDataStore.products` não tem `imageId` (só URLs), então para deletar imagem individual é preciso pegar do backend (`getPublicBySlug`).
3. **Banners: cria antes de fazer upload de imagem** — banner precisa existir no banco para receber `imageUrl`. Se o modal está criando um banner novo, salvamos com `addBanner` primeiro para ter id.
4. **Settings: `update({ logoUrl: null })` para remover** — remove referência, mas o arquivo antigo já foi apagado pelo próprio backend na hora do upload (safeUnlink no service).
5. **Loja em memória continua** — server-side query por rota fica como pendência. Justificativa: `useAdminDataStore.products` já vem da API real, filtros in-memory sobre esse cache são responsivos e não bloqueantes; a otimização de paginação server-side casa com adicionar paginação visual, coisa que a UI não tem.
6. **Home Testimonials silencioso quando vazio** — `if (items.length === 0) return null` evita título vazio. Respeita o design existente.
7. **`PUT /api/me` só aceita name/phone** — evita bypass de role, email dev/prod distintos, e senha antiga. Endereços múltiplos e edição de senha ficam para endpoints futuros dedicados.
8. **Smoke tests com curl em vez de bateria interativa** — decisão de custo/benefício. Endpoints validados; testes interativos (dev servers em paralelo, browser) ficam para R10 antes do deploy.

---

## 8. Pendências reais

### Migração de uploads restante
- **`SeasonalCategory` ainda usa `ImageUploader` Base64.** Baixa prioridade; funcional. Migrar exige criar endpoint específico para banner sazonal ou reusar `siteImageUpload` genérico. Depois, o `ImageUploader` legado pode ser removido.

### Otimizações não críticas
- **`/loja` e `/categoria/:slug` server-side** — hoje `useAdminDataStore.products` vem da API mas filtros são in-memory. Migrar para `productService.listPublic` a cada mudança de filtro melhora escala.
- **Paginação visual** na loja — casa com o item acima.
- **`useAdminDataStore.orders` limita a 100** — se crescer, paginar.

### Endpoints faltando
- `Coupon` como entidade backend (hoje hardcoded em `site.coupons`).
- `POST /api/contact` para form de contato.
- `POST /api/newsletter`.
- `PUT /api/me/password` (troca de senha).
- Endereços múltiplos por cliente.

### Segurança / produção
- ~~Rate limiting~~ — **feito na R10** (`express-rate-limit`: auth 10/15min, quotes 20/hora, uploads 30/hora, todos por IP).
- ~~Helmet / CSP~~ — **feito na R10** (Helmet habilitado; CSP desligado por ser API pura; `crossOriginResourcePolicy: cross-origin` liberado para o frontend consumir `/uploads/*`).
- **CORS prod** — mecanismo pronto (`CORS_ORIGIN` aceita CSV), mas ainda aponta só para `http://localhost:5173`. Falta configurar o domínio real no `.env` de produção quando o deploy acontecer.
- **Cookies httpOnly para JWT** — hoje localStorage (XSS pode roubar). Decisão consciente de manter para o MVP; documentado como risco aceito (ver seção 15).
- **Refresh token** — sem.
- **Uploads em disco não persistem** em serverless (Render/Railway free tier). Documentado em `DEPLOY.md`.
- **`POST /api/quotes/:id/files` sem autenticação** — por design (permite orçamento anônimo). Mitigado por rate limit (R10) + CUID de orçamento praticamente impossível de adivinhar. Risco residual baixo, documentado no código e no `DEPLOY.md`.

### Testes
- ~~Bateria manual interativa~~ — **feito na R10**: smoke tests via curl (auth, RBAC, cart, orders, quotes + upload permitido/bloqueado, todos os endpoints admin) e smoke test manual no browser (home, loja, login admin, dashboard, produtos admin) — ver seção 15.

---

## 9. Riscos

1. **Uploads em disco local perdem dados em ambientes efêmeros.** Se deploy for para Render free/Railway free/Vercel serverless functions, os arquivos somem entre restarts. Mitigação: migrar para S3/Cloudflare R2/Supabase Storage antes do deploy real (documentado em `DEPLOY.md`).
2. **JWT em localStorage é vulnerável a XSS.** Nenhum XSS conhecido no código hoje (Markdown escapa HTML antes de formatar), mas é vetor real. Mitigação: cookies httpOnly SameSite=Lax + CSRF token — não implementado, risco aceito para o MVP.
3. ~~Sem rate limit em `/auth/*`~~ — **corrigido na R10**: `authRateLimiter` (10 tentativas/15min por IP), testado via smoke test (10 tentativas → 429).
4. **`estimatedRevenue` inclui todos os pedidos PAID de todos os tempos** — sem filtro por período. Se cliente pedir "mensal", cair no cache atrapalha. Fácil de resolver quando pedirem.
5. **`useAdminDataStore.refreshAdmin` roda quando admin loga, mas se admin fica logado por dias, cache pode ficar velho.** Nenhum polling. Mitigação: SSE ou refetch manual em cada tela crítica.
6. **`RemoteImageUploader` de banner cria banner antes do usuário confirmar "Salvar"** — comportamento: se admin sobe imagem e desiste, o banner fica criado como rascunho no banco. Mitigação: aceitável no MVP; pode virar "salvar draft" no futuro.
7. **Home Testimonials sem seed** — se `active=false` em todos, seção some. Correto, mas admin precisa saber. Documentado em `INSTRUCOES-ADMIN.md`.
8. **`PUT /api/me` altera name que é usado em snapshot de pedido** — pedidos antigos mantêm o nome antigo (snapshot). OK, comportamento intencional.

---

## 10. Comandos úteis

### Backend
```bash
cd backend
npm install
cp .env.example .env       # preencher JWT_SECRET (16+) e DATABASE_URL do Neon
npm run dev                # tsx watch → http://localhost:3333
npm run build && npm start
npm run typecheck

npm run prisma:migrate     # cria + aplica migration
npm run prisma:seed
npm run prisma:studio      # UI :5555
npm run db:setup           # migrate + seed em um só passo
```

**Smoke test rápido:**
```bash
curl http://localhost:3333/health
curl http://localhost:3333/api/public/settings
```

**Credenciais admin seedadas:**
- E-mail: `admin@3dcommerce.com`
- Senha: `admin123`

### Frontend
```bash
cd 3dCommerce
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:3333
npm run dev                # → http://localhost:5173
npm run build              # tsc + vite build → dist/
npm run preview
```

### Debug / limpeza
```bash
netstat -ano | grep ":3333" | grep LISTENING
taskkill //PID <PID> //F
cd backend && node dist/server.js &
```

---

## 11. Próximos passos recomendados

### R10 — Segurança, Auditoria Final e Deploy Prep — ✅ CONCLUÍDA (ver seção 15)

Itens 1 (rate limiting), 2 (helmet), 3 (CORS via env, mecanismo pronto), 5 (bateria manual) e 7 (`npm audit`) foram concluídos nesta rodada. Itens ainda pendentes, todos documentados em `DEPLOY.md` e na seção 15:
- Uploads em produção → migrar para S3/R2/Supabase Storage (item 4).
- Migrar `SeasonalCategory` para `RemoteImageUploader` (item 6).
- `vercel.json`/`_redirects` para SPA fallback — modelo pronto em `DEPLOY.md`, falta criar o arquivo real na hora do deploy (item 9).
- Deploy real em si (item 10) — não executado por instrução explícita desta rodada.

### R11+ (fase 2 real)
- Gateway de pagamento (Mercado Pago / Asaas) no `POST /api/orders`.
- ViaCEP no checkout.
- Frete real (Melhor Envio).
- E-mail transacional (Resend).
- Estoque sync com ERP.
- Google Analytics + Meta Pixel.
- PWA + Service Worker.

---

## 12. Cuidados para não quebrar o que já está funcionando

### Regras invioláveis

1. **NUNCA remover `useAdminDataStore` sem mapear todos os consumers.** Muitas páginas leem via seletor.
2. **Preservar shape dos DTOs em `services/types.ts`** — backend serializa esses campos exatos.
3. **`passwordHash` fora de qualquer response.** Validar por `JSON.stringify(...).includes('passwordHash') === false`.
4. **JWT_SECRET nunca commitar.** `.env` no `.gitignore`, `.env.example` como template.
5. **Tokens em `3dc-token-customer` e `3dc-token-admin` separados.** `api.ts` prefere admin quando ambos existem.
6. **Ordem de rotas Express importa:**
   - `/public/products/featured` antes de `/public/products/:slug`.
   - `/admin/products/images/:imageId` DELETE antes de `/admin/products/:id`.
   - `/admin/settings/logo` POST antes de PUT genérico.
7. **`ensureSettings()` mantém id fixo `main`** — não trocar por `findFirst` sem upsert.
8. **Transação do `createOrder`** — atômica. Não quebrar em passos separados.
9. **`safeUnlinkSiteImage` protege contra path traversal** — não simplificar removendo os checks `/` e `\\`.
10. **SVG bloqueado propositalmente** em `siteImageUpload` (XSS). Não relaxar sem sanitizer.

### Ao adicionar novo endpoint (backend)
- Envelope `{ok, data}` ou `{ok:false, error:{code, message, details?}}`.
- `authMiddleware` antes de `adminMiddleware`.
- `asyncHandler` no controller.
- Zod parse no controller, service assume tipo validado.
- Decimals → number no DTO (usar `decimalToNumber`).
- Datas → ISO strings.
- Registrar no `routes/index.ts` se for router novo.

### Ao adicionar consumer no frontend
- Usar service correspondente em `src/services/`.
- Nunca hardcodar `http://localhost:3333` — usar `apiAssetUrl` para URLs de mídia.
- Tratar `ApiError` (nome, status, code, message).
- Estados de loading/error/empty visíveis.
- Sem senha em memória por mais tempo que a requisição.

### Ao adicionar novo upload no admin (padrão R9B)
- **Usar `RemoteImageUploader`** (não `ImageUploader` legado).
- Passar `value` (URL atual do backend) + `onUpload(file) => URL final`.
- Se a entidade não existe ainda (form de criação), salvar entidade primeiro; depois habilitar upload.
- No `onRemove`, chamar o endpoint DELETE correspondente (`removeImage`, `update({ url: null })`, etc.).

### Ao mexer no schema Prisma
1. Alteração em `schema.prisma`.
2. `npm run prisma:migrate` (cria migration nova).
3. `npm run prisma:generate` (regenera client).
4. Atualizar `services/types.ts` no frontend.
5. Atualizar `adapters.ts` se muda contrato interno.
6. Rodar build backend + frontend.
7. Migrations reversíveis (evitar DROP + CREATE).

### Ao subir para produção
- Backend: `JWT_SECRET` ≥ 16 chars, `NODE_ENV=production`, `CORS_ORIGIN` com domínios reais, `DATABASE_URL` do Neon prod.
- Frontend: `VITE_API_URL` apontando para backend prod (HTTPS).
- Rodar `prisma migrate deploy` em prod (**não** `migrate dev`).
- Backup do Neon antes de qualquer migration destrutiva.

---

## 13. Estado do banco (Neon)

- **Migration aplicada:** `20260701064817_init`.
- **Seed executado:** 1 admin, 8 categorias, 10 produtos, 1 SiteSettings id=main, 2 banners, 2 testimonials.
- **Dados de teste acumulados:**
  - 1 pedido (`#3DC-...` do teste R5).
  - 2 orçamentos (1 anônimo com 3 arquivos, 1 logado).
  - Alguns customers de teste dos smoke tests foram limpos ao final de cada rodada.
- **Uploads em disco (`backend/uploads/`):**
  - `products/`, `quotes/`, `site/` — servidos via `/uploads/*` estático.
  - **NÃO PERSISTEM** em serverless free tier. Migrar para S3/R2/Supabase Storage antes de prod real.

---

## 14. Referências rápidas

**URLs padrão:**
- Backend dev: `http://localhost:3333`
- Frontend dev: `http://localhost:5173`
- Prisma Studio: `http://localhost:5555`
- Health: `http://localhost:3333/health`

**Env vars mínimas backend:**
```env
PORT=3333
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@ep-....neon.tech/neondb?sslmode=require"
JWT_SECRET="min-16-chars-random-string"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="uploads"
```

**Env vars mínimas frontend:**
```env
VITE_API_URL=http://localhost:3333
```

**Rotas admin acessíveis** (após login em `/admin/login`):
- `/admin` — Dashboard
- `/admin/produtos` — Lista + form (com upload real)
- `/admin/categorias`
- `/admin/categoria-sazonal` — ainda usa `ImageUploader` Base64
- `/admin/banners` — com upload real
- `/admin/pedidos`
- `/admin/orcamentos` — **NOVA na R9B**
- `/admin/depoimentos` — **NOVA na R9B**
- `/admin/configuracoes` — com upload real de logo

---

## 15. R10 — Segurança, Auditoria Final e Deploy Prep (detalhes)

### Diagnóstico inicial
Backend já chegou na R10 com boa base: CORS via env (CSV), `JWT_SECRET` validado no boot (mín. 16 chars, rejeita `"change-me"`), uploads com nome imprevisível + path traversal bloqueado + SVG bloqueado em uploads de usuário, error handler formatando Zod/Multer/HttpError e escondendo stack em produção, `passwordHash` nunca vazando em nenhum DTO. Faltavam mesmo: Helmet, rate limiting, e uma auditoria de secrets.

### 🔴 Achado crítico fora do escopo original — corrigido
`backend/.env.example` continha a **`DATABASE_URL` real do Neon** (usuário e senha em texto puro), idêntica ao `.env` de verdade — ou seja, o arquivo "de exemplo" era na prática um vazamento de credencial de produção. Como a pasta `backend/` inteira ainda estava **não commitada** no git (`git status` mostrava `??`), a credencial não chegou a vazar no GitHub — mas vazaria no primeiro `git add`. Corrigido: `.env.example` agora usa um placeholder (`usuario:senha@ep-seu-endpoint...`). **Recomendação:** mesmo sem vazamento confirmado, considerar rotacionar a senha do Neon por precaução caso o arquivo já tenha sido compartilhado por algum outro canal (Slack, WhatsApp, etc.).

### Arquivos criados
- `backend/src/middlewares/rateLimiters.ts` — `authRateLimiter` (10/15min), `quoteRateLimiter` (20/hora), `uploadRateLimiter` (30/hora), todos por IP, respondendo no envelope `{ok:false, error:{code:"RATE_LIMITED"}}`.
- `backend/uploads/seed/*.svg` (10 arquivos) — placeholders de imagem para os produtos do seed. **Bug pré-existente encontrado durante o smoke test manual**: `prisma/seed.ts` referenciava `/uploads/seed/*.svg` para todos os 10 produtos, mas os arquivos nunca existiam em disco — toda a loja pública exibia imagens quebradas (`ERR_BLOCKED_BY_ORB` no browser, 404 no backend). Corrigido gerando um SVG simples por produto.
- `DEPLOY.md` — guia de deploy (backend, frontend, banco, env vars, checklist pós-deploy, pendências).
- `.claude/launch.json` — config para rodar o frontend via preview tool (não é parte do app, só ferramenta de dev).

### Arquivos alterados
- `backend/src/app.ts` — Helmet habilitado (`contentSecurityPolicy: false` por ser API pura sem HTML; `crossOriginResourcePolicy: cross-origin` para o frontend em outra origem carregar `/uploads/*`).
- `backend/src/modules/auth/auth.routes.ts` — `authRateLimiter` em `/register` e `/login`.
- `backend/src/modules/quotes/quotes.routes.ts` — `quoteRateLimiter` em `POST /quotes`, `uploadRateLimiter` em `POST /quotes/:id/files`.
- `backend/src/modules/products/products.routes.ts` — `uploadRateLimiter` em `POST /admin/products/:id/images`.
- `backend/src/modules/banners/banners.routes.ts` — `uploadRateLimiter` em `POST /admin/banners/:id/image`.
- `backend/src/modules/settings/settings.routes.ts` — `uploadRateLimiter` em `POST /admin/settings/logo`.
- `backend/src/modules/testimonials/testimonials.routes.ts` — `uploadRateLimiter` em `POST /admin/testimonials/:id/avatar`.
- `backend/.env.example` — removida a `DATABASE_URL` real (ver achado crítico acima).
- `backend/package.json` — `+helmet`, `+express-rate-limit`.

### Auditoria de uploads
Produtos/site: jpg/jpeg/png/webp, 5MB, nome com 16 bytes de hex aleatório, extensão validada contra o mime declarado. Site: SVG bloqueado propositalmente (XSS). Quotes: stl/obj/zip/pdf/jpg/jpeg/png/webp, 25MB, blocklist explícita de `.exe/.bat/.js/.html/.php/...`. Arquivos órfãos removidos em caso de falha de transação (`safeUnlink*`). `safeUnlinkSiteImage` bloqueia path traversal (`/` e `\`). Nada foi alterado aqui — já estava sólido; só adicionamos rate limit por cima.

### Auditoria de auth/JWT
`authMiddleware`/`adminMiddleware`/`optionalAuthMiddleware` revisados — comportamento correto (401 quando token ausente/inválido/expirado/usuário desativado, 403 quando role insuficiente). Login usa `bcrypt.compare` com hash dummy para não vazar timing de enumeração de e-mail. `JWT_SECRET` obrigatório e validado.

### Auditoria de `passwordHash`
Grep global confirma: só existe dentro de `auth.service.ts` (hash e compare) e comentários. Nenhum DTO, response ou log expõe.

### Auditoria frontend
Sem mocks perigosos (blogPosts/faqs são conteúdo estático local intencional, não bloqueiam MVP). `Markdown.tsx` escapa HTML bruto antes de aplicar formatação — sem XSS. Tokens `3dc-token-admin`/`3dc-token-customer` separados; 401 global (`auth:expired`) limpa ambas sessões + carrinho. `VITE_API_URL` sem hardcode de `localhost:3333` fora do fallback padrão em `api.ts`. Login admin não valida credencial fixa no client.

### Mocks/fallbacks restantes (não bloqueiam MVP)
- `blogPosts`, `faqs` — conteúdo estático local, intencional.
- Cupons (`site.coupons`) — hardcoded, sem endpoint. Pós-MVP.
- `SeasonalCategory` ainda usa `ImageUploader` Base64 legado. Pós-MVP.
- Filtros da loja em memória sobre `useAdminDataStore.products`. Pós-MVP.

### Resultado dos comandos
- `npx prisma validate` → ✅ schema válido.
- `npx prisma generate` → ✅ (aviso não-bloqueante: Prisma 7 disponível, upgrade major não aplicado).
- Backend `npm run typecheck` → ✅ sem erros.
- Backend `npm run build` → ✅ sem erros.
- Backend `npm audit` → ✅ 0 vulnerabilidades.
- Frontend `npm run build` (`tsc -b && vite build`) → ✅ sem erros (aviso não-bloqueante de chunk >500kB — otimização futura, não bug).
- Frontend `npm audit` → 1 vulnerabilidade moderada/alta em `esbuild`/`vite`, restrita ao **dev server** (não afeta build de produção). Corrigir exige `vite@8` (breaking change) — não aplicado sem aprovação explícita.

### Smoke tests backend (curl)
Todos passaram: `/health` (sem envelope) e `/api/health` (com envelope); registro + login de cliente; login admin; `/api/auth/me`; rota admin com token de cliente → 403; rota admin com token de admin → 200; `/api/public/*` (settings, banners, categories, products, featured); carrinho (`GET`/`POST /items`); `/api/me/orders`; criação de orçamento anônimo; upload de `.stl` aceito (201); upload de `.exe` e `.js` rejeitados (400); todos os endpoints `/api/admin/*` retornando 200 sem `passwordHash` no payload; rate limiter de auth confirmado (10 tentativas → 429 nas seguintes).

### Smoke test frontend (manual, browser real)
Rodado com backend + frontend em `dev` simultâneos via preview tool: Home carrega com dados reais e sem erros de console; Loja lista os 10 produtos (após corrigir o bug de imagens do seed); login admin funciona ponta a ponta (token salvo, redirect para `/admin`); Dashboard mostra métricas reais (1 pedido, R$ 84,80, 10 produtos ativos, 2 com estoque baixo); página de Produtos admin lista o CRUD completo. Nenhum erro de CORS ou de Helmet observado — confirma que os headers de segurança novos não quebraram a integração.

### Rotas principais finais
Confirmadas registradas e ativas: Health (`/health`, `/api/health`), Auth (`/api/auth/*`), Users (`/api/me`), Categorias, Produtos (público + admin + upload de imagens), Cart, Orders, Quotes (público + admin + upload de arquivos), Settings, Banners, Testimonials, Dashboard — sem mudança de shape, só rate limiters adicionados nas rotas sensíveis.

### Pendências pós-MVP
- Migrar uploads para S3/R2/Supabase Storage antes de produção real com filesystem efêmero.
- Gateway de pagamento no checkout.
- Cookies httpOnly + CSRF para o JWT (risco aceito para MVP).
- `SeasonalCategory` migrar para `RemoteImageUploader`.
- `npm audit fix --force` do frontend (bump major do Vite) — avaliar separadamente, fora do escopo de hardening.
- Considerar rotacionar a credencial do Neon por precaução (ver achado crítico acima).

### Checklist de deploy
Ver `DEPLOY.md` — cobre backend (Render/Railway + env vars + `prisma migrate deploy`), frontend (Vercel/Netlify + `VITE_API_URL` + SPA fallback), banco (Neon prod separado do dev) e checklist pós-deploy.

### Status final
- **Pronto para deploy em staging?** Sim — build limpo dos dois lados, segurança básica aplicada (Helmet, rate limit, CORS configurável, secrets fora do repo), smoke tests passando.
- **Pronto para venda/demo?** Sim para demonstração — fluxo completo (loja, carrinho, checkout, orçamento com upload, admin completo) funciona de ponta a ponta com dados reais.
- **Pronto para produção real com clientes pagando?** Não ainda — falta gateway de pagamento e storage externo de uploads (ambos documentados como pendência, nenhum bloqueia staging/demo).
- **Riscos conhecidos:** uploads em disco não persistem em serverless; JWT em localStorage (XSS); upload de orçamento sem auth (mitigado por rate limit); vulnerabilidade de dev-server no `esbuild`/`vite` do frontend.

---

**Fim do checkpoint. A partir daqui, use este arquivo como referência única para retomar o projeto.**
