import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = `${title} — 3DCommerce`;
    document.title = fullTitle;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}

/**
 * Injeta um bloco JSON-LD (`<script type="application/ld+json">`) no head e
 * remove ao desmontar. O conteúdo é serializado via `JSON.stringify` (seguro:
 * sem interpolação de HTML). Passe `null` para não injetar nada.
 */
export function useJsonLd(data: Record<string, unknown> | null) {
  const json = data ? JSON.stringify(data) : null;
  useEffect(() => {
    if (!json) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = json;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [json]);
}
