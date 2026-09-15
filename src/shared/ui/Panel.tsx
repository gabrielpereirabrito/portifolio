import type { ElementType, ReactNode } from 'react';

/**
 * Painel — a moldura de HUD que é a base visual de quase tudo no site.
 *
 * O canto cortado é feito com clip-path em vez de borda arredondada: é o
 * que dá a leitura de "interface de máquina" em vez de card de aplicativo.
 * A borda luminosa é um pseudo-elemento, não box-shadow, porque
 * box-shadow animado força repintura e o ADR-0020 (regra 1) proíbe.
 */
interface PanelProps {
  children: ReactNode;
  /** `section`, `article`, `li`… O padrão é `div`. */
  as?: ElementType;
  /** Intensidade da borda. `aceso` marca o item em foco ou destacado. */
  variante?: 'padrao' | 'aceso';
  className?: string;
}

export function Panel({
  children,
  as: Tag = 'div',
  variante = 'padrao',
  className = '',
}: PanelProps) {
  return (
    <Tag
      data-variante={variante}
      className={`hud-panel relative bg-panel p-5 ${className}`}
    >
      {children}
    </Tag>
  );
}
