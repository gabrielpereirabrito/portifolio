import { useEffect, useId } from 'react';
import { iniciarFundo } from '@/shared/animation/particulas';

/**
 * Fundo interativo da primeira dobra — ADR-0031, DECISOES-TECNICAS 4.6.
 *
 * Uma malha de pontos que estica uma linha até o ponteiro. É **decoração
 * e nada mais**, e o componente inteiro se comporta como tal:
 * `aria-hidden`, sem receber clique, atrás de tudo, e fora do fluxo.
 *
 * A guarda de capacidade mora no bootstrap, não aqui — o `import()` da
 * biblioteca acontece depois dela, então em celular, em tela estreita ou
 * com movimento reduzido **nada é baixado**. O que sobra nesses casos é o
 * gradiente de `.fundo-hero`, que está sempre na tela e é o único fundo
 * que a maioria dos visitantes vai ver.
 *
 * O `id` vem do `useId` porque o tsParticles endereça o container por id,
 * e id fixo em componente é uma colisão esperando acontecer.
 */
export function FundoParticulas() {
  const id = `particulas-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    let derrubar: (() => void) | undefined;
    let cancelado = false;

    void iniciarFundo(id).then((parar) => {
      // Desmontou antes de a biblioteca chegar: derruba na hora, senão o
      // canvas fica rodando sem dono depois de trocar de rota.
      if (cancelado) parar?.();
      else derrubar = parar;
    });

    return () => {
      cancelado = true;
      derrubar?.();
    };
  }, [id]);

  return (
    <div
      id={id}
      aria-hidden="true"
      className="fundo-hero pointer-events-none absolute inset-0 -z-10"
    />
  );
}
