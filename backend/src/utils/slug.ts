/**
 * Gera um slug URL-safe a partir de uma string qualquer.
 * - Remove acentos (NFD + \p{Mn}).
 * - Lowercase.
 * - Substitui runs de caracteres não-alfanuméricos por hífen.
 * - Colapsa hífens duplos.
 * - Retorna "item" se resultado for vazio (evita slugs vazios no banco).
 */
export function slugify(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'item';
}

/**
 * Gera um slug único, chamando o predicate `exists` até encontrar um livre.
 * Sufixa `-2`, `-3`, ... caso o base já esteja em uso.
 *
 * @param base            Texto original (ex.: nome do produto).
 * @param exists          Função que retorna true se o slug já existe.
 * @param ignoreSelf      Slug do próprio registro em edição (para não colidir consigo).
 */
export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  ignoreSelf?: string,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let i = 2;
  // Limite alto de segurança para evitar loop infinito em caso de bug.
  while (i < 1000) {
    if (candidate === ignoreSelf) return candidate;
    const taken = await exists(candidate);
    if (!taken) return candidate;
    candidate = `${root}-${i}`;
    i++;
  }
  throw new Error(`Não foi possível gerar slug único para "${base}"`);
}
