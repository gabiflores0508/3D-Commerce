import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShowcaseSection } from '@/components/home/ShowcaseSection';
import { formatBRL, getDiscountPercent, getEffectivePrice, getPixPrice, calcInstallment } from '@/utils/price';
import { whatsappProduct } from '@/utils/whatsapp';
import { useSEO } from '@/utils/seo';

export default function Product() {
  const { slug } = useParams();
  const products = useAdminDataStore((s) => s.products);
  const product = products.find((p) => p.slug === slug);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const navigate = useNavigate();

  const [imageIdx, setImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVar, setSelectedVar] = useState<string | undefined>(product?.variations[0]?.id);

  useSEO(product?.name ?? 'Produto', product?.shortDescription);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.categoryIds.some((c) => product.categoryIds.includes(c)) && p.active)
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Link to="/loja" className="mt-4 inline-block text-sm font-semibold text-ink-soft hover:underline">
          ← Voltar para a loja
        </Link>
      </div>
    );
  }

  const variation = product.variations.find((v) => v.id === selectedVar);
  const variationDelta = variation?.priceDelta ?? 0;
  const basePrice = getEffectivePrice(product) + variationDelta;
  const fullPrice = product.price + variationDelta;
  const pix = getPixPrice({ ...product, price: fullPrice, promoPrice: product.promoPrice ? basePrice : undefined });
  const discount = getDiscountPercent(product);
  const installment = calcInstallment(basePrice);
  const isQuoteOnly = product.purchaseMode === 'quote';
  const isOutOfStock = product.stock <= 0;

  function addToCart() {
    if (isOutOfStock || isQuoteOnly) return;
    addItem(product!.id, qty, variation?.id, variation?.label);
    toast.success(`${product!.name} adicionado ao carrinho`);
    setTimeout(() => setCartOpen(true), 250);
  }

  function buyNow() {
    addToCart();
    setTimeout(() => navigate('/checkout'), 100);
  }

  return (
    <div className="container-x py-8">
      <nav className="mb-5 flex items-center gap-1 text-xs text-ink-mute">
        <Link to="/" className="hover:text-ink">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/loja" className="hover:text-ink">Loja</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <motion.div
            key={imageIdx}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square overflow-hidden rounded-3xl border border-ink-line bg-bg-card"
          >
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
              {product.badges.slice(0, 3).map((b) => (
                <Badge key={b} type={b} />
              ))}
            </div>
            <img src={product.images[imageIdx]} alt={product.name} className="h-full w-full object-cover" />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIdx(i)}
                  className={`overflow-hidden rounded-xl border-2 ${i === imageIdx ? 'border-ink' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-mute">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight md:text-[2.5rem]">{product.name}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-mute">{product.shortDescription}</p>

          <div className="mt-7 rounded-2xl border border-ink-line/70 bg-bg-soft/50 p-5">
            {product.promoPrice && (
              <p className="text-sm text-ink-mute line-through tabular-nums">{formatBRL(fullPrice)}</p>
            )}
            <div className="flex items-end gap-3">
              <p className="price-display text-[2.75rem] font-bold leading-none text-ink">{formatBRL(basePrice)}</p>
              {discount > 0 && (
                <span className="rounded-md bg-rose-500 px-2 py-1 text-xs font-bold text-white shadow-sm shadow-rose-500/30">-{discount}%</span>
              )}
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {formatBRL(pix)} no Pix
              <span className="font-normal text-ink-mute">(5% off)</span>
            </p>
            <p className="mt-1 text-xs text-ink-mute">
              ou {installment.qty}x de {formatBRL(installment.value)} sem juros
            </p>
          </div>

          {product.variations.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-mute">Variação</p>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVar(v.id)}
                    disabled={!v.inStock}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      selectedVar === v.id
                        ? 'border-ink bg-ink text-bg'
                        : 'border-ink-line bg-bg-card text-ink hover:border-ink'
                    } ${!v.inStock ? 'opacity-50' : ''}`}
                  >
                    {v.swatch && <span className="mr-1.5 inline-block h-3 w-3 rounded-full" style={{ background: v.swatch }} />}
                    {v.label}
                    {v.priceDelta ? <span className="ml-1 opacity-70">+{formatBRL(v.priceDelta)}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isQuoteOnly && (
            <div className="mt-6 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">Quantidade</p>
              <div className="inline-flex items-center rounded-xl border border-ink-line">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 hover:bg-ink/5" aria-label="Diminuir">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-9 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-2 hover:bg-ink/5" aria-label="Aumentar">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className={`text-xs ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
              </span>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {isQuoteOnly ? (
              <a href={whatsappProduct(product, variation?.label)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full">
                <MessageCircle className="h-4 w-4" /> Solicitar orçamento via WhatsApp
              </a>
            ) : (
              <>
                <Button fullWidth size="lg" onClick={buyNow} disabled={isOutOfStock}>
                  <ShoppingBag className="h-4 w-4" /> Comprar agora
                </Button>
                <Button fullWidth size="lg" variant="secondary" onClick={addToCart} disabled={isOutOfStock}>
                  Adicionar ao carrinho
                </Button>
              </>
            )}
            {product.purchaseMode === 'both' && (
              <a
                href={whatsappProduct(product, variation?.label)}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp w-full"
              >
                <MessageCircle className="h-4 w-4" /> Tirar dúvida no WhatsApp
              </a>
            )}
            {product.purchaseMode === 'direct' && (
              <a
                href={whatsappProduct(product, variation?.label)}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center text-xs font-semibold text-ink-mute hover:text-emerald-600"
              >
                Tirar dúvida pelo WhatsApp →
              </a>
            )}
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 border-t border-ink-line pt-6 text-xs text-ink-soft">
            <li className="flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-bg-soft text-ink"><Truck className="h-3.5 w-3.5" /></span> Envio para todo Brasil</li>
            <li className="flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-bg-soft text-ink"><ShieldCheck className="h-3.5 w-3.5" /></span> Compra segura</li>
            <li className="flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-bg-soft text-ink"><Wrench className="h-3.5 w-3.5" /></span> Suporte técnico incluso</li>
            <li className="flex items-center gap-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-bg-soft text-ink"><MessageCircle className="h-3.5 w-3.5" /></span> Atendimento direto</li>
          </ul>
        </div>
      </div>

      <section className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-bold">Descrição do produto</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{product.description}</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-bold">Especificações</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(product.attributes).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-ink-line/50 pb-1.5">
                <dt className="text-ink-mute">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ShowcaseSection eyebrow="Você também pode gostar" title="Produtos relacionados" products={related} />
    </div>
  );
}
