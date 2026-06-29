# Checklist de Deploy — 3DCommerce

Passo a passo para subir o projeto em produção como **site estático**.

---

## Pré-requisitos

- Node 18+ instalado
- Conta na Vercel **ou** Netlify **ou** Cloudflare Pages
- Repositório GitHub privado com o projeto

---

## Antes de subir

- [ ] Logo real do cliente em `src/components/ui/Logo.tsx`
- [ ] WhatsApp real configurado em `src/config/site.ts` (e/ou pelo admin posteriormente)
- [ ] E-mail, endereço e CNPJ conferidos
- [ ] Trocar credenciais demo do admin em `src/config/site.ts`:
  ```ts
  admin: {
    email: 'cliente@suaempresa.com.br',
    password: 'senha-forte-aqui',
  }
  ```
- [ ] `npm run build` rodando sem erros
- [ ] Testar `npm run preview` localmente
- [ ] Verificar `og.svg` (ou substituir por imagem real do cliente)
- [ ] Commit final no GitHub

---

## Opção 1 — Vercel (recomendado)

### Via interface
1. Acesse [vercel.com/new](https://vercel.com/new).
2. Importe o repositório.
3. Framework preset: **Vite** (auto-detectado).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Clique em **Deploy**.

### Configuração SPA (importante)
Crie na raiz do projeto o arquivo `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Sem isso, atualizar a página em `/loja` ou `/produto/xyz` retorna 404.

### Via CLI
```bash
npm i -g vercel
vercel --prod
```

---

## Opção 2 — Netlify

1. [netlify.com](https://netlify.com) → **New site from Git**.
2. Conecte o repositório.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Deploy.

### Configuração SPA
Crie em `public/_redirects`:

```
/*    /index.html   200
```

---

## Opção 3 — Cloudflare Pages

1. [pages.cloudflare.com](https://pages.cloudflare.com).
2. Conecte o repositório GitHub.
3. Build command: `npm run build`.
4. Build output directory: `dist`.
5. Em **Functions**, ative o fallback para SPA (auto se detectar Vite).

---

## Opção 4 — Render (Static Site)

1. [render.com](https://render.com) → **New** → **Static Site**.
2. Conecte o repositório.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Em **Redirects/Rewrites**: source `/*`, destination `/index.html`, action **Rewrite**.

---

## Pós-deploy

- [ ] Acessar a URL gerada e testar:
  - [ ] Home carrega
  - [ ] Navegar para `/loja` direto (sem 404)
  - [ ] Adicionar produto ao carrinho
  - [ ] Checkout até a tela de confirmação
  - [ ] Login admin
  - [ ] Mudança em `/admin/configuracoes` reflete na home
- [ ] Configurar domínio próprio (`3dcommerce.com.br` ou similar)
- [ ] Forçar HTTPS (ativo por padrão nos hosts acima)
- [ ] Submeter `sitemap.xml` no Google Search Console
- [ ] Validar Open Graph com [opengraph.xyz](https://www.opengraph.xyz)
- [ ] Configurar Google Analytics ou Plausible (opcional)
- [ ] Configurar Pixel do Meta (se houver tráfego pago)

---

## Variáveis de ambiente

**Atualmente o projeto não usa variáveis de ambiente em runtime** (frontend-only com mocks). Quando integrar com Supabase na Fase 2, criar `.env.example`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_WHATSAPP_NUMBER=
```

Adicionar `.env` em `.gitignore` (já está).

---

## Atualizações depois do deploy

```bash
git add .
git commit -m "feat: ajuste do cliente"
git push origin main
```

Vercel/Netlify fazem deploy automático. Em 1-2 minutos a nova versão está no ar.

---

## Rollback

- **Vercel**: aba **Deployments** → escolher versão anterior → **Promote to Production**.
- **Netlify**: aba **Deploys** → **Publish deploy** na versão desejada.

---

## Hospedagem mensal sugerida

| Plano | Indicado para | Inclui |
|---|---|---|
| **Hospedagem básica** R$ 99/mês | Site no ar com suporte mínimo | Domínio cuidado, deploy automático, SSL, monitoring |
| **Hospedagem + ajustes** R$ 199/mês | Cliente que pede ajustes mensais | + 2h de ajustes por mês |
| **Premium** R$ 397/mês | Cliente ativo, evoluindo o produto | + 5h ajustes + relatórios mensais + suporte WhatsApp 12h |

Sugestão de mensalidade ao apresentar.
