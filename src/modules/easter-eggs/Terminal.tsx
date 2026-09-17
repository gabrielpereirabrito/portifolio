import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { TerminalWindow, X } from '@phosphor-icons/react';
import type { Attribute, Profile } from '@/data/types';
import type { EasterEgg } from '@/data/easterEggs';
import { copy } from '@/i18n';
import { useEasterEggs } from './store';
import { ATALHOS, executarComando } from './comandos';

/**
 * Terminal falso — DECISOES-TECNICAS seção 5, ADR-0019 e ADR-0023.
 *
 * Três decisões que não são óbvias no código:
 *
 * 1. **Não é modal.** É um painel de canto: o site continua clicável e
 *    continua legível para quem usa leitor de tela. Por isso `role="dialog"`
 *    SEM `aria-modal`, e sem prender o foco — um trap aqui mentiria sobre o
 *    que está inerte e prenderia quem só tropeçou no botão.
 * 2. **O foco é gerenciado mesmo assim** (ADR-0019): abrir leva o foco ao
 *    campo, fechar devolve ao botão que abriu. Sem isso, fechar o painel
 *    joga o foco para o começo do documento.
 * 3. **Os botões de atalho não são enfeite.** Em touch, digitar
 *    `sudo hire-me` com o teclado virtual cobrindo metade da tela é um
 *    trabalho que ninguém faz por curiosidade — o ADR-0023 os torna o
 *    caminho principal ali, e eles continuam úteis no desktop.
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

export function Terminal({ perfil, atributos, catalogo }: TerminalProps) {
  const aberto = useEasterEggs((s) => s.terminalAberto);
  const setAberto = useEasterEggs((s) => s.setTerminalAberto);
  const unlock = useEasterEggs((s) => s.unlock);
  const desbloqueados = useEasterEggs((s) => s.desbloqueados);

  const [entrada, setEntrada] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([]);

  const campo = useRef<HTMLInputElement>(null);
  const botaoDeAbrir = useRef<HTMLButtonElement>(null);
  const saida = useRef<HTMLDivElement>(null);
  const proximoId = useRef(0);

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
    if (resposta.fechar) fechar();
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

  // Esc fecha de qualquer lugar (ADR-0019). No `window` e não no painel: o
  // foco pode estar no campo, num botão de atalho, ou em lugar nenhum
  // depois de um clique no corpo do painel.
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return;
      setAberto(false);
      botaoDeAbrir.current?.focus();
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

      {aberto && (
        <div
          role="dialog"
          aria-label={copy.eggs.terminal.titulo}
          className="hud-panel fixed right-4 bottom-20 z-[60] flex max-h-[min(60vh,28rem)] w-[min(28rem,calc(100vw-2rem))] flex-col gap-3 bg-panel p-4 font-mono text-sm"
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
              <X size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {/* A saída é anunciada, nunca gritada: `polite` espera o leitor
              terminar a frase atual (ADR-0019, compromisso 4). */}
          <div
            ref={saida}
            aria-live="polite"
            aria-label={copy.eggs.terminal.saida}
            className="flex-1 overflow-y-auto whitespace-pre-wrap text-terminal"
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
            className="flex items-center gap-2 border-t border-hud pt-3"
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
        </div>
      )}
    </>
  );
}
