import { useEffect } from 'react';
import type { Attribute, Profile } from '@/data/types';
import type { EasterEgg } from '@/data/easterEggs';
import { useEasterEggs } from './store';
import { observarKonami } from './konami';
import { observarGestoKonami } from './gesto';
import {
  observarCliqueInsistente,
  observarFimDaPagina,
  observarTempoNaPagina,
} from './gatilhos';
import { ToastConquista } from './ToastConquista';
import { Terminal } from './Terminal';

/**
 * Raiz dos easter eggs — a peça que liga reconhecedores, estado e tela.
 *
 * Montada uma vez em `app/App.tsx`, fora das rotas: um egg descoberto na
 * ficha de um projeto é o mesmo egg da home, e remontar os reconhecedores
 * a cada troca de rota zeraria o buffer do Konami no meio da digitação e
 * recomeçaria o contador de permanência do zero.
 *
 * Os reconhecedores escrevem na store de fora do React (ADR-0011) — daí
 * `getState()` em vez de hooks dentro dos listeners: assinar o estado aqui
 * faria os efeitos se recriarem a cada desbloqueio, que é exatamente o que
 * não pode acontecer com um listener acumulando buffer.
 */
interface EasterEggsProps {
  perfil: Profile;
  atributos: Attribute[];
  catalogo: readonly EasterEgg[];
}

export function EasterEggs({ perfil, atributos, catalogo }: EasterEggsProps) {
  const tema = useEasterEggs((s) => s.tema);

  /**
   * Os dois caminhos do Konami, o mesmo desbloqueio.
   *
   * É a regra central do ADR-0023: o que muda é o gesto, nunca a
   * recompensa. Teclado e touch chamam a MESMA função, então o
   * achievement é único e o `unlock` idempotente resolve quem fizer os
   * dois (ADR-0011).
   *
   * O tema alterna em vez de só ligar: repetir o código desfaz o modo
   * ghost, e quem entrou sem querer não fica preso em fósforo verde.
   */
  useEffect(() => {
    function aoCompletar() {
      const { unlock, alternarTema } = useEasterEggs.getState();
      unlock('konami');
      alternarTema();
    }

    const limpezas = [
      observarKonami(aoCompletar),
      observarGestoKonami({ aoCompletar }),
      observarFimDaPagina(() => useEasterEggs.getState().unlock('fim-da-pagina')),
      observarCliqueInsistente(() =>
        useEasterEggs.getState().unlock('clique-insistente'),
      ),
      observarTempoNaPagina(() => useEasterEggs.getState().unlock('tempo-na-pagina')),
    ];

    return () => limpezas.forEach((limpar) => limpar());
  }, []);

  /**
   * O tema é um atributo no `<html>` e mais nada: a camada semântica de
   * tokens se redefine sob `[data-theme="ghost"]` e o site inteiro
   * acompanha, sem uma classe condicional em componente nenhum
   * (ADR-0013). A transição de cor é CSS puro, em `styles/index.css`.
   */
  useEffect(() => {
    const raiz = document.documentElement;

    if (tema === 'ghost') raiz.dataset.theme = 'ghost';
    else delete raiz.dataset.theme;
  }, [tema]);

  return (
    <>
      <ToastConquista catalogo={catalogo} />
      <Terminal perfil={perfil} atributos={atributos} catalogo={catalogo} />
    </>
  );
}
