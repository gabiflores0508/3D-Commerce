import { cn } from '@/utils/cn';

/**
 * Renderizador de Markdown leve e sem dependências externas.
 *
 * Suporta a sintaxe estilo GitHub mais comum usada nas descrições de produto:
 * - Títulos:        # H1, ## H2, ### H3
 * - Negrito:        **texto**
 * - Itálico:        *texto* ou _texto_
 * - Código inline:  `código`
 * - Links:          [texto](https://...)
 * - Listas:         - item  /  * item  /  1. item
 * - Citações:       > texto
 * - Linha horizontal: ---
 * - Parágrafos e quebras de linha
 *
 * O conteúdo vem do admin (confiável), mas ainda assim escapamos HTML bruto
 * antes de aplicar a formatação, evitando injeção acidental.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Formatação inline aplicada dentro de um trecho já escapado.
function inline(text: string): string {
  return text
    // código inline
    .replace(/`([^`]+)`/g, '<code class="rounded bg-bg-soft px-1.5 py-0.5 text-[0.85em] font-mono text-ink">$1</code>')
    // negrito
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // itálico
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // links [texto](url)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium text-ink underline underline-offset-2 hover:text-ink-soft">$1</a>',
    );
}

function toHtml(md: string): string {
  const lines = escapeHtml(md.replace(/\r\n/g, '\n')).split('\n');
  const out: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // linha em branco -> separa blocos
    if (line.trim() === '') {
      closeList();
      continue;
    }

    // linha horizontal
    if (/^---+$/.test(line.trim())) {
      closeList();
      out.push('<hr class="my-5 border-ink-line" />');
      continue;
    }

    // títulos
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const sizes = { 1: 'text-xl font-bold mt-5 mb-2', 2: 'text-lg font-bold mt-4 mb-2', 3: 'text-base font-semibold mt-3 mb-1.5' } as const;
      out.push(`<h${level} class="${sizes[level as 1 | 2 | 3]} text-ink">${inline(heading[2])}</h${level}>`);
      continue;
    }

    // citação
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      closeList();
      out.push(`<blockquote class="my-2 border-l-2 border-ink-line pl-3 italic text-ink-mute">${inline(quote[1])}</blockquote>`);
      continue;
    }

    // lista não ordenada
    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul class="my-2 list-disc space-y-1 pl-5">');
        listType = 'ul';
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    // lista ordenada
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol class="my-2 list-decimal space-y-1 pl-5">');
        listType = 'ol';
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    // parágrafo
    closeList();
    out.push(`<p class="my-2 leading-relaxed">${inline(line)}</p>`);
  }

  closeList();
  return out.join('\n');
}

interface Props {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: Props) {
  return (
    <div
      className={cn('text-sm text-ink-soft', className)}
      dangerouslySetInnerHTML={{ __html: toHtml(content ?? '') }}
    />
  );
}
