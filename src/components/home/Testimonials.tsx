import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonialService } from '@/services/testimonialService';
import { apiAssetUrl } from '@/services/api';
import type { ApiTestimonial } from '@/services/types';

export function Testimonials() {
  const [items, setItems] = useState<ApiTestimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    testimonialService
      .listPublic()
      .then(({ testimonials }) => setItems(testimonials))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (items.length === 0) return null;

  return (
    <section className="container-x py-16">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">Quem já comprou</p>
        <h2 className="section-title">O que os clientes dizem</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-center gap-3">
              {t.avatarUrl ? (
                <img
                  src={apiAssetUrl(t.avatarUrl)}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-soft text-base font-bold text-ink-mute">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                {t.role && <p className="text-xs text-ink-mute">{t.role}</p>}
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-3.5 w-3.5 ${idx < t.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-line'}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {'"'}{t.content}{'"'}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
