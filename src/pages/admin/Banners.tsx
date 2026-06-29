import { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import type { Banner } from '@/types';
import { useSEO } from '@/utils/seo';

export default function Banners() {
  useSEO('Admin Banners');
  const { banners, addBanner, updateBanner, removeBanner } = useAdminDataStore();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  function openNew() {
    setEditing({
      id: 'ban-' + Date.now(),
      title: '',
      subtitle: '',
      ctaLabel: '',
      ctaLink: '',
      image: '',
      position: 'hero',
      active: true,
      order: banners.length + 1,
      bgFrom: '#0F1115',
      bgTo: '#22D3EE',
    });
  }

  function save() {
    if (!editing) return;
    if (banners.find((b) => b.id === editing.id)) {
      updateBanner(editing.id, editing);
      toast.success('Banner atualizado');
    } else {
      addBanner(editing);
      toast.success('Banner criado');
    }
    setEditing(null);
  }

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-ink-mute">{banners.length} banner(s)</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo banner
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div
              className="aspect-[2.5/1] p-5 text-bg"
              style={{ background: `linear-gradient(135deg, ${b.bgFrom ?? '#0F1115'}, ${b.bgTo ?? '#22D3EE'})` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-bg/70">{b.position}</p>
              <h3 className="mt-2 text-lg font-bold">{b.title}</h3>
              {b.subtitle && <p className="mt-1 text-xs text-bg/80">{b.subtitle}</p>}
              {b.ctaLabel && <p className="mt-3 inline-block rounded-md bg-bg px-2 py-1 text-[10px] font-bold text-ink">{b.ctaLabel}</p>}
            </div>
            <div className="flex items-center justify-between p-3 text-xs">
              <span className={`inline-flex items-center gap-1 ${b.active ? 'text-emerald-600' : 'text-ink-mute'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${b.active ? 'bg-emerald-500' : 'bg-ink-mute'}`} />
                {b.active ? 'Ativo' : 'Inativo'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => updateBanner(b.id, { active: !b.active })} className="rounded-lg px-2 py-1 text-ink-soft hover:bg-ink/5">
                  {b.active ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => setEditing(b)} className="rounded-lg p-1.5 text-ink-mute hover:bg-ink/5"><Edit className="h-4 w-4" /></button>
                <button onClick={() => setConfirm(b.id)} className="rounded-lg p-1.5 text-ink-mute hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Banner" maxWidth="max-w-xl">
        {editing && (
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Textarea value={editing.subtitle ?? ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CTA Label</Label>
                <Input value={editing.ctaLabel ?? ''} onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })} />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input value={editing.ctaLink ?? ''} onChange={(e) => setEditing({ ...editing, ctaLink: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Posição</Label>
                <Select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value as Banner['position'] })}>
                  <option value="hero">Hero</option>
                  <option value="filamentos">Filamentos</option>
                  <option value="impressoras">Impressoras</option>
                  <option value="sazonal">Sazonal</option>
                </Select>
              </div>
              <div>
                <Label>Cor de</Label>
                <Input type="color" value={editing.bgFrom ?? '#0F1115'} onChange={(e) => setEditing({ ...editing, bgFrom: e.target.value })} />
              </div>
              <div>
                <Label>Cor até</Label>
                <Input type="color" value={editing.bgTo ?? '#22D3EE'} onChange={(e) => setEditing({ ...editing, bgTo: e.target.value })} />
              </div>
            </div>
            <div className="rounded-xl border border-ink-line p-3">
              <ImageUploader
                label="Imagem do banner (opcional)"
                value={editing.image}
                onChange={(v) => setEditing({ ...editing, image: v })}
                hint="Sobrepõe o gradiente quando preenchida. Upload demonstrativo, salvo no navegador."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="accent-ink" />
              Ativo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Remover banner?">
        <p className="text-sm text-ink-mute">Essa ação é permanente.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => { if (confirm) { removeBanner(confirm); toast.success('Banner removido'); setConfirm(null); } }}>Remover</Button>
        </div>
      </Modal>
    </div>
  );
}
