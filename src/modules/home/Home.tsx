import { Hero } from '@/modules/hero';
import { ListaProjetos } from '@/modules/projetos';
import { Sobre } from '@/modules/sobre';
import { Contato } from '@/modules/contato';
import type { Attribute, Profile, Project, Retrato, TimelineEntry } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Home rolável — ADR-0010.
 *
 * Todas as seções numa página só; o deep link por projeto vive na rota de
 * detalhe. A home não busca dado nenhum: recebe tudo por props de `app/`,
 * que é a única camada autorizada a ler `@/data` (ADR-0006, amarra 2 do
 * ADR-0008 — e o lint garante).
 */
interface HomeProps {
  perfil: Profile;
  projetos: Project[];
  atributos: Attribute[];
  trajetoria: TimelineEntry[];
  retratos: Retrato[];
}

export function Home({ perfil, projetos, atributos, trajetoria, retratos }: HomeProps) {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        {copy.nav.pularParaConteudo}
      </a>

      <main id="conteudo">
        <Hero perfil={perfil} retratos={retratos} />
        <ListaProjetos projetos={projetos} />
        <Sobre perfil={perfil} atributos={atributos} trajetoria={trajetoria} />
        <Contato perfil={perfil} />
      </main>
    </>
  );
}
