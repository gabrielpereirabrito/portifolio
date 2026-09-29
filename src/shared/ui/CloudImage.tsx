import { useState } from 'react';
import {
  urlImagem,
  srcSetImagem,
  cloudinaryConfigurado,
  LARGURAS,
} from '@/shared/lib/cloudinary';
import { copy } from '@/i18n';

/**
 * Imagem hospedada no Cloudinary — ADR-0014 + ADR-0026.
 *
 * Duas coisas são obrigatórias aqui e fáceis de esquecer:
 *
 * 1. DIMENSÃO SEMPRE RESERVADA. Sem `aspect-ratio`, a imagem chega e
 *    empurra o layout: quebra o CLS (ADR-0020) e desalinha os
 *    ScrollTriggers, que mediram o documento antes (ADR-0012, item 3).
 *
 * 2. O PLACEHOLDER OCUPA O MESMO ESPAÇO. Se o Cloudinary estiver fora do
 *    ar, o publicId estiver errado, OU NEM EXISTIR (projeto sem capa,
 *    ADR-0033), cair para um vazio de altura zero causa o mesmo
 *    deslocamento que o item 1 tentou evitar — por isso `publicId` é
 *    opcional e os dois casos caem no mesmo ramo visual. Só o texto do
 *    `aria-label` distingue "sem capa" (nunca houve) de "indisponível"
 *    (falhou ao carregar) — são coisas diferentes para quem usa leitor de
 *    tela.
 */
interface CloudImageProps {
  publicId?: string;
  alt: string;
  proporcao?: `${number}/${number}`;
  /** A imagem do hero é o LCP: sem lazy e com prioridade alta. */
  prioritaria?: boolean;
  /** Dica de largura para o navegador escolher no srcset. */
  sizes?: string;
  className?: string;
}

export function CloudImage({
  publicId,
  alt,
  proporcao = '16/9',
  prioritaria = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
}: CloudImageProps) {
  const [falhou, setFalhou] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-panel ${className}`}
      style={{ aspectRatio: proporcao }}
    >
      {!publicId || falhou || !cloudinaryConfigurado() ? (
        // Placeholder temático: moldura com um símbolo de item ausente, no
        // vocabulário do site. Nunca o ícone quebrado do navegador.
        <div
          role="img"
          aria-label={`${alt} (${!publicId ? copy.imagem.semCapa : copy.imagem.indisponivel})`}
          className="flex h-full w-full items-center justify-center border border-hud"
        >
          <span aria-hidden="true" className="font-mono text-2xl text-hud">
            ▨
          </span>
        </div>
      ) : (
        <img
          src={urlImagem({ publicId, largura: LARGURAS[1] })}
          srcSet={srcSetImagem(publicId)}
          sizes={sizes}
          alt={alt}
          loading={prioritaria ? 'eager' : 'lazy'}
          decoding={prioritaria ? 'sync' : 'async'}
          fetchPriority={prioritaria ? 'high' : 'auto'}
          onError={() => setFalhou(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
