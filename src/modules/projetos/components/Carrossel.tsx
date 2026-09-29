import { useState, type KeyboardEvent } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  TRANSICAO_HUD,
  type Variants,
} from '@/shared/animation/motion';
import { CloudImage } from '@/shared/ui';
import { copy } from '@/i18n';

/**
 * Carrossel das capturas de um projeto — ADR-0032.
 *
 * Mora em `components/` e não inline no `ConteudoFicha` por ter estado e
 * teclado próprios: dentro dele, os dois ficariam ilegíveis.
 *
 * Três coisas aqui não são detalhe:
 *
 * 1. A CAIXA É RESERVADA pelo `CloudImage` (`proporcao`), então trocar de
 *    slide não desloca layout — o que protege o CLS e os ScrollTriggers, que
 *    mediram o documento antes (ADR-0014, ADR-0012 item 3).
 * 2. A POSIÇÃO É ANUNCIADA em região viva. Quem não vê a imagem precisa
 *    saber que ela trocou, e para qual (ADR-0019, compromisso 4). `polite`
 *    espera o leitor terminar a frase atual.
 * 3. As SETAS SÃO BOTÕES e é nelas que ←/→ escutam, não num `<div>` com
 *    handler: teclado em elemento não interativo é o que o jsx-a11y barra, e
 *    com razão — o alvo precisa ser alcançável por Tab antes de responder a
 *    tecla.
 *
 * Com uma imagem só, os controles não aparecem: seta que não leva a lugar
 * nenhum é ruído, e um indicador único não indica nada.
 */
interface CarrosselProps {
  /** publicIds do Cloudinary, sem extensão. `[cover, ...galeria]`. */
  imagens: string[];
  /** Compõe o `alt` de cada slide. */
  nomeDoProjeto: string;
}

/**
 * O slide entra do lado de onde veio: a direção é o sinal do passo, e é ela
 * que transforma "apareceu outra imagem" em "andei para a direita".
 *
 * Variantes dinâmicas (função + `custom`) em vez de dois conjuntos: é o
 * mesmo movimento espelhado, e duplicá-lo seria duas coisas para manter.
 */
const VARIANTES_SLIDE: Variants = {
  entrando: (direcao: number) => ({ opacity: 0, x: direcao > 0 ? 24 : -24 }),
  parado: { opacity: 1, x: 0 },
  saindo: (direcao: number) => ({ opacity: 0, x: direcao > 0 ? -24 : 24 }),
};

/** Reduzido: mesmas chaves, todas no estado final (ADR-0019). */
const VARIANTES_NEUTRAS: Variants = {
  entrando: { opacity: 1, x: 0 },
  parado: { opacity: 1, x: 0 },
  saindo: { opacity: 1, x: 0 },
};

export function Carrossel({ imagens, nomeDoProjeto }: CarrosselProps) {
  const [indice, setIndice] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const reduzido = useReducedMotion();

  const total = imagens.length;
  const atual = imagens[indice];

  // `noUncheckedIndexedAccess` obriga a guarda, e ela é honesta: lista vazia
  // não renderiza nada. Card sem capa continua sendo card sem imagem.
  if (!atual) return null;

  function irPara(proximo: number) {
    // Circula nos dois sentidos: quem chegou no fim quer ver a primeira de
    // novo, não encontrar um botão morto.
    const destino = (proximo + total) % total;
    setDirecao(proximo > indice ? 1 : -1);
    setIndice(destino);
  }

  function aoTeclar(evento: KeyboardEvent) {
    if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      irPara(indice + 1);
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      irPara(indice - 1);
    }
  }

  const posicao = copy.projetos.carrossel.posicao
    .replace('{atual}', String(indice + 1))
    .replace('{total}', String(total));

  const variantes = reduzido ? VARIANTES_NEUTRAS : VARIANTES_SLIDE;
  const soUma = total === 1;

  return (
    <div>
      <div className="relative">
        {/* `mode="wait"` porque as duas imagens ocupam a MESMA caixa: deixar
            as duas montadas ao mesmo tempo empilharia uma sobre a outra. */}
        <AnimatePresence mode="wait" custom={direcao} initial={false}>
          <motion.div
            key={atual}
            custom={direcao}
            variants={variantes}
            initial="entrando"
            animate="parado"
            exit="saindo"
            transition={reduzido ? { duration: 0 } : TRANSICAO_HUD}
          >
            <CloudImage
              publicId={atual}
              alt={`Captura de tela do projeto ${nomeDoProjeto} — ${posicao}`}
              proporcao="16/9"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </motion.div>
        </AnimatePresence>

        {!soUma && (
          <>
            <button
              type="button"
              onClick={() => irPara(indice - 1)}
              onKeyDown={aoTeclar}
              aria-label={copy.projetos.carrossel.anterior}
              className="absolute top-1/2 left-2 -translate-y-1/2 border border-hud bg-panel/80 p-2 text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => irPara(indice + 1)}
              onKeyDown={aoTeclar}
              aria-label={copy.projetos.carrossel.proxima}
              className="absolute top-1/2 right-2 -translate-y-1/2 border border-hud bg-panel/80 p-2 text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <CaretRight size={16} weight="bold" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* A frase vive FORA do bloco condicional dos controles: mesmo com uma
          imagem só, quem usa leitor de tela recebe o rótulo do que está
          vendo. É `sr-only` porque na tela a própria imagem já diz. */}
      <p aria-live="polite" className="sr-only">
        {posicao}
      </p>

      {!soUma && (
        <div className="mt-3 flex justify-center gap-2">
          {imagens.map((publicId, i) => (
            <button
              key={publicId}
              type="button"
              onClick={() => irPara(i)}
              onKeyDown={aoTeclar}
              aria-label={copy.projetos.carrossel.irPara.replace('{n}', String(i + 1))}
              aria-current={i === indice}
              className={`h-1.5 w-6 transition-colors ${
                i === indice ? 'bg-accent' : 'bg-hud hover:bg-accent-alt'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
