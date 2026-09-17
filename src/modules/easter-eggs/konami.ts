/**
 * Konami Code no teclado — DECISOES-TECNICAS seção 5.
 *
 * O reconhecedor é uma função pura sobre o buffer, separada do listener de
 * propósito: é o alvo de teste do ADR-0017 que não precisa de DOM, e é
 * onde mora a única sutileza do arquivo — o reset.
 */
const CODIGO = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
] as const;

/**
 * Guarda SEMPRE as últimas dez teclas, em vez de zerar no primeiro erro.
 *
 * É este detalhe que o "reset correto do buffer" da frente 04 cobra. A
 * versão ingênua — compara a tecla com `CODIGO[posicao]`, erra, zera a
 * posição — engole a tentativa seguinte: quem digita `↑↑↑↓↓…` erra no
 * terceiro `↑`, o buffer zera, e o `↓` que vem logo depois é comparado
 * com o começo do código em vez de continuar a sequência que já estava
 * certa. Na prática o egg fica difícil de disparar por um motivo que
 * ninguém consegue ver.
 *
 * Mantendo uma janela deslizante e comparando o buffer inteiro, o
 * recuo para o maior sufixo válido acontece sozinho, sem caso especial.
 */
export function proximoBuffer(buffer: readonly string[], tecla: string): string[] {
  return [...buffer, tecla.toLowerCase()].slice(-CODIGO.length);
}

export function completouKonami(buffer: readonly string[]): boolean {
  return buffer.length === CODIGO.length && CODIGO.every((t, i) => t === buffer[i]);
}

/** Campo de texto em foco: quem digita `b` numa mensagem não quer o egg. */
function digitandoEmCampo(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  return (
    alvo.isContentEditable ||
    alvo instanceof HTMLInputElement ||
    alvo instanceof HTMLTextAreaElement
  );
}

/**
 * Liga o reconhecedor ao teclado e devolve a função de limpeza.
 *
 * Fica em `window` e não em um elemento: o código pode ser digitado de
 * qualquer lugar do site, inclusive sem nada focado.
 */
export function observarKonami(aoCompletar: () => void): () => void {
  let buffer: string[] = [];

  function aoTeclar(evento: KeyboardEvent) {
    if (digitandoEmCampo(evento.target)) return;

    buffer = proximoBuffer(buffer, evento.key);

    // Sem zerar o buffer depois de reconhecer: a janela deslizante já
    // obriga o código inteiro a ser digitado outra vez para disparar de
    // novo, e o `unlock` é idempotente (ADR-0011) — um segundo disparo
    // não custa nada.
    if (completouKonami(buffer)) aoCompletar();
  }

  window.addEventListener('keydown', aoTeclar);
  return () => window.removeEventListener('keydown', aoTeclar);
}
