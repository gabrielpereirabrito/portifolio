import { gsap } from '@/shared/animation/gsap';

/**
 * Rolagem entre seções, com o sinal falhando no caminho.
 *
 * O corte seco do `scroll-behavior: smooth` leva o visitante até a seção e
 * não conta nada. Aqui a viagem é o efeito: enquanto a página corre, a
 * camada de interferência sobe — é a transição de "hackeamento" da seção
 * 4.4 do DECISOES-TECNICAS, aplicada entre seções em vez de entre páginas.
 *
 * A divisão de trabalho segue a fronteira do ADR-0012: o GSAP faz o que
 * precisa de controle imperativo (a posição do scroll, que depende de onde
 * o alvo está) e o CSS faz o que é decorativo e contínuo (a interferência,
 * presa ao atributo `data-rolando` do <html>). Nenhuma linha de JS anima
 * pixel.
 *
 * Movimento reduzido salta direto, sem animação e sem interferência
 * (ADR-0019). Não é degradação: é o mesmo destino, sem a viagem.
 *
 * NADA de `ScrollTrigger.refresh()` aqui dentro, nem antes nem depois do
 * tween. Um refresh encostado numa rolagem animada faz o ScrollTrigger
 * passar a restaurar a posição que guardou, e aí a rolagem SEGUINTE anda
 * vinte pixels e volta — com a página parecendo travada e o efeito aceso
 * na tela. Quem precisa de refresh é a troca de ROTA, e quem o chama é o
 * `app/Rotas.tsx`, antes de pedir a rolagem (ADR-0012).
 */

/** Teto de segurança: a interferência some sozinha mesmo se algo travar. */
const TETO_MS = 2000;

const ATRIBUTO = 'rolando';

/** Gestos que significam "eu assumo o scroll agora". */
const INTERRUPCOES = ['wheel', 'touchstart'] as const;

function movimentoReduzido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Duração pelo tamanho do salto, não fixa.
 *
 * Tempo fixo faz o pulo curto (contato → sobre) arrastar e o longo
 * (rodapé → topo) parecer teletransporte. O `clamp` mantém a janela onde a
 * interferência tem tempo de aparecer sem virar espera.
 */
function duracaoPara(distancia: number): number {
  return gsap.utils.clamp(0.45, 1.1, distancia / 2200);
}

/**
 * Rola até o elemento e devolve o foco a ele.
 *
 * O foco é a metade invisível: sem ele, o próximo Tab continuaria lá no
 * rodapé, e a navegação por teclado ficaria andando em círculo (ADR-0019).
 * Depende do `tabIndex={-1}` que as seções carregam.
 */
export function rolarComGlitch(alvo: Element): void {
  const raiz = document.documentElement;
  let encerrado = false;

  /** Idempotente: chega por três caminhos e só pode valer uma vez. */
  const aterrissar = (comFoco = true) => {
    if (encerrado) return;
    encerrado = true;

    delete raiz.dataset[ATRIBUTO];
    INTERRUPCOES.forEach((evento) => window.removeEventListener(evento, interromper));
    if (comFoco && alvo instanceof HTMLElement) alvo.focus({ preventScroll: true });
  };

  /**
   * Quem girar a roda no meio do caminho retoma o controle na hora.
   *
   * Feito à mão em vez do `autoKill` do ScrollToPlugin: ele deduz a
   * intervenção comparando a posição que escreveu com a que leu de volta, e
   * aqui isso dá falso positivo — o tween morre sozinho no segundo clique e
   * a interferência fica acesa na tela. Ouvir o gesto de verdade não tem
   * como confundir. Sem foco ao final: o visitante escolheu outro destino.
   */
  function interromper() {
    gsap.killTweensOf(window);
    aterrissar(false);
  }

  if (movimentoReduzido()) {
    alvo.scrollIntoView({ behavior: 'auto' });
    aterrissar();
    return;
  }

  const destino = window.scrollY + alvo.getBoundingClientRect().top;
  const duracao = duracaoPara(Math.abs(destino - window.scrollY));

  // Clique em cima de clique: o tween anterior morre antes de o novo nascer,
  // senão os dois escrevem no mesmo scroll e a página treme.
  gsap.killTweensOf(window);

  raiz.dataset[ATRIBUTO] = 'true';
  INTERRUPCOES.forEach((evento) =>
    window.addEventListener(evento, interromper, { once: true, passive: true }),
  );

  // Rede de segurança: aconteça o que acontecer, a interferência não fica
  // presa na tela.
  const desarmar = window.setTimeout(aterrissar, TETO_MS);

  gsap.to(window, {
    duration: duracao,
    ease: 'power2.inOut',
    scrollTo: { y: destino, autoKill: false },
    onComplete: () => {
      window.clearTimeout(desarmar);
      aterrissar();
    },
  });
}
