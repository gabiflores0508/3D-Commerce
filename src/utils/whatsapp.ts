import { site } from '@/config/site';
import type { Product, CartItem } from '@/types';
import { useAdminDataStore } from '@/store/useAdminDataStore';

function currentPhone(): string {
  try {
    return useAdminDataStore.getState().settings.whatsapp || site.whatsapp;
  } catch {
    return site.whatsapp;
  }
}

function buildLink(message: string, phone = currentPhone()): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function whatsappGeneral(): string {
  return buildLink(
    `Olá, 3DCommerce! Gostaria de mais informações sobre os produtos da loja.`,
  );
}

export function whatsappContact(): string {
  return buildLink(`Olá, 3DCommerce! Quero falar com um atendente.`);
}

export function whatsappProduct(product: Product, variationLabel?: string): string {
  const v = variationLabel ? ` (${variationLabel})` : '';
  return buildLink(
    `Olá! Tenho interesse no produto *${product.name}*${v}. Pode me passar mais informações?`,
  );
}

/**
 * Mensagem de orçamento com detalhes do produto (nome, quantidade, link e
 * preço quando houver). `productUrl` já deve ser a URL pública absoluta.
 * A mensagem é URL-encodada por `buildLink`.
 */
export function whatsappQuoteProduct(
  product: Product,
  qty: number,
  productUrl: string,
  variationLabel?: string,
): string {
  const v = variationLabel ? ` (${variationLabel})` : '';
  const priceLine =
    product.purchaseMode === 'quote'
      ? ''
      : `\nValor unitário: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          product.promoPrice ?? product.price,
        )}`;
  const message =
    `Olá! Tenho interesse neste produto:\n\n` +
    `Produto: ${product.name}${v}\n` +
    `Quantidade: ${qty}\n` +
    `Link: ${productUrl}` +
    priceLine +
    `\n\nPode me passar mais informações e orçamento?`;
  return buildLink(message);
}

export function whatsappQuote(productNames: string[] = []): string {
  const list = productNames.length
    ? `\n\nProdutos de interesse:\n${productNames.map((n) => `• ${n}`).join('\n')}`
    : '';
  return buildLink(
    `Olá, 3DCommerce! Gostaria de solicitar um orçamento.${list}`,
  );
}

export function whatsappCart(items: { name: string; qty: number }[]): string {
  const list = items.map((i) => `• ${i.qty}x ${i.name}`).join('\n');
  return buildLink(
    `Olá, 3DCommerce! Tenho dúvidas sobre estes itens do meu carrinho:\n\n${list}`,
  );
}

export function whatsappCartCheckout(items: CartItem[], products: Product[]): string {
  const lines = items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    return `• ${it.qty}x ${p?.name ?? 'Produto'}${it.variationLabel ? ` (${it.variationLabel})` : ''}`;
  });
  return buildLink(
    `Olá, 3DCommerce! Gostaria de finalizar a compra dos itens abaixo:\n\n${lines.join('\n')}`,
  );
}
