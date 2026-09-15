/**
 * Overlay de scanlines / CRT — DECISOES-TECNICAS 4.2.
 *
 * Montado uma vez, no topo da aplicação. É o efeito mais caro do projeto
 * (cobre a viewport inteira), então tudo que dá para empurrar para o CSS
 * está lá: camada isolada, animando só opacity, sem flicker em tela
 * pequena (ADR-0020 regra 2, ADR-0023).
 *
 * `aria-hidden` porque é puramente decorativo, e `pointer-events: none`
 * no CSS para não capturar clique nenhum.
 */
export function Scanlines() {
  return <div className="scanlines" aria-hidden="true" />;
}
