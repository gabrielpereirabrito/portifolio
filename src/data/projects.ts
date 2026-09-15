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
    slug: 'api-de-catalogo',
    name: 'API de Catálogo',
    difficulty: 3,
    stats: [
      { label: 'Node.js', icon: 'node' },
      { label: 'PostgreSQL', icon: 'postgres' },
      { label: 'TypeScript', icon: 'typescript' },
    ],
    description:
      'API REST para catálogo de produtos, com busca paginada e cache de consultas frequentes.',
    longDescription:
      'Serviço de catálogo com foco em consulta rápida sobre volume alto. O trabalho interessante foi o desenho dos índices e a decisão de onde valia cache e onde ele só adicionaria uma fonte de verdade a mais.',
    links: {},
    year: 2025,
  },
  {
    id: '3',
    slug: 'painel-de-metricas',
    name: 'Painel de Métricas',
    difficulty: 2,
    stats: [
      { label: 'React', icon: 'react' },
      { label: 'TypeScript', icon: 'typescript' },
    ],
    description: 'Dashboard de acompanhamento com gráficos e filtros salvos por usuário.',
    links: {},
    year: 2025,
  },
];
