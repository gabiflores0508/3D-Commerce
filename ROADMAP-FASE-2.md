# Roadmap Fase 2 — 3DCommerce

Plano técnico para evoluir o e-commerce mockado para um sistema com **backend real**, **pagamento real** e **operação real**.

> **Tempo estimado:** 10 a 15 dias úteis após aprovação do cliente.

---

## 1. Backend com Supabase

### Por que Supabase
- Banco Postgres gerenciado.
- Auth pronto (e-mail + senha, Google, etc.).
- Storage para imagens (substituindo placeholders SVG).
- Row Level Security para proteger dados.
- Plano gratuito generoso para começar.
- API REST e Realtime sem precisar escrever backend.

### Tabelas a criar (espelham `src/types/`)

```sql
-- products
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  brand text,
  material text,
  price numeric not null,
  promo_price numeric,
  stock int default 0,
  free_shipping boolean default false,
  purchase_mode text default 'direct',
  variations jsonb default '[]',
  badges text[] default '{}',
  is_highlight boolean default false,
  is_launch boolean default false,
  is_offer boolean default false,
  is_best_seller boolean default false,
  active boolean default true,
  attributes jsonb default '{}',
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  show_in_menu boolean default true,
  show_in_home boolean default true,
  "order" int default 0,
  is_seasonal boolean default false,
  seasonal_active boolean default false,
  seasonal_banner text,
  color text
);

create table product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  cta_label text,
  cta_link text,
  image text,
  position text,
  active boolean default true,
  "order" int default 0,
  bg_from text,
  bg_to text
);

create table orders (
  id text primary key,
  created_at timestamptz default now(),
  customer jsonb not null,
  address jsonb not null,
  items jsonb not null,
  shipping jsonb not null,
  payment jsonb not null,
  coupon jsonb,
  subtotal numeric not null,
  total numeric not null,
  status text not null default 'novo'
);

create table store_settings (
  id int primary key default 1,
  name text,
  whatsapp text,
  instagram text,
  email text,
  address text,
  cnpj text,
  about text,
  shipping_note text,
  free_shipping_threshold numeric,
  pix_discount_percent numeric,
  constraint single_row check (id = 1)
);
```

### Onde plugar no código

- Em `src/services/` criar arquivos:
  - `productsService.ts`
  - `categoriesService.ts`
  - `bannersService.ts`
  - `ordersService.ts`
  - `settingsService.ts`
- Cada um expõe funções `list()`, `get(id)`, `create(...)`, `update(...)`, `remove(id)` que internamente chamam Supabase.
- O `useAdminDataStore` passa a chamar essas funções em vez de operar puramente em memória — pode manter uma cópia em memória para UI otimista.

---

## 2. Auth real

### Substituir mock por Supabase Auth (admin **e cliente final**)

- **Admin** — `src/pages/admin/Login.tsx` passa a usar `supabase.auth.signInWithPassword`.
- **Cliente final** — `src/store/useCustomerAuthStore.ts` (hoje mockado com senhas em localStorage) deve ser **completamente substituído** por Supabase Auth: registro, login, recuperação de senha, sessão persistida via cookie httpOnly.
- `useAdminAuthStore` armazena a session do Supabase.
- `ProtectedAdminRoute` (já existe) checa session ativa.
- Rotas `/minha-conta` e `/meus-pedidos` passam a checar session real.
- Logout chama `supabase.auth.signOut`.

### Upload real de imagens (substitui mock atual)

Hoje `src/components/admin/ImageUploader.tsx` salva imagens em Base64 no `localStorage`. Trocar por:

- **Supabase Storage** com bucket `products` público para leitura.
- Manter a mesma interface do componente (`value` + `onChange`) — só trocar o `FileReader → Base64` por `supabase.storage.from(...).upload(...)` e retornar a URL pública.
- Remover o limite de 1MB (Storage suporta arquivos maiores).
- Adicionar **Supabase Image Transforms** para servir versões redimensionadas.

### Múltiplos níveis de admin (opcional)
- Tabela `admin_users` com coluna `role` (`owner`, `editor`, `read_only`).
- RLS no Supabase bloqueia ações conforme role.

---

## 3. Gateway de pagamento

### Recomendação: **Mercado Pago Checkout Pro** ou **Asaas**

Vantagens MP:
- Pix instantâneo.
- Cartão em até 12x.
- Boleto.
- Taxas competitivas no Brasil.
- SDK JS pronto.

Vantagens Asaas:
- API limpa.
- Boa relação custo-benefício para PMEs.
- Notificações via webhook.

### Onde plugar

`src/pages/public/Checkout.tsx` — função `onConfirm` do `ReviewStep`:

1. Cria pedido no Supabase com status `aguardando-pagamento`.
2. Chama API do gateway para gerar:
   - QR Code Pix, ou
   - Link de pagamento de cartão, ou
   - Linha digitável de boleto.
3. Mostra ao cliente.
4. Configura webhook para receber notificação de pagamento confirmado → atualiza status no Supabase para `pago`.

Pequena edge function no Supabase recebe o webhook e atualiza a linha.

---

## 4. Frete real

### Recomendação: **Melhor Envio**

- API REST simples.
- Cota Correios + transportadoras parceiras.
- Calcula com base no CEP, peso e dimensões.

### Onde plugar

- Em `AddressStep` do checkout, ao mudar o CEP: chamar API do ViaCEP (auto-fill rua/bairro/cidade) + Melhor Envio (lista de transportadoras e prazos).
- Substituir `getCartShipping` em `src/store/useCartStore.ts` por chamada à API.
- Adicionar peso aproximado em cada produto (`weight_g` no schema).

---

## 5. Upload de imagens reais

### Supabase Storage

- Criar bucket `products` público para leitura.
- No `ProductForm.tsx` do admin: trocar geração SVG por componente de upload (`react-dropzone` ou input nativo).
- Salvar URL pública no campo `images` do produto.
- Permitir múltiplas imagens (galeria).

### Otimização

- Configurar **Supabase Image Transforms** para servir versões redimensionadas (thumbnail, médio, grande).
- ou usar **Cloudinary** se cliente preferir.

---

## 6. ERP / Estoque

### Cenário 1 — Cliente sem ERP
- Estoque é editado manualmente no admin.
- Após cada venda confirmada, decrementar via Supabase function.

### Cenário 2 — Cliente com ERP (Bling, Tiny, Omie)
- API REST de polling diário ou webhooks.
- Sincroniza `stock` dos produtos.
- Sincroniza pedidos no sentido inverso (3DCommerce → ERP).

---

## 7. E-mail transacional

### Recomendação: **Resend** ou **SendGrid**

Disparos:
- Confirmação de pedido para o cliente.
- Notificação de novo pedido para o lojista.
- Atualização de status (em separação, enviado, entregue).
- Recuperação de senha do admin (quando integrar Auth real).

Templates HTML simples em React Email (compatível com Resend).

---

## 8. Newsletter

Persistir em:
- **Supabase** (tabela `newsletter_subscribers`) + integração futura com Mailchimp / RD Station.
- ou direto em **Resend Audiences** / **Mailchimp**.

---

## 9. Performance e PWA

- **Lighthouse** rodando em 90+ em todas as métricas.
- Adicionar `manifest.json` para PWA instalável.
- Service worker para cache offline.
- Lazy load de imagens via `loading="lazy"` (já implementado).
- `<link rel="preload">` para Hero image quando houver foto real.

---

## 10. Analytics e marketing

- Google Analytics 4.
- Pixel do Meta (para Facebook/Instagram Ads).
- Google Search Console (sitemap já gerado).
- Tag do Google Tag Manager para flexibilidade futura.

---

## Cronograma sugerido (15 dias úteis)

| Semana | Entregas |
|---|---|
| **Semana 1** (5 dias) | Supabase setup, schema, RLS, services, auth real, migração de dados mockados. |
| **Semana 2** (5 dias) | Gateway de pagamento, frete Melhor Envio, upload de imagens. |
| **Semana 3** (5 dias) | E-mail transacional, analytics, ajustes finais, treinamento. |

---

## Estimativa de investimento Fase 2

- **R$ 6.500** (preço sugerido).
- Inclui tudo desta lista + 30 dias de garantia + 1h de treinamento.
- Não inclui: tarifas de pagamento (gateway fica 3-4% por venda), domínio anual, contratos de marketing.

---

## Riscos e dependências

- **Conta no gateway de pagamento** — cliente precisa abrir CNPJ + conta Mercado Pago / Asaas.
- **Domínio próprio** — cliente fornece ou compra.
- **Logo e fotos reais** — cliente entrega.
- **Decisão sobre ERP** — define se conectamos ou não.
- **Disponibilidade do cliente** para validações intermediárias.

---

**Pronto para evoluir quando o cliente decidir.**
