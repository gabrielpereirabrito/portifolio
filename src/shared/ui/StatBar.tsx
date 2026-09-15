import { useRef } from 'react';
import {
  gsap,
  useGSAP,
  mm,
  MOVIMENTO_OK,
  MOVIMENTO_REDUZIDO,
} from '@/shared/animation/gsap';

/**
 * Barra de atributo — HP, MP, XP da ficha de personagem.
 *
 * Usada tanto pelos stats de projeto quanto pelos atributos do perfil
 * (ADR-0024), que compartilham a mesma escala 1–5 de propósito: uma
 * escala só no site inteiro significa que as barras querem dizer a mesma
 * coisa em todo lugar.
 */
type Stat = 'hp' | 'mp' | 'xp' | 'ouro';

interface StatBarProps {
  rotulo: string;
  nivel: 1 | 2 | 3 | 4 | 5;
  stat?: Stat;
}

const COR: Record<Stat, string> = {
  hp: 'bg-hp',
  mp: 'bg-mp',
  xp: 'bg-xp',
  ouro: 'bg-ouro',
};

const MAX = 5;

export function StatBar({ rotulo, nivel, stat = 'mp' }: StatBarProps) {
  const container = useRef<HTMLDivElement>(null);
  const porcentagem = (nivel / MAX) * 100;

  useGSAP(
    () => {
      // A barra preenche quando entra na tela. Animar scaleX e não width:
      // width força layout a cada frame (ADR-0020, regra 1).
      mm.add(MOVIMENTO_OK, () => {
        gsap.from('[data-preenchimento]', {
          scaleX: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: container.current, start: 'top 85%' },
        });
      });

      // Sem animação, a barra já nasce cheia — nunca vazia (ADR-0019).
      mm.add(MOVIMENTO_REDUZIDO, () => {
        gsap.set('[data-preenchimento]', { scaleX: 1 });
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-primary">{rotulo}</span>
        <span className="text-muted" aria-hidden="true">
          {nivel}/{MAX}
        </span>
      </div>

      <div
        role="meter"
        aria-valuenow={nivel}
        aria-valuemin={1}
        aria-valuemax={MAX}
        aria-label={`${rotulo}: ${nivel} de ${MAX}`}
        className="h-1.5 w-full overflow-hidden bg-hud"
      >
        <div
          data-preenchimento
          className={`h-full origin-left ${COR[stat]}`}
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  );
}
