import type { Attribute, Profile } from '@/data/types';
import type { EasterEgg, EggId } from '@/data/easterEggs';
import { copy } from '@/i18n';

/**
 * Parser do terminal falso — DECISOES-TECNICAS seção 5.
 *
 * Função pura, de propósito: recebe a linha digitada e o conteúdo, devolve
 * o que imprimir. Nada de DOM, nada de store. É o alvo de teste barato do
 * ADR-0017 — o caminho do comando desconhecido, que é o que costuma
 * quebrar calado, se verifica sem montar componente nenhum.
 *
 * O conteúdo chega por parâmetro e não por import: `whoami` e `skills`
 * mostram perfil e atributos de verdade, e quem lê `@/data` é `app/`
 * (ADR-0006).
 */
export interface ContextoDoTerminal {
  perfil: Profile;
  atributos: Attribute[];
  /** Para o comando `achievements`: o catálogo já filtrado pela store. */
  desbloqueados: readonly EasterEgg[];
}

export interface RespostaDoTerminal {
  /** Linhas a imprimir. Vazio é resposta válida — `clear` não imprime nada. */
  linhas: string[];
  /** Limpa o histórico antes de imprimir. */
  limpar?: boolean;
  /** Fecha o painel. */
  fechar?: boolean;
  /** Egg que este comando desbloqueia, se algum. */
  desbloqueia?: EggId;
}

/**
 * O catálogo de comandos é uma lista e não um `switch` porque `help`
 * também o lê: descrever o comando ao lado dele é o que impede a ajuda de
 * envelhecer separada da implementação. Os botões de atalho do ADR-0023
 * saem daqui pelo mesmo motivo.
 */
interface Comando {
  nome: string;
  descricao: string;
  /** Aparece como botão de atalho. `sudo hire-me` sim; `clear` não. */
  atalho: boolean;
  executar: (ctx: ContextoDoTerminal) => RespostaDoTerminal;
}

/** Estrelas da mesma escala 1–5 do resto do site (ADR-0007, ADR-0024). */
function barraDeNivel(nivel: number): string {
  return '█'.repeat(nivel) + '░'.repeat(5 - nivel);
}

export const COMANDOS: Comando[] = [
  {
    nome: 'help',
    descricao: 'lista o que dá para digitar aqui',
    atalho: true,
    executar: () => ({
      linhas: [
        copy.eggs.terminal.ajuda,
        ...COMANDOS.map((c) => `  ${c.nome.padEnd(14)} ${c.descricao}`),
      ],
    }),
  },
  {
    nome: 'whoami',
    descricao: 'quem escreveu este site',
    atalho: true,
    executar: ({ perfil }) => ({
      linhas: [
        perfil.name,
        perfil.title,
        ...(perfil.location ? [perfil.location] : []),
        '',
        perfil.bio,
      ],
    }),
  },
  {
    nome: 'skills',
    descricao: 'atributos do personagem',
    atalho: true,
    executar: ({ atributos }) => ({
      linhas: atributos.map(
        (a) => `  ${a.label.padEnd(14)} ${barraDeNivel(a.level)}  ${a.category}`,
      ),
    }),
  },
  {
    nome: 'achievements',
    descricao: 'o que você já encontrou',
    atalho: true,
    executar: ({ desbloqueados }) => ({
      // Só o que JÁ foi encontrado: listar o que falta entregaria os
      // outros eggs de graça e acabaria com a graça deles.
      linhas: desbloqueados.length
        ? desbloqueados.map((egg) => `  [x] ${egg.titulo}`)
        : [copy.eggs.terminal.semConquistas],
    }),
  },
  {
    nome: 'sudo hire-me',
    descricao: 'o motivo de este site existir',
    atalho: true,
    executar: ({ perfil }) => ({
      linhas: [
        copy.eggs.terminal.contratando,
        `  ${perfil.social.email}`,
        `  ${perfil.social.linkedin}`,
        `  ${perfil.social.github}`,
      ],
      desbloqueia: 'terminal',
    }),
  },
  {
    nome: 'clear',
    descricao: 'limpa a tela',
    atalho: false,
    executar: () => ({ linhas: [], limpar: true }),
  },
  {
    nome: 'exit',
    descricao: 'fecha o terminal',
    atalho: false,
    executar: () => ({ linhas: [], fechar: true }),
  },
];

export const ATALHOS = COMANDOS.filter((c) => c.atalho).map((c) => c.nome);

/**
 * Normaliza antes de comparar: `  SUDO   hire-me ` é o mesmo comando.
 * Espaço interno colapsa porque `sudo hire-me` tem dois pedaços, e quem
 * digita costuma errar o espaçamento antes de errar o nome.
 */
function normalizar(entrada: string): string {
  return entrada.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function executarComando(
  entrada: string,
  contexto: ContextoDoTerminal,
): RespostaDoTerminal {
  const comando = normalizar(entrada);

  // Enter numa linha vazia não é erro: só devolve o prompt, como num
  // terminal de verdade.
  if (!comando) return { linhas: [] };

  const encontrado = COMANDOS.find((c) => c.nome === comando);

  if (!encontrado) {
    return {
      linhas: [copy.eggs.terminal.desconhecido.replace('{comando}', comando)],
    };
  }

  return encontrado.executar(contexto);
}
