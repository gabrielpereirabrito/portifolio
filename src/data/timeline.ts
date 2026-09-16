import type { TimelineEntry } from './types';

/** CONTEUDO DE EXEMPLO — trocar pela trajetoria real. */
export const trajetoria: TimelineEntry[] = [
  {
    id: 'atual',
    role: 'Desenvolvedor Full Stack',
    org: 'Contabhub',
    start: '2026-01',
    end: 'atual',
    summary:
      'Desenvolvedor full stack especializado em aplicações web modernas com React, Node.js e IA, aplicando TypeScript, Zod, Express, MySQL e Docker para construir soluções escaláveis e de alta performance.',
    highlights: [
      'Treinei e mentorei estagiários, estruturando trilhas de aprendizado e treinamentos técnicos que aceleraram a curva de aprendizado do time',
      'Reduzi o tempo de carregamento da aplicação principal em [X]%, otimizando queries, bundling e estratégias de cache',
      'Liderei a padronização do design system interno, aumentando a consistência visual e reduzindo o retrabalho entre times de produto',
    ],
  },
  {
    id: 'anterior',
    role: 'Assistente de Desenvolvimento',
    org: 'CF Contabilidade',
    start: '2025-03',
    end: '2025-12',
    summary:
      'Desenvolvimento de sistemas de informacoes e interfaces responsivas e acessiveis para produtos de uso diario. Auxiliei na orientação e treinamento dos usuarios e na manutenção dos sistemas existentes.',
  },
];
