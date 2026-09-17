import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EggId } from '@/data/easterEggs';
import { registrarDescoberta } from './analytics';

/**
 * Estado dos easter eggs — ADR-0011.
 *
 * Por que Zustand e não Context: boa parte das escritas acontece FORA do
 * React — um listener de keydown no window detectando Konami, um callback
 * onComplete de timeline GSAP marcando achievement. Aqui isso é
 * `useEasterEggs.getState().unlock('konami')` de qualquer lugar; com
 * Context exigiria montar um componente-ponte só para chamar o dispatch.
 *
 * `EggId` vem do catálogo em `@/data/easterEggs` — TIPO atravessa a
 * fronteira do ADR-0006, dado não. É o que mantém a lista em um lugar só
 * sem a store passar a ler conteúdo.
 */
export type { EggId };

export type Tema = 'padrao' | 'ghost';

interface EasterEggsState {
  desbloqueados: EggId[];
  /** Fila de toasts ainda não exibidos. Ver `unlock`. */
  fila: EggId[];
  tema: Tema;
  terminalAberto: boolean;

  /** Idempotente de propósito: desbloquear duas vezes não dispara dois toasts. */
  unlock: (id: EggId) => void;
  jaDesbloqueado: (id: EggId) => boolean;
  /** Tira o primeiro da fila — quem chama é o toast, ao terminar de exibir. */
  consumirDaFila: () => void;
  alternarTema: () => void;
  setTerminalAberto: (aberto: boolean) => void;
}

export const useEasterEggs = create<EasterEggsState>()(
  persist(
    (set, get) => ({
      desbloqueados: [],
      fila: [],
      tema: 'padrao',
      terminalAberto: false,

      /**
       * A guarda no topo é o item "idempotente" da frente 04, e ela
       * protege três coisas de uma vez: o toast não repete, a lista não
       * duplica, e o evento do ADR-0022 conta DESCOBERTA, não repetição —
       * um Konami digitado dez vezes seguidas é uma descoberta só.
       *
       * A fila existe porque os gatilhos podem coincidir: quem rola até o
       * rodapé perto dos dois minutos de página dispara dois eggs quase
       * juntos, e um toast sobrescrevendo o outro perderia o primeiro.
       */
      unlock: (id) => {
        if (get().desbloqueados.includes(id)) return;

        set((s) => ({
          desbloqueados: [...s.desbloqueados, id],
          fila: [...s.fila, id],
        }));

        registrarDescoberta(id);
      },

      jaDesbloqueado: (id) => get().desbloqueados.includes(id),

      consumirDaFila: () => set((s) => ({ fila: s.fila.slice(1) })),

      alternarTema: () => set((s) => ({ tema: s.tema === 'ghost' ? 'padrao' : 'ghost' })),

      setTerminalAberto: (aberto) => set({ terminalAberto: aberto }),
    }),
    {
      // Chave versionada para poder invalidar depois sem quebrar quem já
      // visitou (ADR-0011).
      name: 'portfolio:achievements:v1',

      storage: createJSONStorage(() => {
        // Hidratação defensiva (ADR-0026, item 4): navegador em modo
        // privativo ou com armazenamento bloqueado LANÇA ao acessar
        // localStorage. Um achievement não pode derrubar o boot.
        try {
          const teste = '__portfolio_probe__';
          window.localStorage.setItem(teste, teste);
          window.localStorage.removeItem(teste);
          return window.localStorage;
        } catch {
          // Armazenamento de mentirinha: o site funciona, o progresso
          // simplesmente não sobrevive ao refresh. Troca aceitável.
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
      }),

      // O tema, a fila e o terminal não persistem: são estado de sessão.
      // Só o progresso do visitante sobrevive ao refresh — e a fila, se
      // persistisse, faria a página abrir cuspindo os toasts da visita
      // passada.
      partialize: (s) => ({ desbloqueados: s.desbloqueados }) as EasterEggsState,

      /**
       * O que volta do `localStorage` é texto que qualquer pessoa pode
       * editar no inspetor, e ele chega sem tipo nenhum: `desbloqueados`
       * pode voltar como objeto, como número, ou com um id que saiu do
       * catálogo entre duas visitas. Sem este filtro, o `.includes` do
       * `unlock` lançaria no primeiro egg da sessão — e um achievement
       * derrubaria o site (ADR-0026).
       *
       * A checagem aqui é de FORMA, não de catálogo: a store conhece o
       * tipo `EggId`, não a lista. Quem descarta um id que não existe
       * mais é o toast, que recebe o catálogo por props e simplesmente
       * não tem o que anunciar.
       */
      merge: (persistido, atual) => {
        const salvo = persistido as Partial<EasterEggsState> | undefined;
        const desbloqueados = Array.isArray(salvo?.desbloqueados)
          ? salvo.desbloqueados.filter((id): id is EggId => typeof id === 'string')
          : [];

        return { ...atual, desbloqueados };
      },
    },
  ),
);
