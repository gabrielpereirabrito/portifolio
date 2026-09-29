import { useEffect, useRef } from 'react';
import { Panel, CloudImage, StarRating, TechIcon } from '@/shared/ui';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Ficha de personagem — o card de projeto do DECISOES-TECNICAS seção 3.
 *
 * Desde a ADR-0033, o card NÃO CRESCE MAIS: ele só abre o `FichaModal`
 * (montado uma vez em `ListaProjetos`). É por isso que ele voltou a usar
 * `Panel` em vez de `motion.article` — sem `layout` para animar, não há
 * motivo para ser um nó da Motion.
 *
 * O título continua sendo BOTÃO, não link: o `<Link>` para
 * `/projetos/:slug` vive dentro do modal aberto, como "abrir em página
 * própria" — um alvo de clique por vez no card (herdado da ADR-0032).
 */
interface FichaCardProps {
  projeto: Project;
  /** O modal deste projeto está aberto no momento — só destaque visual. */
  aberto: boolean;
  onAbrir: () => void;
}

export function FichaCard({ projeto, aberto, onAbrir }: FichaCardProps) {
  const { name, difficulty, stats, description, cover } = projeto;
  const botao = useRef<HTMLButtonElement>(null);
  const eraAberto = useRef(aberto);

  // Devolve o foco ao próprio botão quando o modal deste card acabou de
  // fechar — seja por Esc, clique no fundo ou no X, não só pelo botão
  // daqui. Ninguém além do card sabe qual botão é "o dele".
  useEffect(() => {
    if (eraAberto.current && !aberto) botao.current?.focus();
    eraAberto.current = aberto;
  }, [aberto]);

  return (
    <Panel
      as="article"
      variante={aberto ? 'aceso' : 'padrao'}
      className="group flex flex-col gap-4"
    >
      <CloudImage
        publicId={cover}
        alt={`Captura de tela do projeto ${name}`}
        proporcao="16/9"
      />

      <h3 className="font-display text-secao text-primary">
        <button
          ref={botao}
          type="button"
          onClick={onAbrir}
          aria-haspopup="dialog"
          aria-label={`${copy.projetos.verFicha}: ${name}`}
          // O `::after` estende a área de clique sobre o painel inteiro.
          className="text-left after:absolute after:inset-0 after:content-['']"
        >
          {name}
        </button>
      </h3>

      <StarRating nivel={difficulty} rotulo={copy.projetos.dificuldade} />

      <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted">
        {stats.map((stat) => (
          <li key={stat.label} className="flex items-center gap-1.5">
            <TechIcon id={stat.icon} className="text-accent" />
            {stat.label}
          </li>
        ))}
      </ul>

      <p className="text-sm leading-[var(--leading-corpo)] text-muted">{description}</p>

      <span
        aria-hidden="true"
        className="mt-auto font-mono text-xs text-accent opacity-0 transition-opacity duration-[var(--duracao-media)] group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {copy.projetos.verFicha} →
      </span>
    </Panel>
  );
}
