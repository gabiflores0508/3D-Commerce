import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck, Wrench } from 'lucide-react';
import { whatsappContact } from '@/utils/whatsapp';
import { useAdminDataStore } from '@/store/useAdminDataStore';

export function Hero() {
  // Banner cadastrado no admin para a posição "hero" (ativo, primeiro pela ordem).
  const heroBanner = useAdminDataStore((s) =>
    s.banners
      .filter((b) => b.position === 'hero' && b.active)
      .sort((a, b) => a.order - b.order)[0],
  );
  const heroImage = heroBanner?.image;

  // Selos flutuantes: usam o que foi cadastrado no banner; se não houver banner,
  // caem nos valores padrão. Cada selo pode ser desativado (enabled = false).
  const badgeLeft = heroBanner?.badgeLeft ?? { enabled: true, tag: '+ Vendido', title: 'PLA Preto 1kg', info: 'R$ 109,90' };
  const badgeRight = heroBanner?.badgeRight ?? { enabled: true, tag: 'Lançamento', title: 'Bambu Lab A1', info: 'Suporte incluso' };

  return (
    <section className="relative overflow-hidden bg-ink text-bg">
      <div className="absolute inset-0 opacity-[0.12] bg-grid-soft [background-size:32px_32px]" />
      <div className="absolute -top-32 -right-40 h-[560px] w-[560px] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[460px] w-[460px] rounded-full bg-violet-500/10 blur-3xl" />

      <div className="container-x relative z-10 grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-bg/15 bg-bg/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-bg/85 backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" /> Loja oficial 3D · Bento Gonçalves
          </span>
          <h1 className="mt-6 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Tudo para
            <br />
            <span className="relative inline-block">
              impressão 3D
              <svg
                aria-hidden
                className="absolute -bottom-2 left-0 h-3 w-full text-accent"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path d="M0 8 C 40 2, 80 12, 120 6 S 200 4, 200 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            <span className="text-bg/55">em um só lugar.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-bg/70 md:text-lg">
            Filamentos, resinas, impressoras e suporte especializado.
            Compre online ou visite nossa loja física — enviamos para todo o Brasil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/loja"
              className="group inline-flex items-center gap-2 rounded-xl bg-bg px-6 py-3.5 text-sm font-bold text-ink shadow-2xl shadow-accent/10 transition hover:bg-accent hover:shadow-accent/30"
            >
              Explorar a loja
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={whatsappContact()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-bg/15 bg-bg/[0.04] px-6 py-3.5 text-sm font-bold text-bg backdrop-blur transition hover:bg-bg/10"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" /> Falar no WhatsApp
            </a>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
            {[
              { icon: Truck, label: 'Envio nacional' },
              { icon: ShieldCheck, label: 'Compra segura' },
              { icon: Wrench, label: 'Suporte técnico' },
              { icon: MessageCircle, label: 'Atendimento direto' },
            ].map((it) => (
              <li key={it.label} className="flex items-center gap-2 text-bg/75">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-bg/[0.06] text-accent ring-1 ring-bg/10">
                  <it.icon className="h-3.5 w-3.5" />
                </span>
                {it.label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative aspect-square overflow-hidden rounded-[28px] border border-bg/15 bg-gradient-to-br from-bg/[0.04] to-bg/0 p-7 shadow-[0_30px_120px_-30px_rgba(34,211,238,0.35)]">
            {heroImage ? (
              <img
                src={heroImage}
                alt={heroBanner?.title ?? 'Destaque 3DCommerce'}
                className="absolute inset-0 h-full w-full rounded-[28px] object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-7 rounded-[20px] border border-bg/10" />
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <radialGradient id="hgGlow" cx="0.5" cy="0.5" r="0.6">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="78" fill="url(#hgGlow)" />
                  <g transform="translate(100 100)">
                    <polygon points="-60,-35 60,-35 75,0 0,55 -75,0" fill="url(#hg)" opacity="0.22" />
                    <polygon points="-60,-35 60,-35 75,0 0,55 -75,0" fill="none" stroke="#FAFAF7" strokeWidth="2" strokeLinejoin="round" />
                    <polyline points="-75,0 -50,-15 -25,5 0,-10 25,10 50,-5 75,0" fill="none" stroke="#22D3EE" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="0" cy="-10" r="6" fill="#FAFAF7" />
                    <circle cx="0" cy="-10" r="2.5" fill="#22D3EE" />
                    <text x="0" y="80" textAnchor="middle" fill="#FAFAF7" opacity="0.55" fontSize="10" letterSpacing="4">3DCOMMERCE</text>
                  </g>
                </svg>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-bg px-5 py-2 text-xs font-bold text-ink shadow-2xl">
                  Impressão de qualidade
                </div>
              </>
            )}
          </div>

          {badgeLeft.enabled && (badgeLeft.tag || badgeLeft.title || badgeLeft.info) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -left-6 top-12 rounded-2xl border border-bg/15 bg-ink/50 px-4 py-3 backdrop-blur-md md:-left-10"
            >
              {badgeLeft.tag && <p className="text-[10px] uppercase tracking-widest text-bg/55">{badgeLeft.tag}</p>}
              {badgeLeft.title && <p className="mt-0.5 text-sm font-bold">{badgeLeft.title}</p>}
              {badgeLeft.info && <p className="mt-0.5 text-[11px] font-semibold text-accent">{badgeLeft.info}</p>}
            </motion.div>
          )}
          {badgeRight.enabled && (badgeRight.tag || badgeRight.title || badgeRight.info) && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -right-6 bottom-16 rounded-2xl border border-bg/15 bg-ink/50 px-4 py-3 backdrop-blur-md md:-right-10"
            >
              {badgeRight.tag && <p className="text-[10px] uppercase tracking-widest text-bg/55">{badgeRight.tag}</p>}
              {badgeRight.title && <p className="mt-0.5 text-sm font-bold">{badgeRight.title}</p>}
              {badgeRight.info && <p className="mt-0.5 text-[11px] font-semibold text-violet-300">{badgeRight.info}</p>}
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-bg/10 bg-ink/40 backdrop-blur">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3 text-[11px] uppercase tracking-widest text-bg/55">
          <span>Filamentos · PLA · PETG · ABS · Resinas</span>
          <span className="hidden md:inline">Impressoras Creality · Bambu Lab · Elegoo</span>
          <span>Suporte técnico especializado</span>
        </div>
      </div>
    </section>
  );
}
