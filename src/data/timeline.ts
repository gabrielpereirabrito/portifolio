import type { TimelineEntry } from './types';

/** CONTEUDO DE EXEMPLO — trocar pela trajetoria real. */
export const trajetoria: TimelineEntry[] = [
  {
    id: 'atual',
    role: 'Desenvolvedor Full Stack',
    org: 'Empresa Atual',
    start: '2024-01',
    end: 'atual',
    summary:
      'Desenvolvimento de aplicacoes web com React e Node, do desenho da API a interface.',
    highlights: [
      'Reduzi o tempo de carga da aplicacao principal',
      'Padronizei o design system interno',
    ],
  },
  {
    id: 'anterior',
    role: 'Desenvolvedor Frontend',
    org: 'Empresa Anterior',
    start: '2022-06',
    end: '2023-12',
    summary: 'Interfaces responsivas e acessiveis para produtos de uso diario.',
  },
];
