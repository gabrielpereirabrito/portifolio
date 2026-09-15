/**
 * Montagem de URL do Cloudinary — ADR-0014.
 *
 * REGRA: nenhum componente escreve URL de Cloudinary à mão. Tudo passa por
 * aqui — é o que permite trocar de provedor mexendo em um arquivo só.
 *
 * Segurança: só `VITE_CLOUDINARY_CLOUD_NAME` existe neste lado. Chave e
 * segredo servem para upload, que é operação de linha de comando na
 * máquina local, nunca do navegador.
 */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

const BASE = 'https://res.cloudinary.com';

/**
 * Conjunto pequeno e fixo de larguras, de propósito.
 *
 * Cada combinação nova de transformação é um cache miss no CDN e uma
 * transformação a mais contra a camada gratuita. Poucas larguras
 * maximizam o acerto de cache.
 */
export const LARGURAS = [400, 800, 1200, 1600] as const;

interface OpcoesImagem {
  /** Caminho no Cloudinary, sem extensão. Ex: `portfolio/projetos/meu-app/capa` */
  publicId: string;
  largura: number;
}

/**
 * `f_auto` deixa o navegador negociar o formato (AVIF onde houver suporte,
 * WebP depois, original como piso) e `q_auto` deixa o serviço escolher a
 * qualidade. Os dois juntos costumam cortar metade dos bytes sem que se
 * precise gerar variante nenhuma à mão.
 */
export function urlImagem({ publicId, largura }: OpcoesImagem): string {
  if (!CLOUD_NAME) return '';
  const t = `f_auto,q_auto,c_limit,w_${largura},dpr_auto`;
  return `${BASE}/${CLOUD_NAME}/image/upload/${t}/${publicId}`;
}

/** Candidatas para o navegador escolher conforme a tela. */
export function srcSetImagem(publicId: string): string {
  if (!CLOUD_NAME) return '';
  return LARGURAS.map((w) => `${urlImagem({ publicId, largura: w })} ${w}w`).join(', ');
}

/** O Cloudinary está configurado? Sem isso, o componente cai no placeholder. */
export function cloudinaryConfigurado(): boolean {
  return Boolean(CLOUD_NAME);
}
