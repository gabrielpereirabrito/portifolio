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
    links: { repo: 'https://github.com/gabrielpereirabrito/commitchi-game' },
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
    links: { repo: 'https://github.com/gabrielpereirabrito/organizei' },
    year: 2025,
  },
  {
    id: '5',
    slug: 'andie-e-gabriel',
    name: 'Andie e Gabriel',
    // Baixa de propósito, e sincera: o desafio aqui não foi técnico
    // (ADR-0007 mede desafio, não tempo nem carinho).
    difficulty: 2,
    stats: [
      { label: 'Next.js', icon: 'nextjs' },
      { label: 'TypeScript', icon: 'typescript' },
      { label: 'CSS', icon: 'css' },
    ],
    description:
      'Presente de Dia dos Namorados: um site com o tempo que estamos juntos contado ao vivo, até em luas cheias.',
    longDescription:
      'Um site feito de presente. A contagem do tempo juntos corre ao vivo — anos, meses, dias, horas, minutos e segundos — e vira também o número de luas cheias que passaram desde o primeiro dia, uma a cada 29,5 dias. Abaixo, a linha do tempo dos momentos que valeram a pena registrar. O desafio não foi a stack: foi fazer um contador que corre sem travar a página e um texto que não envergonha ninguém dez anos depois.',
    links: {
      demo: 'https://andie-e-brito.vercel.app',
      repo: 'https://github.com/gabrielpereirabrito/dia-dos-namorados',
    },
    year: 2026,
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
