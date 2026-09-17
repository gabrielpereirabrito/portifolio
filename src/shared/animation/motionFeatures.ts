/**
 * Pacote de recursos da Motion, carregado sob demanda — ADR-0029.
 *
 * Arquivo separado de propósito: é ele que o `import()` dinâmico do
 * bootstrap aponta, e é a fronteira do pedaço que o bundler consegue
 * cortar do bundle inicial. Se o `import()` apontasse para `motion/react`
 * direto, o corte não aconteceria — o chunk viria com a biblioteca
 * inteira dentro.
 *
 * `domMax` e não `domAnimation`: a diferença entre os dois é justamente
 * a **layout animation**, e ela é o que anima a viagem do terminal entre
 * o formato de canto e o expandido — o mesmo nó mudando de tamanho e de
 * lugar, com a Motion interpolando a caixa. Sem ela, os dois formatos
 * trocariam em um quadro.
 *
 * O custo fica onde não dói: este módulo inteiro é carregado sob demanda,
 * então a diferença entre os dois pacotes não toca o bundle inicial —
 * ela aparece no pedaço que chega depois do primeiro clique.
 */
import { domMax } from 'motion/react';

export default domMax;
