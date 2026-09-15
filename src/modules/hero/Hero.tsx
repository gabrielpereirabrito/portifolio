import { useRef } from 'react';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';
import { Glitch } from '@/shared/ui';
import type { Profile } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Hero — a primeira dobra.
 *
 * É o LCP do site (ADR-0020), então nada aqui pode depender de rede: só
 * texto, com a Orbitron precarregada pelo plugin de build. Nenhuma imagem.
 */
interface HeroProps {
  perfil: Profile;
}

export function Hero({ perfil }: HeroProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      mm.add(MOVIMENTO_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-hero="nome"]', { y: 30, opacity: 0, duration: 0.9 })
          .from('[data-hero="cargo"]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
          .from('[data-hero="bio"]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.45')
          .from('[data-hero="rolar"]', { opacity: 0, duration: 0.6 }, '-=0.3');
      });

      // Sem animação, tudo já nasce no estado final. Nunca invisível
      // (ADR-0019, compromisso 2).
      mm.add(MOVIMENTO_REDUZIDO, () => {
        gsap.set('[data-hero]', { y: 0, opacity: 1 });
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="flex min-h-[90vh] flex-col justify-center gap-6 px-6 py-24 sm:px-10"
    >
      <h1
        data-hero="nome"
        className="font-display text-display leading-[1.05] text-primary"
      >
        <Glitch texto={perfil.name} />
      </h1>

      <p
        data-hero="cargo"
        className="font-mono text-sm tracking-[0.3em] text-accent uppercase"
      >
        {perfil.title}
      </p>

      <p
        data-hero="bio"
        className="max-w-prose text-lg leading-[var(--leading-corpo)] text-muted"
      >
        {perfil.bio}
      </p>

      <p
        data-hero="rolar"
        aria-hidden="true"
        className="mt-8 font-mono text-xs tracking-[0.2em] text-muted"
      >
        ▼ {copy.hero.rolar}
      </p>
    </section>
  );
}
