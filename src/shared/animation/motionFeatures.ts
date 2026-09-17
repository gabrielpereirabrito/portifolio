/**
 * Pacote de recursos da Motion, carregado sob demanda — ADR-0029.
 *
 * Arquivo separado de propósito: é ele que o `import()` dinâmico do
 * bootstrap aponta, e é a fronteira do pedaço que o bundler consegue
 * cortar do bundle inicial. Se o `import()` apontasse para `motion/react`
 * direto, o corte não aconteceria — o chunk viria com a biblioteca
 * inteira dentro.
 *
 * `domAnimation` cobre o que o projeto usa (opacity, transform,
 * variantes, saída). O irmão maior, `domMax`, acrescenta layout
 * animations e drag, que ninguém aqui pede e custam a maior parte do
 * peso.
 */
import { domAnimation } from 'motion/react';

export default domAnimation;
