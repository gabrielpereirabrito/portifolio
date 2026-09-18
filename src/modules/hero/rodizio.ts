/**
 * O rodízio das cartas do protagonista — ADR-0030.
 *
 * Em arquivo próprio pelo mesmo motivo que o reconhecedor do Konami está
 * fora do componente: é a única regra aqui que se verifica sem DOM, e
 * misturá-la ao componente também custaria o fast refresh (um arquivo que
 * exporta componente e função deixa de recarregar em pé).
 *
 * Sequencial e não sorteado de propósito: com três cartas, o sorteio
 * repete a anterior uma vez em três, e repetição lida como travamento.
 */
export function proximoIndice(atual: number, total: number): number {
  // Lista vazia ou índice fora da faixa não podem devolver NaN nem
  // negativo: quem chama usa o resultado para indexar um array, e um
  // `undefined` ali apagaria a carta da tela sem erro nenhum.
  if (total <= 0) return 0;
  if (atual < 0) return 0;

  return (atual + 1) % total;
}
