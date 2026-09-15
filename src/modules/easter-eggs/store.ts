import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Estado dos easter eggs — ADR-0011.
 *
 * Por que Zustand e não Context: boa parte das escritas acontece FORA do
 * React — um listener de keydown no window detectando Konami, um callback
 * onComplete de timeline GSAP marcando achievement. Aqui isso é
 * `useEasterEggs.getState().unlock('konami')` de qualquer lugar; com
 * Context exigiria montar um componente-ponte só para chamar o dispatch.
 */
export type EggId = 'konami' | 'terminal' | 'fim-da-pagina' | 'clique-insistente';

export type Tema = 'padrao' | 'ghost';

interface EasterEggsState {
  desbloqueados: EggId[];
  tema: Tema;
  terminalAberto: boolean;

  /** Idempotente de propósito: desbloquear duas vezes não dispara dois toasts. */
  unlock: (id: EggId) => void;
  jaDesbloqueado: (id: EggId) => boolean;
  alternarTema: () => void;
  setTerminalAberto: (aberto: boolean) => void;
}

export const useEasterEggs = create<EasterEggsState>()(
  persist(
    (set, get) => ({
      desbloqueados: [],
      tema: 'padrao',
      terminalAberto: false,

      unlock: (id) => {
        if (get().desbloqueados.includes(id)) return;
        set((s) => ({ desbloqueados: [...s.desbloqueados, id] }));
      },

      jaDesbloqueado: (id) => get().desbloqueados.includes(id),

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

      // O tema e o terminal não persistem: são estado de sessão. Só o
      // progresso do visitante sobrevive ao refresh.
      partialize: (s) => ({ desbloqueados: s.desbloqueados }) as EasterEggsState,
    },
  ),
);
