import type { TechIconId } from '@/shared/ui';

/**
 * Modelo de conteúdo — ADR-0024.
 *
 * Estes tipos são o contrato. Hoje o dado vem de arquivos ao lado; quando
 * existir uma API (ADR-0008), ela devolve exatamente estas formas e nenhum
 * componente precisa mudar.
 *
 * Três decisões estão embutidas aqui e valem ser lidas antes de mexer:
 *
 * 1. `TechIconId` é união fechada, derivada do registro de ícones. Um typo
 *    vira erro de compilação em vez de um quadrado vazio na ficha.
 * 2. `difficulty` e `level` usam a MESMA escala 1–5. Uma escala só no site
 *    inteiro significa que as estrelas querem dizer a mesma coisa em todo
 *    lugar.
 * 3. Datas são string 'AAAA-MM', não Date. O conteúdo é escrito à mão;
 *    Date traria fuso horário e serialização para um problema que é só
 *    exibição.
 */

/** Escala única do site. Fechada de propósito — impede um 7 acidental. */
export type Nivel = 1 | 2 | 3 | 4 | 5;

export interface TechStat {
  label: string;
  icon: TechIconId;
}

export interface Project {
  id: string;
  /** Chave da rota /projetos/:slug (ADR-0010). Precisa ser único. */
  slug: string;
  name: string;
  difficulty: Nivel;
  stats: TechStat[];
  /** Curta, para o card da listagem. */
  description: string;
  /** Para a ficha completa. */
  longDescription?: string;
  /** publicId do Cloudinary, sem extensão (ADR-0014). */
  cover?: string;
  links: { demo?: string; repo?: string };
  year?: number;
  /** Sobe na ordenação da home. */
  featured?: boolean;
}

/** "Atributos do personagem" — as habilidades, em linguagem de RPG. */
export interface Attribute {
  label: string;
  level: Nivel;
  category: 'frontend' | 'backend' | 'infra' | 'ferramentas';
  icon: TechIconId;
}

/** "Histórico de campanha" — a trajetória profissional. */
export interface TimelineEntry {
  id: string;
  role: string;
  org: string;
  /** 'AAAA-MM' */
  start: string;
  /** 'AAAA-MM' ou o literal 'atual' — evita null com significado implícito. */
  end: string | 'atual';
  summary: string;
  highlights?: string[];
}

/**
 * "Carta de protagonista" — o VERSO do retrato do hero (ADR-0030).
 *
 * A frente é sempre a mesma: `Profile.avatar`, a foto real. O que muda a
 * cada virada é isto aqui — a persona, com a foto estilizada e a piada de
 * RPG. Daí serem entidades separadas: a foto real é uma só e identifica a
 * pessoa; as cartas são várias e rodam.
 *
 * Não é um campo de `Profile` de propósito: `Profile` é singular por
 * decisão do ADR-0008, e um array de entidades com dados próprios dentro
 * dele é o começo do modelo que aquele ADR mandou não construir.
 */
export interface Retrato {
  id: string;
  /** publicId do Cloudinary, em `portfolio/perfil/` (ADR-0014). */
  publicId: string;
  /** Descreve a FOTO desta carta. A frente tem o seu próprio. */
  alt: string;
  /** A piada de RPG: "Arquiteto de Sistemas", "Domador de Legado"… */
  classe: string;
  /** Mesma escala 1–5 do site inteiro — ver a decisão 2 acima. */
  nivel: Nivel;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  location?: string;
  /**
   * publicId do Cloudinary — a foto real, e a FRENTE do retrato do hero
   * (ADR-0030). É para ela que a carta sempre volta.
   */
  avatar?: string;
  /** PDF em public/, com nome estável. */
  resumeUrl: string;
  social: { github: string; linkedin: string; email: string };
}
