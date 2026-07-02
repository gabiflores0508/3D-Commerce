import type { Prisma } from '@prisma/client';

type Numeric = Prisma.Decimal | number | string | null | undefined;

/**
 * Converte um valor monetário/Decimal do Prisma para `number` seguro
 * (2 casas de precisão). Devolve `null` para nulos/undefined.
 *
 * Reservado para serialização de RESPOSTAS da API. Para cálculos internos
 * (soma de valores, etc.) prefira usar `Prisma.Decimal` diretamente.
 */
export function decimalToNumber(v: Numeric): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  const n = Number(v.toString());
  return Number.isFinite(n) ? n : null;
}
