import { cn } from '@/utils/cn';
import type { ProductBadge } from '@/types';

const tones: Record<ProductBadge, string> = {
  oferta: 'bg-rose-500 text-white',
  lancamento: 'bg-ink text-bg',
  'mais-vendido': 'bg-amber-500 text-ink',
  esgotado: 'bg-ink-mute text-white',
  'frete-gratis': 'bg-emerald-500 text-white',
};

const labels: Record<ProductBadge, string> = {
  oferta: 'Oferta',
  lancamento: 'Lançamento',
  'mais-vendido': 'Mais vendido',
  esgotado: 'Esgotado',
  'frete-gratis': 'Frete grátis',
};

export function Badge({ type, className }: { type: ProductBadge; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        tones[type],
        className,
      )}
    >
      {labels[type]}
    </span>
  );
}
