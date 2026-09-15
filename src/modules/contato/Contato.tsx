import { useId, useState, type FormEvent } from 'react';
import { GithubLogo, LinkedinLogo, Envelope } from '@phosphor-icons/react';
import type { Profile } from '@/data/types';
import { copy } from '@/i18n';

/**
 * Contato — ADR-0021.
 *
 * Duas decisões daquele ADR aparecem literalmente aqui:
 *
 * 1. O E-MAIL FICA VISÍVEL ao lado do formulário. Esconder o endereço
 *    atrás de um formulário só prejudica o dono do site — quem prefere o
 *    próprio cliente de e-mail, ou desconfia de formulário, perde o
 *    caminho.
 * 2. O ERRO OFERECE O E-MAIL DIRETO. Um formulário que falha calado é
 *    pior que não ter formulário, e este é o único canal de contato.
 *
 * Honeypot em vez de CAPTCHA: mais eficaz por unidade de esforço, e sem o
 * atrito e o problema de acessibilidade do CAPTCHA (ADR-0019).
 */
type Estado = 'parado' | 'enviando' | 'sucesso' | 'erro';

const ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

interface ContatoProps {
  perfil: Profile;
}

export function Contato({ perfil }: ContatoProps) {
  const [estado, setEstado] = useState<Estado>('parado');
  const idNome = useId();
  const idEmail = useId();
  const idMensagem = useId();

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    setEstado('enviando');

    try {
      const resposta = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
      });
      if (!resposta.ok) throw new Error(`Web3Forms respondeu ${resposta.status}`);
      setEstado('sucesso');
      form.reset();
    } catch (erro) {
      // Deixa rastro: sem monitoramento, o console é o único sinal que
      // sobra (ADR-0026).
      console.error('[contato] falha no envio', erro);
      setEstado('erro');
    }
  }

  return (
    <section id="contato" className="px-6 py-24 sm:px-10">
      <h2 className="font-display text-titulo text-accent">{copy.contato.titulo}</h2>
      <p className="mt-2 max-w-prose leading-[var(--leading-corpo)] text-muted">
        {copy.contato.subtitulo}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_16rem]">
        <form onSubmit={enviar} className="flex max-w-xl flex-col gap-5">
          <input type="hidden" name="access_key" value={ACCESS_KEY ?? ''} />
          <input type="hidden" name="subject" value="Contato pelo portfólio" />

          {/* Honeypot: invisível para gente, irresistível para robô. */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />

          <div className="flex flex-col gap-2">
            <label htmlFor={idNome} className="font-mono text-xs text-muted">
              {copy.contato.nome}
            </label>
            <input
              id={idNome}
              name="name"
              type="text"
              required
              className="border border-hud bg-panel px-4 py-3 text-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={idEmail} className="font-mono text-xs text-muted">
              {copy.contato.email}
            </label>
            <input
              id={idEmail}
              name="email"
              type="email"
              required
              className="border border-hud bg-panel px-4 py-3 text-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={idMensagem} className="font-mono text-xs text-muted">
              {copy.contato.mensagem}
            </label>
            <textarea
              id={idMensagem}
              name="message"
              rows={5}
              required
              className="border border-hud bg-panel px-4 py-3 text-primary"
            />
          </div>

          <button
            type="submit"
            disabled={estado === 'enviando'}
            className="self-start border border-accent px-6 py-3 font-mono text-sm text-accent disabled:opacity-50"
          >
            {estado === 'enviando' ? copy.contato.enviando : copy.contato.enviar}
          </button>

          {/* Anunciado, não gritado — e o erro sempre carrega o plano B. */}
          <p role="status" aria-live="polite" className="font-mono text-sm">
            {estado === 'sucesso' && (
              <span className="text-terminal">{copy.contato.sucesso}</span>
            )}
            {estado === 'erro' && (
              <span className="text-danger">
                {copy.contato.erro}{' '}
                <a
                  href={`mailto:${perfil.social.email}`}
                  className="underline underline-offset-4"
                >
                  {perfil.social.email}
                </a>
              </span>
            )}
          </p>
        </form>

        <ul className="flex h-fit flex-col gap-4 font-mono text-sm">
          <li>
            <a
              href={`mailto:${perfil.social.email}`}
              className="flex items-center gap-3 text-accent"
            >
              <Envelope size={18} weight="bold" aria-hidden="true" />
              {perfil.social.email}
            </a>
          </li>
          <li>
            <a
              href={perfil.social.github}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 text-accent"
            >
              <GithubLogo size={18} weight="bold" aria-hidden="true" />
              GitHub ↗
            </a>
          </li>
          <li>
            <a
              href={perfil.social.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 text-accent"
            >
              <LinkedinLogo size={18} weight="bold" aria-hidden="true" />
              LinkedIn ↗
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
