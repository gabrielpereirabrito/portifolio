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
  hero: {
    rolar: 'role para explorar',
  },
  projetos: {
    titulo: 'Projetos',
    subtitulo: 'Cada trabalho como uma ficha de personagem',
    verFicha: 'abrir ficha',
    verDemo: 'ver demo',
    verRepo: 'repositorio',
    dificuldade: 'Dificuldade',
    stats: 'Stats',
    voltar: 'voltar para a home',
    semImagem: 'imagem indisponivel',
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
