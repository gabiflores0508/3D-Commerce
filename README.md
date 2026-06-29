# 3DCommerce

E-commerce premium e painel administrativo da **3DCommerce** — loja especializada em impressão 3D (filamentos, resinas, impressoras e acessórios), com loja física em **Bento Gonçalves/RS** e envio para todo o Brasil.

Projeto desenvolvido pela **G-Rec Company**.

> **Frase institucional**
> *Tudo para impressão 3D em um só lugar: impressoras, filamentos, resinas e suporte especializado.*

---

## Visão geral

Aplicação **frontend-only** (React + Vite + TypeScript) com dados mockados persistidos em `localStorage`. Toda a arquitetura está preparada para receber backend real (Supabase ou API própria) e gateway de pagamento na **Fase 2**, sem refazer a UI.

- 16 páginas públicas
- 10 páginas administrativas
- Carrinho persistido
- Checkout demonstrativo de 4 passos
- Pedido fechado pelo cliente aparece automaticamente no painel admin
- Categoria sazonal totalmente editável (ativar/desativar, banner, produtos associados)
- Sistema de banners, categorias e produtos editáveis
- Modo de compra por produto: **direct**, **quote** ou **both**
- WhatsApp em todas as páginas
- SEO básico, Open Graph e Twitter Cards
- Responsivo mobile-first

---

## Stack

- **React 18** + **Vite 5** + **TypeScript** (strict)
- **Tailwind CSS** com tokens próprios (off-white, branco, cinza, preto, grafite, acento ciano)
- **Framer Motion** — animações suaves
- **Zustand** — carrinho, UI, admin auth e admin data (com `persist` em localStorage)
- **React Router v6** com rotas aninhadas, `ScrollRestoration` e code-splitting via `React.lazy`
- **React Hook Form + Zod** — formulários validados
- **Lucide React** — ícones
- **react-hot-toast** — feedback
- **clsx + tailwind-merge** — utilitário `cn()`
- **slugify** — geração de slugs no admin

Sem backend, sem banco de dados, sem dependências pesadas.

---

## Como rodar localmente

Pré-requisitos: **Node 18+** e **npm**.

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev

# 3. Build de produção
npm run build

# 4. Preview da build
npm run preview
```

O Vite abrirá em `http://localhost:5173` por padrão.

---

## Funcionalidades públicas

- **Home** com Hero animado, faixa de marcas, vitrines (destaques / ofertas / mais vendidos), banner sazonal, materiais educativos, blocos de confiança, loja física, Instagram e newsletter.
- **Catálogo** com filtros (material, marca, preço, em estoque, ofertas), 6 ordenações e busca por palavra-chave via querystring.
- **Página de produto** com galeria, variações (cor/material/peso/diâmetro/voltagem/modelo), preço normal + Pix + parcelamento, badges, modos `direct`/`quote`/`both` e produtos relacionados.
- **Carrinho** persistido + drawer lateral + cupons demonstrativos.
- **Checkout demonstrativo** em 4 passos (cliente → endereço → entrega → pagamento → revisão), com Zod, tela de confirmação e **persistência do pedido no admin**.
- **Orçamento via WhatsApp** dedicado (`/orcamento`) com seleção de produtos de interesse.
- **Blog**, **FAQ**, **Como comprar**, **Trocas e devoluções**, **Política de privacidade**, **Sobre**, **Materiais**, **Contato** (formulário dispara WhatsApp).
- **Botão flutuante de WhatsApp** em todas as páginas.

---

## Área do cliente demonstrativa

Cliente final tem fluxo próprio (separado do login admin):

- `/login` — entrar
- `/criar-conta` — cadastrar
- `/minha-conta` — dados pessoais e endereço padrão
- `/meus-pedidos` — histórico de pedidos do próprio cliente

Quando o cliente faz checkout **logado**, o pedido recebe `customerId` e aparece tanto no admin quanto em `/meus-pedidos`. Sem login, o pedido continua salvo no admin (sem `customerId`).

> **Demonstração apenas.** Cadastro e senhas ficam no `localStorage` em texto puro. Trocar por Supabase Auth na Fase 2.

---

## Upload mockado de imagens (admin)

Disponível em **Produtos**, **Banners**, **Categoria Sazonal** e **Configurações (logo)**.

- Aceita PNG, JPG, WEBP e SVG.
- Limite de 1MB por imagem (evita estourar `localStorage`).
- Conversão via `FileReader` para Base64.
- Também aceita URL externa.
- Produtos: até 6 imagens, primeira é a principal.

> **Demonstração apenas.** As imagens ficam no navegador. Em produção, trocar por Supabase Storage / S3.

---

## Funcionalidades administrativas

Acesse `/admin/login`.

**Credenciais demo:**

```
E-mail: admin@3dcommerce.com
Senha:  3dcommerce2026
```

**Recursos:**

- **Dashboard** com cards de estatísticas, sparklines e tabela de últimos pedidos.
- **Produtos**: lista com busca/filtro, criar/editar com seções de informações, preços, classificação e flags.
- **Categorias**: CRUD com toggles `mostrar no menu` e `mostrar na home`.
- **Categoria Sazonal**: ativar/desativar, editar nome, slug, descrição, banner e produtos associados — com preview ao vivo.
- **Banners**: CRUD com preview do gradiente.
- **Pedidos**: lista filtrável por status com drawer de detalhes + mudança de status.
- **Configurações da loja**: nome, contatos, endereço, CNPJ, texto institucional, frete grátis e desconto Pix — reflete imediatamente no site público.
- Botão **"Restaurar dados de exemplo"** no header do admin.

Toda a operação do admin é persistida em `localStorage`.

---

## Como demonstrar o fluxo completo de pedido

1. Adicione produtos ao carrinho.
2. Vá em `/checkout` e finalize com qualquer dado fictício.
3. Faça login em `/admin/login`.
4. Acesse `/admin/pedidos` — seu pedido aparece no topo da lista.
5. Mude o status (novo → em separação → enviado).

---

## Como demonstrar a categoria sazonal

1. Acesse `/admin/categoria-sazonal`.
2. Desative a campanha "Copa do Mundo 3D".
3. Volte para `/` — a categoria some do menu e da home.
4. Reative, edite o nome ("Black Friday", "Natal", etc.) e veja a mudança em tempo real.

---

## Como trocar logo, dados da loja e WhatsApp

### Logo
Em `src/components/ui/Logo.tsx`. Substitua o `<svg>` interno por `<img src="..." />` ou ajuste o SVG. A logo aparece em header, footer, sidebar admin e tela de login.

### Dados da loja e WhatsApp
Duas formas:

1. **Editável pelo cliente em runtime**: `/admin/configuracoes` — altera nome, WhatsApp, e-mail, endereço, CNPJ, texto institucional, frete grátis e desconto Pix.
2. **Padrão técnico**: `src/config/site.ts` define defaults, credenciais de admin demo e cupons.

O número de WhatsApp do `admin/configuracoes` é usado em todos os links do site (botão flutuante, cards, página de produto, orçamento e contato).

---

## Modos de compra (direct / quote / both)

Cada produto possui a propriedade `purchaseMode`:

- **`direct`** — botão "Adicionar ao carrinho" + "Comprar agora".
- **`quote`** — apenas "Solicitar orçamento via WhatsApp" (não entra no carrinho).
- **`both`** — ambos: compra direta + botão secundário de WhatsApp.

Editável por produto no admin.

---

## Cupons demonstrativos

| Código | Tipo | Efeito |
|---|---|---|
| `BEMVINDO10` | Percentual | 10% off |
| `PIX5` | Percentual | 5% off extra |
| `FRETE3D` | Frete | Frete grátis |

Configuráveis em `src/config/site.ts`.

---

## Build de produção

```bash
npm run build
# saída em dist/
```

Bundle splitado em ~26 chunks (admin é code-split, visitante público não baixa).

Pronto para deploy estático em **Vercel**, **Netlify**, **Render**, **Cloudflare Pages**, **S3** ou qualquer host estático.

Consulte `CHECKLIST-DEPLOY.md` para o passo a passo.

---

## Próximos passos para integração real

Detalhamento completo em `ROADMAP-FASE-2.md`. Resumo:

| Componente | Onde plugar |
|---|---|
| Banco de dados (Supabase, Postgres) | Substituir `data/*.ts` e métodos do `useAdminDataStore` por chamadas em `src/services/` |
| Auth real | Substituir `useAdminAuthStore` por Supabase Auth / Auth0 / JWT próprio |
| Gateway de pagamento | Implementar em `pages/public/Checkout.tsx` no `onConfirm` do `ReviewStep` |
| Frete real | Substituir `getCartShipping` por API dos Correios / Melhor Envio |
| Upload de imagens | Substituir geração SVG por upload (Supabase Storage / S3) |
| ERP / Estoque | Sincronizar `stock` via webhook ou polling |
| E-mail transacional | Plugar em confirmação de checkout e contato |
| Newsletter | Persistir em base ou serviço externo (Mailchimp, RD) |

---

## Documentos do projeto

| Arquivo | Para que serve |
|---|---|
| `README.md` | Este arquivo — visão geral |
| `CHECKLIST-ENTREGA.md` | Checklist pré-entrega do projeto |
| `CHECKLIST-DEPLOY.md` | Passo a passo de deploy estático |
| `ROTEIRO-DEMO.md` | Roteiro de apresentação 5-7 min |
| `RESUMO-COMERCIAL.md` | Argumentos comerciais e valor percebido |
| `ROADMAP-FASE-2.md` | Caminho de evolução para backend real |
| `INSTRUCOES-ADMIN.md` | Manual rápido do painel admin |

---

**3DCommerce** — Tudo para impressão 3D em um só lugar.
Desenvolvido com cuidado pela **G-Rec Company**.
