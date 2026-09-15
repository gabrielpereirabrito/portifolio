import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger, refreshAposFontes } from '@/shared/animation/gsap';
import { ErrorBoundary } from '@/app/ErrorBoundary';

// `app/` é a camada de composição: é o único lugar que lê @/data e
// distribui por props (ADR-0006).
import { perfil } from '@/data/profile';
import { projetos } from '@/data/projects';
import { atributos } from '@/data/attributes';
import { trajetoria } from '@/data/timeline';

/**
 * Rotas — ADR-0010 (híbrido: home rolável + rota de detalhe por projeto).
 *
 * A rota de detalhe é preguiçosa para não pesar a home (ADR-0020 regra 3).
 */
const Home = lazy(() => import('@/modules/home').then((m) => ({ default: m.Home })));
const FichaProjeto = lazy(() =>
  import('@/modules/projetos').then((m) => ({ default: m.FichaProjeto })),
);
const NaoMapeado = lazy(() =>
  import('@/modules/erro').then((m) => ({ default: m.NaoMapeado })),
);
// Vitrine do design system: rota interna, nao linkada (frente 02).
const Vitrine = lazy(() =>
  import('@/modules/vitrine').then((m) => ({ default: m.Vitrine })),
);

/**
 * Na troca de rota: volta ao topo e remede o scroll.
 *
 * Sem o refresh, os ScrollTriggers da rota nova calculam posição a partir
 * do layout da rota anterior — e o sintoma aparece na página seguinte,
 * longe da causa (ADR-0012).
 */
function AoTrocarDeRota() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}

export function Rotas() {
  useEffect(refreshAposFontes, []);

  return (
    <>
      <AoTrocarDeRota />
      <Suspense fallback={null}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                perfil={perfil}
                projetos={projetos}
                atributos={atributos}
                trajetoria={trajetoria}
              />
            }
          />
          <Route
            path="/projetos/:slug"
            // Fronteira em volta da rota de detalhe: um projeto com dado
            // ruim não derruba a navegação do site (ADR-0026).
            element={
              <ErrorBoundary origem="ficha-projeto">
                <FichaProjeto projetos={projetos} />
              </ErrorBoundary>
            }
          />
          <Route path="/_vitrine" element={<Vitrine />} />
          <Route path="*" element={<NaoMapeado />} />
        </Routes>
      </Suspense>
    </>
  );
}
