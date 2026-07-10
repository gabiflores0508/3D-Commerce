import { useRef, useState } from 'react';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { parseProductsXlsx, type ParsedProductRow, type ParseResult } from '@/utils/productExcel';
import { productService } from '@/services/productService';
import { enumAdapters } from '@/services/adapters';
import { ApiError } from '@/services/api';
import type { Category, Product } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onDone: () => void; // refresh após gravar
}

interface ImportReport {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export function ProductImportModal({ open, onClose, products, categories, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);

  function reset() {
    setResult(null);
    setReport(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function close() {
    reset();
    onClose();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setResult(null);
    setReport(null);
    try {
      const parsed = await parseProductsXlsx(file);
      if (parsed.rows.length === 0) {
        toast.error('A planilha não tem linhas de produto.');
      }
      setResult(parsed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao ler o arquivo.');
    } finally {
      setParsing(false);
    }
  }

  function resolveCategoryId(name?: string): string | null {
    if (!name) return null;
    const c = categories.find((x) => x.name.trim().toLowerCase() === name.trim().toLowerCase());
    return c?.id ?? null;
  }

  async function confirmImport() {
    if (!result) return;
    const valid = result.rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) {
      toast.error('Nenhuma linha válida para importar.');
      return;
    }
    setImporting(true);
    const rep: ImportReport = { created: 0, updated: 0, skipped: 0, errors: [] };

    for (const row of valid) {
      const categoryId = resolveCategoryId(row.data.categoryName);
      if (!categoryId) {
        rep.skipped += 1;
        rep.errors.push(`Linha ${row.line}: categoria "${row.data.categoryName ?? ''}" não encontrada.`);
        continue;
      }
      const slug = (row.data.slug || slugify(row.data.name, { lower: true, strict: true })).slice(0, 160);
      const existing = products.find((p) => p.slug === slug);
      const payload = {
        name: row.data.name,
        slug,
        price: row.data.price,
        promotionalPrice: row.data.promotionalPrice ?? null,
        stock: row.data.stock,
        active: row.data.active,
        featured: row.data.featured,
        material: row.data.material,
        shortDescription: row.data.shortDescription,
        description: row.data.description,
        categoryId,
        purchaseMode: enumAdapters.purchaseModeToApi('direct'),
      };
      try {
        if (existing) {
          await productService.update(existing.id, payload);
          rep.updated += 1;
        } else {
          await productService.create(payload);
          rep.created += 1;
        }
      } catch (err) {
        rep.skipped += 1;
        rep.errors.push(`Linha ${row.line}: ${err instanceof ApiError ? err.message : 'erro ao gravar.'}`);
      }
    }

    setImporting(false);
    setReport(rep);
    onDone();
    toast.success(`Importação: ${rep.created} criados, ${rep.updated} atualizados, ${rep.skipped} ignorados.`);
  }

  const rowsWithErrors: ParsedProductRow[] = result ? result.rows.filter((r) => r.errors.length > 0) : [];

  return (
    <Modal open={open} onClose={close} title="Importar produtos (Excel)" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {!result && !report && (
          <div className="rounded-xl border border-dashed border-ink-line p-6 text-center">
            <FileUp className="mx-auto h-8 w-8 text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">Selecione um arquivo <b>.xlsx</b> (máx. 2 MB).</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFile}
              className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-2 file:text-bg"
            />
            {parsing && <p className="mt-3 text-xs text-ink-mute">Lendo planilha...</p>}
          </div>
        )}

        {result && !report && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-bg-soft p-3">
                <p className="text-lg font-bold">{result.rows.length}</p>
                <p className="text-[11px] uppercase tracking-wide text-ink-mute">Linhas</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-lg font-bold text-emerald-700">{result.validCount}</p>
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">Válidas</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3">
                <p className="text-lg font-bold text-rose-600">{result.errorCount}</p>
                <p className="text-[11px] uppercase tracking-wide text-rose-600">Com erro</p>
              </div>
            </div>

            {rowsWithErrors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-ink-line text-xs">
                {rowsWithErrors.map((r) => (
                  <div key={r.line} className="flex items-start gap-2 border-b border-ink-line/50 px-3 py-2 last:border-0">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span>
                      <b>Linha {r.line}</b> ({r.data.name || 'sem nome'}): {r.errors.join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-ink-mute">
              Produtos com o mesmo <b>slug</b> serão atualizados; os demais serão criados. Linhas com erro são ignoradas.
              Categoria precisa existir (por nome). Imagens não são importadas nesta versão.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={reset}>Trocar arquivo</Button>
              <Button onClick={confirmImport} loading={importing} disabled={result.validCount === 0}>
                Importar {result.validCount} produto(s)
              </Button>
            </div>
          </div>
        )}

        {report && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> <span className="font-semibold">Importação concluída</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-emerald-50 p-3"><p className="text-lg font-bold text-emerald-700">{report.created}</p><p className="text-[11px] uppercase text-emerald-700">Criados</p></div>
              <div className="rounded-lg bg-sky-50 p-3"><p className="text-lg font-bold text-sky-700">{report.updated}</p><p className="text-[11px] uppercase text-sky-700">Atualizados</p></div>
              <div className="rounded-lg bg-ink/5 p-3"><p className="text-lg font-bold text-ink-mute">{report.skipped}</p><p className="text-[11px] uppercase text-ink-mute">Ignorados</p></div>
            </div>
            {report.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-ink-line px-3 py-2 text-xs text-ink-soft">
                {report.errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={reset}>Importar outro</Button>
              <Button onClick={close}>Fechar</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
