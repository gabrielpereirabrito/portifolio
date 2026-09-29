import { useRef, useState } from 'react';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';
import { FichaCard } from './components/FichaCard';
import { FichaModal } from './components/FichaModal';
import { ordenarProjetos } from './ordenar';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Listagem dos projetos — ADR-0033.
 *
 * O estado de "qual ficha está aberta" mora aqui e não em cada card,
 * porque só um `FichaModal` é montado (não um por card) e ele precisa
 * saber qual projeto mostrar.
 *
 * Diferente da ADR-0032 (substituída): o modal é `fixed`, não faz o card
 * crescer nem empurra os vizinhos, então não há mais disputa de
 * `transform` entre GSAP e Motion a documentar aqui — o `ScrollTrigger` de
 * entrada em `[data-ficha]` é a única animação deste componente.
 */
interface ListaProjetosProps {
  projetos: Project[];
}

export function ListaProjetos({ projetos }: ListaProjetosProps) {
  const container = useRef<HTMLElement>(null);
  const [slugAberto, setSlugAberto] = useState<string | null>(null);
  const ordenados = ordenarProjetos(projetos);
  const projetoAberto = ordenados.find((projeto) => projeto.slug === slugAberto) ?? null;

  useGSAP(
    () => {
      mm.add(MOVIMENTO_OK, () => {
        gsap.from('[data-ficha]', {
          y: 32,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: container.current, start: 'top 75%' },
        });
      });

      mm.add(MOVIMENTO_REDUZIDO, () => {
        gsap.set('[data-ficha]', { y: 0, opacity: 1 });
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} id="projetos" tabIndex={-1} className="px-6 py-24 sm:px-10">
      <header className="mb-10 flex flex-col gap-2">
        <h2 className="font-display text-titulo text-accent">{copy.projetos.titulo}</h2>
        <p className="font-mono text-xs tracking-[0.2em] text-muted">
          {copy.projetos.subtitulo}
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ordenados.map((projeto) => (
          <li key={projeto.id} data-ficha>
            <FichaCard
              projeto={projeto}
              aberto={projeto.slug === slugAberto}
              onAbrir={() => setSlugAberto(projeto.slug)}
            />
          </li>
        ))}
      </ul>

      <FichaModal projeto={projetoAberto} onFechar={() => setSlugAberto(null)} />
    </section>
  );
}
