import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Tag } from 'lucide-react';
import { useAdminDataStore } from '@/store/useAdminDataStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaMenu({ open, onClose, onMouseEnter, onMouseLeave }: Props) {
  const categories = useAdminDataStore((s) => s.categories);
  const products = useAdminDataStore((s) => s.products);

  const main = categories
    .filter((c) => c.showInMenu && !c.isSeasonal && c.slug !== 'ofertas')
    .sort((a, b) => a.order - b.order);
  const seasonal = categories.find((c) => c.isSeasonal && c.seasonalActive && c.showInMenu);
  const offers = categories.find((c) => c.slug === 'ofertas');
  const highlights = products.filter((p) => p.isHighlight && p.active).slice(0, 4);

  // Coluna "Materiais": categorias de filamento/resina conhecidas.
  // Coluna "Loja": todas as demais (inclui categorias novas criadas no admin).
  const materialSlugs = ['pla', 'petg', 'abs', 'resinas'];
  const materialCats = main.filter((c) => materialSlugs.includes(c.slug));
  const otherCats = main.filter((c) => !materialSlugs.includes(c.slug));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 top-full z-40 hidden lg:block"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave ?? onClose}
        >
          {/* Hover bridge: faixa invisível entre o botão e o painel para não cortar o hover */}
          <div aria-hidden className="h-2 w-full" />
          <div className="border-t border-ink-line bg-bg-card shadow-xl">
          <div className="container-x grid grid-cols-12 gap-8 py-8">
            <div className="col-span-3">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-mute">Materiais</p>
              <ul className="space-y-2">
                {materialCats.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/categoria/${c.slug}`}
                      onClick={onClose}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                    >
                      {c.name}
                      <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-3">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-mute">Loja</p>
              <ul className="space-y-2">
                {otherCats.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/categoria/${c.slug}`}
                      onClick={onClose}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                    >
                      {c.name}
                      <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/loja"
                    onClick={onClose}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-soft"
                  >
                    Ver tudo
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              </ul>
              <div className="mt-6 space-y-2">
                {offers && (
                  <Link
                    to={`/categoria/${offers.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Ofertas da semana
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {seasonal && (
                  <Link
                    to={`/categoria/${seasonal.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> {seasonal.name}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            <div className="col-span-6">
              <p className="mb-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                <Flame className="h-3 w-3" /> Destaques
              </p>
              <div className="grid grid-cols-4 gap-3">
                {highlights.map((p) => (
                  <Link
                    key={p.id}
                    to={`/produto/${p.slug}`}
                    onClick={onClose}
                    className="group overflow-hidden rounded-xl border border-ink-line bg-bg transition hover:shadow-card"
                  >
                    <img src={p.images[0]} alt={p.name} className="aspect-square w-full object-cover" />
                    <div className="p-2">
                      <p className="line-clamp-2 text-xs font-semibold text-ink">{p.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
