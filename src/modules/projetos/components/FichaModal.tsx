import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import {
  AnimatePresence,
  motion,
  useVariantesDePainel,
  type Variants,
} from '@/shared/animation/motion';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';
import { ConteudoFicha } from './ConteudoFicha';

/**
 * A ficha de projeto em modal flutuante — ADR-0033, substitui o acordeão
 * inline da ADR-0032.
 *
 * Precedente seguido de propósito: o estado "expandido" do
 * `Terminal.tsx` (easter eggs) já é exatamente isto — painel central,
 * fundo escurecido clicável, `aria-modal`, trap de foco, Esc. Não
 * reinventamos o padrão, só aplicamos ao mesmo corpo que a rota
 * `/projetos/:slug` usa (`ConteudoFicha`).
 *
 * Cinco coisas aqui voltam a quebrar se alguém "simplificar":
 *
 * 1. MONTADO UMA VEZ, EM `ListaProjetos`, NUNCA POR CARD. A condição de
 *    abrir/fechar (`{projeto && <motion.div>}`) fica DENTRO deste
 *    componente, que por sua vez fica SEMPRE montado no pai. Mover a
 *    condição para o pai (renderizar `<FichaModal>` só quando há projeto)
 *    faz a saída sumir em silêncio — o erro mais comum do `AnimatePresence`
 *    (ADR-0029).
 * 2. SEM `ScrollTrigger.refresh()`. O modal é `fixed`, nunca muda a altura
 *    do documento — ao contrário do card que crescia no lugar na
 *    ADR-0032, não há Trigger para desalinhar.
 * 3. O fundo é `<button>`, não `<div onClick>`: clique precisa de
 *    equivalente de teclado, e aqui o equivalente é o Esc — mas o alvo de
 *    clique em si também precisa ser alcançável, e só um elemento
 *    interativo nativo garante isso sem reinventar semântica.
 * 4. NÃO TRAVA O SCROLL DA PÁGINA COM `overflow: hidden`. Foi tentado e
 *    revertido: `--text-titulo`/`--text-secao` (tokens.css) usam `vw` no
 *    `clamp()`, e cada vez que o `overflow` do body alterna, a barra de
 *    rolagem some/aparece, o `vw` efetivo muda, e o texto do site inteiro
 *    "pulsa" de tamanho. O fundo clicável já impede interagir com o que
 *    está atrás; rolar por trás do modal aberto é um custo aceito.
 * 5. SEM `.glitch-painel` AQUI DENTRO. A ADR-0032 usava esse overlay (com
 *    `@keyframes ... infinite`) na abertura/fechamento do card, escondido
 *    via variantes invertidas da Motion enquanto parado. Foi tentado aqui
 *    e removido: sem poder testar visualmente, não dá para confirmar
 *    que a propagação de variantes (painel → span, sem `initial`/`animate`
 *    próprios no span) realmente deixa o overlay em opacidade 0 quando o
 *    modal está parado — e se não deixar, os `@keyframes infinite` ficam
 *    piscando pra sempre com o modal aberto. Reintroduzir isso exige
 *    `initial`/`animate`/`exit` explícitos no span (não propagação) e
 *    confirmação visual de que fica invisível parado.
 */
interface FichaModalProps {
  /** `null` = fechado. */
  projeto: Project | null;
  onFechar: () => void;
}

/** O que conta como parada de Tab dentro do painel — igual ao `Terminal`. */
const FOCAVEIS = 'button, input, a[href], [tabindex]:not([tabindex="-1"])';

/** Fade simples do fundo — variantes independentes das do painel. */
const VARIANTES_FUNDO: Variants = {
  oculto: { opacity: 0 },
  visivel: { opacity: 1 },
};

export function FichaModal({ projeto, onFechar }: FichaModalProps) {
  const painel = useRef<HTMLDivElement>(null);
  const animacao = useVariantesDePainel();

  const aberto = projeto !== null;
  const idDoTitulo = projeto ? `ficha-modal-${projeto.slug}-titulo` : undefined;

  // Esc fecha sempre; Tab circula dentro do painel.
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onFechar();
        return;
      }

      if (evento.key !== 'Tab' || !painel.current) return;

      const paradas = [...painel.current.querySelectorAll<HTMLElement>(FOCAVEIS)];
      const primeira = paradas[0];
      const ultima = paradas[paradas.length - 1];
      if (!primeira || !ultima) return;

      const atual = document.activeElement;
      const fora = !painel.current.contains(atual);

      if (evento.shiftKey && (atual === primeira || fora)) {
        evento.preventDefault();
        ultima.focus();
      } else if (!evento.shiftKey && (atual === ultima || fora)) {
        evento.preventDefault();
        primeira.focus();
      }
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  return (
    <AnimatePresence>
      {projeto && (
        <div
          key={projeto.slug}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label={copy.projetos.fecharFicha}
            onClick={onFechar}
            initial="oculto"
            animate="visivel"
            exit="oculto"
            variants={VARIANTES_FUNDO}
            transition={animacao.transition}
            className="absolute inset-0 bg-base/80 backdrop-blur-sm"
          />

          <motion.div
            ref={painel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={idDoTitulo}
            variants={animacao.variants}
            initial="oculto"
            animate="visivel"
            exit="oculto"
            transition={animacao.transition}
            className="hud-panel relative flex max-h-[85vh] w-[min(40rem,100%)] flex-col gap-4 overflow-y-auto bg-panel p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={idDoTitulo} className="font-display text-secao text-primary">
                {projeto.name}
              </h2>

              <button
                type="button"
                onClick={onFechar}
                aria-label={copy.projetos.fecharFicha}
                className="shrink-0 text-muted transition-colors hover:text-accent"
              >
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <ConteudoFicha projeto={projeto} comLinkDaRota />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
