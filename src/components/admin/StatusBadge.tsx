import type { OrderStatus } from '@/types';

const tones: Record<OrderStatus, string> = {
  novo: 'bg-blue-100 text-blue-700',
  'aguardando-pagamento': 'bg-amber-100 text-amber-700',
  pago: 'bg-emerald-100 text-emerald-700',
  'em-separacao': 'bg-violet-100 text-violet-700',
  enviado: 'bg-cyan-100 text-cyan-700',
  concluido: 'bg-ink text-bg',
  cancelado: 'bg-rose-100 text-rose-700',
};

const labels: Record<OrderStatus, string> = {
  novo: 'Novo',
  'aguardando-pagamento': 'Aguardando',
  pago: 'Pago',
  'em-separacao': 'Em separação',
  enviado: 'Enviado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${tones[status]}`}>
      {labels[status]}
    </span>
  );
}

export { labels as statusLabels };
