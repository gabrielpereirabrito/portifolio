import type { Retrato } from './types';

/**
 * CONTEUDO DE EXEMPLO — trocar pelas cartas reais.
 *
 * Cada entrada é um VERSO do retrato do hero (ADR-0030): a foto
 * estilizada, a classe e o nível. A frente é sempre `perfil.avatar`, e é
 * para ela que a carta volta depois de 3 segundos.
 *
 * Ao adicionar uma carta:
 * - `publicId` segue a convenção `portfolio/perfil/<nome>` do ADR-0014, e
 *   o Cloudinary já está configurado — subir a imagem com esse caminho
 *   basta, sem tocar em código. Enquanto ela não existir, o `CloudImage`
 *   cai no placeholder temático (ADR-0026).
 * - `alt` descreve a FOTO, não a piada. Quem usa leitor de tela precisa
 *   saber o que está na imagem; a classe e o nível já são anunciados à
 *   parte.
 * - `nivel` é a mesma escala 1–5 do resto do site (ADR-0007). Vale variar:
 *   cinco cartas todas nível 5 não dizem nada.
 *
 * A ordem aqui é a ordem do rodízio — cada virada mostra a próxima.
 */
export const retratos: Retrato[] = [
  {
    id: 'arquiteto',
    publicId: 'portfolio/perfil/carta-arquiteto',
    alt: 'Gabriel de frente para a câmera, em tons de ciano',
    classe: 'Arquiteto de Sistemas',
    nivel: 4,
  },
  {
    id: 'domador',
    publicId: 'portfolio/perfil/carta-domador',
    alt: 'Gabriel de perfil, iluminado por um monitor',
    classe: 'Domador de Legado',
    nivel: 5,
  },
  {
    id: 'noturno',
    publicId: 'portfolio/perfil/carta-noturno',
    alt: 'Gabriel em plano fechado, com luz baixa',
    classe: 'Programador Noturno',
    nivel: 3,
  },
];
