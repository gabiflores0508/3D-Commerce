import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ChevronRight, Check } from 'lucide-react';
import { useCartStore, getCartDiscount, getCartShipping, getCartSubtotal } from '@/store/useCartStore';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { formatBRL } from '@/utils/price';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSEO } from '@/utils/seo';
import type { Order, OrderItem } from '@/types';
import { useCurrentCustomer } from '@/store/useCustomerAuthStore';
import { maskPhone, maskCPF, maskCEP } from '@/utils/masks';

const customerSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().optional(),
});
const addressSchema = z.object({
  cep: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Endereço inválido'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  district: z.string().min(2, 'Bairro inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().min(2, 'UF inválida').max(2),
});

type Customer = z.infer<typeof customerSchema>;
type Address = z.infer<typeof addressSchema>;

type ShippingMethod = 'pac' | 'sedex' | 'retirada';
type PaymentMethod = 'pix' | 'credito' | 'boleto';

const steps = ['Cliente', 'Endereço', 'Entrega', 'Pagamento', 'Revisão'] as const;

export default function Checkout() {
  useSEO('Checkout');
  const navigate = useNavigate();
  const { items, coupon, clear } = useCartStore();
  const products = useAdminDataStore((s) => s.products);
  const addOrder = useAdminDataStore((s) => s.addOrder);
  const loggedCustomer = useCurrentCustomer();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(
    loggedCustomer
      ? { name: loggedCustomer.name, email: loggedCustomer.email, phone: loggedCustomer.phone }
      : null,
  );
  const [address, setAddress] = useState<Address | null>(
    loggedCustomer?.defaultAddress
      ? {
          cep: loggedCustomer.defaultAddress.cep,
          street: loggedCustomer.defaultAddress.street,
          number: loggedCustomer.defaultAddress.number,
          complement: loggedCustomer.defaultAddress.complement,
          district: loggedCustomer.defaultAddress.district,
          city: loggedCustomer.defaultAddress.city,
          state: loggedCustomer.defaultAddress.state,
        }
      : null,
  );
  const [shipping, setShipping] = useState<ShippingMethod>('pac');
  const [payment, setPayment] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState(1);
  const [done, setDone] = useState<string | null>(null);

  const subtotal = getCartSubtotal(items, products);
  const discount = getCartDiscount(subtotal, coupon);
  const cartShipping = getCartShipping(subtotal, coupon);
  const shippingPrices: Record<ShippingMethod, { price: number; label: string; deadline: string }> = {
    pac: { price: cartShipping, label: 'PAC', deadline: '5 a 8 dias úteis' },
    sedex: { price: cartShipping + 18, label: 'Sedex', deadline: '2 a 4 dias úteis' },
    retirada: { price: 0, label: 'Retirada na loja', deadline: 'Em até 1 dia útil' },
  };
  const finalShipping = shippingPrices[shipping].price;
  const total = subtotal - discount + finalShipping;

  if (items.length === 0 && !done) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Seu carrinho está vazio"
          description="Adicione produtos antes de finalizar a compra."
          action={<Link to="/loja" className="btn-primary">Ir para a loja</Link>}
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-x py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold">Pedido confirmado!</h1>
          <p className="mt-3 text-ink-mute">
            Seu pedido <strong>{done}</strong> foi recebido. Entraremos em contato com os próximos passos.
          </p>
          <p className="mt-2 text-xs text-ink-mute">
            Ambiente demonstrativo: nenhum pagamento real será processado.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link to="/" className="btn-secondary">Voltar para a loja</Link>
            <Link to="/loja" className="btn-primary">Continuar comprando</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Finalizar pedido</p>
      <h1 className="section-title">Checkout</h1>

      {!loggedCustomer && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-line bg-bg-soft px-4 py-3 text-sm">
          <span className="text-ink-soft">
            Entre ou crie uma conta para acompanhar seus pedidos depois.
          </span>
          <span className="flex gap-2">
            <Link to="/login" className="text-xs font-bold text-ink hover:underline">Entrar</Link>
            <span className="text-ink-mute">·</span>
            <Link to="/criar-conta" className="text-xs font-bold text-ink hover:underline">Criar conta</Link>
          </span>
        </div>
      )}

      <ol className="mt-4 flex flex-wrap items-center gap-1 text-xs">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1">
            <span
              className={`inline-flex h-6 items-center justify-center rounded-full px-2.5 font-semibold ${
                i <= step ? 'bg-ink text-bg' : 'bg-bg-soft text-ink-mute'
              }`}
            >
              {i + 1}. {s}
            </span>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-ink-mute" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          {step === 0 && (
            <CustomerStep
              defaults={customer ?? undefined}
              onNext={(d) => {
                setCustomer(d);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <AddressStep
              defaults={address ?? undefined}
              onBack={() => setStep(0)}
              onNext={(d) => {
                setAddress(d);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <ShippingStep
              prices={shippingPrices}
              value={shipping}
              setValue={setShipping}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <PaymentStep
              value={payment}
              setValue={setPayment}
              installments={installments}
              setInstallments={setInstallments}
              total={total}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && customer && address && (
            <ReviewStep
              customer={customer}
              address={address}
              shipping={shippingPrices[shipping]}
              payment={payment}
              installments={installments}
              total={total}
              onBack={() => setStep(3)}
              onConfirm={() => {
                const id = `#3DC-${String(Math.floor(1000 + Math.random() * 9000))}`;
                const orderItems: OrderItem[] = items.map((it) => {
                  const p = products.find((x) => x.id === it.productId);
                  return {
                    productId: it.productId,
                    name: p?.name ?? 'Produto',
                    image: p?.images[0] ?? '',
                    variationLabel: it.variationLabel,
                    qty: it.qty,
                    unitPrice: p ? p.promoPrice ?? p.price : 0,
                  };
                });
                const order: Order = {
                  id,
                  createdAt: new Date().toISOString(),
                  customerId: loggedCustomer?.id,
                  customer,
                  address,
                  items: orderItems,
                  shipping: {
                    method: shippingPrices[shipping].label,
                    price: shippingPrices[shipping].price,
                    deadline: shippingPrices[shipping].deadline,
                  },
                  payment: {
                    method: payment,
                    installments: payment === 'credito' ? installments : undefined,
                  },
                  coupon: coupon
                    ? { code: coupon, discount }
                    : undefined,
                  subtotal,
                  total,
                  status: payment === 'boleto' ? 'aguardando-pagamento' : 'novo',
                };
                addOrder(order);
                toast.success(`Pedido ${id} confirmado!`);
                clear();
                setDone(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>

        <aside className="card h-fit p-5">
          <h2 className="text-base font-bold">Resumo do pedido</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((it) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              return (
                <li key={p.id + (it.variationId ?? '')} className="flex justify-between gap-2">
                  <span className="text-ink-mute">
                    {it.qty}x {p.name}
                  </span>
                  <span>{formatBRL((p.promoPrice ?? p.price) * it.qty)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-ink-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-mute">Subtotal</dt>
              <dd>{formatBRL(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt>Cupom</dt>
                <dd>-{formatBRL(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-mute">Frete</dt>
              <dd>{finalShipping === 0 ? 'Grátis' : formatBRL(finalShipping)}</dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-ink-line pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatBRL(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function CustomerStep({ defaults, onNext }: { defaults?: Customer; onNext: (d: Customer) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaults,
  });
  const phoneReg = register('phone');
  const cpfReg = register('cpf');
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-lg font-bold">Seus dados</h2>
      <div>
        <Label>Nome completo</Label>
        <Input {...register('name')} error={errors.name?.message} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>E-mail</Label>
          <Input type="email" {...register('email')} error={errors.email?.message} />
        </div>
        <div>
          <Label>Telefone / WhatsApp</Label>
          <Input
            {...phoneReg}
            inputMode="tel"
            placeholder="(54) 99999-9999"
            error={errors.phone?.message}
            onChange={(e) => {
              e.target.value = maskPhone(e.target.value);
              phoneReg.onChange(e);
            }}
          />
        </div>
      </div>
      <div>
        <Label>CPF (opcional)</Label>
        <Input
          {...cpfReg}
          inputMode="numeric"
          placeholder="000.000.000-00"
          onChange={(e) => {
            e.target.value = maskCPF(e.target.value);
            cpfReg.onChange(e);
          }}
        />
      </div>
      <Button>Continuar para endereço</Button>
    </form>
  );
}

function AddressStep({ defaults, onBack, onNext }: { defaults?: Address; onBack: () => void; onNext: (d: Address) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaults,
  });
  const cepReg = register('cep');
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-lg font-bold">Endereço de entrega</h2>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>CEP</Label>
          <Input
            {...cepReg}
            inputMode="numeric"
            placeholder="00000-000"
            error={errors.cep?.message}
            onChange={(e) => {
              e.target.value = maskCEP(e.target.value);
              cepReg.onChange(e);
            }}
          />
        </div>
        <div className="col-span-2">
          <Label>Rua</Label>
          <Input {...register('street')} error={errors.street?.message} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Número</Label>
          <Input {...register('number')} error={errors.number?.message} />
        </div>
        <div className="col-span-2">
          <Label>Complemento</Label>
          <Input {...register('complement')} placeholder="opcional" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Bairro</Label>
          <Input {...register('district')} error={errors.district?.message} />
        </div>
        <div>
          <Label>Cidade</Label>
          <Input {...register('city')} error={errors.city?.message} />
        </div>
        <div>
          <Label>UF</Label>
          <Input {...register('state')} maxLength={2} error={errors.state?.message} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit">Continuar para entrega</Button>
      </div>
    </form>
  );
}

function ShippingStep({
  prices, value, setValue, onBack, onNext,
}: {
  prices: Record<ShippingMethod, { price: number; label: string; deadline: string }>;
  value: ShippingMethod;
  setValue: (v: ShippingMethod) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Forma de entrega</h2>
      <div className="space-y-2">
        {(Object.keys(prices) as ShippingMethod[]).map((k) => {
          const p = prices[k];
          return (
            <label
              key={k}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                value === k ? 'border-ink bg-bg-soft' : 'border-ink-line'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={value === k}
                  onChange={() => setValue(k)}
                  className="accent-ink"
                />
                <div>
                  <p className="font-semibold">{p.label}</p>
                  <p className="text-xs text-ink-mute">{p.deadline}</p>
                </div>
              </div>
              <span className="font-bold">{p.price === 0 ? 'Grátis' : formatBRL(p.price)}</span>
            </label>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onNext}>Continuar para pagamento</Button>
      </div>
    </div>
  );
}

function PaymentStep({
  value, setValue, installments, setInstallments, total, onBack, onNext,
}: {
  value: PaymentMethod;
  setValue: (v: PaymentMethod) => void;
  installments: number;
  setInstallments: (n: number) => void;
  total: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Forma de pagamento</h2>
      <div className="grid grid-cols-3 gap-3">
        {(['pix', 'credito', 'boleto'] as PaymentMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => setValue(m)}
            className={`rounded-xl border p-4 text-left ${value === m ? 'border-ink bg-bg-soft' : 'border-ink-line'}`}
          >
            <p className="text-sm font-semibold capitalize">
              {m === 'pix' ? 'Pix' : m === 'credito' ? 'Cartão de crédito' : 'Boleto'}
            </p>
            {m === 'pix' && <p className="mt-1 text-xs text-emerald-600">5% off no Pix</p>}
            {m === 'credito' && <p className="mt-1 text-xs text-ink-mute">Em até 10x</p>}
          </button>
        ))}
      </div>

      {value === 'credito' && (
        <div>
          <Label>Parcelas</Label>
          <Select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}x de {formatBRL(total / (i + 1))} {i === 0 ? '' : 'sem juros'}
              </option>
            ))}
          </Select>
        </div>
      )}

      <p className="text-xs text-ink-mute">
        ⓘ Ambiente demonstrativo: nenhum pagamento real será processado.
      </p>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onNext}>Revisar pedido</Button>
      </div>
    </div>
  );
}

function ReviewStep({
  customer, address, shipping, payment, installments, total, onBack, onConfirm,
}: {
  customer: Customer;
  address: Address;
  shipping: { label: string; price: number; deadline: string };
  payment: PaymentMethod;
  installments: number;
  total: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Revise seu pedido</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-ink-line p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Cliente</p>
          <p className="mt-1 text-sm font-semibold">{customer.name}</p>
          <p className="text-xs text-ink-mute">{customer.email}</p>
          <p className="text-xs text-ink-mute">{customer.phone}</p>
        </div>
        <div className="rounded-xl border border-ink-line p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Endereço</p>
          <p className="mt-1 text-sm">
            {address.street}, {address.number} {address.complement && `(${address.complement})`}
          </p>
          <p className="text-xs text-ink-mute">
            {address.district}, {address.city}/{address.state} — {address.cep}
          </p>
        </div>
        <div className="rounded-xl border border-ink-line p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Entrega</p>
          <p className="mt-1 text-sm font-semibold">{shipping.label}</p>
          <p className="text-xs text-ink-mute">{shipping.deadline}</p>
        </div>
        <div className="rounded-xl border border-ink-line p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Pagamento</p>
          <p className="mt-1 text-sm font-semibold capitalize">
            {payment === 'pix' ? 'Pix' : payment === 'credito' ? `Cartão (${installments}x)` : 'Boleto'}
          </p>
          <p className="text-xs text-ink-mute">{formatBRL(total)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onConfirm}>Confirmar pedido</Button>
      </div>
    </div>
  );
}
