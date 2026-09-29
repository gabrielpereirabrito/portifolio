import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  TRANSICAO_HUD,
  type Variants,
} from '@/shared/animation/motion';
import { CloudImage, StarRating, TechIcon } from '@/shared/ui';
import type { Project } from '@/data/types';
import { copy } from '@/i18n';
import { Carrossel } from './Carrossel';

/**
 * O corpo da ficha — ADR-0033.
 *
 * Renderizado em DOIS contextos: dentro do modal que abre na home, e na
 * rota `/projetos/:slug`. É o que impede o conteúdo da ficha de existir em
 * duas cópias que saem de sincronia — princípio herdado da ADR-0032
 * (substituída), que só mudou de moldura, não de ideia.
 *
 * NÃO RENDERIZA O NOME DO PROJETO, e isso não é esquecimento: o modal já
 * tem o `<h2>` e a rota já tem o `<h1>` com glitch. O nível certo seria
 * diferente nos dois lugares.
 *
 * LAYOUT PLANO, sem abas (ADR-0033 revoga a restrição de duas abas da
 * ADR-0032): capa (ou o espaço reservado pra ela) primeiro, tecnologias
 * sempre visíveis logo abaixo — nunca escondidas atrás de um clique em
 * aba. Só o detalhe de CADA tecnologia (o campo `nota`) continua atrás de
 * um toggle explícito, não de hover: em touch não há hover, e um revelar
 * que só o mouse alcança é meio recurso (ADR-0023).
 *
 * Os links de ação ficam por último, sempre visíveis: eles são a chamada
 * do card, não conteúdo folheável.
 */
interface ConteudoFichaProps {
  projeto: Project;
  /**
   * Mostra o link para `/projetos/:slug`.
   *
   * Verdadeiro no modal, onde ele é a porta para o deep link depois que o
   * modal fechar. Falso na própria rota, onde apontaria para onde já se
   * está.
   */
  comLinkDaRota?: boolean;
}

/** Entrada do detalhe de um stat. Só `opacity`/`y` (ADR-0020, regra 1). */
const VARIANTES_TROCA: Variants = {
  oculto: { opacity: 0, y: 6 },
  visivel: { opacity: 1, y: 0 },
};

const VARIANTES_NEUTRAS: Variants = {
  oculto: { opacity: 1, y: 0 },
  visivel: { opacity: 1, y: 0 },
};

export function ConteudoFicha({ projeto, comLinkDaRota = false }: ConteudoFichaProps) {
  const {
    slug,
    name,
    difficulty,
    stats,
    description,
    longDescription,
    cover,
    galeria,
    links,
    year,
  } = projeto;

  const [statAberto, setStatAberto] = useState<string | null>(null);
  const reduzido = useReducedMotion();

  // A capa é o primeiro slide; a galeria vem depois.
  const imagens = [cover, ...(galeria ?? [])].filter((id): id is string => Boolean(id));

  const variantes = reduzido ? VARIANTES_NEUTRAS : VARIANTES_TROCA;
  const transicao = reduzido ? { duration: 0 } : TRANSICAO_HUD;

  return (
    <div className="flex flex-col gap-6">
      {/* O espaço da capa é sempre reservado, mesmo sem imagem — um projeto
          sem `cover`/`galeria` mostra o placeholder do `CloudImage` em vez
          de sumir com a área inteira (ADR-0033). */}
      {imagens.length > 0 ? (
        <Carrossel imagens={imagens} nomeDoProjeto={name} />
      ) : (
        <CloudImage alt={`Capa do projeto ${name}`} proporcao="16/9" />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <StarRating nivel={difficulty} rotulo={copy.projetos.dificuldade} animada />
        {year && <span className="font-mono text-xs text-muted">{year}</span>}
      </div>

      <ul className="flex flex-col gap-3 font-mono text-sm">
        {stats.map((stat) => {
          const revelado = statAberto === stat.label;
          const rotulo = copy.projetos.notaStat.replace('{tecnologia}', stat.label);

          return (
            <li key={stat.label}>
              {/* Sem `nota`, o stat é só ícone e rótulo — nenhum botão que
                  não leva a nada. */}
              {stat.nota ? (
                <>
                  <button
                    type="button"
                    aria-expanded={revelado}
                    aria-label={rotulo}
                    onClick={() => setStatAberto(revelado ? null : stat.label)}
                    className="flex w-full items-center gap-2 text-left text-primary transition-colors hover:text-accent"
                  >
                    <TechIcon id={stat.icon} className="text-accent" />
                    {stat.label}
                    <span aria-hidden="true" className="text-xs text-muted">
                      {revelado ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {revelado && (
                      <motion.p
                        key="nota"
                        variants={variantes}
                        initial="oculto"
                        animate="visivel"
                        exit="oculto"
                        transition={transicao}
                        className="mt-2 border-l border-hud pl-3 text-xs leading-[var(--leading-corpo)] text-muted"
                      >
                        {stat.nota}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <span className="flex items-center gap-2 text-primary">
                  <TechIcon id={stat.icon} className="text-accent" />
                  {stat.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="leading-[var(--leading-corpo)] text-muted">
        {longDescription ?? description}
      </p>

      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs">
        {links.demo && (
          <a
            href={links.demo}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent underline underline-offset-4"
          >
            {copy.projetos.verDemo} ↗
          </a>
        )}
        {links.repo && (
          <a
            href={links.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent underline underline-offset-4"
          >
            {copy.projetos.verRepo} ↗
          </a>
        )}
        {comLinkDaRota && (
          <Link
            to={`/projetos/${slug}`}
            className="text-muted underline underline-offset-4 transition-colors hover:text-accent"
          >
            {copy.projetos.paginaPropria} →
          </Link>
        )}
      </nav>
    </div>
  );
}
