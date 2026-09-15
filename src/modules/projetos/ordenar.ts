import type { Project } from '@/data/types';

/**
 * Funcoes puras de ordenacao e filtro — amarra 3 do ADR-0008.
 *
 * Ficam fora do componente de proposito: continuam validas quando o dado
 * vier de uma API, e sao testaveis sem montar nada (ADR-0017).
 *
 * Importar `@/data/types` aqui e so tipo, nao dado — o conteudo continua
 * descendo por props.
 */

/** Destaques primeiro, depois do mais recente para o mais antigo. */
export function ordenarProjetos(projetos: Project[]): Project[] {
  return [...projetos].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}

/** Busca pela chave da rota. `undefined` vira 404 (ADR-0026). */
export function acharPorSlug(projetos: Project[], slug: string | undefined) {
  if (!slug) return undefined;
  return projetos.find((p) => p.slug === slug);
}

/** Toda tecnologia citada, sem repetir — util para SEO e para filtros. */
export function tecnologiasUsadas(projetos: Project[]): string[] {
  const todas = projetos.flatMap((p) => p.stats.map((s) => s.label));
  return [...new Set(todas)].sort();
}
