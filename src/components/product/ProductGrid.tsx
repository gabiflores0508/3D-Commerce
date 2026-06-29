import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: 3 | 4 }) {
  const grid = cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';
  return (
    <div className={`grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 ${grid}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
