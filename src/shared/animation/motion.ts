/**
 * Bootstrap da Motion — ADR-0029.
 *
 * REGRA, igual à do GSAP (ADR-0012): nada no projeto importa `motion` do
 * pacote direto. Tudo importa daqui. Aqui não há plugin a registrar, mas
 * há o que importa mais — as curvas e durações do site em um lugar só, e
 * o interruptor de movimento reduzido ao lado delas, onde é difícil
 * esquecer que existe.
 *
 * A fronteira com o GSAP está tabelada no ADR-0029, e em uma linha:
 * **Motion anima o que nasce e morre com o componente; GSAP anima
 * timeline e scroll; CSS anima o que é contínuo e decorativo.**
 */
import { AnimatePresence, LazyMotion, m, useReducedMotion } from 'motion/react';
import type { Transition, Variants } from 'motion/react';

/**
 * A mesma assinatura de movimento do resto do site.
 *
 * Os números são os dos tokens (`--ease-hud`, `--duracao-media`), em
 * segundos e em array de bézier, que é a forma que a Motion entende. Não
 * dá para ler a custom property daqui sem consultar o CSSOM a cada
 * animação — então o lugar de verdade continua sendo `tokens.css`, e
 * estas constantes são a cópia declarada, com a obrigação de mudarem
 * junto.
 */
export const EASE_HUD = [0.2, 0.8, 0.2, 1] as const;

export const DURACAO_RAPIDA = 0.18;
export const DURACAO_MEDIA = 0.32;

export const TRANSICAO_HUD: Transition = {
  duration: DURACAO_MEDIA,
  ease: EASE_HUD,
};

/**
 * Entrada e saída padrão de painel de HUD: sobe um pouco, ganha corpo.
 *
 * `scale` começa perto de 1 de propósito — o painel liga como uma tela
 * velha acordando, não como um balão inflando.
 */
export const VARIANTES_PAINEL: Variants = {
  oculto: { opacity: 0, scale: 0.96, y: 8 },
  visivel: { opacity: 1, scale: 1, y: 0 },
};

/**
 * Movimento reduzido, do lado da Motion (ADR-0019, compromisso 2).
 *
 * Devolve as variantes NEUTRAS quando a preferência é reduzir: mesmas
 * chaves, todas no estado final. É isso que garante que o conteúdo
 * apareça inteiro em vez de ficar preso em `opacity: 0` — a falha do
 * "acessível e vazio".
 *
 * Neutralizar as variantes, e não pular o `<motion.div>`, mantém um
 * caminho de render só: o componente não precisa saber se há movimento,
 * e não existe a versão "sem animação" que ninguém testa.
 */
const VARIANTES_NEUTRAS: Variants = {
  oculto: { opacity: 1, scale: 1, y: 0 },
  visivel: { opacity: 1, scale: 1, y: 0 },
};

export function useVariantesDePainel(): {
  variants: Variants;
  transition: Transition;
} {
  const reduzido = useReducedMotion();

  return {
    variants: reduzido ? VARIANTES_NEUTRAS : VARIANTES_PAINEL,
    // Duração zero em vez de `transition: none`: a Motion ainda precisa
    // de uma transição para resolver a saída e desmontar o elemento.
    transition: reduzido ? { duration: 0 } : TRANSICAO_HUD,
  };
}

/**
 * Carrega os recursos da Motion fora do caminho crítico.
 *
 * Medido: importar a API completa custou **+44 KB gzip** no bundle
 * inicial — o dobro do estimado, e perto demais do teto de 200 do
 * ADR-0020 para um site cujo primeiro acesso costuma ser num celular.
 * Com `LazyMotion` + `m`, o inicial leva só o componente, e o resto
 * chega no primeiro uso.
 *
 * O que isso custa: a primeira animação da sessão pode perder alguns
 * quadros enquanto o pedaço carrega. Todas elas são de entrada de painel
 * — nenhuma carrega informação, e nenhuma acontece antes de um clique.
 */
export const carregarRecursos = () => import('./motionFeatures').then((m) => m.default);

/**
 * `m` no lugar de `motion`: mesma API, sem os recursos embutidos. O
 * projeto inteiro escreve `motion.div`, e quem resolve o que isso sabe
 * fazer é o `<LazyMotion>` montado uma vez na raiz dos componentes
 * animados.
 */
export { AnimatePresence, LazyMotion, m as motion, useReducedMotion };
export type { Transition, Variants };
