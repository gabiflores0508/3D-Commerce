import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';
import { getCartDiscount, getCartShipping, getCartSubtotal, useCartStore } from '@/store/useCartStore';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { formatBRL } from '@/utils/price';
import { site } from '@/config/site';

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);
  const { items, updateQty, removeItem, coupon } = useCartStore();
  const products = useAdminDataStore((s) => s.products);
  const navigate = useNavigate();

  const subtotal = getCartSubtotal(items, products);
  const discount = getCartDiscount(subtotal, coupon);
  const shipping = getCartShipping(subtotal, coupon);
  const total = subtotal - discount + shipping;

  return (
    <Drawer open={open} onClose={() => setOpen(false)} title="Seu carrinho">
      {items.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="Seu carrinho está vazio"
            description="Adicione produtos para continuar sua compra."
            icon={<ShoppingBag className="h-6 w-6" />}
            action={
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate('/loja');
                }}
              >
                Explorar produtos
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 divide-y divide-ink-line">
            {items.map((it) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              const unitPrice = p.promoPrice ?? p.price;
              return (
                <div key={it.productId + (it.variationId ?? '')} className="flex gap-3 p-4">
                  <img src={p.images[0]} alt={p.name} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/produto/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-semibold hover:underline"
                    >
                      {p.name}
                    </Link>
                    {it.variationLabel && (
                      <span className="text-xs text-ink-mute">{it.variationLabel}</span>
                    )}
                    <div className="mt-auto flex items-end justify-between">
                      <div className="inline-flex items-center rounded-lg border border-ink-line">
                        <button
                          className="p-1.5 hover:bg-ink/5"
                          onClick={() => updateQty(p.id, it.qty - 1, it.variationId)}
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-semibold">{it.qty}</span>
                        <button
                          className="p-1.5 hover:bg-ink/5"
                          onClick={() => updateQty(p.id, it.qty + 1, it.variationId)}
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatBRL(unitPrice * it.qty)}</p>
                        <button
                          onClick={() => removeItem(p.id, it.variationId)}
                          className="text-[11px] text-ink-mute hover:text-rose-500 inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-ink-line bg-bg-card p-5">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-mute">Subtotal</dt>
                <dd>{formatBRL(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Cupom ({coupon})</dt>
                  <dd>-{formatBRL(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-mute">Frete</dt>
                <dd>{shipping === 0 ? 'Grátis' : formatBRL(shipping)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-ink-line pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatBRL(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-ink-mute">
              Frete grátis acima de {formatBRL(site.freeShippingThreshold)}.
            </p>
            <div className="mt-4 space-y-2">
              <Button
                fullWidth
                onClick={() => {
                  setOpen(false);
                  navigate('/checkout');
                }}
              >
                Finalizar compra
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  navigate('/carrinho');
                }}
              >
                Ver carrinho completo
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
