import { Link } from 'react-router-dom';

/**
 * 404 — ADR-0026.
 *
 * O enquadramento é de RPG, não de erro HTTP: o visitante saiu do mapa.
 * Precisa ser útil além de bonita — os dois caminhos de volta ficam
 * visíveis sem rolar.
 */
export function NaoMapeado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="font-display text-3xl tracking-widest text-accent sm:text-5xl">
        ÁREA NÃO MAPEADA
      </h1>

      <pre className="font-mono text-sm leading-relaxed text-muted">
        {['> rota não encontrada neste setor', '> último ponto seguro: /'].join('\n')}
      </pre>

      <nav className="flex flex-wrap items-center justify-center gap-6 font-mono text-sm">
        <Link to="/" className="text-accent underline underline-offset-4">
          voltar ao início
        </Link>
        <Link to="/#projetos" className="text-accent underline underline-offset-4">
          ver projetos
        </Link>
      </nav>
    </main>
  );
}
