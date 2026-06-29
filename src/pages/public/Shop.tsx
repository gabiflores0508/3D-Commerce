import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters, type FiltersState } from '@/components/product/ProductFilters';
import { ProductSort, applySort, type SortKey } from '@/components/product/ProductSort';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSEO } from '@/utils/seo';

export default function Shop({ categorySlug, title }: { categorySlug?: string; title?: string }) {
  useSEO(title ?? 'Loja', 'Todos os produtos de impressão 3D da 3DCommerce.');
  const products = useAdminDataStore((s) => s.products);
  const categories = useAdminDataStore((s) => s.categories);
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;

  const [filters, setFilters] = useState<FiltersState>({
    q,
    categories: category ? [category.id] : [],
    materials: [],
    brands: [],
    minPrice: 0,
    maxPrice: 5000,
    inStockOnly: false,
    onlyOffer: category?.slug === 'ofertas',
  });
  const [sort, setSort] = useState<SortKey>('novidades');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = products.filter((p) => p.active);
    if (category?.isSeasonal && category.productIds?.length) {
      arr = arr.filter((p) => category.productIds!.includes(p.id));
    } else if (filters.categories.length) {
      arr = arr.filter((p) => p.categoryIds.some((id) => filters.categories.includes(id)));
    }
    if (filters.materials.length) {
      arr = arr.filter((p) => p.material && filters.materials.includes(p.material));
    }
    if (filters.brands.length) {
      arr = arr.filter((p) => filters.brands.includes(p.brand));
    }
    arr = arr.filter((p) => (p.promoPrice ?? p.price) <= filters.maxPrice);
    if (filters.inStockOnly) arr = arr.filter((p) => p.stock > 0);
    if (filters.onlyOffer) arr = arr.filter((p) => p.isOffer);
    const text = (q || filters.q).trim().toLowerCase();
    if (text) {
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(text) ||
          p.brand.toLowerCase().includes(text) ||
          (p.material ?? '').toLowerCase().includes(text) ||
          p.description.toLowerCase().includes(text),
      );
    }
    return applySort(arr, sort);
  }, [products, filters, category, q, sort]);

  return (
    <div className="container-x py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Catálogo</p>
        <h1 className="mt-1 text-3xl font-bold">{title ?? category?.name ?? 'Todos os produtos'}</h1>
        {category?.description && <p className="mt-2 max-w-2xl text-sm text-ink-mute">{category.description}</p>}
        {q && <p className="mt-2 text-sm text-ink-mute">Busca por: <strong>{q}</strong></p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <ProductFilters products={products} filters={filters} setFilters={setFilters} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="btn-secondary !py-2 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
            <p className="text-xs text-ink-mute">{filtered.length} produto(s)</p>
            <ProductSort value={sort} onChange={setSort} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhum produto encontrado"
              description="Tente remover alguns filtros ou alterar sua busca."
            />
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-bg p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Filtros</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProductFilters products={products} filters={filters} setFilters={setFilters} />
          </div>
        </div>
      )}
    </div>
  );
}
