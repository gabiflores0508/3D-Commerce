import { MapPin, Truck, Wrench, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useSEO } from '@/utils/seo';
import { whatsappContact } from '@/utils/whatsapp';

export default function About() {
  useSEO('Sobre a 3DCommerce');
  const settings = useAdminDataStore((s) => s.settings);
  return (
    <div className="container-x py-12">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Sobre nós</p>
        <h1 className="mt-2 font-display text-4xl font-bold">A 3DCommerce em poucas linhas</h1>
        <p className="mt-4 text-lg text-ink-mute">{settings.about}</p>
      </header>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: Sparkles, title: 'Foco em qualidade', desc: 'Curadoria de marcas e produtos testados pelo nosso time.' },
          { icon: Wrench, title: 'Suporte especializado', desc: 'Acompanhamento técnico antes, durante e depois da compra.' },
          { icon: ShieldCheck, title: 'Compromisso com você', desc: 'Atendimento humano, transparência e garantia em todos os produtos.' },
        ].map((it) => (
          <div key={it.title} className="card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-bg">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{it.title}</h3>
            <p className="mt-2 text-sm text-ink-mute">{it.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-3xl bg-ink p-8 text-bg md:p-12">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Visite nossa loja física</h2>
        <ul className="mt-5 space-y-2 text-sm text-bg/80">
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {settings.address}</li>
          <li className="flex items-center gap-2"><Truck className="h-4 w-4" /> {settings.shippingNote}</li>
          <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp comercial em tempo real</li>
        </ul>
        <a href={whatsappContact()} target="_blank" rel="noreferrer" className="btn-whatsapp mt-6">
          <MessageCircle className="h-4 w-4" /> Falar com nossa equipe
        </a>
      </section>
    </div>
  );
}
