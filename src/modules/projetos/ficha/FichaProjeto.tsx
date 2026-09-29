import { useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';
import { Glitch } from '@/shared/ui';
import { acharPorSlug } from '../ordenar';
import { ConteudoFicha } from '../components/ConteudoFicha';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Ficha completa — rota /projetos/:slug (ADR-0010).
 *
 * É aqui que a transição "hackeamento" da seção 4.4 faz sentido narrativo:
 * entrar no detalhe de um projeto é o momento em que "carregar dados
 * corrompidos" combina, em vez de ser um efeito aplicado a esmo.
 *
 * O CORPO da ficha não mora aqui: ele é o `ConteudoFicha`, o mesmo que o card
 * da home abre no lugar (ADR-0032). O que esta rota acrescenta é a moldura —
 * o `<h1>` com glitch, a saída para a home e a recomposição escalonada. É por
 * isso que o conteúdo dos dois lugares não pode sair de sincronia: ele existe
 * uma vez só.
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
        <Glitch texto={projeto.name} />
      </h1>

      {/* Um `data-bloco` só para o corpo inteiro: o escalonamento fino de
          imagem, stats e texto era feito quando eles eram irmãos aqui. Agora
          eles são de outro componente, e alcançá-los por seletor daqui seria
          o acoplamento que o ADR-0009 evita. A recomposição continua: título,
          volta e corpo entram em sequência. */}
      <div data-bloco className="mt-8">
        <ConteudoFicha projeto={projeto} />
      </div>
    </main>
  );
}
