import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { useSEO } from '@/utils/seo';
import { whatsappContact } from '@/utils/whatsapp';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { site } from '@/config/site';

const schema = z.object({
  name: z.string().min(3, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
  message: z.string().min(10, 'Mensagem muito curta'),
});
type Data = z.infer<typeof schema>;

export default function Contact() {
  useSEO('Contato');
  const settings = useAdminDataStore((s) => s.settings);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Data>({ resolver: zodResolver(schema) });

  function onSubmit(d: Data) {
    const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
      `Olá, 3DCommerce!\n\nNome: ${d.name}\nE-mail: ${d.email}\n\n${d.message}`,
    )}`;
    window.open(url, '_blank');
    toast.success('Abrindo WhatsApp...');
    reset();
  }

  return (
    <div className="container-x py-12">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-mute">Contato</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Fale com a 3DCommerce</h1>
        <p className="mt-3 text-ink-mute">Atendimento humano, rápido e técnico. Estamos prontos para ajudar.</p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <Label>Nome</Label>
            <Input {...register('name')} error={errors.name?.message} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" {...register('email')} error={errors.email?.message} />
          </div>
          <div>
            <Label>Mensagem</Label>
            <Textarea {...register('message')} rows={5} error={errors.message?.message} />
          </div>
          <Button variant="whatsapp" size="lg" type="submit">
            <MessageCircle className="h-4 w-4" /> Enviar via WhatsApp
          </Button>
        </form>

        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-base font-bold">Canais de contato</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-ink-mute" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                <a href={whatsappContact()} target="_blank" rel="noreferrer" className="hover:underline">
                  WhatsApp {site.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-ink-mute" />
                <a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a>
              </li>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-base font-bold">Horário de atendimento</h3>
            <p className="mt-2 text-sm text-ink-mute">Segunda a sexta: 9h às 19h</p>
            <p className="text-sm text-ink-mute">Sábado: 9h às 13h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
