# Manual do Painel Administrativo — 3DCommerce

Guia rápido para o cliente operar o painel.

---

## Acesso

URL: `https://[seu-dominio]/admin/login`

**Credenciais demo:**

```
E-mail: admin@3dcommerce.com
Senha:  3dcommerce2026
```

> ⚠️ Troque essa senha antes de colocar em produção. Veja a seção **Trocar senha** abaixo.

---

## Estrutura do painel

| Seção | Para que serve |
|---|---|
| **Dashboard** | Visão geral: pedidos, faturamento, produtos ativos, estoque baixo |
| **Produtos** | Cadastrar, editar, ativar/desativar produtos |
| **Categorias** | Criar e organizar categorias da loja |
| **Categoria Sazonal** | Campanha especial editável (Copa, Black Friday, Natal, etc.) |
| **Banners** | Banners da home e seções |
| **Pedidos** | Lista de pedidos, mudança de status |
| **Configurações** | Dados da loja, contato, frete, Pix |

---

## Tarefas comuns

### Upload mockado de imagens

Em **Produtos**, **Banners**, **Categoria Sazonal** e **Configurações**:

- Clique em **Enviar imagem** → escolha do computador (PNG, JPG, WEBP ou SVG, **até 1MB**).
- Ou clique em **Usar URL** → cole o link de uma imagem.
- Para produtos, adicione até 6 imagens; a primeira é a principal.
- Passe o mouse sobre uma imagem e clique no **X** para remover.

> Upload demonstrativo — imagens ficam salvas no navegador (localStorage). Em produção troca por Supabase Storage / S3.

### Cadastrar um novo produto

1. Acesse **Produtos** → **Novo produto**.
2. Preencha:
   - Nome (obrigatório)
   - Marca
   - Descrição curta e completa
   - Preço normal e promocional
   - Estoque
   - Categoria
   - Material (PLA, PETG, ABS, Resina ou —)
   - **Modo de compra**:
     - `direct` → cliente compra direto
     - `quote` → só orçamento pelo WhatsApp
     - `both` → cliente escolhe
   - Flags: destaque na home, lançamento, oferta, mais vendido, frete grátis, ativo
3. Clique em **Salvar produto**.

> A imagem é gerada automaticamente com base no nome. Na Fase 2 vai dar para subir foto real.

### Editar um produto

- **Produtos** → clique no ícone de lápis ao lado do produto.
- Faça as mudanças e salve.

### Ativar / desativar produto

- Use o toggle direto na lista, sem precisar editar.

### Remover produto

- Ícone de lixeira → confirma no modal.

### Criar categoria

1. **Categorias** → **Nova categoria**.
2. Preencha nome, descrição.
3. Marque **Mostrar no menu** e/ou **Mostrar na home**.
4. Salvar.

### Configurar campanha sazonal

1. **Categoria Sazonal**.
2. Ative o toggle **Ativar campanha sazonal**.
3. Preencha nome (ex.: "Black Friday"), descrição e texto do banner.
4. Marque os produtos da campanha em **Produtos associados**.
5. Decida se aparece no menu, na home ou em ambos.
6. **Salvar campanha**.

> O preview aparece à direita em tempo real.

### Criar banner

1. **Banners** → **Novo banner**.
2. Preencha título, subtítulo, CTA, link.
3. Escolha a posição (Hero, Filamentos, Impressoras, Sazonal).
4. Ajuste as cores do gradiente.
5. Marque como **Ativo**.
6. Salvar.

### Gerenciar pedidos

1. **Pedidos** → filtre por status.
2. Clique em **Detalhes →** em qualquer pedido.
3. No drawer, mude o status pelo dropdown:
   - **Novo** → pedido acabou de chegar
   - **Aguardando pagamento** → ex.: boleto
   - **Pago** → confirmou
   - **Em separação** → equipe está montando
   - **Enviado** → saiu para entrega
   - **Concluído** → cliente recebeu
   - **Cancelado** → pedido cancelado

### Atualizar dados da loja

1. **Configurações**.
2. Edite o que precisar (nome, WhatsApp, e-mail, endereço, CNPJ, sobre, frete grátis, desconto Pix).
3. **Salvar configurações**.

> As mudanças aparecem **imediatamente** no site público (header, footer, página de contato, etc.).

### Restaurar dados de exemplo

- Botão **Restaurar dados** no topo do painel.
- Apaga tudo que você editou e volta para o estado inicial.
- Útil em demonstrações.

---

## Trocar a senha do admin

A senha está em `src/config/site.ts`:

```ts
admin: {
  email: 'admin@3dcommerce.com',
  password: '3dcommerce2026',
}
```

Para trocar:
1. Edite o arquivo.
2. Faça commit no GitHub.
3. Vercel/Netlify faz redeploy automático.

> Na **Fase 2** (Supabase Auth) a senha vai ser trocada por uma interface no próprio admin, sem mexer no código.

---

## Como o site público reage às mudanças do admin

| Mudança | Reflexo no site |
|---|---|
| Criar/editar produto | Aparece em `/loja` e nas categorias correspondentes |
| Desativar produto | Some do site público |
| Marcar produto como **Destaque** | Aparece na vitrine "Os produtos do momento" da home |
| Marcar como **Oferta** | Entra no banner de ofertas e no filtro |
| Marcar como **Mais vendido** | Entra na vitrine de mais vendidos |
| Marcar como **Lançamento** | Recebe selo "Lançamento" |
| Criar/editar categoria | Aparece no mega menu (se marcada como menu) |
| Criar/editar campanha sazonal | Aparece como banner verde na home |
| Editar configurações | Atualiza header, footer, contato |
| Mudar status do pedido | Hoje atualiza só no admin. Na Fase 2 avisa o cliente por e-mail/WhatsApp |

---

## Dúvidas frequentes do cliente

**"O cliente final pode ver o painel?"**
Não. O `/admin` é protegido por login. Apenas quem tem a senha entra.

**"E se eu esquecer a senha?"**
Hoje a senha é fixa em código. Entre em contato com a G-Rec ou abra o arquivo `src/config/site.ts`. Na Fase 2 isso vira interface gráfica.

**"E se eu apagar tudo por engano?"**
Botão **Restaurar dados** volta ao estado original. Como hoje tudo fica no navegador, restaurar não afeta outros computadores.

**"Posso usar o painel em vários computadores ao mesmo tempo?"**
Hoje cada navegador tem sua própria cópia. Para sincronizar entre máquinas, precisa da Fase 2 com Supabase.

**"O pedido que o cliente fez vai para onde?"**
Aparece em **Pedidos** do admin, no topo da lista, com o status inicial correto. Hoje fica salvo no navegador. Na Fase 2 vai para banco central.

**"Como eu testo se está tudo funcionando?"**
1. Adicione produtos ao carrinho como cliente.
2. Finalize o checkout com dados fictícios.
3. Entre no admin e veja o pedido aparecer.
4. Mude o status dele.
5. Edite configurações e veja refletir no site.

---

## Apoio técnico

Em caso de dúvida durante uso real, entre em contato com a G-Rec Company.

**Boas vendas! 🚀**
