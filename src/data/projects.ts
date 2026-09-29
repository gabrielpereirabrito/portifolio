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
 * - `galeria` são as capturas além da capa, em
 *   `portfolio/projetos/<slug>/screenshot-01` e seguintes. O carrossel da
 *   ficha recebe `[cover, ...galeria]`; vazio, ele não renderiza nada
 *   (ADR-0032).
 * - `difficulty` é a sua avaliação do desafio, não tempo gasto (ADR-0007).
 *   Vale manter pelo menos um projeto na faixa baixa: se tudo é 4 ou 5, a
 *   escala deixa de dizer alguma coisa.
 * - `stats[].nota` é o que aquela tecnologia faz NESTE projeto, não o que
 *   ela é (ADR-0032). "React" não precisa de definição; o que informa é o
 *   problema que ele resolveu aqui. Uma linha, no máximo duas.
 */
export const projetos: Project[] = [
  {
    id: '1',
    slug: 'portfolio-rpg',
    name: 'Portfólio RPG',
    difficulty: 4,
    stats: [
      {
        label: 'React',
        icon: 'react',
        nota: 'A interface toda, e o ciclo de vida que as animações de entrada e saída precisam respeitar.',
      },
      {
        label: 'TypeScript',
        icon: 'typescript',
        nota: 'Escalas e ícones são uniões fechadas: um typo de conteúdo vira erro de compilação, não quadrado vazio na tela.',
      },
      {
        label: 'GSAP',
        icon: 'magia',
        nota: 'Tudo que é timeline ou depende de scroll. A divisão de trabalho com a Motion está escrita em ADR, não no gosto de quem escreveu.',
      },
      {
        label: 'Tailwind',
        icon: 'css',
        nota: 'Utilitário sobre tokens semânticos, com lint proibindo cor crua — trocar o acento do site é mexer em uma linha.',
      },
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
      {
        label: 'React',
        icon: 'react',
        nota: 'A interface do bichinho e os estados de humor que reagem à atividade de código.',
      },
      {
        label: 'TypeScript',
        icon: 'typescript',
        nota: 'Os estados do bichinho como união fechada — não existe humor inválido em tempo de execução.',
      },
      {
        label: 'Git',
        icon: 'git',
        nota: 'A fonte do XP: é o histórico de commits que alimenta o bichinho. Sem ele não há jogo.',
      },
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
      {
        label: 'React',
        icon: 'react',
        nota: 'As telas de lançamento e o acompanhamento de gastos.',
      },
      {
        label: 'Node.js',
        icon: 'node',
        nota: 'A API entre a interface e o banco — o fechamento do mês não é conta de navegador.',
      },
      {
        label: 'PostgreSQL',
        icon: 'postgres',
        nota: 'Lançamentos e categorias em tabelas relacionadas: o relatório do mês é uma pergunta de JOIN.',
      },
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
      {
        label: 'Next.js',
        icon: 'nextjs',
        nota: 'A página do presente, entregue estática e servida de CDN.',
      },
      {
        label: 'TypeScript',
        icon: 'typescript',
        nota: 'A aritmética de datas e a contagem de luas cheias — errar um fuso aqui estraga a única coisa que o site faz.',
      },
      {
        label: 'CSS',
        icon: 'css',
        nota: 'A linha do tempo e o contador que corre ao vivo, sem biblioteca de animação nenhuma.',
      },
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
      {
        label: 'Next.js',
        icon: 'nextjs',
        nota: 'As rotas do catálogo e da busca sobre o acervo do TMDB.',
      },
      {
        label: 'TypeScript',
        icon: 'typescript',
        nota: 'A resposta do TMDB tipada na borda: campo que muda de forma vira erro de compilação, não tela vazia.',
      },
      {
        label: 'CSS',
        icon: 'css',
        nota: 'A grade de pôsteres, que precisa caber de um celular a um monitor largo.',
      },
    ],
    description:
      'Catálogo digital para organização de séries e filmes integrado com a API do TMDB.',
    longDescription:
      'Aplicação voltada para organizar listas de séries e filmes consumindo a API do TMDB, trazendo informações completas e atualizadas do mundo do entretenimento.',
    links: {},
    year: 2025,
  },
];
