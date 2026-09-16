import type { MouseEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, DownloadSimple } from '@phosphor-icons/react';
import type { Profile } from '@/data/types';
import { LinksSociais } from '@/shared/ui';
import { rolarComGlitch } from '@/shared/animation/rolagem';
import { copy } from '@/i18n';
import { SECOES } from './secoes';

/**
 * Rodapé — ADR-0027.
 *
 * É a navegação do site inteiro, e aparece em todas as rotas. O motivo está
 * no ADR: ninguém procura navegação enquanto lê; procura quando o conteúdo
 * acabou. E, principalmente, a ficha aberta por deep link (ADR-0010) deixa
 * de ser beco sem saída.
 *
 * Mora fora do <main id="conteudo"> — `<footer>` é o landmark `contentinfo`,
 * e landmark dentro de landmark não é landmark. Por isso quem o monta é
 * `app/Rotas.tsx`, irmão de <Routes>, e não a `Home`.
 *
 * Nenhum ScrollTrigger anima a ENTRADA do rodapé — ele é cromo de fim de
 * página, não seção narrativa. O GSAP que aparece aqui é outro: o da
 * transição entre seções, disparada por clique (ADR-0028).
 */
interface RodapeProps {
  perfil: Profile;
}

/**
 * Âncora do rodapé.
 *
 * Dentro da home, o clique é tratado AQUI, na mão. A versão óbvia — deixar o
 * <Link> mudar a URL e o `AoTrocarDeRota` reagir à mudança — tem um furo que
 * só aparece no segundo clique: quando a URL JÁ é `/#sobre`, clicar em
 * "Sobre" de novo não muda location nenhuma, o efeito não roda, e o link
 * fica morto até alguem recarregar a página. Âncora nativa nunca teve esse
 * problema porque o navegador rerresolve o fragmento a cada clique.
 *
 * Fora da home o caminho continua sendo o <Link>: a rota precisa trocar
 * antes de existir para onde rolar, e quem termina o serviço é o
 * `AoTrocarDeRota`.
 *
 * Em ambos os casos continua sendo um <a href> de verdade — abrir em nova
 * aba, copiar endereço e clique do meio seguem valendo.
 */
function AncoraDeSecao({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();

  function aoClicar(evento: MouseEvent<HTMLAnchorElement>) {
    // Modificadores são do navegador: abrir em nova aba não deve rolar nada.
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    if (pathname !== '/') return;

    const alvo = document.getElementById(id);
    if (!alvo) return;

    evento.preventDefault();
    // A URL acompanha, mas por `replace`: a rolagem já aconteceu, e deixar o
    // router empilhar entrada faria o Voltar refazer o caminho em silencio.
    window.history.replaceState(window.history.state, '', `/#${id}`);
    rolarComGlitch(alvo);
  }

  return (
    <Link to={`/#${id}`} onClick={aoClicar} className={className}>
      {children}
    </Link>
  );
}

export function Rodape({ perfil }: RodapeProps) {
  const linkDeLista = 'text-muted transition-colors hover:text-accent';

  return (
    <footer className="border-t border-hud px-6 py-16 sm:px-10">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* aria-label obrigatório: já existem outros <nav> no site
              (NaoMapeado, FichaProjeto), e landmark repetido sem nome é
              indistinguível no leitor de tela (ADR-0019). */}
          <nav aria-label={copy.rodape.navegacao} className="flex flex-col gap-4">
            <h2 className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
              {copy.rodape.navegacao}
            </h2>
            <ul className="flex flex-col gap-3 font-mono text-sm">
              {SECOES.map(({ id, rotulo }) => (
                <li key={id}>
                  <AncoraDeSecao id={id} className={linkDeLista}>
                    {rotulo}
                  </AncoraDeSecao>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
              {copy.rodape.redes}
            </h2>
            <LinksSociais social={perfil.social} orientacao="coluna" />
            <a
              href={perfil.resumeUrl}
              download
              className="mt-1 flex items-center gap-3 font-mono text-sm text-accent"
            >
              <DownloadSimple size={18} weight="bold" aria-hidden="true" />
              {copy.sobre.curriculo}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-hud pt-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* Ano calculado, nunca fixo: rodapé com ano velho é o detalhe que
              denuncia site abandonado (ADR-0025, regra do Intl). */}
          <p>
            © {new Date().getFullYear()} {perfil.name}. {copy.rodape.direitos}
          </p>

          <AncoraDeSecao id="inicio" className="flex items-center gap-2 text-accent">
            <ArrowUp size={16} weight="bold" aria-hidden="true" />
            {copy.rodape.voltarAoTopo}
          </AncoraDeSecao>
        </div>
      </div>
    </footer>
  );
}
