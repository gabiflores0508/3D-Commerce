# Roteiro de Demonstração — 3DCommerce

Roteiro de **5 a 7 minutos** para apresentar o projeto ao cliente, presencialmente ou por vídeo.

---

## Antes de começar

- Abra o navegador em **aba anônima** (estado limpo do localStorage).
- Tenha `npm run dev` rodando em segundo plano.
- Carregue `http://localhost:5173`.
- Mantenha o WhatsApp aberto em outra aba (para mostrar mensagens reais).
- Configure tela: 1280×720 ou maior para o mega menu aparecer bem.

---

## Estrutura geral (7 minutos)

| Tempo | Bloco |
|---|---|
| 0:00 — 0:45 | Abertura e contexto |
| 0:45 — 2:00 | Tour pela home |
| 2:00 — 3:15 | Catálogo e página de produto |
| 3:15 — 4:30 | Carrinho e checkout |
| 4:30 — 6:00 | Painel administrativo |
| 6:00 — 6:45 | Mobile e diferenciais |
| 6:45 — 7:00 | Fechamento |

---

## Bloco 1 — Abertura (45s)

> "Boa tarde! Eu sou da G-Rec e preparei uma demonstração do novo e-commerce da 3DCommerce. O foco dessa entrega é unir três coisas: um site bonito e moderno, um sistema que vocês conseguem atualizar sozinhos, e uma estrutura pronta para escalar quando fizer sentido."

Mostre o navegador na Home, ainda parado.

---

## Bloco 2 — Tour pela home (1:15)

**Mostre, narrando:**

- **Hero** — "Aqui é a porta de entrada. Headline clara, CTA principal pra explorar a loja, CTA secundário pro WhatsApp. Repare na faixa logo abaixo com Creality, Bambu Lab e Elegoo — isso já transmite autoridade no primeiro segundo."
- **Categorias** — "Cards animados, fáceis de navegar. PLA, PETG, ABS, resinas, impressoras, acessórios — tudo um clique."
- **Vitrines** — passe pelas 3 (destaques, ofertas, mais vendidos). Faça hover em um card para mostrar a animação.
- **Banner sazonal** — "Esse aqui é especial. Vocês conseguem trocar do admin — Copa do Mundo agora, Natal em dezembro, Black Friday em novembro. Já mostro como."
- **Materiais educativos** — "Conteúdo de valor pro cliente novato. Ajuda no SEO também."
- **Por que comprar** — "Os 5 pilares de confiança: loja física, envio, suporte, segurança, atendimento."
- **Loja física** — "Endereço destacado, mostra que é loja real, não dropshipping."
- **Newsletter + Instagram** — "Engajamento e captura de e-mail."

---

## Bloco 3 — Catálogo e produto (1:15)

- Clique em **Loja** → "Aqui tudo. Filtros à esquerda (material, marca, preço), ordenação à direita."
- Use a busca no header: digite **"filamento"** → "Busca instantânea, com URL — funciona pro SEO."
- Clique em **Filamento PLA Preto 1kg**.
- Mostre a **página de produto**:
  - Galeria à esquerda
  - "Preço normal, preço no Pix com 5% off, parcelado em 6x — toda a informação de venda no lugar certo."
  - "Variações: cor, peso, diâmetro."
  - "Especificações técnicas."
  - "Botão principal de comprar e botão secundário de tirar dúvida no WhatsApp."
- Volte para a Loja, clique em um produto que tem **modo `quote`** (ex.: Chaveiro 3D ou Bambu Lab A1).
- "Esse produto é sob consulta — só botão de orçamento via WhatsApp. Configurável por produto."

---

## Bloco 4 — Carrinho e checkout (1:15)

- Adicione **2 ou 3 produtos** ao carrinho.
- "Drawer abre lateral, mostra os produtos, contagem no header."
- Clique em **Ver carrinho completo**.
- Aplique o cupom **`BEMVINDO10`** — "10% de desconto aplicado, cálculo instantâneo. Frete grátis acima de R$ 299."
- Clique em **Finalizar compra**.
- Passe pelos **4 passos do checkout**: cliente → endereço → entrega → pagamento → revisão.
- "Validação em tempo real, sem deixar passar erro."
- Clique em **Confirmar pedido**.
- **Tela de sucesso** — anote o ID (ex.: `#3DC-4821`).
- "O pedido foi gerado. Agora deixa eu te mostrar como aparece no painel administrativo."

---

## Bloco 5 — Painel administrativo (1:30)

- Acesse `/admin/login`.
- Credenciais já preenchidas → **Entrar**.
- **Dashboard** — "Stats em tempo real, sparklines, últimos pedidos, indicador de sistema online."
- **Pedidos** — "Olha o pedido que acabamos de criar, no topo da lista, com status novo." Clique nele → drawer com todos os detalhes (cliente, endereço, itens, frete, cupom).
- Mude o status para **Em separação** → **Enviado**. "Cliente recebe atualização (na Fase 2 com e-mail real)."
- **Produtos** — "Tabela completa, busca, filtro por categoria, toggle ativo/inativo. Vou desativar esse aqui."
- Desative um produto → vá pra `/loja` em outra aba → mostre que sumiu.
- Volte ao admin → **Categoria Sazonal**.
- "Esse é um dos diferenciais. Hoje tá Copa do Mundo. Em novembro vocês trocam para Black Friday em 30 segundos."
- Desative → volte para Home → categoria sumiu. Reative → volte → voltou.
- **Banners** — "Criação visual, gradiente customizável, ativar/desativar."
- **Configurações** — "Edita nome da loja, WhatsApp, e-mail, endereço, CNPJ, frete grátis. Tudo reflete no site público na hora."

---

## Bloco 6 — Mobile e diferenciais (45s)

- Abra DevTools → modo mobile → **iPhone 14 Pro** ou similar.
- "Drawer lateral, busca completa, categorias e WhatsApp à mão."
- Navegue rapidamente: home → loja → produto → carrinho.
- "Mobile-first. A maior parte do tráfego de loja é mobile."

**Diferenciais finais (fale enquanto navega):**

- "Salva tudo no navegador — testa quantas vezes quiser sem perder."
- "Build otimizado, carrega rápido, SEO básico configurado, Open Graph para link no WhatsApp."
- "100% editável pelo painel — vocês não dependem de nós pra trocar produto, preço, banner ou WhatsApp."

---

## Bloco 7 — Fechamento (15s)

> "É isso. Esse é o e-commerce 3DCommerce. Posso te mandar o link da demo agora, e a gente combina os próximos passos: domínio, deploy em produção e os pacotes de hospedagem com suporte. Topa?"

---

## Notas para o apresentador

- Se algo demorar a carregar, **não pause** — comente: "tudo é instantâneo porque a estrutura está local". Continue navegando.
- Se cliente perguntar **"e o pagamento real?"** — responda: "Hoje é demo. A Fase 2 já tá mapeada — em 2 semanas integramos Mercado Pago ou Asaas e fica processando de verdade. Tá tudo no roadmap que mando junto."
- Se cliente perguntar **"e estoque que esgota?"** — "Quando integrar com Supabase ou ERP, o estoque sincroniza automático. Por enquanto vocês ajustam manual pelo painel."
- Se cliente perguntar **"posso vender por mim mesmo já?"** — "Pode demonstrar e testar à vontade. Pra vender de verdade precisamos da Fase 2 que inclui pagamento real. 5 a 10 dias úteis."

---

## Material de apoio

- Vídeo curto (90s) gravado da demo, opcional, pra mandar antes da call.
- Link do projeto rodando (deploy preview).
- `RESUMO-COMERCIAL.md` para enviar por WhatsApp depois.
