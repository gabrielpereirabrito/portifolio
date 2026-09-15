import { useRef } from 'react';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';

/**
 * Home — casca da frente 03. Serve por ora para provar que o padrão de
 * animação do ADR-0012 está de pé.
 */
export function Home() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Escopo por ref: os seletores abaixo só enxergam o que está
      // dentro deste container, nunca outra seção da página.
      mm.add(MOVIMENTO_OK, () => {
        gsap.from('[data-anim="entrada"]', {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
        });
      });

      // A contraparte obrigatória: com movimento reduzido o conteúdo vai
      // para o estado FINAL, não fica invisível (ADR-0019 compromisso 2).
      mm.add(MOVIMENTO_REDUZIDO, () => {
        gsap.set('[data-anim="entrada"]', { y: 0, opacity: 1 });
      });
    },
    { scope: container },
  );

  return (
    <>
      <a href="#conteudo" className="skip-link">
        pular para o conteúdo
      </a>

      <main id="conteudo" ref={container} className="min-h-screen px-6 py-24">
        <h1 data-anim="entrada" className="font-display text-4xl text-accent">
          Portfolio
        </h1>
        <p data-anim="entrada" className="mt-4 max-w-prose text-muted">
          Fundação de pé. Hero, projetos, sobre e contato entram na frente 03.
        </p>
        <pre data-anim="entrada" className="mt-8 font-mono text-sm text-terminal">
          {'> sistema operacional'}
        </pre>
      </main>
    </>
  );
}
