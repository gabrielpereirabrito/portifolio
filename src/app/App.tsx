import { BrowserRouter } from 'react-router-dom';
import { Rotas } from '@/app/Rotas';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { EasterEggs } from '@/modules/easter-eggs';
import { LazyMotion, carregarRecursos } from '@/shared/animation/motion';
import { Scanlines } from '@/shared/ui';

// `app/` é a única camada que lê @/data e distribui por props (ADR-0006).
import { perfil } from '@/data/profile';
import { atributos } from '@/data/attributes';
import { easterEggs } from '@/data/easterEggs';

export function App() {
  return (
    <ErrorBoundary>
      {/* O `<LazyMotion>` na RAIZ, e não dentro de um módulo: o que o
          projeto importa como `motion` é o componente `m`, e ele só anima
          se houver um `<LazyMotion>` ACIMA dele na árvore (ADR-0029).
          Montado só em volta dos easter eggs, ele deixava a carta do hero
          renderizar parada — sem erro nenhum, que é o pior tipo de falha.

          `strict` transforma em erro o uso da API completa, que voltaria a
          arrastar os 44 KB para o bundle inicial sem ninguém perceber. O
          pedaço de recursos continua vindo sob demanda. */}
      <LazyMotion features={carregarRecursos} strict>
        <BrowserRouter>
          <Rotas />

          {/* Fora de <Routes>: um egg descoberto na ficha de um projeto é o
            mesmo egg da home, e os reconhecedores não podem remontar a
            cada troca de rota — remontar zera o buffer do Konami e
            recomeça o contador de permanência.

            Com fronteira de erro própria, como a rota de detalhe: um egg
            é recompensa, e recompensa que quebra não pode levar o site
            junto (ADR-0026). Sem `fallback`: quando algo aqui falha, o
            certo é não aparecer nada. */}
          <ErrorBoundary origem="easter-eggs" fallback={null}>
            <EasterEggs perfil={perfil} atributos={atributos} catalogo={easterEggs} />
          </ErrorBoundary>

          <Scanlines />
        </BrowserRouter>
      </LazyMotion>
    </ErrorBoundary>
  );
}
