import { Select } from '@/components/ui/Input';

export type SortKey = 'novidades' | 'menor-preco' | 'maior-preco' | 'mais-vendidos' | 'az' | 'za';

export function ProductSort({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as SortKey)} className="!py-2 max-w-[220px]">
      <option value="novidades">Novidades</option>
      <option value="menor-preco">Menor preço</option>
      <option value="maior-preco">Maior preço</option>
      <option value="mais-vendidos">Mais vendidos</option>
      <option value="az">A → Z</option>
      <option value="za">Z → A</option>
    </Select>
  );
}

export function applySort<T extends { promoPrice?: number; price: number; name: string; isBestSeller: boolean; createdAt: string }>(arr: T[], key: SortKey): T[] {
  const copy = arr.slice();
  switch (key) {
    case 'menor-preco':
      return copy.sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price));
    case 'maior-preco':
      return copy.sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price));
    case 'mais-vendidos':
      return copy.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
    case 'az':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'za':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'novidades':
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
