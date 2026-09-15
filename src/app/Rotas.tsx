import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger, refreshAposFontes } from '@/shared/animation/gsap';

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
          <Route path="/" element={<Home />} />
          <Route path="/projetos/:slug" element={<FichaProjeto />} />
          <Route path="*" element={<NaoMapeado />} />
        </Routes>
      </Suspense>
    </>
  );
}
