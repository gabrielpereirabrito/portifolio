import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

/**
 * ADR-0013, regra 1: componente nunca usa cor crua nem valor arbitrário —
 * usa o token semântico. Sem isto, `text-[#38e8ff]` se espalha e trocar o
 * acento do site deixa de ser mexer em uma linha. Pior: cor escrita à mão
 * não acompanha a troca para o tema ghost.
 *
 * Dirigida a COR, de propósito. A regra `no-arbitrary-value` do plugin
 * baniria também `tracking-[0.25em]` e `leading-[var(--leading-corpo)]`,
 * que são usos legítimos — e uma regra que reclama do que é correto é uma
 * regra que vai ser desligada.
 *
 * Feita à mão, e não com eslint-plugin-tailwindcss: a versão 4 do plugin
 * insiste em ler o CSS de entrada de `src/style.css` e ignora o `settings`
 * que aponta para o nosso caminho. Acoplar o lint à introspecção do
 * Tailwind não vale o que ele entregaria a mais aqui.
 */
const CORES_ARBITRARIAS = String.raw`-\[(#|rgb|rgba|hsl|hsla|oklch|oklab|color\()`;

const semCorArbitraria = {
  selector: `Literal[value=/${CORES_ARBITRARIAS}/]`,
  message:
    'ADR-0013: use o token semântico (text-accent, bg-panel, border-hud) em vez de cor arbitrária. Cor escrita à mão não acompanha a troca para o tema ghost.',
};

/**
 * ESLint — ADR-0016.
 *
 * O que importa aqui não é pegar variável não usada (o TypeScript já faz).
 * São as restrições de import abaixo: elas transformam decisões
 * arquiteturais em erro de build em vez de disciplina humana. Sem elas,
 * este arquivo não teria razão de existir.
 *
 * ATENÇÃO ao flat config: quando dois blocos casam com o mesmo arquivo, o
 * último SUBSTITUI a regra do anterior — não soma. Por isso as restrições
 * são compostas em constantes e reaplicadas inteiras por grupo, em vez de
 * espalhadas em blocos que se sobrescrevem em silêncio.
 */

/** ADR-0009: cruzar fronteira de módulo só pelo barrel. */
const semCaminhoInternoDeModulo = {
  group: ['@/modules/*/*'],
  message:
    'ADR-0009: cruze a fronteira de um módulo pelo barrel (@/modules/x), nunca por caminho interno.',
};

/** ADR-0006 + amarra 2 do ADR-0008: componente recebe dado, não busca. */
const semImportarData = {
  group: ['@/data', '@/data/*'],
  message:
    'ADR-0006: o dado desce por props. Só app/ e os barrels importam de @/data — é isso que permite trocar arquivo por API sem tocar em componente.',
};

/** ADR-0012: tudo passa pelo bootstrap, que registra os plugins uma vez. */
const semGsapDireto = [
  {
    name: 'gsap',
    message:
      'ADR-0012: importe de @/shared/animation/gsap — é o que garante os plugins registrados uma única vez.',
  },
  { name: 'gsap/ScrollTrigger', message: 'ADR-0012: importe de @/shared/animation/gsap.' },
  { name: '@gsap/react', message: 'ADR-0012: importe de @/shared/animation/gsap.' },
];

export default tseslint.config(
  { ignores: ['dist', 'docs', 'node_modules'] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ── Protege ADR-0013, regra 1 ───────────────────────────────────
      'no-restricted-syntax': ['error', semCorArbitraria],

      // ── Protege ADR-0012 ────────────────────────────────────────────
      // Dependência faltando no useGSAP recria (ou não recria) a animação
      // na hora errada. Como aviso, passa batido.
      'react-hooks/exhaustive-deps': 'error',

      // ── Protege ADR-0019 ────────────────────────────────────────────
      // Acessibilidade como aviso é acessibilidade ignorada.
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'error',
    },
  },

  // Regra de import para TODO o src: sem gsap direto, sem caminho interno
  // de módulo. app/ pode importar de @/data — ele é a camada de composição.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: semGsapDireto, patterns: [semCaminhoInternoDeModulo] },
      ],
    },
  },

  // Dentro de módulo e de shared, some também o acesso a @/data.
  // Repete as restrições acima de propósito: o flat config substitui.
  {
    files: ['src/modules/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: semGsapDireto,
          patterns: [semCaminhoInternoDeModulo, semImportarData],
        },
      ],
    },
  },

  // O barrel do módulo é a exceção: é ele que monta o mundo do módulo e
  // pode ler os dados para distribuí-los por props.
  {
    files: ['src/modules/*/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: semGsapDireto, patterns: [semCaminhoInternoDeModulo] },
      ],
    },
  },

  // O bootstrap do GSAP é o único lugar autorizado a tocar no pacote.
  {
    files: ['src/shared/animation/gsap.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [semCaminhoInternoDeModulo] }],
    },
  },

  prettier,
);
