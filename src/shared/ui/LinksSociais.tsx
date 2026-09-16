import { GithubLogo, LinkedinLogo, Envelope, type Icon } from '@phosphor-icons/react';
import type { Profile } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Os três canais de contato, num componente só.
 *
 * Nasceu como bloco solto dentro do `Contato` e subiu para cá quando o
 * rodapé virou o segundo consumidor real (ADR-0009, regra 3 — promover no
 * segundo, não no segundo hipotético).
 *
 * `Profile.social` é um objeto de três chaves fixas, não um array, e fica
 * assim de propósito: ele é o contrato do ADR-0024, e derivar a lista aqui
 * custa menos que mexer no contrato. Quando entrar uma quarta rede, o lugar
 * de decidir isso é um ADR, não este arquivo.
 *
 * Recebe `social` por props — `shared/` não lê `@/data` (o lint barra), e é
 * isso que mantém a troca por API restrita à camada `app/`.
 */
interface LinksSociaisProps {
  social: Profile['social'];
  /**
   * `lista` escreve o rótulo ao lado do ícone — é o formato do rodapé, onde
   * o endereço de e-mail precisa estar legível.
   *
   * `icones` mostra só os ícones. Usado no Contato, que fica logo acima do
   * rodapé: repetir os três endereços por extenso a uma tela de distância
   * um do outro não informa, só enche. O nome acessível continua em
   * `aria-label`, então para o leitor de tela nada muda.
   */
  variante?: 'lista' | 'icones';
  /** Só vale para `lista`. */
  orientacao?: 'coluna' | 'linha';
  className?: string;
}

interface Canal {
  id: string;
  rotulo: string;
  href: string;
  Icone: Icon;
  externo: boolean;
}

function canaisDe(social: Profile['social']): Canal[] {
  return [
    {
      id: 'email',
      rotulo: social.email,
      href: `mailto:${social.email}`,
      Icone: Envelope,
      externo: false,
    },
    {
      id: 'github',
      rotulo: 'GitHub',
      href: social.github,
      Icone: GithubLogo,
      externo: true,
    },
    {
      id: 'linkedin',
      rotulo: 'LinkedIn',
      href: social.linkedin,
      Icone: LinkedinLogo,
      externo: true,
    },
  ];
}

export function LinksSociais({
  social,
  variante = 'lista',
  orientacao = 'coluna',
  className = '',
}: LinksSociaisProps) {
  const canais = canaisDe(social);

  if (variante === 'icones') {
    return (
      <ul className={`flex h-fit flex-row gap-5 ${className}`}>
        {canais.map(({ id, rotulo, href, Icone, externo }) => (
          <li key={id}>
            <a
              href={href}
              {...(externo && { target: '_blank', rel: 'noreferrer noopener' })}
              // Sem texto visível, o nome acessível TEM de vir daqui — do
              // contrário o link é anunciado pela URL (ADR-0019). O `title`
              // é para o mouse, que também perdeu o rótulo.
              aria-label={externo ? `${rotulo} (${copy.rodape.novaAba})` : rotulo}
              title={rotulo}
              className="block text-muted transition-colors hover:text-accent"
            >
              <Icone size={26} weight="light" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    );
  }

  const direcao = orientacao === 'linha' ? 'flex-row flex-wrap gap-6' : 'flex-col gap-4';

  return (
    <ul className={`flex h-fit ${direcao} font-mono text-sm ${className}`}>
      {canais.map(({ id, rotulo, href, Icone, externo }) => (
        <li key={id}>
          <a
            href={href}
            {...(externo && { target: '_blank', rel: 'noreferrer noopener' })}
            className="flex items-center gap-3 text-accent"
          >
            <Icone size={18} weight="bold" aria-hidden="true" />
            {/* Rótulo e seta no MESMO span: o `gap-3` é para separar o ícone
                do texto, e solto ele abriria um vão entre "GitHub" e o ↗. */}
            <span>
              {rotulo}
              {/* aria-hidden: solta, a seta vira "north east arrow" no leitor
                  de tela. O aviso em palavras vem logo abaixo. */}
              {externo && <span aria-hidden="true"> ↗</span>}
            </span>
            {/* A seta é dica visual; quem usa leitor de tela precisa do aviso
                em palavras (ADR-0019). */}
            {externo && <span className="sr-only">{copy.rodape.novaAba}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
