import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger, refreshAposFontes } from '@/shared/animation/gsap';
import { rolarComGlitch } from '@/shared/animation/rolagem';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { Rodape } from '@/modules/rodape';

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
 * Leva a rolagem até o alvo de um hash, esperando ele existir.
 *
 * A espera é o ponto. Vindo de `/projetos/:slug` para `/#sobre`, a `Home` é
 * `lazy` e ainda não montou quando o efeito de rota roda: `querySelector`
 * devolve `null`, o visitante cai no topo, e o bug só aparece no primeiro
 * acesso frio — que é justamente o caso do deep link que o ADR-0010 existe
 * para servir. Daí as tentativas por frame, com teto para nunca virar loop
 * quando o hash simplesmente não corresponde a nada.
 */
function rolarParaHash(hash: string, comEfeito: boolean, tentativas = 10) {
  const alvo = document.querySelector(hash);

  if (!alvo) {
    if (tentativas > 0) {
      requestAnimationFrame(() => rolarParaHash(hash, comEfeito, tentativas - 1));
    } else {
      // Hash sem dono: melhor o topo da rota nova que uma tela parada no
      // meio do nada (ADR-0026).
      window.scrollTo(0, 0);
    }
    return;
  }

  // Refresh aqui, ANTES de rolar: a rota trocou, e os triggers precisam
  // medir o layout novo. Depois da rolagem seria tarde e, pior, encostado no
  // tween ele passa a restaurar a posição guardada e trava a próxima
  // rolagem (ADR-0012).
  ScrollTrigger.refresh();

  if (!comEfeito) {
    // Chegada direta pela URL: a página acabou de aparecer, e rolar sozinha
    // na frente de quem nem terminou de ler o primeiro quadro desorienta
    // mais do que encanta.
    alvo.scrollIntoView({ behavior: 'auto' });
    if (alvo instanceof HTMLElement) alvo.focus({ preventScroll: true });
    return;
  }

  rolarComGlitch(alvo);
}

/**
 * Na troca de rota: volta ao topo e remede o scroll.
 *
 * Sem o refresh, os ScrollTriggers da rota nova calculam posição a partir
 * do layout da rota anterior — e o sintoma aparece na página seguinte,
 * longe da causa (ADR-0012).
 *
 * Quando vem hash junto, o destino não é o topo e sim a seção — é o que faz
 * a navegação do rodapé funcionar de fora da home (ADR-0027). O React Router
 * não rola para hash sozinho, e sem este ramo o `scrollTo(0, 0)` abaixo
 * engoliria a âncora em silêncio.
 *
 * Todo clique no rodapé passa por aqui, inclusive dentro da própria home: é o
 * que dá um caminho só para a transição com interferência. A exceção é a
 * PRIMEIRA execução — aí o hash veio colado na URL, ninguém clicou em nada, e
 * a página salta direto.
 */
function AoTrocarDeRota() {
  const { pathname, hash } = useLocation();
  const primeiraVez = useRef(true);

  useEffect(() => {
    const chegadaDireta = primeiraVez.current;
    primeiraVez.current = false;

    if (hash) {
      rolarParaHash(hash, !chegadaDireta);
      return;
    }

    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname, hash]);

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

      {/* Fora do <Suspense> e fora do <main> da Home: <footer> é o landmark
          `contentinfo`, e ele não pode morar dentro de outro landmark
          (ADR-0019). Aparece em toda rota, `/_vitrine` inclusive — e o
          rodapé não é preguiçoso, então a saída do site existe mesmo
          enquanto a rota carrega. */}
      <Rodape perfil={perfil} />
    </>
  );
}
