/**
 * Catálogo de easter eggs — DECISOES-TECNICAS seção 5.
 *
 * Lista central, e por isso mora aqui e não espalhada nos componentes:
 * cada egg tem um id, uma forma de ser encontrado e uma recompensa, e o
 * toast, o analytics (ADR-0022) e a store (ADR-0011) leem todos deste
 * mesmo lugar. Acrescentar um egg é acrescentar uma entrada.
 *
 * `as const` não é detalhe: é ele que faz `EggId` ser união fechada
 * derivada da lista, do mesmo jeito que `TechIconId` é derivado do
 * registro de ícones (ADR-0024, decisão 1). Um `unlock('konam')` vira
 * erro de compilação em vez de um achievement que nunca dispara.
 *
 * `gatilho` e `recompensa` são texto de vitrine, não instrução: eles
 * aparecem no toast e no comando `achievements` do terminal. Descrevem o
 * que a pessoa acabou de fazer — nunca ensinam o que ainda falta fazer,
 * senão deixa de ser segredo.
 */
export interface EasterEgg {
  id: string;
  /** Vai no título do toast, em caixa alta na tela. */
  titulo: string;
  /** Uma linha, no corpo do toast. */
  recompensa: string;
}

export const easterEggs = [
  {
    id: 'konami',
    titulo: 'MODO GHOST',
    recompensa: 'Uma camada abaixo da interface: fósforo sobre preto.',
  },
  {
    id: 'terminal',
    titulo: 'ACESSO CONCEDIDO',
    recompensa: 'sudo hire-me executado com sucesso.',
  },
  {
    id: 'fim-da-pagina',
    titulo: 'EXPLORADOR',
    recompensa: 'Você leu até o fim. Pouca gente chega aqui.',
  },
  {
    id: 'clique-insistente',
    titulo: 'INSISTENTE',
    recompensa: 'Cinco cliques no mesmo ícone. Ele não faz nada — mas você tentou.',
  },
  {
    id: 'tempo-na-pagina',
    titulo: 'RESIDENTE',
    recompensa: 'Dois minutos de tela acesa por aqui.',
  },
] as const satisfies readonly EasterEgg[];

/** União fechada derivada da lista acima. Não escrever à mão. */
export type EggId = (typeof easterEggs)[number]['id'];
