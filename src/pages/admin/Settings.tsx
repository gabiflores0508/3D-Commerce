import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import type { StoreSettings } from '@/types';
import { useSEO } from '@/utils/seo';

const schema = z.object({
  name: z.string().min(2),
  whatsapp: z.string().min(8),
  instagram: z.string().url().optional().or(z.literal('')),
  email: z.string().email(),
  address: z.string().min(5),
  cnpj: z.string().min(5),
  about: z.string().min(20),
  shippingNote: z.string().min(5),
  freeShippingThreshold: z.coerce.number().min(0),
  pixDiscountPercent: z.coerce.number().min(0).max(100),
});
type Data = z.infer<typeof schema>;

export default function Settings() {
  useSEO('Admin Configurações');
  const { settings, updateSettings } = useAdminDataStore();
  const [logo, setLogo] = useState<string>(settings.logo ?? '');
  const { register, handleSubmit, formState: { errors } } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: settings,
  });

  function onSubmit(d: Data) {
    updateSettings({ ...(d as Partial<StoreSettings>), logo: logo || undefined });
    toast.success('Configurações salvas');
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Configurações da loja</h1>
        <p className="text-sm text-ink-mute">Edite informações que aparecem no site público.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="text-base font-bold">Identidade</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><Label>Nome da loja</Label><Input {...register('name')} error={errors.name?.message} /></div>
            <div><Label>CNPJ</Label><Input {...register('cnpj')} error={errors.cnpj?.message} /></div>
          </div>
          <div className="rounded-xl border border-ink-line p-3">
            <ImageUploader
              label="Logo da loja (opcional)"
              value={logo}
              onChange={setLogo}
              hint="Sobrepõe o logo padrão no header e footer quando preenchida."
            />
          </div>
          <div>
            <Label>Sobre a empresa</Label>
            <Textarea {...register('about')} rows={4} error={errors.about?.message} />
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold">Contato</h2>
          <div><Label>WhatsApp (somente números, com DDD)</Label><Input {...register('whatsapp')} error={errors.whatsapp?.message} /></div>
          <div><Label>E-mail</Label><Input {...register('email')} error={errors.email?.message} /></div>
          <div><Label>Instagram (URL)</Label><Input {...register('instagram')} error={errors.instagram?.message} /></div>
          <div><Label>Endereço</Label><Input {...register('address')} error={errors.address?.message} /></div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-base font-bold">Frete e pagamentos</h2>
          <div><Label>Mensagem de envio (topbar)</Label><Input {...register('shippingNote')} error={errors.shippingNote?.message} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Frete grátis a partir de (R$)</Label><Input type="number" {...register('freeShippingThreshold')} error={errors.freeShippingThreshold?.message} /></div>
            <div><Label>Desconto Pix (%)</Label><Input type="number" {...register('pixDiscountPercent')} error={errors.pixDiscountPercent?.message} /></div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Button type="submit" size="lg">
            <Save className="h-4 w-4" /> Salvar configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
