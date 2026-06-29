import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Altura recolhida em px. Acima disso, mostra "Ver mais". */
  collapsedHeight?: number;
}

/**
 * Recolhe conteúdo longo e exibe "Ver mais / Ver menos".
 * O botão só aparece quando o conteúdo realmente ultrapassa a altura recolhida.
 */
export function Collapsible({ children, collapsedHeight = 220 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > collapsedHeight + 8);
    check();
    // Reavalia em resize (o texto reflui e muda de altura).
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, collapsedHeight]);

  const collapsed = overflowing && !expanded;

  return (
    <div>
      <div
        ref={ref}
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: collapsed ? collapsedHeight : ref.current?.scrollHeight ?? 'none' }}
      >
        {children}
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-card to-transparent" />
        )}
      </div>

      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink transition hover:text-ink-soft"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
