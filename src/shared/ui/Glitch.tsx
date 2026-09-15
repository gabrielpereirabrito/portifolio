import type { ElementType } from 'react';

/**
 * Texto com glitch — DECISOES-TECNICAS 4.1.
 *
 * O efeito vive no CSS (efeitos.css), não no GSAP: é decorativo,
 * contínuo e não se sincroniza com nada, então roda no compositor e
 * desliga sozinho com prefers-reduced-motion (ADR-0012, fronteira com
 * CSS).
 *
 * O texto é duplicado em `data-texto` para os pseudo-elementos, mas as
 * cópias são puramente visuais: o texto real continua sendo o filho, e é
 * o único que o leitor de tela encontra.
 */
interface GlitchProps {
  texto: string;
  as?: ElementType;
  className?: string;
}

export function Glitch({ texto, as: Tag = 'span', className = '' }: GlitchProps) {
  return (
    <Tag data-texto={texto} className={`glitch ${className}`}>
      {texto}
    </Tag>
  );
}
