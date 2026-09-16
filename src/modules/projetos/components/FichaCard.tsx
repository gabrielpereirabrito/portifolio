import { Link } from 'react-router-dom';
import { Panel, StarRating, TechIcon, CloudImage } from '@/shared/ui';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Ficha de personagem — o card de projeto do DECISOES-TECNICAS seção 3.
 *
 * O card inteiro é clicável, mas o link de verdade é só o título: assim o
 * leitor de tela anuncia um destino, não um bloco de texto inteiro como
 * link. O `::after` do título estende a área de clique sobre o painel
 * (ADR-0019).
 */
interface FichaCardProps {
  projeto: Project;
}

export function FichaCard({ projeto }: FichaCardProps) {
  const { slug, name, difficulty, stats, description, cover } = projeto;

  return (
    <Panel as="article" className="group flex flex-col gap-4">
      {cover && (
        <CloudImage
          publicId={cover}
          alt={`Captura de tela do projeto ${name}`}
          proporcao="16/9"
        />
      )}

      <h3 className="font-display text-secao text-primary">
        <Link
          to={`/projetos/${slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {name}
        </Link>
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
