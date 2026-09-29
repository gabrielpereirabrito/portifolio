import {
  motion,
  useReducedMotion,
  TRANSICAO_HUD,
  type Variants,
} from '@/shared/animation/motion';

/**
 * Dificuldade de 1 a 5 — ADR-0007.
 *
 * Acessibilidade (ADR-0019): as estrelas são decorativas e ficam fora da
 * árvore de acessibilidade; quem usa leitor de tela recebe a frase, não
 * cinco repetições de "estrela". Sem isso, um card de projeto vira um
 * ruído de símbolos.
 *
 * A rolagem de dado (`animada`, ADR-0032) é puramente decorativa por
 * consequência disso: ela mexe em glifos que já são `aria-hidden`, e a
 * frase `sr-only` está pronta desde o primeiro quadro. É por isso que
 * animar a opacidade delas não cai no "acessível e vazio" — não há
 * informação escondida atrás do movimento.
 */
interface StarRatingProps {
  /** Escala fechada de propósito — o tipo impede um 7 acidental. */
  nivel: 1 | 2 | 3 | 4 | 5;
  /** O que a escala mede, para o texto lido em voz alta. */
  rotulo?: string;
  /**
   * As estrelas preenchidas entram uma a uma, como um dado rolando.
   *
   * Opcional e desligado por padrão: na listagem fechada e na vitrine a
   * dificuldade é informação de relance, não um momento. Ela vira momento
   * quando a ficha ABRE (ADR-0032).
   */
  animada?: boolean;
}

const TOTAL = 5;

/**
 * O escalonamento mora no PAI, que é como a Motion orquestra: o filho só
 * declara de onde vem.
 */
const VARIANTES_GRUPO: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.09 } },
};

/**
 * `rotate` junto com `scale` é o que faz ler como dado caindo em vez de
 * estrela crescendo. Só `transform` e `opacity` (ADR-0020, regra 1).
 */
const VARIANTES_ESTRELA: Variants = {
  oculto: { opacity: 0, scale: 0.4, rotate: -40 },
  visivel: { opacity: 1, scale: 1, rotate: 0 },
};

/**
 * Sem animação e com movimento reduzido caem no MESMO caminho: variantes
 * com as mesmas chaves, todas no estado final. Um caminho de render só —
 * não existe a versão "sem Motion" que ninguém testa.
 */
const VARIANTES_NEUTRAS: Variants = {
  oculto: { opacity: 1, scale: 1, rotate: 0 },
  visivel: { opacity: 1, scale: 1, rotate: 0 },
};

export function StarRating({
  nivel,
  rotulo = 'Dificuldade',
  animada = false,
}: StarRatingProps) {
  const reduzido = useReducedMotion();
  const rolando = animada && !reduzido;

  return (
    <span className="inline-flex items-center gap-2">
      <motion.span
        aria-hidden="true"
        variants={rolando ? VARIANTES_GRUPO : undefined}
        initial="oculto"
        animate="visivel"
        className="font-mono text-sm tracking-[0.25em]"
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const preenchida = i < nivel;

          return (
            <motion.span
              key={i}
              // A estrela VAZIA não rola: ela é o lugar onde a preenchida
              // vai cair, e precisa estar lá antes.
              variants={rolando && preenchida ? VARIANTES_ESTRELA : VARIANTES_NEUTRAS}
              transition={rolando ? TRANSICAO_HUD : { duration: 0 }}
              className={`inline-block ${preenchida ? 'text-ouro' : 'text-hud'}`}
            >
              {preenchida ? '★' : '☆'}
            </motion.span>
          );
        })}
      </motion.span>
      <span className="sr-only">{`${rotulo}: ${nivel} de ${TOTAL}`}</span>
    </span>
  );
}
