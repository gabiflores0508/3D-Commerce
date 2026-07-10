import type {
  ApiCouponDiscountType,
  ApiCouponScript,
  ApiLinkedCoupon,
  ApiScriptCategory,
} from '@/services/types';

/** Variáveis suportadas nos templates de WhatsApp. */
export const SCRIPT_VARIABLES = [
  '{{nome_cliente}}',
  '{{cupom}}',
  '{{desconto}}',
  '{{validade}}',
  '{{link_loja}}',
  '{{nome_produto}}',
  '{{valor_minimo}}',
  '{{nome_loja}}',
] as const;

export const SCRIPT_CATEGORY_LABELS: Record<ApiScriptCategory, string> = {
  COUPON: 'Cupom',
  POST_SALE: 'Pós-venda',
  QUOTE_RECOVERY: 'Recuperação de orçamento',
  LAUNCH: 'Lançamento',
  SEASONAL_OFFER: 'Oferta sazonal',
  FREE_SHIPPING: 'Frete grátis',
  FEATURED_PRODUCT: 'Produto em destaque',
  RETURNING_CUSTOMER: 'Cliente antigo',
};

export const SCRIPT_CATEGORY_OPTIONS = Object.entries(SCRIPT_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ApiScriptCategory, label }),
);

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Texto amigável do desconto de um cupom vinculado. */
export function couponDiscountLabel(c: ApiLinkedCoupon | null): string {
  if (!c) return '';
  if (c.discountType === 'PERCENTAGE') return `${c.discountValue}% de desconto`;
  if (c.discountType === 'FIXED_AMOUNT') return `${formatBRL(c.discountValue)} de desconto`;
  return 'frete grátis';
}

export interface TemplateVars {
  nome_cliente?: string;
  cupom?: string;
  desconto?: string;
  validade?: string;
  link_loja?: string;
  nome_produto?: string;
  valor_minimo?: string;
  nome_loja?: string;
}

/**
 * Monta valores padrão de variáveis a partir do cupom vinculado, do nome da
 * loja e de um nome de cliente opcional. Deixa os placeholders "abertos"
 * (ex.: {{nome_produto}}) quando não há valor — o lojista completa manualmente.
 */
export function buildTemplateVars(opts: {
  script?: Pick<ApiCouponScript, 'linkedCoupon'> | null;
  storeName?: string;
  storeUrl?: string;
  customerName?: string;
}): TemplateVars {
  const c = opts.script?.linkedCoupon ?? null;
  const vars: TemplateVars = {
    nome_loja: opts.storeName || '3DCommerce',
    link_loja: opts.storeUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
  };
  if (opts.customerName?.trim()) vars.nome_cliente = opts.customerName.trim();
  if (c) {
    vars.cupom = c.code;
    vars.desconto = couponDiscountLabel(c);
    if (c.expiresAt) {
      vars.validade = new Date(c.expiresAt).toLocaleDateString('pt-BR');
    }
    if (c.minOrderValue != null) {
      vars.valor_minimo = formatBRL(c.minOrderValue);
    }
  }
  return vars;
}

/**
 * Gera um template padrão de WhatsApp conforme o tipo do cupom (R14).
 * Acrescenta linhas de validade e/ou valor mínimo quando o cupom os tiver.
 */
export function defaultTemplateForCoupon(coupon: {
  discountType: ApiCouponDiscountType;
  expiresAt: string | null;
  minOrderValue: number | null;
}): string {
  const greeting = 'Olá, {{nome_cliente}}! Tudo bem? 😊';
  let body: string;
  if (coupon.discountType === 'FREE_SHIPPING') {
    body = `Hoje temos frete grátis para você!\n\nUse o cupom {{cupom}} na finalização da compra.`;
  } else if (coupon.discountType === 'FIXED_AMOUNT') {
    body = `Preparamos uma condição especial para você:\nuse o cupom {{cupom}} e ganhe {{desconto}} na sua compra.`;
  } else {
    body = `Use o cupom {{cupom}} e ganhe {{desconto}} na sua compra.`;
  }

  const extras: string[] = [];
  if (coupon.expiresAt) extras.push('Válido até {{validade}}.');
  if (coupon.minOrderValue != null) extras.push('Válido para compras acima de {{valor_minimo}}.');

  return [greeting, '', body, ...(extras.length ? ['', extras.join('\n')] : []), '', 'Acesse: {{link_loja}}'].join('\n');
}

/**
 * Substitui as variáveis conhecidas no template. Placeholders sem valor
 * permanecem visíveis para o lojista saber o que ainda falta preencher.
 * Retorna texto puro (sem HTML) — seguro para renderizar em React.
 */
export function fillTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = (vars as Record<string, string | undefined>)[key.toLowerCase()];
    return value != null && value !== '' ? value : match;
  });
}
