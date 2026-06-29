import { useState } from 'react';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import type { Category } from '@/types';
import { useSEO } from '@/utils/seo';

export default function Categories() {
  useSEO('Admin Categorias');
  const { categories, addCategory, updateCategory, removeCategory } = useAdminDataStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  function openNew() {
    setEditing({
      id: 'cat-' + Date.now(),
      slug: '',
      name: '',
      description: '',
      showInMenu: true,
      showInHome: true,
      order: categories.length + 1,
    });
  }

  function save() {
    if (!editing) return;
    if (!editing.name) {
      toast.error('Informe o nome');
      return;
    }
    const payload = { ...editing, slug: editing.slug || slugify(editing.name, { lower: true, strict: true }) };
    if (categories.find((c) => c.id === payload.id)) {
      updateCategory(payload.id, payload);
      toast.success('Categoria atualizada');
    } else {
      addCategory(payload);
      toast.success('Categoria criada');
    }
    // Mantém o modal aberto após salvar; o usuário fecha em "Concluir".
    setEditing(payload);
  }

  function remove(id: string) {
    removeCategory(id);
    toast.success('Categoria removida');
    setConfirm(null);
  }

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-sm text-ink-mute">{categories.length} categoria(s)</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Menu</th>
              <th className="px-4 py-3">Home</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-bg-soft/50">
                <td className="px-4 py-3 font-semibold">
                  {c.name}
                  {c.isSeasonal && <span className="ml-2 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">SAZONAL</span>}
                </td>
                <td className="px-4 py-3 text-ink-mute">/{c.slug}</td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={c.showInMenu}
                    onChange={(e) => updateCategory(c.id, { showInMenu: e.target.checked })}
                    className="accent-ink"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={c.showInHome}
                    onChange={(e) => updateCategory(c.id, { showInHome: e.target.checked })}
                    className="accent-ink"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-ink-mute hover:bg-ink/5 hover:text-ink"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setConfirm(c.id)} className="rounded-lg p-1.5 text-ink-mute hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id && categories.find((c) => c.id === editing.id) ? 'Editar categoria' : 'Nova categoria'} maxWidth="max-w-lg">
        {editing && (
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <Label>Slug (opcional)</Label>
              <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Imagem da categoria (opcional)</Label>
              <ImageUploader
                value={editing.image ?? ''}
                onChange={(next) => setEditing({ ...editing, image: next })}
                hint="Aparece no card da categoria na home. Sem imagem, usa o estilo de cor padrão."
              />
            </div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.showInMenu} onChange={(e) => setEditing({ ...editing, showInMenu: e.target.checked })} className="accent-ink" />
                Mostrar no menu
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.showInHome} onChange={(e) => setEditing({ ...editing, showInHome: e.target.checked })} className="accent-ink" />
                Mostrar na home
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Fechar</Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Remover categoria?">
        <p className="text-sm text-ink-mute">Os produtos associados não serão removidos.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => confirm && remove(confirm)}>Remover</Button>
        </div>
      </Modal>
    </div>
  );
}
