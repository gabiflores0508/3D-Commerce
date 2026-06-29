import { Accordion } from '@/components/ui/Accordion';
import { seedFaqs } from '@/data/faqs';
import { useSEO } from '@/utils/seo';

export default function FAQ() {
  useSEO('Perguntas frequentes');
  return (
    <div className="container-x py-12">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Ajuda</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Perguntas frequentes</h1>
        <p className="mt-3 text-ink-mute">Tirou suas dúvidas? Caso contrário, fale com nossa equipe pelo WhatsApp.</p>
      </header>
      <div className="mt-8 max-w-3xl">
        <Accordion items={seedFaqs.map((f) => ({ id: f.id, title: f.question, content: f.answer }))} />
      </div>
    </div>
  );
}
