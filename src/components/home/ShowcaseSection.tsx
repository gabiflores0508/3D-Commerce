import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/types';
import { ProductGrid } from '@/components/product/ProductGrid';

interface Props {
  eyebrow: string;
  title: string;
  ctaTo?: string;
  ctaLabel?: string;
  products: Product[];
}

export function ShowcaseSection({ eyebrow, title, ctaTo, ctaLabel, products }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="container-x py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        {ctaTo && (
          <Link
            to={ctaTo}
            className="group hidden text-sm font-semibold text-ink-soft transition hover:text-ink md:inline-flex md:items-center md:gap-1"
          >
            {ctaLabel ?? 'Ver tudo'}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <ProductGrid products={products.slice(0, 8)} />
    </section>
  );
}
