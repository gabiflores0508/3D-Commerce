import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { useCurrentCustomer } from '@/store/useCustomerAuthStore';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Drawer } from '@/components/ui/Drawer';
import { formatBRL } from '@/utils/price';
import type { Order } from '@/types';
import { useSEO } from '@/utils/seo';

export default function CustomerOrders() {
  useSEO('Meus pedidos');
  const customer = useCurrentCustomer();
  const orders = useAdminDataStore((s) => s.orders);
  const [active, setActive] = useState<Order | null>(null);

  if (!customer) return <Navigate to="/login" replace />;

  const mine = orders.filter((o) => o.customerId === customer.id);

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Minha conta</p>
      <h1 className="section-title">Meus pedidos</h1>
      <p className="mt-2 text-sm text-ink-mute">
        Acompanhe o status dos seus pedidos na 3DCommerce.
      </p>

      {mine.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Você ainda não tem pedidos."
            description="Quando finalizar uma compra logado(a), ela aparece aqui."
            icon={<Package className="h-6 w-6" />}
            action={
              <Link to="/loja" className="btn-primary">
                Ver produtos
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {mine
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((o) => (
              <button
                key={o.id}
                onClick={() => setActive(o)}
                className="card flex w-full items-center justify-between gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-card"
              >
                <div>
                  <p className="text-sm font-bold tabular-nums">{o.id}</p>
                  <p className="mt-0.5 text-xs text-ink-mute">
                    {new Date(o.createdAt).toLocaleDateString('pt-BR')} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={o.status} />
                  <p className="price-display text-sm font-bold tabular-nums">{formatBRL(o.total)}</p>
                  <ChevronRight className="h-4 w-4 text-ink-mute" />
                </div>
              </button>
            ))}
        </div>
      )}

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.id ?? 'Pedido'}>
        {active && (
          <div className="space-y-5 p-5 text-sm">
            <div className="flex items-center justify-between">
              <StatusBadge status={active.status} />
              <span className="text-xs text-ink-mute">
                {new Date(active.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Itens</p>
              <ul className="mt-2 divide-y divide-ink-line">
                {active.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 py-3">
                    {it.image && <img src={it.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <p className="font-semibold">{it.name}</p>
                      {it.variationLabel && <p className="text-xs text-ink-mute">{it.variationLabel}</p>}
                      <p className="text-xs text-ink-mute">Qtde: {it.qty}</p>
                    </div>
                    <p className="font-semibold tabular-nums">{formatBRL(it.unitPrice * it.qty)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-bg-soft p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Endereço</p>
              <p className="mt-1">{active.address.street}, {active.address.number}</p>
              <p className="text-xs text-ink-mute">
                {active.address.district}, {active.address.city}/{active.address.state} — {active.address.cep}
              </p>
            </div>

            <div className="space-y-1 border-t border-ink-line pt-3">
              <div className="flex justify-between"><span className="text-ink-mute">Subtotal</span><span>{formatBRL(active.subtotal)}</span></div>
              {active.coupon && (
                <div className="flex justify-between text-emerald-600"><span>Cupom {active.coupon.code}</span><span>-{formatBRL(active.coupon.discount)}</span></div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-mute">Frete ({active.shipping.method})</span>
                <span>{active.shipping.price === 0 ? 'Grátis' : formatBRL(active.shipping.price)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-ink-line pt-2 font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatBRL(active.total)}</span>
              </div>
            </div>

            <div className="text-xs text-ink-mute">
              Pagamento: <span className="capitalize">{active.payment.method}</span>
              {active.payment.installments ? ` (${active.payment.installments}x)` : ''}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
