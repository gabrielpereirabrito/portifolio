import { useEffect } from 'react';
import { Trophy, X } from '@phosphor-icons/react';
import type { EasterEgg } from '@/data/easterEggs';
import { AnimatePresence, motion, useVariantesDePainel } from '@/shared/animation/motion';
import { copy } from '@/i18n';
import { useEasterEggs } from './store';

/**
 * Toast de conquista — ADR-0019 (compromisso 4) e ADR-0029.
 *
 * `role="status"` com `aria-live="polite"` é o par que o ADR pede:
 * anunciado, não gritado. Quem estiver lendo a bio quando o egg dispara
 * ouve o aviso ao terminar a frase, e não por cima dela — `assertive`
 * atropelaria.
 *
 * Um de cada vez, da fila da store: dois toasts empilhados em região viva
 * viram uma frase só, sem pausa, e o leitor de tela lê os dois colados.
 * Some sozinho, mas tem botão de dispensar — quem usa teclado não deveria
 * precisar esperar o tempo passar.
 *
 * A saída é animada porque agora dá: antes ele desaparecia de um quadro
 * para o outro, já que animar desmontagem sem `AnimatePresence` custava
 * uma máquina de estados inteira. Esse era um dos dois casos que
 * motivaram o ADR-0029.
 *
 * O texto vem do catálogo em `data/easterEggs`, não daqui: este
 * componente não sabe o que existe, só como anunciar.
 */
interface ToastConquistaProps {
  catalogo: readonly EasterEgg[];
}

/** Longo o bastante para ler duas linhas sem pressa. */
const DURACAO_MS = 6000;

export function ToastConquista({ catalogo }: ToastConquistaProps) {
  const fila = useEasterEggs((s) => s.fila);
  const consumirDaFila = useEasterEggs((s) => s.consumirDaFila);

  const animacao = useVariantesDePainel();

  const id = fila[0];
  // Id que saiu do catálogo entre duas visitas não tem o que anunciar —
  // ver a nota do `merge` na store (ADR-0026).
  const egg = id ? catalogo.find((item) => item.id === id) : undefined;

  useEffect(() => {
    if (!id) return;

    // Descartar o id órfão também: sem isto ele travaria a fila e os
    // toasts seguintes nunca apareceriam.
    const relogio = window.setTimeout(consumirDaFila, egg ? DURACAO_MS : 0);
    return () => window.clearTimeout(relogio);
  }, [id, egg, consumirDaFila]);

  return (
    // A região vive fora da condição: criada só quando o toast aparece,
    // ela nasce junto com o conteúdo e o leitor de tela costuma não
    // anunciar nada. Vazia desde o início, a mudança é percebida.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-4 left-1/2 z-[60] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2"
    >
      <AnimatePresence>
        {egg && (
          <motion.div
            key={egg.id}
            variants={animacao.variants}
            initial="oculto"
            animate="visivel"
            exit="oculto"
            transition={animacao.transition}
            className="hud-panel pointer-events-auto relative flex items-start gap-3 bg-panel p-4"
          >
            <Trophy
              size={22}
              weight="fill"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-ouro"
            />

            <div className="flex flex-col gap-1">
              <p className="font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
                {copy.eggs.conquista}
              </p>
              <p className="font-display text-sm text-accent">{egg.titulo}</p>
              <p className="text-sm text-muted">{egg.recompensa}</p>
            </div>

            <button
              type="button"
              onClick={consumirDaFila}
              aria-label={copy.eggs.fecharToast}
              className="ml-auto shrink-0 text-muted transition-colors hover:text-accent"
            >
              <X size={16} weight="bold" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
