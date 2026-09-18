import { useRef } from 'react';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';
import { Glitch } from '@/shared/ui';
import type { Profile, Retrato } from '@/data/types';
import { copy } from '@/i18n';
import { CartaProtagonista } from './CartaProtagonista';
import { FundoParticulas } from './FundoParticulas';

/**
 * Hero — a primeira dobra.
 *
 * **Sobre a imagem aqui (ADR-0030):** até 2026-09-17 este hero era só
 * texto, para nada nele depender de rede. A regra mudou, mas o motivo
 * dela não: o retrato entra **atrás do título na fila** — sem `preload`,
 * sem `fetchpriority`, com dimensão reservada pelo `CloudImage` — e o LCP
 * continua sendo o `<h1>`, que chega com o HTML junto da Orbitron
 * precarregada. Marcar a imagem como prioritária desfaz isso em silêncio.
 *
 * O fundo de partículas (ADR-0031) é decoração que, na maior parte das
 * visitas, nem é baixada: a guarda de capacidade vive no bootstrap, e em
 * celular sobra o gradiente de `.fundo-hero`.
 */
interface HeroProps {
  perfil: Profile;
  retratos: Retrato[];
}

export function Hero({ perfil, retratos }: HeroProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      mm.add(MOVIMENTO_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-hero="nome"]', { y: 30, opacity: 0, duration: 0.9 })
          .from('[data-hero="cargo"]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
          .from('[data-hero="bio"]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.45')
          // A carta entra por último e sem `y`: ela é o único elemento com
          // imagem, e deslocá-la seria animar layout em cima de algo que
          // ainda pode estar carregando.
          .from('[data-hero="carta"]', { opacity: 0, duration: 0.8 }, '-=0.5')
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
    // `tabIndex={-1}` nas quatro secoes: quando o rodape rola ate uma delas
    // por JS (vindo de outra rota), e so com isto que da para levar o FOCO
    // junto. A ancora nativa ja faz sozinha — isto iguala os dois caminhos
    // (ADR-0019, ADR-0027).
    <section
      ref={container}
      id="inicio"
      tabIndex={-1}
      // `relative` e `isolate` são o que prendem o fundo a esta seção: o
      // canvas é `absolute inset-0 -z-10`, e sem o contexto de empilhamento
      // próprio ele passaria por trás do resto da página.
      className="relative isolate flex min-h-[90vh] items-center px-6 py-24 sm:px-10"
    >
      <FundoParticulas />

      <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div className="flex flex-col gap-6">
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
        </div>

        {/* Depois do texto no DOM, e não antes: quem navega por teclado ou
            leitor de tela encontra nome, cargo e bio primeiro — a carta é
            recompensa, não porta de entrada. No desktop a grade a coloca à
            direita; no celular ela cai abaixo, onde não empurra a bio para
            fora da primeira dobra. */}
        <div data-hero="carta" className="lg:justify-self-end">
          <CartaProtagonista perfil={perfil} retratos={retratos} />
        </div>
      </div>
    </section>
  );
}
