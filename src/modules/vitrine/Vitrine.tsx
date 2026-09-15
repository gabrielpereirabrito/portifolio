import { useState } from 'react';
import {
  Panel,
  StarRating,
  StatBar,
  TechIcon,
  CloudImage,
  Glitch,
  type TechIconId,
} from '@/shared/ui';

/**
 * Vitrine do design system — rota interna, não linkada em lugar nenhum.
 *
 * Existe para ver todos os componentes e efeitos juntos antes de qualquer
 * seção real usá-los, e para conferir contraste e troca de tema num lugar
 * só. É o "pronto quando" da frente 02.
 *
 * Some quando o site estiver pronto, ou vira a base de um storybook.
 */
const STACK: { id: TechIconId; label: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'node', label: 'Node.js' },
  { id: 'postgres', label: 'PostgreSQL' },
];

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Vitrine() {
  const [tema, setTema] = useState<'padrao' | 'ghost'>('padrao');

  function alternar() {
    const novo = tema === 'ghost' ? 'padrao' : 'ghost';
    setTema(novo);
    // Prévia manual do que o Konami vai fazer na frente 04: a troca é um
    // atributo no <html>, e toda a camada semântica de tokens acompanha.
    document.documentElement.dataset.theme = novo === 'ghost' ? 'ghost' : '';
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-titulo text-accent">
          <Glitch texto="DESIGN SYSTEM" />
        </h1>
        <button
          type="button"
          onClick={alternar}
          className="border border-hud px-4 py-2 font-mono text-xs text-accent"
        >
          tema: {tema}
        </button>
      </header>

      <Secao titulo="Tipografia">
        <p className="font-display text-display text-primary">Aa</p>
        <p className="max-w-prose leading-[var(--leading-corpo)] text-primary">
          Space Grotesk no corpo. Uma grotesca com terminações cortadas e desenho
          levemente mecânico, que conversa com a Orbitron sem competir com ela.
        </p>
        <p className="max-w-prose leading-[var(--leading-corpo)] text-muted">
          O mesmo parágrafo em texto secundário, para conferir que continua legível sobre
          o fundo escuro.
        </p>
        <pre className="font-mono text-sm text-terminal">
          {'> whoami\n> 0123456789 Il1 O0'}
        </pre>
      </Secao>

      <Secao titulo="Paleta">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['accent', 'text-accent'],
              ['accent-alt', 'text-accent-alt'],
              ['terminal', 'text-terminal'],
              ['danger', 'text-danger'],
              ['hp', 'text-hp'],
              ['mp', 'text-mp'],
              ['xp', 'text-xp'],
              ['ouro', 'text-ouro'],
            ] as const
          ).map(([nome, classe]) => (
            <li
              key={nome}
              className={`border border-hud p-3 font-mono text-xs ${classe}`}
            >
              {nome}
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Painel e ficha">
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel as="article" className="flex flex-col gap-3">
            <h3 className="font-display text-secao text-primary">Projeto Exemplo</h3>
            <StarRating nivel={4} />
            <ul className="flex flex-wrap gap-3 font-mono text-xs text-muted">
              {STACK.map(({ id, label }) => (
                <li key={id} className="flex items-center gap-1.5">
                  <TechIcon id={id} className="text-accent" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-[var(--leading-corpo)] text-muted">
              Descrição curta do projeto, do tamanho que aparece na listagem.
            </p>
          </Panel>

          <Panel as="article" variante="aceso" className="flex flex-col gap-4">
            <h3 className="font-display text-secao text-primary">Atributos</h3>
            <StatBar rotulo="Frontend" nivel={5} stat="mp" />
            <StatBar rotulo="Backend" nivel={3} stat="hp" />
            <StatBar rotulo="Infra" nivel={2} stat="xp" />
          </Panel>
        </div>
      </Secao>

      <Secao titulo="Imagem (com fallback)">
        <div className="grid gap-4 sm:grid-cols-2">
          <CloudImage publicId="portfolio/exemplo/inexistente" alt="Exemplo de capa" />
          <p className="self-center font-mono text-xs text-muted">
            publicId inválido de propósito: o placeholder ocupa exatamente as mesmas
            dimensões, então o layout não desloca quando a imagem falha.
          </p>
        </div>
      </Secao>
    </main>
  );
}
