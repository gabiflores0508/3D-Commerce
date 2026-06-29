import { Instagram } from 'lucide-react';
import { site } from '@/config/site';
import { productSvg } from '@/utils/productImage';

const tiles = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  img: productSvg(['PLA', 'PETG', 'ABS', 'Resin', 'Print', 'Maker'][i] ?? 'P', 'filament', 500 + i * 17),
}));

export function InstagramFeed() {
  return (
    <section className="container-x py-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Comunidade</p>
          <h2 className="mt-1 text-3xl font-bold">Acompanhe no Instagram</h2>
        </div>
        <a
          href={site.instagram}
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm font-semibold text-ink-soft hover:text-ink md:inline-flex"
        >
          {site.instagramHandle} →
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {tiles.map((t) => (
          <a
            key={t.id}
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <img src={t.img} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/40">
              <Instagram className="h-5 w-5 text-bg opacity-0 transition group-hover:opacity-100" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
