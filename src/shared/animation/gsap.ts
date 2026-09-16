/**
 * Bootstrap do GSAP — ADR-0012.
 *
 * REGRA: nada no projeto importa 'gsap' do pacote direto. Tudo importa
 * daqui. É isso que garante que os plugins já estejam registrados em
 * qualquer ponto de uso, e que o registro aconteça UMA vez — não a cada
 * remontagem de componente.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

/**
 * Interruptor global de movimento reduzido (ADR-0012 regra 4, ADR-0019
 * compromisso 2).
 *
 * Registrar animação decorativa aqui dentro, e não em cada componente:
 * quando o usuário pede menos movimento, ela simplesmente não é criada.
 * O matchMedia também reverte sozinho se a preferência mudar com a
 * página aberta.
 *
 * CUIDADO — a falha clássica: movimento reduzido nunca pode ESCONDER
 * conteúdo. Se a animação normal parte de opacity 0, a versão reduzida
 * precisa colocar o elemento no estado final, não pular a animação e
 * deixar o elemento invisível.
 */
export const mm = gsap.matchMedia();

export const MOVIMENTO_OK = '(prefers-reduced-motion: no-preference)';
export const MOVIMENTO_REDUZIDO = '(prefers-reduced-motion: reduce)';

/**
 * ScrollTrigger mede o documento no momento em que é criado. Fonte que
 * carrega depois (ADR-0005) ou imagem sem dimensão reservada (ADR-0014)
 * deslocam tudo, e os triggers passam a disparar no lugar errado — de
 * forma intermitente, que é o pior tipo de bug.
 *
 * Chamar depois que o layout estabiliza.
 */
export function refreshAposFontes(): void {
  if (typeof document === 'undefined') return;

  void document.fonts?.ready
    .then(() => {
      ScrollTrigger.refresh();
    })
    .catch(() => {
      /* Falha de fonte não pode derrubar o scroll (ADR-0026). */
      ScrollTrigger.refresh();
    });
}

export { gsap, ScrollTrigger, ScrollToPlugin, useGSAP };
