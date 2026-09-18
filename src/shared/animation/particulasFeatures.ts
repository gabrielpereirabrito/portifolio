import { tsParticles } from '@tsparticles/engine';
import { loadBasic } from '@tsparticles/basic';
import { loadParticlesLinksInteraction } from '@tsparticles/interaction-particles-links';
import { loadExternalGrabInteraction } from '@tsparticles/interaction-external-grab';

/**
 * Os pedaços do tsParticles, carregados sob demanda — ADR-0031.
 *
 * Arquivo separado pelo mesmo motivo do `motionFeatures.ts`: é ele que o
 * `import()` do bootstrap aponta, e é essa fronteira que o bundler
 * consegue cortar do bundle inicial. Apontar o `import()` para
 * `@tsparticles/engine` direto faria o pedaço vir com a biblioteca
 * inteira dentro (ADR-0029, nota de implementação).
 *
 * **Montagem sob medida, e não o `slim`.** Só o que o efeito usa:
 *
 * - `basic` — movimento, círculo, tamanho e opacidade;
 * - `particles-links` — as linhas entre as partículas, a malha;
 * - `external-grab` — a linha que se estica até o ponteiro, que é a
 *   única razão de o fundo existir.
 *
 * O `slim` traria emissores, absorvedores, trilhas e mais uma dúzia de
 * interações que ninguém aqui pediu — 30,47 KB gzip contra os ~16 desta
 * lista. A diferença é escolher.
 */
export async function carregarRecursosDeParticulas() {
  // Ordem importa: o engine precisa dos básicos registrados antes das
  // interações que dependem deles.
  await loadBasic(tsParticles);
  await loadParticlesLinksInteraction(tsParticles);
  await loadExternalGrabInteraction(tsParticles);

  return tsParticles;
}
