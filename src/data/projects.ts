import type { Project } from './types';

/**
 * CONTEÚDO DE EXEMPLO — trocar pelos projetos reais.
 *
 * Ao adicionar um projeto:
 * - `slug` precisa ser único (é a rota) e não deveria mudar depois de
 *   publicado, senão links compartilhados quebram.
 * - `cover` é o publicId no Cloudinary, sem extensão, na convenção
 *   `portfolio/projetos/<slug>/capa` (ADR-0014). Sem ele, o card mostra o
 *   placeholder temático — não quebra.
 * - `difficulty` é a sua avaliação do desafio, não tempo gasto (ADR-0007).
 *   Vale manter pelo menos um projeto na faixa baixa: se tudo é 4 ou 5, a
 *   escala deixa de dizer alguma coisa.
 */
export const projetos: Project[] = [
  {
    id: '1',
    slug: 'portfolio-rpg',
    name: 'Portfólio RPG',
    difficulty: 4,
    stats: [
      { label: 'React', icon: 'react' },
      { label: 'TypeScript', icon: 'typescript' },
      { label: 'GSAP', icon: 'magia' },
      { label: 'Tailwind', icon: 'css' },
    ],
    description:
      'Este site. Portfólio com identidade de RPG e cyberpunk, construído sobre um registro de decisões arquiteturais.',
    longDescription:
      'Um portfólio que trata cada projeto como ficha de personagem. Por trás da estética, o exercício real foi de arquitetura: 26 decisões registradas em ADR antes da primeira linha de código, com regras de lint que impedem que essas decisões sejam furadas depois.',
    links: { repo: 'https://github.com/gabrielpereirabrito/portifolio' },
    year: 2026,
    featured: true,
  },
  {
    id: '2',
    slug: 'commitchi',
    name: 'Commitchi',
    difficulty: 4,
    stats: [
      { label: 'React', icon: 'react' },
      { label: 'TypeScript', icon: 'typescript' },
      { label: 'Git', icon: 'git' },
    ],
    description:
      'Companion pet que reage à atividade de código do dev, gamificando consistência através de nostalgia.',
    longDescription:
      'Um companion pet (estilo Tamagotchi) que reage à atividade de código do dev. Cada commit alimenta o bichinho de XP; dias sem commitar, ele fica triste/faminto. A ideia principal é gamificar a consistência de código usando o fator nostalgia de Tamagotchi, Pokémon e Digimon.',
    links: {},
    year: 2026,
  },
  {
    id: '3',
    slug: 'organizei',
    name: 'Organizei',
    difficulty: 3,
    stats: [
      { label: 'React', icon: 'react' },
      { label: 'Node.js', icon: 'node' },
      { label: 'PostgreSQL', icon: 'postgres' },
    ],
    description:
      'Sistema de finanças pessoais para controle de gastos e planejamento financeiro.',
    links: {},
    year: 2025,
  },
  {
    id: '4',
    slug: 'asamovie',
    name: 'Asamovie',
    difficulty: 3,
    stats: [
      { label: 'Next.js', icon: 'nextjs' },
      { label: 'TypeScript', icon: 'typescript' },
      { label: 'CSS', icon: 'css' },
    ],
    description:
      'Catálogo digital para organização de séries e filmes integrado com a API do TMDB.',
    longDescription:
      'Aplicação voltada para organizar listas de séries e filmes consumindo a API do TMDB, trazendo informações completas e atualizadas do mundo do entretenimento.',
    links: {},
    year: 2025,
  },
];
