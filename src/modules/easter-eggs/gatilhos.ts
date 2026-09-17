/**
 * Gatilhos dos achievements — DECISOES-TECNICAS seção 5.
 *
 * Os três são passivos: ninguém digita nada, ninguém aperta nada de
 * propósito. Eles observam o que a pessoa já estava fazendo — rolar, se
 * distrair clicando num ícone, ficar lendo — e por isso cada um devolve a
 * própria limpeza, sem deixar listener para trás.
 *
 * Nenhum deles toca em outro módulo. O acoplamento aqui é com o DOM
 * (`footer`, `svg`), não com os componentes que o produzem — é o que
 * permite os eggs existirem sem espalhar `data-egg` pelo site inteiro.
 */

/** Tentativas por frame até o alvo existir, como em `app/Rotas.tsx`. */
const TENTATIVAS = 20;

/**
 * "Rolar até o fim" — o rodapé é a sentinela natural.
 *
 * Ele existe em TODA rota (ADR-0027), então o egg vale na home e também na
 * ficha de um projeto: em qualquer lugar, chegar ao rodapé é ter chegado
 * ao fim do que havia para ler.
 *
 * `threshold: 0.6` em vez de qualquer aparição: o rodapé é alto, e um
 * pedaço dele entrando na tela ainda não é ter lido a página.
 */
export function observarFimDaPagina(aoAtingir: () => void): () => void {
  let observador: IntersectionObserver | null = null;
  let frame = 0;
  let cancelado = false;

  function tentar(restantes: number) {
    if (cancelado) return;

    const rodape = document.querySelector('footer');

    if (!rodape) {
      // O rodapé mora em `app/Rotas.tsx` e monta junto, mas "junto" não é
      // garantia de ordem entre efeitos — daí a espera por frame, com
      // teto para nunca virar laço.
      if (restantes > 0) frame = requestAnimationFrame(() => tentar(restantes - 1));
      return;
    }

    observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) aoAtingir();
      },
      { threshold: 0.6 },
    );

    observador.observe(rodape);
  }

  tentar(TENTATIVAS);

  return () => {
    cancelado = true;
    cancelAnimationFrame(frame);
    observador?.disconnect();
  };
}

/** Cliques necessários no mesmo ícone. */
const CLIQUES = 5;

/** Passou disso, foi outra sessão de cliques. */
const INTERVALO_MS = 1200;

/**
 * "Cinco cliques num ícone" — por delegação, sem marcar ícone nenhum.
 *
 * A alternativa seria pendurar um `onClick` em algum componente e espalhar
 * a lógica do egg pelo site; aqui um listener só, no documento, reconhece
 * o padrão em qualquer ícone que já exista.
 *
 * Ícone dentro de link ou botão fica de fora de propósito: ali o clique
 * tem destino, e contar repetição significaria premiar quem clicou cinco
 * vezes no mesmo link porque a página não respondeu.
 */
export function observarCliqueInsistente(aoAtingir: () => void): () => void {
  let alvoAtual: Element | null = null;
  let contagem = 0;
  let ultimoEm = 0;

  function aoClicar(evento: MouseEvent) {
    const alvo = evento.target;
    if (!(alvo instanceof Element)) return;

    const icone = alvo.closest('svg');
    const agora = Date.now();

    if (!icone || icone.closest('a, button')) {
      alvoAtual = null;
      contagem = 0;
      return;
    }

    const mesmoIcone = icone === alvoAtual && agora - ultimoEm <= INTERVALO_MS;
    alvoAtual = icone;
    ultimoEm = agora;
    contagem = mesmoIcone ? contagem + 1 : 1;

    if (contagem >= CLIQUES) {
      contagem = 0;
      aoAtingir();
    }
  }

  document.addEventListener('click', aoClicar);
  return () => document.removeEventListener('click', aoClicar);
}

/** Dois minutos — ver o catálogo. */
const PERMANENCIA_MS = 120_000;

/** Grão do contador. Um segundo é preciso o bastante e barato. */
const PASSO_MS = 1000;

/**
 * "Tempo na página" — tempo de tela ACESA, não de aba esquecida aberta.
 *
 * Um `setTimeout` de dois minutos premiaria quem abriu o site e foi
 * almoçar, o que não é o que o egg quer dizer. Contar por passo e parar
 * quando a aba fica oculta custa um intervalo de um segundo e mede a
 * coisa certa.
 */
export function observarTempoNaPagina(aoAtingir: () => void): () => void {
  let acumulado = 0;
  let intervalo = 0;

  function parar() {
    window.clearInterval(intervalo);
    intervalo = 0;
  }

  function contar() {
    acumulado += PASSO_MS;
    if (acumulado < PERMANENCIA_MS) return;

    parar();
    aoAtingir();
  }

  function retomar() {
    if (intervalo) return;
    intervalo = window.setInterval(contar, PASSO_MS);
  }

  function aoMudarVisibilidade() {
    if (document.hidden) parar();
    else retomar();
  }

  if (!document.hidden) retomar();
  document.addEventListener('visibilitychange', aoMudarVisibilidade);

  return () => {
    parar();
    document.removeEventListener('visibilitychange', aoMudarVisibilidade);
  };
}
