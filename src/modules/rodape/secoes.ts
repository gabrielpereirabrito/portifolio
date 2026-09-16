import { copy } from '@/i18n';

/**
 * As âncoras do site, em ordem de leitura — ADR-0027.
 *
 * Mora aqui, local ao módulo, e não em `shared/`: hoje existe um consumidor
 * só. Sobe quando um cabeçalho aparecer (ADR-0009, regra 3 — código é
 * promovido, não pré-alocado).
 *
 * Em arquivo separado do componente de propósito: const exportada ao lado de
 * componente em `.tsx` acorda o `react-refresh/only-export-components`.
 *
 * Os rótulos saem dos títulos que as próprias seções já usam, então mudar o
 * <h2> de "Sobre" muda o link do rodapé junto. `inicio` é o único escrito à
 * mão, porque o hero não tem título de seção.
 */
export interface LinkDeSecao {
  /** Precisa casar com o `id` do <section> correspondente. */
  id: string;
  rotulo: string;
}

export const SECOES: readonly LinkDeSecao[] = [
  { id: 'inicio', rotulo: copy.rodape.inicio },
  { id: 'projetos', rotulo: copy.projetos.titulo },
  { id: 'sobre', rotulo: copy.sobre.titulo },
  { id: 'contato', rotulo: copy.contato.titulo },
];
