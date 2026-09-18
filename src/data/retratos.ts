import type { Retrato } from './types';

/**
 * As cartas do protagonista — o VERSO do retrato do hero (ADR-0030).
 *
 * A frente é sempre `perfil.avatar`, a foto real, e é para ela que a
 * carta volta depois de 3 segundos. Cada entrada aqui é uma persona, e a
 * ordem da lista é a ordem do rodízio.
 *
 * Ao adicionar uma carta:
 * - `publicId` é o caminho no Cloudinary, sem extensão. **Estas três
 *   imagens vivem na raiz**, e não na pasta `portifolio/` que o
 *   `CLOUDINARY_FOLDER` aponta — foram enviadas assim antes de a
 *   convenção do ADR-0014 existir na prática. Mover depois quebra o
 *   cache do CDN e as URLs já compartilhadas, então ficam onde estão; o
 *   que entrar de novo segue a convenção.
 * - `alt` descreve **a imagem**, não a piada: classe e nível já são
 *   anunciados à parte pela região viva (ADR-0019).
 * - As artes são quadradas e a foto é 2:3; a moldura da carta é 3/4 e o
 *   recorte é central. Conferido: as três sobrevivem ao corte com o
 *   rosto e o personagem inteiros.
 * - `nivel` é a mesma escala 1–5 do site (ADR-0007). Vale variar: duas
 *   cartas nível 5 não dizem nada.
 */
export const retratos: Retrato[] = [
  {
    id: 'cyberpunk',
    publicId: 'cyberpunk',
    alt: 'Ilustração em pixel art de Gabriel numa rua cyberpunk à noite, de jaqueta, cercado por painéis holográficos e letreiros de neon',
    classe: 'Netrunner',
    nivel: 5,
  },
  {
    id: 'rpg',
    publicId: 'rpg',
    alt: 'Ilustração em pixel art de Gabriel como aventureiro numa vila medieval, com espada nas costas, ombreira de aço e ferramentas nas mãos',
    classe: 'Artífice da Guilda',
    nivel: 4,
  },
];
