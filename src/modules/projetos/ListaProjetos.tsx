import { useRef } from 'react';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';
import { FichaCard } from './components/FichaCard';
import { ordenarProjetos } from './ordenar';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';

interface ListaProjetosProps {
  projetos: Project[];
}

export function ListaProjetos({ projetos }: ListaProjetosProps) {
  const container = useRef<HTMLElement>(null);
  const ordenados = ordenarProjetos(projetos);

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
            <FichaCard projeto={projeto} />
          </li>
        ))}
      </ul>
    </section>
  );
}
