# STAGING-R11 — Deploy Staging + Validação Comercial

Guia operacional para subir o **3D Commerce em ambiente de staging** (Render/Railway + Vercel + Neon) e validá-lo.

> **Este documento NÃO executa deploy.** É o passo a passo + checklists para quando o deploy for autorizado. Complementa o [DEPLOY.md](DEPLOY.md) com foco em staging e validação comercial.

---

## 0. Pré-deploy — Segurança de secrets (OBRIGATÓRIO antes de tudo)

Estado verificado nesta rodada:

- [x] `backend/.env` está no `.gitignore` e **não é versionado** (confirmado via `git check-ignore` e `git ls-files`).
- [x] `backend/.env.example` contém **apenas placeholder** (`usuario:senha@ep-seu-endpoint...`), sem credencial real.
- [x] Nenhum arquivo versionado contém `postgresql://`, `neon.tech`, `JWT_SECRET` ou `DATABASE_URL` com valor real.
- [x] Ocorrências de `password` no código são nomes de campos/variáveis legítimos; `admin123` só existe no `seed.ts` e docs como credencial de demonstração.

Ação manual pendente (só você consegue fazer — precisa de acesso à conta):

- [ ] **Rotacionar a senha do banco Neon.** Console Neon → seu projeto → **Roles** → role do banco → **Reset password**. Motivo: a `DATABASE_URL` real esteve no `.env.example` durante a R9B (corrigido na R10); mesmo sem ter ido pro GitHub, rotacionar elimina o risco residual.
- [ ] Atualizar `backend/.env` local com a **nova** `DATABASE_URL` (não commitar).
- [ ] Gerar um `JWT_SECRET` **novo e forte** para staging (diferente do de dev):
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

---

## 1. Scripts confirmados

**Backend** (`backend/package.json`) — todos existem e o build passa limpo:
| Script | Comando | Status |
|---|---|---|
| install | `npm install` | ✅ |
| build | `tsc -p tsconfig.json` → `dist/` | ✅ build limpo |
| start | `node dist/server.js` | ✅ entrypoint existe |
| migrate deploy | `npx prisma migrate deploy` | ✅ (usar em prod, **não** `migrate dev`) |

**Frontend** (`package.json` raiz):
| Script | Comando | Status |
|---|---|---|
| build | `tsc -b && vite build` → `dist/` | ✅ build limpo |

---

## 2. Variáveis de ambiente

### Backend (definir no painel Render/Railway — **nunca** commitar)
| Variável | Valor staging | Observação |
|---|---|---|
| `PORT` | `3333` (ou a porta que a plataforma injeta) | Render/Railway às vezes injetam `PORT` automático — o código já lê `process.env.PORT`. |
| `NODE_ENV` | `production` | Desliga stack de erro e o requestLogger verboso. |
| `DATABASE_URL` | *(Neon staging, com sslmode=require)* | Usar branch/projeto **separado** do dev. |
| `JWT_SECRET` | *(≥16 chars, gerado novo)* | Nunca reusar o de dev. |
| `JWT_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | *(URL do frontend na Vercel, ex.: `https://3dcommerce.vercel.app`)* | Aceita CSV para múltiplas origens. |
| `UPLOAD_DIR` | `uploads` | ⚠️ ver risco de disco efêmero (seção 6). |

### Frontend (definir no painel Vercel)
| Variável | Valor staging | Observação |
|---|---|---|
| `VITE_API_URL` | *(URL do backend no Render/Railway, HTTPS)* | Sem barra final. Injetada em build time. |

---

## 3. Checklist — Backend no Render / Railway

### Render (Web Service)
- [ ] Novo **Web Service** apontando para o repositório, **Root Directory = `backend`**.
- [ ] Runtime: Node. Build Command: `npm install && npm run build`. Start Command: `npm start`.
- [ ] Adicionar todas as env vars da seção 2 (backend).
- [ ] **Antes do primeiro start** ou como comando pós-build, rodar as migrations:
      `npx prisma migrate deploy && npx prisma generate`.
      (No Render, pode ir no Build Command: `npm install && npx prisma generate && npm run build`. As migrations podem ser rodadas via Shell do serviço ou um pre-deploy command.)
- [ ] Confirmar Node ≥ 18 (o `package.json` exige `>=18`).
- [ ] Se o plano tiver disco efêmero: cientes de que uploads somem em restart (seção 6).
- [ ] Anotar a URL pública gerada (vira o `VITE_API_URL` do frontend e entra no `CORS_ORIGIN`).

### Railway (alternativa)
- [ ] Novo projeto → Deploy from repo → **Root Directory = `backend`**.
- [ ] Build: `npm install && npm run build`. Start: `npm start`.
- [ ] Env vars idem seção 2.
- [ ] Rodar `npx prisma migrate deploy` via Railway Shell/CLI.
- [ ] Volume persistente para `uploads/` se quiser evitar perda de arquivos (opcional em staging).

---

## 4. Checklist — Frontend na Vercel

- [ ] Importar o repositório na Vercel.
- [ ] **Root Directory = raiz do repo** (onde está o `package.json` do frontend). Framework detectado: **Vite**.
- [ ] `vercel.json` (já criado na raiz) cuida do build, output `dist` e do **SPA fallback** (rewrite `/(.*) → /index.html`).
- [ ] Env var `VITE_API_URL` = URL do backend (HTTPS), definida **antes** do build.
- [ ] Confirmar que o build da Vercel não tenta buildar a pasta `backend/` (o `vercel.json` na raiz e o framework Vite mantêm o escopo no frontend).
- [ ] Após o primeiro deploy, pegar a URL (`*.vercel.app`) e **colocá-la no `CORS_ORIGIN` do backend** — depois redeploy do backend.

> Ordem recomendada: 1) subir backend, 2) subir frontend com `VITE_API_URL` do backend, 3) atualizar `CORS_ORIGIN` do backend com a URL da Vercel, 4) redeploy backend.

---

## 5. Checklist — Banco Neon

- [ ] Criar **branch ou projeto separado** para staging (não usar o banco de dev).
- [ ] Copiar a `DATABASE_URL` de staging para as env do backend.
- [ ] Rodar `npx prisma migrate deploy` (aplica a migration `20260701064817_init`) — **nunca** `migrate dev` nem `migrate reset` em staging.
- [ ] Rodar o seed **uma única vez** e com atenção (`npx prisma db seed` / `npm run prisma:seed`): cria 1 admin, 8 categorias, 10 produtos, settings, 2 banners, 2 depoimentos.
- [ ] Trocar a senha do admin seedado (`admin123`) por uma real após o primeiro login, ou ajustar o seed antes de rodar.
- [ ] **Não** rodar reset, **não** apagar dados.

---

## 6. Checklist — Pós-deploy (validação funcional)

Rodar na ordem, contra as URLs de staging:

- [ ] **Health backend** — `GET https://BACKEND/health` responde `{"status":"ok"}`.
- [ ] **CORS** — abrir o frontend e confirmar no DevTools → Network que as chamadas à API **não** dão erro de origem bloqueada.
- [ ] **Home** — carrega settings, banners, categorias e produtos reais; sem erro no console.
- [ ] **Loja** — lista os 10 produtos com imagens (as imagens de seed `/uploads/seed/*.svg` precisam existir no disco do backend; ver nota abaixo).
- [ ] **Produto** — abrir uma página de produto; preços, variações e specs aparecem.
- [ ] **Carrinho** — adicionar item, drawer abre, contador no header atualiza.
- [ ] **Checkout** — criar um pedido de teste end-to-end até a tela de sucesso.
- [ ] **Orçamento** — criar orçamento anônimo com upload de arquivo (`.stl`); confirmar que `.exe`/`.js` são rejeitados.
- [ ] **Login admin** — `/admin/login` autentica e redireciona para `/admin`.
- [ ] **Dashboard admin** — métricas carregam (pedidos, faturamento, produtos, estoque baixo).
- [ ] **Upload de produto** — editar produto no admin, subir imagem, confirmar que a URL responde e aparece na loja.
- [ ] **Upload de banner** — criar/editar banner com imagem.
- [ ] **Upload de logo** — trocar logo em Configurações; confirmar reflexo no site.

> **Nota sobre imagens de seed:** os arquivos `backend/uploads/seed/*.svg` (placeholders dos 10 produtos) foram criados na R10 e existem no repositório local. Se o backend for buildado do zero em disco efêmero, esses arquivos **precisam** estar no deploy — confirmar que a pasta `uploads/seed/` foi para o serviço, ou que o seed aponta para imagens externas. Sem eles, a loja mostra imagens quebradas.

---

## 7. Riscos conhecidos (staging)

1. **Uploads em disco efêmero** — Render/Railway free tier apagam `uploads/*` a cada restart/deploy. Em staging é tolerável (dados de teste); em produção real, migrar para S3/R2/Supabase Storage.
2. **Imagens de seed** — dependem de `uploads/seed/*.svg` presentes no disco do backend (ver nota da seção 6).
3. **JWT em localStorage** — vetor de XSS; risco aceito para MVP/staging.
4. **Upload de orçamento sem auth** — por design (orçamento anônimo), mitigado por rate limit + CUID imprevisível.
5. **Cold start** — em free tier, o backend hiberna; a primeira request após inatividade demora alguns segundos. Avisar isso na demo.
6. **Sem pagamento real** — o checkout cria o pedido sem cobrança; não usar staging para transações reais.
7. **Vulnerabilidade de dev-server** (`esbuild`/`vite`) no `npm audit` do frontend — não afeta o build de produção servido pela Vercel.

---

## 8. O que ainda falta para PRODUÇÃO REAL (além de staging)

- Gateway de pagamento (Mercado Pago / Asaas) no `POST /api/orders`.
- Storage externo de uploads (S3 / Cloudflare R2 / Supabase Storage).
- Domínio próprio + HTTPS (a Vercel/Render já dão HTTPS no subdomínio; falta o domínio do cliente).
- Cookies httpOnly + CSRF para o JWT (endurecimento adicional).
- E-mail transacional (confirmação de pedido/orçamento).
- Backup automatizado do banco de produção.
- Trocar a senha do admin seedado por uma real e forte.

---

## 9. Roteiro de demo comercial — versão STAGING (4–5 min)

> Diferente do [ROTEIRO-DEMO.md](ROTEIRO-DEMO.md) (que é da demo **local** e tem trechos desatualizados — login admin já **não** vem com credenciais preenchidas, e os dados agora vêm de backend real, não do navegador). Use **este** roteiro quando estiver apresentando o ambiente de **staging** com URL real.

**Abertura (30s)**
> "Esse é o 3D Commerce rodando de verdade, no ar, com backend, banco de dados e painel administrativo reais — não é protótipo local. Vou te mostrar do lado do cliente e do lado de quem administra a loja."

**Lado do cliente (2 min)**
1. Abrir a **Home** (URL da Vercel) — hero, categorias, vitrines, depoimentos, loja física. "Tudo isso é editável pelo painel."
2. **Loja** → filtros e busca. Abrir um **produto** (ex.: Filamento PLA Preto) — preço, preço no Pix, parcelamento, specs.
3. Adicionar 1–2 itens ao **carrinho** → **checkout** completo até a tela de sucesso. "O pedido foi gravado no banco de verdade."
4. Voltar e abrir **Orçamento** — mostrar upload de arquivo 3D (`.stl`). "Cliente manda o modelo, a loja responde com valor pelo painel."

**Lado do admin (1min30)**
5. `/admin/login` → entrar. **Dashboard** com o pedido que acabou de ser criado aparecendo nas métricas em tempo real.
6. **Pedidos** → abrir o pedido novo, mudar status. **Produtos** → editar, subir imagem, ativar/desativar (mostrar refletindo na loja).
7. **Configurações** → "Nome, WhatsApp, endereço, logo — tudo muda no site na hora, sem depender da gente."

**Fechamento (30s)**
> "Isso já está no ar em ambiente de testes. Para virar produção definitiva faltam dois passos combinados: pagamento processando de verdade e o domínio de vocês. A estrutura toda já está pronta e é 100% administrável por vocês."

**Se perguntarem sobre demora ao abrir:** "O servidor de testes hiberna quando ninguém usa, por isso a primeira tela demora uns segundos. Em produção fica sempre ativo."

---

## 10. Status final

- **Pronto para deploy em staging?** ✅ **Sim.** Builds passam nos dois lados, scripts confirmados, secrets fora do repo, `vercel.json` de SPA criado, checklists prontos. Falta apenas a execução (autorizada por você) + a rotação da credencial Neon (ação manual sua).
- **Pronto para produção definitiva?** ❌ Ainda não — falta pagamento real e storage externo (seção 8).
- **Deploy real executado?** ❌ Não — aguardando sua autorização explícita, conforme instruído.
