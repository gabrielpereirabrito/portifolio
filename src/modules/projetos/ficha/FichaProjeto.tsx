import { useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';
import { StarRating, TechIcon, CloudImage, Glitch } from '@/shared/ui';
import { acharPorSlug } from '../ordenar';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Ficha completa — rota /projetos/:slug (ADR-0010).
 *
 * É aqui que a transição "hackeamento" da seção 4.4 faz sentido narrativo:
 * entrar no detalhe de um projeto é o momento em que "carregar dados
 * corrompidos" combina, em vez de ser um efeito aplicado a esmo.
 */
interface FichaProjetoProps {
  projetos: Project[];
}

export function FichaProjeto({ projetos }: FichaProjetoProps) {
  const { slug } = useParams<{ slug: string }>();
  const projeto = acharPorSlug(projetos, slug);
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!projeto) return;

      mm.add(MOVIMENTO_OK, () => {
        // A recomposição "linha por linha": os blocos entram em sequência
        // rápida, como dados sendo reconstruídos.
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.from('[data-bloco]', {
          opacity: 0,
          y: 14,
          duration: 0.45,
          stagger: 0.07,
        });
      });

      mm.add(MOVIMENTO_REDUZIDO, () => {
        gsap.set('[data-bloco]', { opacity: 1, y: 0 });
      });
    },
    { scope: container, dependencies: [projeto] },
  );

  // Slug inexistente cai na 404 temática, nunca em tela branca (ADR-0026).
  if (!projeto) return <Navigate to="/404" replace />;

  const { name, difficulty, stats, description, longDescription, cover, links, year } =
    projeto;

  return (
    <main ref={container} className="mx-auto max-w-3xl px-6 py-20 sm:px-10">
      <Link
        to="/"
        data-bloco
        className="mb-10 inline-block font-mono text-xs text-accent underline underline-offset-4"
      >
        ← {copy.projetos.voltar}
      </Link>

      <h1 data-bloco className="font-display text-titulo text-primary">
        <Glitch texto={name} />
      </h1>

      <div data-bloco className="mt-4 flex flex-wrap items-center gap-4">
        <StarRating nivel={difficulty} rotulo={copy.projetos.dificuldade} />
        {year && <span className="font-mono text-xs text-muted">{year}</span>}
      </div>

      {cover && (
        <div data-bloco className="mt-8">
          <CloudImage
            publicId={cover}
            alt={`Captura de tela do projeto ${name}`}
            proporcao="16/9"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <section data-bloco className="mt-10">
        <h2 className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
          {copy.projetos.stats}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3 font-mono text-sm text-primary">
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-center gap-2">
              <TechIcon id={stat.icon} className="text-accent" />
              {stat.label}
            </li>
          ))}
        </ul>
      </section>

      <div
        data-bloco
        className="mt-10 flex flex-col gap-4 text-lg leading-[var(--leading-corpo)] text-muted"
      >
        <p>{longDescription ?? description}</p>
      </div>

      {(links.demo ?? links.repo) && (
        <nav data-bloco className="mt-10 flex flex-wrap gap-6 font-mono text-sm">
          {links.demo && (
            <a
              href={links.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline underline-offset-4"
            >
              {copy.projetos.verDemo} ↗
            </a>
          )}
          {links.repo && (
            <a
              href={links.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline underline-offset-4"
            >
              {copy.projetos.verRepo} ↗
            </a>
          )}
        </nav>
      )}
    </main>
  );
}
