/**
 * Dificuldade de 1 a 5 — ADR-0007.
 *
 * Acessibilidade (ADR-0019): as estrelas são decorativas e ficam fora da
 * árvore de acessibilidade; quem usa leitor de tela recebe a frase, não
 * cinco repetições de "estrela". Sem isso, um card de projeto vira um
 * ruído de símbolos.
 */
interface StarRatingProps {
  /** Escala fechada de propósito — o tipo impede um 7 acidental. */
  nivel: 1 | 2 | 3 | 4 | 5;
  /** O que a escala mede, para o texto lido em voz alta. */
  rotulo?: string;
}

const TOTAL = 5;

export function StarRating({ nivel, rotulo = 'Dificuldade' }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="font-mono text-sm tracking-[0.25em]">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span key={i} className={i < nivel ? 'text-ouro' : 'text-hud'}>
            {i < nivel ? '★' : '☆'}
          </span>
        ))}
      </span>
      <span className="sr-only">{`${rotulo}: ${nivel} de ${TOTAL}`}</span>
    </span>
  );
}
