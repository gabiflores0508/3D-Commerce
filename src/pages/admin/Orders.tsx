import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { formatBRL } from '@/utils/price';
import { StatusBadge, statusLabels } from '@/components/admin/StatusBadge';
import { Drawer } from '@/components/ui/Drawer';
import { Select } from '@/components/ui/Input';
import type { Order, OrderStatus } from '@/types';
import { useSEO } from '@/utils/seo';

export default function Orders() {
  useSEO('Admin Pedidos');
  const { orders, updateOrderStatus } = useAdminDataStore();
  const [params] = useSearchParams();
  const initialStatus = (params.get('status') ?? 'all') as 'all' | OrderStatus;
  const [filter, setFilter] = useState<'all' | OrderStatus>(initialStatus);
  const [active, setActive] = useState<Order | null>(null);
  useEffect(() => {
    const s = params.get('status') as OrderStatus | null;
    if (s) setFilter(s);
  }, [params]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Operação</p>
          <h1 className="section-title">Pedidos</h1>
          <p className="mt-1 text-sm text-ink-mute">{filtered.length} pedido(s)</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | OrderStatus)} className="max-w-[220px]">
          <option value="all">Todos os status</option>
          {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </Select>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-bg-soft/50">
                <td className="px-4 py-3 font-semibold">{o.id}</td>
                <td className="px-4 py-3">{o.customer.name}</td>
                <td className="px-4 py-3 text-ink-mute">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">{formatBRL(o.total)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => setActive(o)} className="text-xs font-semibold text-ink hover:underline">Detalhes →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.id ?? 'Pedido'} width="w-full sm:max-w-lg">
        {active && (
          <div className="space-y-5 p-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={active.status} />
              <Select
                value={active.status}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  updateOrderStatus(active.id, newStatus);
                  setActive({ ...active, status: newStatus });
                  toast.success(`Status: ${statusLabels[newStatus]}`);
                }}
                className="max-w-[200px]"
              >
                {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </Select>
            </div>

            <div className="rounded-xl bg-bg-soft p-4 text-sm">
              <p className="font-semibold">{active.customer.name}</p>
              <p className="text-ink-mute">{active.customer.email}</p>
              <p className="text-ink-mute">{active.customer.phone}</p>
            </div>
            <div className="rounded-xl bg-bg-soft p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Endereço</p>
              <p>{active.address.street}, {active.address.number}</p>
              <p className="text-ink-mute">{active.address.district}, {active.address.city}/{active.address.state} — {active.address.cep}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Itens</p>
              <ul className="mt-2 space-y-2 text-sm">
                {active.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.qty}x {it.name}</span>
                    <span className="font-semibold">{formatBRL(it.unitPrice * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 border-t border-ink-line pt-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-mute">Subtotal</span><span>{formatBRL(active.subtotal)}</span></div>
              {active.coupon && <div className="flex justify-between text-emerald-600"><span>Cupom {active.coupon.code}</span><span>-{formatBRL(active.coupon.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-ink-mute">Frete ({active.shipping.method})</span><span>{active.shipping.price === 0 ? 'Grátis' : formatBRL(active.shipping.price)}</span></div>
              <div className="flex justify-between border-t border-ink-line pt-1 font-bold"><span>Total</span><span>{formatBRL(active.total)}</span></div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
