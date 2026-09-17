import type { EggId } from '@/data/easterEggs';

/**
 * Evento anônimo de "easter egg descoberto" — ADR-0022.
 *
 * O ADR mede QUAL egg foi encontrado, nunca quem encontrou: é contagem
 * agregada, sem identificador de pessoa, e é ela que responde se vale
 * continuar investindo neles.
 *
 * A parte que importa aqui é a proteção. Bloqueador de anúncio bloqueia
 * também o analytics — e o script da Vercel só entra na frente 05, então
 * hoje `window.va` simplesmente não existe. Nos dois casos o egg precisa
 * continuar funcionando: o `try/catch` em volta e a checagem de função
 * são o que impede que um script ausente derrube o desbloqueio (nota de
 * implementação do ADR-0022).
 *
 * Por isso também não há `await`, nem retorno, nem erro propagado: quem
 * chama não tem o que fazer com a falha.
 */
declare global {
  interface Window {
    /** Fila do Vercel Analytics. Pode não existir — ver acima. */
    va?: (
      evento: 'event',
      dados: { name: string; data?: Record<string, string> },
    ) => void;
  }
}

export function registrarDescoberta(id: EggId): void {
  try {
    window.va?.('event', { name: 'easter-egg', data: { id } });
  } catch {
    /* Analytics bloqueado não é um problema do visitante (ADR-0022). */
  }
}
