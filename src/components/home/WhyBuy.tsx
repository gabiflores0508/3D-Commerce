import { MapPin, Truck, Wrench, ShieldCheck, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { icon: MapPin, title: 'Loja física confiável', desc: 'Atendimento presencial em Bento Gonçalves/RS.' },
  { icon: Truck, title: 'Envio nacional', desc: 'Despacho ágil para todo o Brasil.' },
  { icon: Wrench, title: 'Suporte técnico', desc: 'Acompanhamos sua impressão do unboxing à primeira peça.' },
  { icon: ShieldCheck, title: 'Compra segura', desc: 'Pagamento criptografado e garantia em todos os produtos.' },
  { icon: MessageCircle, title: 'Atendimento direto', desc: 'WhatsApp humano sempre que você precisar.' },
];

export function WhyBuy() {
  return (
    <section className="container-x py-20">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Por que a 3DCommerce</p>
        <h2 className="section-title">Mais que uma loja: um parceiro de impressão 3D.</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-ink-line/70 bg-bg-card p-6 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-card"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-bg transition-colors group-hover:bg-accent group-hover:text-ink">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-[15px] font-bold leading-tight">{it.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
