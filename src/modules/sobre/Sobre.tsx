import { Panel, StatBar, TechIcon } from '@/shared/ui';
import type { Attribute, Profile, TimelineEntry } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Sobre — a bio, os atributos do personagem e o histórico de campanha.
 *
 * É aqui que a metáfora de RPG deixa de valer só para os cards de projeto
 * e passa a valer para a pessoa: habilidades como atributos, experiência
 * como histórico (ADR-0024).
 */
interface SobreProps {
  perfil: Profile;
  atributos: Attribute[];
  trajetoria: TimelineEntry[];
}

const ORDEM_CATEGORIA: Attribute['category'][] = [
  'frontend',
  'backend',
  'infra',
  'ferramentas',
];

const STAT_POR_CATEGORIA = {
  frontend: 'mp',
  backend: 'hp',
  infra: 'xp',
  ferramentas: 'ouro',
} as const;

/** '2024-01' → 'jan 2024'. Exibição apenas — ver ADR-0024, decisão 3. */
function formatarMes(valor: string): string {
  if (valor === 'atual') return copy.sobre.atual;
  const [ano, mes] = valor.split('-');
  if (!ano || !mes) return valor;
  const data = new Date(Number(ano), Number(mes) - 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(
    data,
  );
}

export function Sobre({ perfil, atributos, trajetoria }: SobreProps) {
  return (
    <section id="sobre" className="px-6 py-24 sm:px-10">
      <h2 className="mb-10 font-display text-titulo text-accent">{copy.sobre.titulo}</h2>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-10">
          <p className="max-w-prose text-lg leading-[var(--leading-corpo)] text-muted">
            {perfil.bio}
          </p>

          <div>
            <h3 className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
              {copy.sobre.trajetoria}
            </h3>

            <ol className="mt-6 flex flex-col gap-8 border-l border-hud pl-6">
              {trajetoria.map((item) => (
                <li key={item.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-2 -left-[1.9rem] h-2 w-2 bg-accent"
                  />
                  <p className="font-display text-secao text-primary">{item.role}</p>
                  <p className="font-mono text-xs text-accent">{item.org}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {formatarMes(item.start)} — {formatarMes(item.end)}
                  </p>
                  <p className="mt-3 leading-[var(--leading-corpo)] text-muted">
                    {item.summary}
                  </p>
                  {item.highlights && (
                    <ul className="mt-3 flex list-disc flex-col gap-1 pl-4 text-sm text-muted">
                      {item.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <a
            href={perfil.resumeUrl}
            download
            className="self-start border border-hud px-5 py-3 font-mono text-sm text-accent"
          >
            {copy.sobre.curriculo} ↓
          </a>
        </div>

        <Panel as="aside" className="flex h-fit flex-col gap-6">
          <h3 className="font-display text-secao text-primary">{copy.sobre.atributos}</h3>

          {ORDEM_CATEGORIA.map((categoria) => {
            const doGrupo = atributos.filter((a) => a.category === categoria);
            if (doGrupo.length === 0) return null;

            return (
              <div key={categoria} className="flex flex-col gap-3">
                <p className="font-mono text-[0.65rem] tracking-[0.25em] text-muted uppercase">
                  {categoria}
                </p>
                {doGrupo.map((a) => (
                  <div key={a.label} className="flex items-center gap-3">
                    <TechIcon id={a.icon} className="shrink-0 text-accent" />
                    <div className="flex-1">
                      <StatBar
                        rotulo={a.label}
                        nivel={a.level}
                        stat={STAT_POR_CATEGORIA[categoria]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </Panel>
      </div>
    </section>
  );
}
