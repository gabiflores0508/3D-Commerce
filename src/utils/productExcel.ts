import * as XLSX from 'xlsx';
import type { Category, Product } from '@/types';

/**
 * Utilitários de Excel para produtos (R16).
 * - Exportação: gera .xlsx a partir dos produtos já carregados no admin.
 * - Modelo: cabeçalhos + 1 linha de exemplo.
 * - Importação: lê .xlsx, valida linha a linha e devolve prévia (sem gravar).
 *
 * Segurança: os valores são lidos como dados (nunca como fórmula); textos são
 * sanitizados (trim + limite de tamanho) e números validados.
 */

export const IMPORT_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// Cabeçalhos amigáveis (pt-BR). A importação casa por estes nomes (case-insensitive).
const HEADERS = {
  id: 'id',
  nome: 'nome',
  slug: 'slug',
  marca: 'marca',
  categoria: 'categoria',
  descricaoCurta: 'descricao_curta',
  descricaoCompleta: 'descricao_completa',
  preco: 'preco',
  precoPromocional: 'preco_promocional',
  estoque: 'estoque',
  ativo: 'ativo',
  destaque: 'destaque_home',
  lancamento: 'lancamento',
  oferta: 'oferta',
  maisVendido: 'mais_vendido',
  freteGratis: 'frete_gratis',
  criadoEm: 'criado_em',
} as const;

function categoryName(product: Product, categories: Category[]): string {
  const c = categories.find((x) => product.categoryIds.includes(x.id));
  return c?.name ?? '';
}

function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR');
}

function triggerDownload(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

// -----------------------------------------------------------------------------
// Exportação
// -----------------------------------------------------------------------------

export function exportProductsXlsx(products: Product[], categories: Category[]) {
  const rows = products.map((p) => ({
    [HEADERS.id]: p.id,
    [HEADERS.nome]: p.name,
    [HEADERS.slug]: p.slug,
    [HEADERS.marca]: p.brand,
    [HEADERS.categoria]: categoryName(p, categories),
    [HEADERS.descricaoCurta]: p.shortDescription,
    [HEADERS.descricaoCompleta]: p.description,
    [HEADERS.preco]: p.price,
    [HEADERS.precoPromocional]: p.promoPrice ?? '',
    [HEADERS.estoque]: p.stock,
    [HEADERS.ativo]: p.active ? 'sim' : 'não',
    [HEADERS.destaque]: p.isHighlight ? 'sim' : 'não',
    [HEADERS.lancamento]: p.isLaunch ? 'sim' : 'não',
    [HEADERS.oferta]: p.isOffer ? 'sim' : 'não',
    [HEADERS.maisVendido]: p.isBestSeller ? 'sim' : 'não',
    [HEADERS.freteGratis]: p.freeShipping ? 'sim' : 'não',
    [HEADERS.criadoEm]: fmtDate(p.createdAt),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(wb, `produtos-3dcommerce-${date}.xlsx`);
}

export function downloadProductTemplate() {
  const example = {
    [HEADERS.nome]: 'Filamento PLA Verde 1kg',
    [HEADERS.slug]: '', // opcional — gerado pelo nome se vazio
    [HEADERS.marca]: 'PLA',
    [HEADERS.categoria]: 'Filamentos PLA',
    [HEADERS.descricaoCurta]: 'PLA 1.75mm verde, 1kg.',
    [HEADERS.descricaoCompleta]: 'Descrição completa em **Markdown** opcional.',
    [HEADERS.preco]: 129.9,
    [HEADERS.precoPromocional]: 109.9,
    [HEADERS.estoque]: 25,
    [HEADERS.ativo]: 'sim',
    [HEADERS.destaque]: 'não',
  };
  const ws = XLSX.utils.json_to_sheet([example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
  triggerDownload(wb, 'modelo-importacao-produtos.xlsx');
}

// -----------------------------------------------------------------------------
// Importação (parse + validação — NÃO grava)
// -----------------------------------------------------------------------------

export interface ParsedProductRow {
  line: number; // linha na planilha (1-based, considerando cabeçalho)
  data: {
    name: string;
    slug?: string;
    material?: string | null;
    categoryName?: string;
    shortDescription?: string | null;
    description?: string | null;
    price: number;
    promotionalPrice?: number | null;
    stock: number;
    active: boolean;
    featured: boolean;
  };
  errors: string[];
}

export interface ParseResult {
  rows: ParsedProductRow[];
  validCount: number;
  errorCount: number;
}

const MAX_TEXT = 5000;

function sanitizeText(v: unknown, max = MAX_TEXT): string {
  return String(v ?? '').trim().slice(0, max);
}

/** Lê valores booleanos flexíveis: sim/não, true/false, 1/0, s/n, yes/no. */
function parseBool(v: unknown, fallback = false): boolean {
  if (v === undefined || v === null || v === '') return fallback;
  const s = String(v).trim().toLowerCase();
  if (['sim', 's', 'true', '1', 'yes', 'y', 'ativo'].includes(s)) return true;
  if (['nao', 'não', 'n', 'false', '0', 'no', 'inativo'].includes(s)) return false;
  return fallback;
}

function parseNumber(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  // Aceita "129,90" e "129.90".
  const s = String(v).trim().replace(/\s/g, '').replace(/\./g, (m, i, str) =>
    // remove separador de milhar só quando há vírgula decimal depois
    str.includes(',') ? '' : m,
  ).replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Lê o header real da planilha e mapeia para as chaves canônicas (case-insensitive). */
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '_');
}

export async function parseProductsXlsx(file: File): Promise<ParseResult> {
  if (!/\.xlsx$/i.test(file.name)) {
    throw new Error('Envie um arquivo .xlsx válido.');
  }
  if (file.size > IMPORT_MAX_BYTES) {
    throw new Error('Arquivo muito grande (máx. 2 MB).');
  }

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  // raw:false força valores como texto/computados (nunca fórmula), defval '' evita undefined.
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false, defval: '' });

  const rows: ParsedProductRow[] = json.map((raw, idx) => {
    // Normaliza chaves da linha.
    const row: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) row[normalizeKey(k)] = v;

    const errors: string[] = [];
    const name = sanitizeText(row[HEADERS.nome], 200);
    if (!name || name.length < 2) errors.push('Nome é obrigatório.');

    const price = parseNumber(row[HEADERS.preco]);
    if (price === null || price < 0) errors.push('Preço inválido.');

    const promo = parseNumber(row[HEADERS.precoPromocional]);
    if (promo !== null && promo < 0) errors.push('Preço promocional não pode ser negativo.');

    const stockNum = parseNumber(row[HEADERS.estoque]);
    let stock = 0;
    if (stockNum === null) {
      stock = 0;
    } else if (!Number.isInteger(stockNum) || stockNum < 0) {
      errors.push('Estoque deve ser inteiro ≥ 0.');
    } else {
      stock = stockNum;
    }

    const categoryName = sanitizeText(row[HEADERS.categoria], 120);

    return {
      line: idx + 2, // +1 header, +1 base-1
      data: {
        name,
        slug: sanitizeText(row[HEADERS.slug], 160) || undefined,
        material: sanitizeText(row[HEADERS.marca], 120) || null,
        categoryName: categoryName || undefined,
        shortDescription: sanitizeText(row[HEADERS.descricaoCurta], 300) || null,
        description: sanitizeText(row[HEADERS.descricaoCompleta]) || null,
        price: price ?? 0,
        promotionalPrice: promo,
        stock,
        active: parseBool(row[HEADERS.ativo], true),
        featured: parseBool(row[HEADERS.destaque]) || parseBool(row[HEADERS.maisVendido]),
      },
      errors,
    };
  });

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  return { rows, validCount, errorCount: rows.length - validCount };
}
