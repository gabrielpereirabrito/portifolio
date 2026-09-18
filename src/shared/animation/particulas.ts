import type { Container, ISourceOptions } from '@tsparticles/engine';

/**
 * Bootstrap do fundo de partículas — ADR-0031.
 *
 * REGRA, a mesma do GSAP e da Motion: nada no projeto importa
 * `@tsparticles/*` direto. Tudo passa por aqui, e o lint garante
 * (ADR-0012, ADR-0029, ADR-0031).
 *
 * O que este arquivo faz de verdade é **decidir se a biblioteca chega a
 * ser baixada**. Essa é a parte que segura o orçamento: o `import()` mora
 * dentro de `iniciarFundo`, depois da guarda, então quem não passa em
 * `podeAnimarFundo()` nunca pede o pedaço ao servidor.
 */

/**
 * Abaixo disto o fundo não entra. Não é sobre "ser celular": é que numa
 * tela estreita a malha vira um borrão atrás do texto, e é justamente ali
 * que a GPU é mais fraca (ADR-0020, regra 2).
 */
const LARGURA_MINIMA = 1024;

/**
 * As três guardas do ADR-0031, numa função só — a única porta de entrada.
 *
 * Consulta **capacidade**, nunca "é celular?" (ADR-0023): um notebook com
 * tela sensível ao toque tem ponteiro fino e merece o efeito; um tablet
 * grande não tem ponteiro para reagir, e um fundo interativo sem
 * interação é custo de GPU puro.
 */
export function podeAnimarFundo(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;

  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const telaLarga = window.matchMedia(`(min-width: ${LARGURA_MINIMA}px)`).matches;

  return !movimentoReduzido && ponteiroFino && telaLarga;
}

/**
 * Lê uma cor da camada semântica de tokens (ADR-0013).
 *
 * O tsParticles quer uma string de cor, e as nossas vivem em custom
 * properties — é isto que faz o fundo virar fósforo junto com o resto do
 * site quando o Konami liga o tema ghost, sem uma linha de código de tema
 * aqui dentro.
 */
function corDoToken(nome: string, reserva: string): string {
  if (typeof window === 'undefined') return reserva;

  const valor = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return valor || reserva;
}

/**
 * A configuração do efeito.
 *
 * Contagem baixa e velocidade baixa de propósito: é fundo, e fundo que
 * disputa atenção com o nome do dono do site está errado. `grab` é a
 * única interação — a linha que se estica até o ponteiro.
 */
function opcoes(): ISourceOptions {
  const acento = corDoToken('--accent', '#38e8ff');
  const acentoAlt = corDoToken('--accent-alt', '#ff5fa2');

  return {
    fullScreen: { enable: false },
    detectRetina: true,
    // Pausas nativas: aba em segundo plano e seção fora da viewport não
    // gastam GPU nem bateria. Feito pela lib porque ela já sabe fazer
    // melhor do que um listener nosso.
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    fpsLimit: 60,
    background: { color: 'transparent' },
    particles: {
      number: { value: 45, density: { enable: true } },
      color: { value: [acento, acentoAlt] },
      shape: { type: 'circle' },
      opacity: { value: 0.35 },
      size: { value: { min: 1, max: 2.5 } },
      move: { enable: true, speed: 0.4, outModes: { default: 'out' } },
      links: {
        enable: true,
        color: acento,
        distance: 140,
        opacity: 0.18,
        width: 1,
      },
    },
    interactivity: {
      // No canvas e não na janela: o canvas cobre só o hero, e o efeito
      // deve morrer junto com a primeira dobra.
      detectsOn: 'canvas',
      events: {
        onHover: { enable: true, mode: 'grab' },
        resize: { enable: true },
      },
      modes: {
        grab: { distance: 170, links: { opacity: 0.5 } },
      },
    },
  };
}

/**
 * Sobe o fundo no elemento dado e devolve como derrubá-lo.
 *
 * Devolve `undefined` quando a guarda barra — e nesse caso **nada é
 * baixado**. Quem chama não precisa saber o motivo: o fallback de CSS já
 * está na tela de qualquer jeito.
 */
export async function iniciarFundo(id: string): Promise<(() => void) | undefined> {
  if (!podeAnimarFundo()) return undefined;

  const { carregarRecursosDeParticulas } = await import('./particulasFeatures');
  const motor = await carregarRecursosDeParticulas();

  const container: Container | undefined = await motor.load({ id, options: opcoes() });
  if (!container) return undefined;

  /**
   * O tema pode mudar com a página aberta — é o que o Konami faz
   * (ADR-0011). As cores das partículas foram lidas na montagem, então
   * sem isto o fundo ficaria ciano num site que virou fósforo.
   *
   * Recarrega as opções em vez de tentar reescrever partícula por
   * partícula: são 45 pontos, e a troca de tema é rara.
   */
  const observador = new MutationObserver(() => {
    container.options.load(opcoes());
    void container.refresh();
  });

  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return () => {
    observador.disconnect();
    container.destroy();
  };
}
