/**
 * Textos de interface — ADR-0025.
 *
 * Nenhum rotulo, titulo de secao ou mensagem de erro literal no JSX. A
 * regra custa quase nada agora e e o que torna barato adicionar ingles
 * depois, se o gatilho do ADR-0025 chegar.
 *
 * Efeito colateral util: da para revisar a escrita do site inteiro
 * lendo um arquivo so.
 *
 * Mora em src/i18n e nao em src/data porque a fronteira do ADR-0006 e
 * sobre CONTEUDO que um dia vem de uma API (projetos, perfil). Texto de
 * interface nao e isso: e parte da UI, e todo modulo pode ler.
 */
export const copy = {
  nav: {
    pularParaConteudo: 'pular para o conteudo',
  },
  /**
   * Hero — o retrato que vira carta (ADR-0030).
   *
   * `anunciarCarta` e `anunciarRetrato` sao o que a regiao viva fala na
   * troca: quem nao ve a imagem precisa saber que ela virou, e no que ela
   * virou (ADR-0019).
   */
  hero: {
    rolar: 'role para explorar',
    virarCarta: 'ver a carta de personagem',
    anunciarCarta: 'Carta virada: {classe}, nivel {nivel} de 5.',
    anunciarRetrato: 'De volta a foto.',
  },
  /**
   * Projetos — ADR-0033.
   *
   * A ficha abre em um MODAL flutuante ao clicar no card, e continua tendo
   * rota própria. `verFicha` é o rótulo do botão que abre o modal;
   * `fecharFicha` é o do botão de fechar dentro dele — não são mais os dois
   * lados do mesmo botão (isso era o acordeão da ADR-0032, substituída).
   * `paginaPropria` continua sendo o link para `/projetos/:slug`, que vive
   * dentro do corpo da ficha.
   *
   * As mensagens do carrossel usam `{placeholder}` em vez de concatenacao no
   * meio do codigo — `posicao` e lida em voz alta a cada troca de slide, e a
   * frase inteira precisa caber numa linha para ser reescrita de uma vez.
   */
  projetos: {
    titulo: 'Projetos',
    subtitulo: 'Cada trabalho como uma ficha de personagem',
    verFicha: 'abrir ficha',
    fecharFicha: 'fechar ficha',
    paginaPropria: 'abrir em página própria',
    verDemo: 'ver demo',
    verRepo: 'repositorio',
    dificuldade: 'Dificuldade',
    stats: 'Stats',
    voltar: 'voltar para a home',

    /** Rótulo do alvo que revela o papel da tecnologia no projeto. */
    notaStat: 'o que {tecnologia} faz aqui',

    carrossel: {
      rotulo: 'capturas de tela',
      anterior: 'imagem anterior',
      proxima: 'próxima imagem',
      posicao: 'imagem {atual} de {total}',
      irPara: 'ir para a imagem {n}',
    },
  },
  /**
   * Imagem — mora fora de `projetos` de propósito.
   *
   * Quem lê isto é o `CloudImage`, que é `shared/ui` e serve tambem o
   * retrato do hero. Enquanto a chave morava em `projetos`, o componente
   * preferia escrever a string na mao a importar de um bloco que nao era
   * dele — e o resultado era um rotulo orfao no i18n.
   */
  imagem: {
    indisponivel: 'imagem indisponível',
    semCapa: 'projeto sem capa',
  },
  sobre: {
    titulo: 'Sobre',
    atributos: 'Atributos',
    trajetoria: 'Historico de campanha',
    curriculo: 'baixar curriculo',
    atual: 'atual',
  },
  contato: {
    titulo: 'Contato',
    subtitulo: 'Para conversar sobre trabalho, ou so para dizer oi.',
    nome: 'Nome',
    email: 'E-mail',
    mensagem: 'Mensagem',
    enviar: 'enviar',
    enviando: 'enviando...',
    sucesso: 'Mensagem enviada. Obrigado pelo contato!',
    erro: 'Nao consegui enviar. Se preferir, escreva direto para',
    campoObrigatorio: 'Preencha este campo.',
    emailInvalido: 'E-mail parece incompleto.',
  },
  /**
   * Easter eggs — DECISOES-TECNICAS seção 5, ADR-0019 e ADR-0023.
   *
   * O texto do terminal mora aqui junto com o resto da interface; o do
   * CATÁLOGO (título e recompensa de cada egg) mora em `data/easterEggs`.
   * A fronteira do ADR-0006 separa os dois: rótulo de botão e mensagem de
   * erro são UI, a lista de conquistas é conteúdo.
   *
   * As mensagens usam `{placeholder}` em vez de concatenação no meio do
   * código — assim dá para reescrever a voz do terminal inteiro lendo
   * este bloco.
   */
  eggs: {
    conquista: 'CONQUISTA DESBLOQUEADA',
    fecharToast: 'dispensar',

    terminal: {
      abrir: 'abrir terminal',
      titulo: 'terminal',
      fechar: 'fechar terminal',
      expandir: 'expandir para a tela toda',
      recolher: 'recolher para o canto',
      rotuloEntrada: 'digite um comando',
      saida: 'saída do terminal',
      boasVindas: 'portfolio-os v1.0 — digite help para ver o que existe.',
      ajuda: 'comandos disponíveis:',
      desconhecido: 'comando não encontrado: {comando} — digite help.',
      contratando: 'privilégios concedidos. canal de contato aberto:',
      semConquistas: 'nenhuma conquista registrada ainda.',
    },
  },

  /**
   * Rodape — ADR-0027.
   *
   * So o que NAO existe em outro lugar. Os rotulos das secoes saem de
   * `projetos.titulo`, `sobre.titulo` e `contato.titulo`, e o curriculo de
   * `sobre.curriculo`: assim o link do rodape nunca sai de sincronia com o
   * <h2> da secao para onde ele aponta. `inicio` e o unico novo, porque o
   * hero nao tem titulo escrito.
   */
  rodape: {
    navegacao: 'Navegacao',
    redes: 'Redes',
    inicio: 'Inicio',
    voltarAoTopo: 'voltar ao topo',
    novaAba: 'abre em nova aba',
    direitos: 'Todos os direitos reservados.',
  },
} as const;
