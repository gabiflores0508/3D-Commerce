import { useMemo } from 'react';
import type { Product } from '@/types';
import { Label } from '@/components/ui/Input';

export interface FiltersState {
  q: string;
  categories: string[];
  materials: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  onlyOffer: boolean;
}

interface Props {
  products: Product[];
  filters: FiltersState;
  setFilters: (f: FiltersState) => void;
}

export function ProductFilters({ products, filters, setFilters }: Props) {
  const materials = useMemo(
    () => Array.from(new Set(products.map((p) => p.material).filter((m): m is NonNullable<typeof m> => Boolean(m) && m !== '-'))),
    [products],
  );
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))), [products]);

  function toggle<K extends 'materials' | 'brands' | 'categories'>(field: K, value: string) {
    const list = filters[field];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    setFilters({ ...filters, [field]: next });
  }

  return (
    <aside className="space-y-6 rounded-2xl border border-ink-line bg-bg-card p-5">
      <div>
        <Label>Material</Label>
        <div className="space-y-1.5">
          {materials.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.materials.includes(m)}
                onChange={() => toggle('materials', m)}
                className="accent-ink"
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Marca</Label>
        <div className="space-y-1.5">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.brands.includes(b)}
                onChange={() => toggle('brands', b)}
                className="accent-ink"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Preço</Label>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-ink"
          />
          <p className="text-xs text-ink-mute">Até R$ {filters.maxPrice}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
            className="accent-ink"
          />
          Apenas em estoque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.onlyOffer}
            onChange={(e) => setFilters({ ...filters, onlyOffer: e.target.checked })}
            className="accent-ink"
          />
          Apenas ofertas
        </label>
      </div>

      <button
        onClick={() =>
          setFilters({
            q: '',
            categories: [],
            materials: [],
            brands: [],
            minPrice: 0,
            maxPrice: 5000,
            inStockOnly: false,
            onlyOffer: false,
          })
        }
        className="text-xs font-semibold text-ink-mute hover:text-ink underline"
      >
        Limpar filtros
      </button>
    </aside>
  );
}
