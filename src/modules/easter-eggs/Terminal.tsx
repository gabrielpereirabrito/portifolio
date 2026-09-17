import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { TerminalWindow, X } from '@phosphor-icons/react';
import type { Attribute, Profile } from '@/data/types';
import type { EasterEgg } from '@/data/easterEggs';
import { AnimatePresence, motion, useVariantesDePainel } from '@/shared/animation/motion';
import { copy } from '@/i18n';
import { useEasterEggs } from './store';
import { ATALHOS, executarComando } from './comandos';

/**
 * Terminal falso — DECISOES-TECNICAS seção 5, ADR-0019, ADR-0023 e
 * ADR-0029.
 *
 * Ele abre no CENTRO da tela, sobre um fundo escurecido, e é modal de
 * verdade. Isso é decisão, não detalhe de layout: um painel largo no meio
 * da tela cobre o conteúdo, e cobrir sem assumir é o pior dos dois mundos
 * — quem enxerga vê um diálogo, quem usa leitor de tela continua
 * navegando por um site que já não está visível. Assumido: `aria-modal`,
 * foco preso enquanto aberto, `Esc` fecha, clique no fundo fecha.
 *
 * A saída animada é o motivo de a Motion existir no projeto (ADR-0029):
 * `AnimatePresence` segura o componente montado até a animação terminar.
 * Com GSAP isso seria um segundo estado de "fechando", sincronizado à mão
 * com o do React.
 *
 * Os botões de atalho não são enfeite: em touch, digitar `sudo hire-me`
 * com o teclado virtual cobrindo metade da tela é um trabalho que ninguém
 * faz por curiosidade (ADR-0023). No centro da tela eles sobem junto com o
 * painel, em vez de ficarem embaixo do teclado virtual — que era o outro
 * problema do painel de canto.
 */
interface TerminalProps {
  perfil: Profile;
  atributos: Attribute[];
  catalogo: readonly EasterEgg[];
}

interface Linha {
  id: number;
  texto: string;
  /** Eco do que foi digitado, com prompt, em vez de só a resposta. */
  eco?: boolean;
}

/** O que conta como parada de Tab dentro do painel. */
const FOCAVEIS = 'button, input, a[href], [tabindex]:not([tabindex="-1"])';

export function Terminal({ perfil, atributos, catalogo }: TerminalProps) {
  const aberto = useEasterEggs((s) => s.terminalAberto);
  const setAberto = useEasterEggs((s) => s.setTerminalAberto);
  const unlock = useEasterEggs((s) => s.unlock);
  const desbloqueados = useEasterEggs((s) => s.desbloqueados);

  const [entrada, setEntrada] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([]);

  const painel = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const botaoDeAbrir = useRef<HTMLButtonElement>(null);
  const saida = useRef<HTMLDivElement>(null);
  const proximoId = useRef(0);

  const animacao = useVariantesDePainel();

  /** Cruza o progresso da store com o catálogo — ver `comandos.ts`. */
  const conquistas = useMemo(
    () =>
      desbloqueados
        .map((id) => catalogo.find((egg) => egg.id === id))
        .filter((egg): egg is EasterEgg => Boolean(egg)),
    [desbloqueados, catalogo],
  );

  function criarLinhas(textos: string[], eco = false): Linha[] {
    return textos.map((texto) => ({ id: proximoId.current++, texto, eco }));
  }

  function fechar() {
    setAberto(false);
    botaoDeAbrir.current?.focus();
  }

  function rodar(comando: string) {
    const resposta = executarComando(comando, {
      perfil,
      atributos,
      desbloqueados: conquistas,
    });

    const novas = [
      ...criarLinhas([`> ${comando}`], true),
      ...criarLinhas(resposta.linhas),
    ];
    setLinhas((atuais) => (resposta.limpar ? [] : [...atuais, ...novas]));

    if (resposta.desbloqueia) unlock(resposta.desbloqueia);
    if (resposta.fechar) {
      fechar();
      return;
    }

    // Depois de um atalho, o cursor volta para onde se digita — senão o
    // foco fica no botão e a próxima tecla não vai a lugar nenhum.
    campo.current?.focus();
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    rodar(entrada);
    setEntrada('');
  }

  // Abrir: boas-vindas uma vez, e o foco no campo. `autoFocus` não serve
  // (é erro de lint, por bons motivos — ADR-0019): o foco só deve se mover
  // porque alguém pediu, e aqui alguém pediu.
  useEffect(() => {
    if (!aberto) return;

    campo.current?.focus();
    setLinhas((atuais) =>
      atuais.length
        ? atuais
        : [{ id: proximoId.current++, texto: copy.eggs.terminal.boasVindas }],
    );
  }, [aberto]);

  /**
   * Esc fecha; Tab circula dentro do painel.
   *
   * O trap é a contrapartida honesta do `aria-modal`: se o resto do site
   * está anunciado como inerte, o Tab não pode passear por ele. Ele nasce
   * com o formato novo — o painel de canto anterior não prendia foco
   * nenhum, e estava certo em não prender.
   *
   * Só interfere nas BORDAS da lista. No meio dela o Tab do navegador já
   * faz a coisa certa, e ele conhece a ordem visual melhor do que
   * qualquer lista montada à mão.
   */
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        setAberto(false);
        botaoDeAbrir.current?.focus();
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
  }, [aberto, setAberto]);

  // A saída cresce para baixo, como num terminal de verdade.
  useEffect(() => {
    const elemento = saida.current;
    if (elemento) elemento.scrollTop = elemento.scrollHeight;
  }, [linhas]);

  return (
    <>
      {/* O botão é o caminho acessível e o único jeito de o terminal ser
          encontrado sem sorte. Acima das scanlines (z-50) para não receber
          a trama por cima do ícone. */}
      <button
        ref={botaoDeAbrir}
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        aria-label={copy.eggs.terminal.abrir}
        className="hud-panel fixed right-4 bottom-4 z-[60] bg-panel p-3 text-muted transition-colors hover:text-accent"
      >
        <TerminalWindow size={20} weight="bold" aria-hidden="true" />
      </button>

      {/* `AnimatePresence` é o que mantém o painel montado durante a saída
          (ADR-0029). A `key` estável e a condição AQUI dentro — não no pai
          — são o que faz isso funcionar; o erro contrário falha calado. */}
      <AnimatePresence>
        {aberto && (
          <div
            key="terminal"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Fundo clicável. É um <button> e não uma <div> com onClick
                porque clique precisa de equivalente de teclado — e aqui ele
                tem: o Esc. Fora da ordem de tabulação para não virar uma
                parada muda antes do painel. */}
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label={copy.eggs.terminal.fechar}
              onClick={fechar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={animacao.transition}
              className="absolute inset-0 bg-base/80 backdrop-blur-sm"
            />

            <motion.div
              ref={painel}
              role="dialog"
              aria-modal="true"
              aria-label={copy.eggs.terminal.titulo}
              variants={animacao.variants}
              initial="oculto"
              animate="visivel"
              exit="oculto"
              transition={animacao.transition}
              className="hud-panel relative flex h-[min(34rem,80vh)] w-[min(46rem,100%)] flex-col gap-4 bg-panel p-5 font-mono text-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs tracking-[0.3em] text-muted uppercase">
                  {copy.eggs.terminal.titulo}
                </h2>
                <button
                  type="button"
                  onClick={fechar}
                  aria-label={copy.eggs.terminal.fechar}
                  className="text-muted transition-colors hover:text-accent"
                >
                  <X size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>

              {/* A saída é anunciada, nunca gritada: `polite` espera o
                  leitor terminar a frase atual (ADR-0019, compromisso 4). */}
              <div
                ref={saida}
                aria-live="polite"
                aria-label={copy.eggs.terminal.saida}
                className="flex-1 overflow-y-auto leading-relaxed whitespace-pre-wrap text-terminal"
              >
                {linhas.map((linha) => (
                  <p key={linha.id} className={linha.eco ? 'text-muted' : undefined}>
                    {linha.texto}
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {ATALHOS.map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => rodar(nome)}
                    className="border border-hud px-2 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {nome}
                  </button>
                ))}
              </div>

              <form
                onSubmit={aoEnviar}
                className="flex items-center gap-2 border-t border-hud pt-4"
              >
                <span aria-hidden="true" className="text-accent">
                  &gt;
                </span>
                <label htmlFor="terminal-entrada" className="sr-only">
                  {copy.eggs.terminal.rotuloEntrada}
                </label>
                <input
                  ref={campo}
                  id="terminal-entrada"
                  value={entrada}
                  onChange={(evento) => setEntrada(evento.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-primary"
                />
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
