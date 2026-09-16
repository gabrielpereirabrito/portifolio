import {
  Atom,
  Code,
  Database,
  FileTs,
  GitBranch,
  Lightning,
  Palette,
  Shield,
  Sparkle,
  Terminal,
  Sword,
  Cloud,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

/**
 * Ícone de tecnologia — ADR-0004.
 *
 * O registro abaixo é a fonte da verdade, e `TechIconId` é derivado dele.
 * É isso que transforma um erro de digitação em `stats[].icon` em erro de
 * compilação, em vez de um quadrado vazio na ficha (ADR-0024, decisão 1).
 *
 * Importação nominal, nunca o pacote inteiro — importar tudo infla o
 * bundle sem ninguém perceber (ADR-0020, regra 8).
 */
const REGISTRO = {
  react: Atom,
  typescript: FileTs,
  node: Lightning,
  postgres: Database,
  git: GitBranch,
  css: Palette,
  codigo: Code,
  terminal: Terminal,
  cloud: Cloud,
  // Temáticos de RPG — entram como SVG próprio quando forem desenhados.
  espada: Sword,
  escudo: Shield,
  magia: Sparkle,
  // Novas tecnologias
  javascript: Code,
  nextjs: Atom,
  mysql: Database,
  golang: Code,
  python: Code,
  docker: Cloud,
} satisfies Record<string, Icon>;

export type TechIconId = keyof typeof REGISTRO;

interface TechIconProps {
  id: TechIconId;
  /** Rótulo acessível. Omitir marca o ícone como decorativo. */
  rotulo?: string;
  tamanho?: number;
  className?: string;
}

export function TechIcon({ id, rotulo, tamanho = 18, className }: TechIconProps) {
  const Componente = REGISTRO[id];

  // Ícone ao lado de um texto que já diz a mesma coisa é decorativo: sem
  // rótulo ele sai da árvore de acessibilidade em vez de virar repetição.
  return (
    <Componente
      size={tamanho}
      weight="bold"
      className={className}
      aria-hidden={rotulo ? undefined : 'true'}
      aria-label={rotulo}
      role={rotulo ? 'img' : undefined}
    />
  );
}
