import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * ErrorBoundary — ADR-0026.
 *
 * O piso da decisão: nenhuma falha pode terminar em tela branca. Um erro
 * de renderização em React derruba a árvore inteira, e com o conteúdo
 * vindo de arquivos escritos à mão (ADR-0024) isso é plausível.
 *
 * Ainda precisa ser classe: não há equivalente em hook.
 */
interface Props {
  children: ReactNode;
  /** Identifica de onde veio a falha no log. */
  origem?: string;
  fallback?: ReactNode;
}

interface State {
  erro: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    // Sem serviço de monitoramento, este console.error é o único rastro
    // que existe (ADR-0026). O smoke E2E verifica console limpo, o que
    // transforma isso em sinal (ADR-0017).
    console.error(
      `[ErrorBoundary${this.props.origem ? `: ${this.props.origem}` : ''}]`,
      erro,
      info.componentStack,
    );
  }

  render() {
    if (!this.state.erro) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-2xl text-danger">SISTEMA CORROMPIDO</h1>
        <pre className="font-mono text-sm text-muted">
          {'> falha inesperada neste setor\n> último ponto seguro: /'}
        </pre>
        <a href="/" className="font-mono text-accent underline underline-offset-4">
          voltar ao início
        </a>
      </main>
    );
  }
}
