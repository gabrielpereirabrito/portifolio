import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/**
 * Preload da fonte do hero — ADR-0020, regra 5.
 *
 * O nome do arquivo só existe depois do build (tem hash), então o link
 * não pode ser escrito à mão no index.html. Este plugin procura o woff2
 * da Orbitron no bundle e injeta o preload com o nome final.
 *
 * Só a Orbitron: ela é a fonte do título do hero, que é o LCP. Precarregar
 * as três competiria com o próprio conteúdo pela banda inicial e pioraria
 * justamente a métrica que se quer melhorar.
 */
function preloadFonteDoHero(): Plugin {
  return {
    name: 'preload-fonte-do-hero',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      const arquivo = Object.keys(ctx.bundle ?? {}).find(
        (nome) => nome.includes('orbitron') && nome.endsWith('.woff2'),
      );
      if (!arquivo) return [];

      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'font',
            type: 'font/woff2',
            href: `/${arquivo}`,
            crossorigin: '',
          },
          injectTo: 'head',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonteDoHero()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
