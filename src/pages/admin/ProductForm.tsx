import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import slugify from 'slugify';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import type { Product, PurchaseMode } from '@/types';
import { productSvg } from '@/utils/productImage';
import { useSEO } from '@/utils/seo';
import { ImageUploader } from '@/components/admin/ImageUploader';

const schema = z.object({
  name: z.string().min(3),
  shortDescription: z.string().min(5),
  description: z.string().min(10),
  brand: z.string().min(1),
  price: z.coerce.number().min(0.01),
  promoPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  material: z.enum(['PLA', 'PETG', 'ABS', 'Resina', '-']).optional(),
  purchaseMode: z.enum(['direct', 'quote', 'both']),
  isHighlight: z.boolean().optional(),
  isLaunch: z.boolean().optional(),
  isOffer: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  active: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useSEO(isEdit ? 'Editar produto' : 'Novo produto');
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useAdminDataStore();
  const existing = id ? products.find((p) => p.id === id) : undefined;

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          name: existing.name,
          shortDescription: existing.shortDescription,
          description: existing.description,
          brand: existing.brand,
          price: existing.price,
          promoPrice: existing.promoPrice,
          stock: existing.stock,
          categoryId: existing.categoryIds[0] ?? categories[0]?.id,
          material: existing.material ?? '-',
          purchaseMode: existing.purchaseMode,
          isHighlight: existing.isHighlight,
          isLaunch: existing.isLaunch,
          isOffer: existing.isOffer,
          isBestSeller: existing.isBestSeller,
          freeShipping: existing.freeShipping,
          active: existing.active,
        }
      : {
          purchaseMode: 'direct' as PurchaseMode,
          active: true,
          categoryId: categories[0]?.id,
          material: '-',
          stock: 1,
          price: 0,
        },
  });

  const name = watch('name');
  const [images, setImages] = useState<string[]>(existing ? existing.images : []);

  useEffect(() => {
    if (!existing && images.length === 0 && name) {
      setImages([productSvg(name, 'generic', Math.floor(Math.random() * 999))]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function onSubmit(d: FormData) {
    const badges: Product['badges'] = [];
    if (d.isOffer) badges.push('oferta');
    if (d.isLaunch) badges.push('lancamento');
    if (d.isBestSeller) badges.push('mais-vendido');
    if (d.stock <= 0) badges.push('esgotado');
    if (d.freeShipping) badges.push('frete-gratis');

    const finalImages = images.length > 0 ? images : [productSvg(d.name, 'generic', 1)];
    if (isEdit && existing) {
      updateProduct(existing.id, {
        ...d,
        material: d.material as Product['material'],
        categoryIds: [d.categoryId],
        images: finalImages,
        badges,
        isHighlight: !!d.isHighlight,
        isLaunch: !!d.isLaunch,
        isOffer: !!d.isOffer,
        isBestSeller: !!d.isBestSeller,
        freeShipping: !!d.freeShipping,
        active: !!d.active,
      });
      toast.success('Produto atualizado');
    } else {
      const newId = 'prod-' + Date.now();
      const product: Product = {
        id: newId,
        slug: slugify(d.name, { lower: true, strict: true }),
        name: d.name,
        shortDescription: d.shortDescription,
        description: d.description,
        brand: d.brand,
        material: d.material as Product['material'],
        categoryIds: [d.categoryId],
        images: finalImages,
        price: d.price,
        promoPrice: d.promoPrice,
        stock: d.stock,
        freeShipping: !!d.freeShipping,
        purchaseMode: d.purchaseMode,
        variations: [],
        badges,
        isHighlight: !!d.isHighlight,
        isLaunch: !!d.isLaunch,
        isOffer: !!d.isOffer,
        isBestSeller: !!d.isBestSeller,
        active: !!d.active,
        createdAt: new Date().toISOString().slice(0, 10),
        attributes: {},
      };
      addProduct(product);
      toast.success('Produto criado');
    }
    navigate('/admin/produtos');
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-mute hover:text-ink">
        <ChevronLeft className="h-3 w-3" /> Voltar
      </button>
      <h1 className="mt-3 text-2xl font-bold">{isEdit ? 'Editar produto' : 'Novo produto'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <h2 className="text-base font-bold">Informações</h2>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Nome</Label>
                <Input {...register('name')} error={errors.name?.message} />
              </div>
              <div>
                <Label>Marca</Label>
                <Input {...register('brand')} error={errors.brand?.message} />
              </div>
              <div>
                <Label>Descrição curta</Label>
                <Input {...register('shortDescription')} error={errors.shortDescription?.message} />
              </div>
              <div>
                <Label>Descrição completa</Label>
                <Textarea {...register('description')} rows={5} error={errors.description?.message} />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-base font-bold">Preços e estoque</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" {...register('price')} error={errors.price?.message} />
              </div>
              <div>
                <Label>Preço promo</Label>
                <Input type="number" step="0.01" {...register('promoPrice')} />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input type="number" {...register('stock')} error={errors.stock?.message} />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-base font-bold">Classificação</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select {...register('categoryId')}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Material</Label>
                <Select {...register('material')}>
                  <option value="-">—</option>
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="Resina">Resina</option>
                </Select>
              </div>
              <div>
                <Label>Modo de compra</Label>
                <Select {...register('purchaseMode')}>
                  <option value="direct">Direct (apenas compra)</option>
                  <option value="quote">Quote (apenas orçamento)</option>
                  <option value="both">Both (compra + orçamento)</option>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="text-base font-bold">Imagens do produto</h2>
            <div className="mt-4">
              <ImageUploader
                multiple
                max={6}
                value={images}
                onChange={setImages}
                hint="Primeira imagem vira a principal. Upload demonstrativo: imagens ficam salvas no navegador (até 1MB cada)."
              />
            </div>
          </div>
          <div className="card p-5">
            <h2 className="text-base font-bold">Flags</h2>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" {...register('isHighlight')} className="accent-ink" /> Destaque na home</label>
              <label className="flex items-center gap-2"><input type="checkbox" {...register('isLaunch')} className="accent-ink" /> Lançamento</label>
              <label className="flex items-center gap-2"><input type="checkbox" {...register('isOffer')} className="accent-ink" /> Oferta</label>
              <label className="flex items-center gap-2"><input type="checkbox" {...register('isBestSeller')} className="accent-ink" /> Mais vendido</label>
              <label className="flex items-center gap-2"><input type="checkbox" {...register('freeShipping')} className="accent-ink" /> Frete grátis</label>
              <label className="flex items-center gap-2 border-t border-ink-line pt-3"><input type="checkbox" {...register('active')} className="accent-ink" /> Produto ativo</label>
            </div>
          </div>
          <Button type="submit" fullWidth size="lg">
            <Save className="h-4 w-4" /> Salvar produto
          </Button>
        </aside>
      </form>
    </div>
  );
}
