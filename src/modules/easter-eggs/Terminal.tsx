import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  TerminalWindow,
  X,
} from '@phosphor-icons/react';
import type { Attribute, Profile } from '@/data/types';
import type { EasterEgg } from '@/data/easterEggs';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useVariantesDePainel,
} from '@/shared/animation/motion';
import { copy } from '@/i18n';
import { useEasterEggs } from './store';
import { ATALHOS, executarComando } from './comandos';

/**
 * Terminal falso — DECISOES-TECNICAS seção 5, ADR-0019, ADR-0023 e
 * ADR-0029.
 *
 * Ele tem DOIS tamanhos, e o pequeno é o padrão:
 *
 * - **No canto**, discreto, do tamanho de um widget. É como ele abre, e
 *   nesse formato não cobre nada: o site continua clicável e legível por
 *   trás, então `role="dialog"` **sem** `aria-modal` e sem prender foco —
 *   um trap aqui mentiria sobre o que está inerte.
 * - **Expandido**, no centro da tela, sobre fundo escurecido, para quando
 *   a saída de um comando merece espaço. Aqui ele cobre o conteúdo, e
 *   cobrir sem assumir é o pior dos dois mundos: no expandido entram
 *   `aria-modal`, o foco preso e o clique no fundo que fecha.
 *
 * É o MESMO nó nos dois estados — muda o alinhamento do container e o
 * tamanho do painel. Isso não é economia de código: é o que permite ao
 * `layout` da Motion animar a viagem de um formato ao outro, em vez de
 * um sumir e o outro aparecer (ADR-0029).
 *
 * A saída animada é o outro motivo de a Motion existir aqui:
 * `AnimatePresence` segura o componente montado até a animação terminar.
 * Com GSAP isso seria um segundo estado de "fechando", sincronizado à mão
 * com o do React.
 *
 * Os botões de atalho não são enfeite: em touch, digitar `sudo hire-me`
 * com o teclado virtual cobrindo metade da tela é um trabalho que ninguém
 * faz por curiosidade (ADR-0023) — e é no expandido que eles sobem junto
 * com o painel, em vez de ficarem embaixo do teclado.
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
  /**
   * Estado local, e não na store: é preferência de visualização desta
   * sessão, não progresso do visitante. A store persiste o que foi
   * descoberto (ADR-0011) — o tamanho do painel não tem nada que fazer
   * no `localStorage`. Sobrevive a fechar e reabrir porque o componente
   * continua montado; some no refresh, e está certo.
   */
  const [expandido, setExpandido] = useState(false);

  const painel = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const botaoDeAbrir = useRef<HTMLButtonElement>(null);
  const saida = useRef<HTMLDivElement>(null);
  const proximoId = useRef(0);

  const animacao = useVariantesDePainel();
  const movimentoReduzido = useReducedMotion();

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
   * Esc fecha sempre; Tab só circula quando o painel está expandido.
   *
   * O trap é a contrapartida honesta do `aria-modal`, e por isso segue o
   * mesmo interruptor: se o resto do site está anunciado como inerte, o
   * Tab não pode passear por ele. No formato de canto nada está inerte —
   * prender o foco ali prenderia quem só tropeçou no botão.
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

      if (evento.key !== 'Tab' || !expandido || !painel.current) return;

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
  }, [aberto, expandido, setAberto]);

  // A saída cresce para baixo, como num terminal de verdade. Roda também
  // ao trocar de tamanho: a altura muda, e o que estava à vista sairia de
  // vista sem isto.
  useEffect(() => {
    const elemento = saida.current;
    if (elemento) elemento.scrollTop = elemento.scrollHeight;
  }, [linhas, expandido]);

  const Expandir = expandido ? ArrowsInSimple : ArrowsOutSimple;
  const rotuloDoTamanho = expandido
    ? copy.eggs.terminal.recolher
    : copy.eggs.terminal.expandir;

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
            className={`fixed inset-0 z-[60] flex p-4 ${
              expandido
                ? 'items-center justify-center'
                : // `pb-20` deixa o painel POUSAR acima do botão que o
                  // abriu, em vez de cobri-lo. `pointer-events-none` no
                  // container é o que mantém o site clicável por trás —
                  // ele ocupa a tela inteira só para posicionar.
                  'pointer-events-none items-end justify-end pb-20'
            }`}
          >
            {/* Fundo clicável, só no expandido — é ele que torna o painel
                modal. É um <button> e não uma <div> com onClick porque
                clique precisa de equivalente de teclado, e aqui ele tem: o
                Esc. Fora da ordem de tabulação para não virar uma parada
                muda antes do painel. */}
            <AnimatePresence>
              {expandido && (
                <motion.button
                  key="fundo"
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
              )}
            </AnimatePresence>

            <motion.div
              ref={painel}
              role="dialog"
              // `aria-modal` acompanha o tamanho: só o expandido cobre o
              // conteúdo, e só ele pode dizer que o resto está inerte.
              aria-modal={expandido || undefined}
              aria-label={copy.eggs.terminal.titulo}
              // `layout` anima a viagem entre os dois formatos — o mesmo
              // nó muda de tamanho e de canto, e a Motion interpola a
              // caixa. Desligado com movimento reduzido: aí o painel
              // troca de formato de uma vez, sem viagem (ADR-0019).
              layout={!movimentoReduzido}
              variants={animacao.variants}
              initial="oculto"
              animate="visivel"
              exit="oculto"
              transition={animacao.transition}
              className={`hud-panel pointer-events-auto relative flex flex-col gap-4 bg-panel font-mono text-sm ${
                expandido
                  ? 'h-[min(34rem,80vh)] w-[min(46rem,100%)] p-5 sm:p-6'
                  : 'h-[min(22rem,60vh)] w-[min(24rem,100%)] p-4'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs tracking-[0.3em] text-muted uppercase">
                  {copy.eggs.terminal.titulo}
                </h2>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandido(!expandido)}
                    aria-label={rotuloDoTamanho}
                    title={rotuloDoTamanho}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    <Expandir size={18} weight="bold" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={fechar}
                    aria-label={copy.eggs.terminal.fechar}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    <X size={18} weight="bold" aria-hidden="true" />
                  </button>
                </div>
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
