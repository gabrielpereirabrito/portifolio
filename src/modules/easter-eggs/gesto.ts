/**
 * Konami em touch — ADR-0023.
 *
 * O código original é `↑↑↓↓←→←→BA`, e as quatro primeiras entradas são
 * direções — que existem em touch como swipe. Daí a tradução do ADR:
 * **swipe ↑ ↑ ↓ ↓ seguido de duplo toque**, com o duplo toque no papel do
 * `BA`. Preserva a forma do código em vez de inventar um gesto qualquer, e
 * alimenta o MESMO `unlock` do teclado: achievement único, recompensa
 * igual.
 *
 * O risco que o ADR manda mitigar é colisão — com a rolagem e com o zoom
 * por duplo toque. Três coisas resolvem isso, e nenhuma delas é bloquear
 * o gesto do navegador:
 *
 * 1. Nada de `preventDefault`. Os listeners são `passive`, a página rola
 *    normalmente durante os swipes e o duplo toque continua dando zoom
 *    onde o navegador quiser. O reconhecedor só ESCUTA.
 * 2. O duplo toque só é olhado depois dos quatro swipes na ordem certa.
 *    Um duplo toque solto na página não entra em nenhuma conta.
 * 3. Janela de tempo entre as entradas. Passou da janela, a sequência
 *    expira — quem rolou a página para cima duas vezes de manhã e para
 *    baixo duas à tarde não desbloqueou nada.
 */
type Direcao = 'cima' | 'baixo';

const SEQUENCIA: readonly Direcao[] = ['cima', 'cima', 'baixo', 'baixo'];

/** Deslocamento mínimo para o movimento contar como swipe, em px. */
const DISTANCIA_MINIMA = 60;

/** Acima disso o toque parado deixa de ser toque e vira arrasto lento. */
const TOLERANCIA_DE_TOQUE = 16;

/** Entre duas entradas da sequência. Generosa: o gesto é longo. */
const JANELA_MS = 1500;

/** Entre os dois toques do duplo toque — o mesmo valor que o navegador usa. */
const DUPLO_TOQUE_MS = 400;

/** Toque longo é outra intenção (seleção, menu de contexto). */
const TOQUE_CURTO_MS = 300;

interface Opcoes {
  /** Recebe quantos passos da sequência já casaram (1 a 4). */
  aoAvancar?: (passo: number) => void;
  aoCompletar: () => void;
}

/**
 * Vibração curta no segundo swipe, onde houver suporte — o ADR-0023 a
 * pede como sinal de que algo está sendo reconhecido, e ela é o que
 * transforma um gesto secreto em um gesto descobrível.
 *
 * Protegida: `vibrate` não existe no iOS, e onde existe pode lançar se o
 * navegador considerar que não houve interação suficiente.
 */
function vibrar(): void {
  try {
    navigator.vibrate?.(20);
  } catch {
    /* Sem háptico o gesto continua inteiro. */
  }
}

export function observarGestoKonami({ aoAvancar, aoCompletar }: Opcoes): () => void {
  let passo = 0;
  let ultimaEntradaEm = 0;
  let toqueAnteriorEm = 0;

  /** Começo do toque atual. `null` enquanto não houver um válido. */
  let inicio: { x: number; y: number; em: number } | null = null;

  function reiniciar(direcaoAtual?: Direcao) {
    // Recuo para o maior sufixo válido, igual ao buffer do teclado: um
    // ↑ que não casa com o passo atual ainda é um começo de sequência
    // legítimo, e zerar cego faria a terceira tentativa seguida ser a
    // primeira que funciona.
    passo = direcaoAtual === SEQUENCIA[0] ? 1 : 0;
    toqueAnteriorEm = 0;
    if (passo > 0) ultimaEntradaEm = Date.now();
  }

  function aoComecar(evento: TouchEvent) {
    const toque = evento.touches.length === 1 ? evento.touches[0] : undefined;

    // Multitouch é pinça de zoom, nunca parte do código.
    if (!toque) {
      inicio = null;
      reiniciar();
      return;
    }

    inicio = { x: toque.clientX, y: toque.clientY, em: Date.now() };
  }

  function aoTerminar(evento: TouchEvent) {
    const partida = inicio;
    inicio = null;

    const toque =
      evento.changedTouches.length === 1 ? evento.changedTouches[0] : undefined;
    if (!partida || !toque) return;

    const dx = toque.clientX - partida.x;
    const dy = toque.clientY - partida.y;
    const agora = Date.now();

    // Sequência expirada: o que vier agora é começo, não continuação.
    if (passo > 0 && agora - ultimaEntradaEm > JANELA_MS) reiniciar();

    const paradoEmX = Math.abs(dx) < TOLERANCIA_DE_TOQUE;
    const paradoEmY = Math.abs(dy) < TOLERANCIA_DE_TOQUE;

    if (paradoEmX && paradoEmY) {
      if (agora - partida.em > TOQUE_CURTO_MS) return;

      // Toque solto antes da hora é ignorado, não reinicia: encostar na
      // tela para parar a rolagem inercial é reflexo, e punir isso
      // tornaria o gesto quase impossível num celular.
      if (passo < SEQUENCIA.length) return;

      if (toqueAnteriorEm && agora - toqueAnteriorEm <= DUPLO_TOQUE_MS) {
        passo = 0;
        toqueAnteriorEm = 0;
        aoCompletar();
        return;
      }

      toqueAnteriorEm = agora;
      ultimaEntradaEm = agora;
      return;
    }

    // Vertical de verdade: o eixo dominante decide, senão um arrasto
    // diagonal de rolagem entraria como swipe.
    if (Math.abs(dy) < DISTANCIA_MINIMA || Math.abs(dy) < Math.abs(dx) * 1.5) {
      reiniciar();
      return;
    }

    // Dedo subindo é `↑`: a tela desce, mas o gesto é o mesmo da seta.
    const direcao: Direcao = dy < 0 ? 'cima' : 'baixo';

    if (passo < SEQUENCIA.length && direcao === SEQUENCIA[passo]) {
      passo += 1;
      ultimaEntradaEm = agora;
      if (passo === 2) vibrar();
      aoAvancar?.(passo);
      return;
    }

    reiniciar(direcao);
  }

  // `passive` explícito: além de não bloquear a rolagem, é o que permite
  // ao navegador rolar sem esperar o listener responder (ADR-0020).
  const opcoes: AddEventListenerOptions = { passive: true };
  window.addEventListener('touchstart', aoComecar, opcoes);
  window.addEventListener('touchend', aoTerminar, opcoes);
  window.addEventListener('touchcancel', reiniciarTudo, opcoes);

  function reiniciarTudo() {
    inicio = null;
    reiniciar();
  }

  return () => {
    window.removeEventListener('touchstart', aoComecar);
    window.removeEventListener('touchend', aoTerminar);
    window.removeEventListener('touchcancel', reiniciarTudo);
  };
}
