import { useEffect, useRef, useState } from 'react';
import type { Profile, Retrato } from '@/data/types';
import { CloudImage, Panel, StarRating } from '@/shared/ui';
import { motion, useReducedMotion } from '@/shared/animation/motion';
import { copy } from '@/i18n';
import { proximoIndice } from './rodizio';

/**
 * Carta do protagonista — ADR-0030, DECISOES-TECNICAS 3.2.
 *
 * A frente é sempre a mesma foto (`perfil.avatar`); o clique vira, e o
 * VERSO é que roda — cada virada mostra a próxima persona. Depois de 3
 * segundos ela volta sozinha para a foto real.
 *
 * Duas coisas aqui não são detalhe de estilo e não devem ser
 * "simplificadas" depois:
 *
 * 1. **As faces dividem a mesma célula de grade**, em vez de uma delas
 *    ser `absolute`. Com `absolute`, a altura do contêiner passaria a
 *    depender de qual face está visível, e o hero saltaria no meio do
 *    giro — o CLS que o ADR-0020 cobra, na primeira dobra, que é onde ele
 *    mais pesa.
 * 2. **A imagem não tem prioridade de rede.** `CloudImage` nasce com
 *    `loading="lazy"` e sem `fetchpriority`, e é assim que fica: quem
 *    chega primeiro é o título, que é o LCP. Marcar o retrato como
 *    prioritário "para aparecer mais rápido" é exatamente a regressão que
 *    o ADR-0030 existe para impedir.
 */
interface CartaProtagonistaProps {
  perfil: Profile;
  retratos: Retrato[];
}

/** Quanto tempo a carta fica virada. */
const TEMPO_VIRADA_MS = 3000;

/** Meia volta, em graus. */
const MEIA_VOLTA = 180;

export function CartaProtagonista({ perfil, retratos }: CartaProtagonistaProps) {
  const [virada, setVirada] = useState(false);
  const [indice, setIndice] = useState(0);
  /**
   * O que a região viva fala. Começa **vazio**, e é isso que importa:
   * região viva que nasce já preenchida costuma não ser anunciada, porque
   * o leitor de tela a considera parte do conteúdo inicial (mesma lição
   * do toast de conquista).
   */
  const [anuncio, setAnuncio] = useState('');

  /**
   * Guarda contra avançar a carta sem ninguém ter clicado.
   *
   * `initial={false}` já deveria impedir qualquer animação na montagem, e
   * portanto qualquer `onAnimationComplete` — mas confiar nisso significa
   * que, se a lib decidir disparar o callback uma vez ao montar, a
   * primeira virada pula a primeira carta. O sintoma seria "a carta que
   * nunca aparece", e não há erro para ajudar a achar.
   */
  const jaVirou = useRef(false);

  const semMovimento = useReducedMotion();
  const carta = retratos[indice];

  const transicao = semMovimento
    ? { duration: 0 }
    : { duration: 0.6, ease: 'easeInOut' as const };

  /**
   * Um timer só, e ele é o dono da volta.
   *
   * Nasce quando a carta vira e morre com ela. Clique durante a virada
   * não chega aqui (o handler ignora), então nunca há dois timers
   * correndo — a corrida clássica, que faz a carta voltar na hora errada
   * e só aparece com clique rápido.
   *
   * A limpeza no retorno não é formalidade: trocar de rota no meio dos
   * três segundos tentaria atualizar estado de componente desmontado, e o
   * aviso apareceria longe da causa.
   */
  useEffect(() => {
    if (!virada) return;

    const relogio = window.setTimeout(() => {
      setVirada(false);
      setAnuncio(copy.hero.anunciarRetrato);
    }, TEMPO_VIRADA_MS);

    return () => window.clearTimeout(relogio);
  }, [virada]);

  /**
   * A próxima carta entra quando o giro de volta TERMINA — não quando ele
   * começa.
   *
   * Trocar junto com o `setVirada(false)` parece equivalente e não é: no
   * início da volta a face de trás ainda está de frente para quem olha, e
   * só some ao cruzar os 90°. A troca ali aparecia na tela — a arte
   * seguinte girando para fora, no finalzinho da animação.
   *
   * `onAnimationComplete` em vez de um segundo `setTimeout` casado com a
   * duração: dois relógios que precisam concordar sempre acabam
   * discordando quando alguém muda a duração e esquece o outro.
   */
  function aoTerminarOGiro() {
    if (virada || !jaVirou.current) return;
    setIndice((atual) => proximoIndice(atual, retratos.length));
  }

  // Sem foto ou sem carta nenhuma em `data/`, o hero fica com o texto que
  // já tinha — nada de moldura vazia ocupando a primeira dobra.
  if (!carta || !perfil.avatar) return null;

  function virar() {
    if (virada || !carta) return;

    jaVirou.current = true;
    setVirada(true);
    setAnuncio(
      copy.hero.anunciarCarta
        .replace('{classe}', carta.classe)
        .replace('{nivel}', String(carta.nivel)),
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={virar}
        aria-label={copy.hero.virarCarta}
        aria-pressed={virada}
        className="grid w-[min(20rem,100%)] [perspective:1000px]"
      >
        {/* As duas faces na MESMA célula — ver a nota 1 no topo. */}
        <motion.div
          className="col-start-1 row-start-1 [backface-visibility:hidden]"
          initial={false}
          animate={{ rotateY: virada ? MEIA_VOLTA : 0 }}
          transition={transicao}
        >
          <Panel>
            <CloudImage
              publicId={perfil.avatar}
              alt={`${perfil.name}, ${perfil.title}`}
              proporcao="3/4"
              sizes="(max-width: 1024px) 80vw, 20rem"
            />
          </Panel>
        </motion.div>

        <motion.div
          className="col-start-1 row-start-1 [backface-visibility:hidden]"
          initial={false}
          animate={{ rotateY: virada ? 0 : -MEIA_VOLTA }}
          transition={transicao}
          onAnimationComplete={aoTerminarOGiro}
          // `backface-visibility` esconde o pixel, não a árvore de
          // acessibilidade: sem isto, o leitor de tela leria as duas faces
          // ao mesmo tempo, a escondida inclusive.
          aria-hidden={!virada}
        >
          <Panel variante="aceso" className="relative">
            <CloudImage
              publicId={carta.publicId}
              alt={carta.alt}
              proporcao="3/4"
              sizes="(max-width: 1024px) 80vw, 20rem"
            />

            {/* A faixa de ficha, por cima da arte. O gradiente não é
                enfeite: ele garante o contraste do texto sobre qualquer
                foto — sem ele, a legibilidade dependeria da imagem que
                alguém subiu (ADR-0019, compromisso 1). */}
            <div className="absolute inset-x-5 bottom-5 flex flex-col gap-1 bg-gradient-to-t from-base via-base/90 to-transparent p-3 pt-10 text-left">
              <p className="font-display text-sm text-primary">{perfil.name}</p>
              <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
                {carta.classe}
              </p>
              <StarRating nivel={carta.nivel} rotulo={carta.classe} />
            </div>
          </Panel>
        </motion.div>
      </button>

      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>

      <p
        aria-hidden="true"
        className="font-mono text-[0.65rem] tracking-[0.2em] text-muted"
      >
        {copy.hero.virarCarta}
      </p>
    </div>
  );
}
