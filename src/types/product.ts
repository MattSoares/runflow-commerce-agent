/**
 * Representa um produto armazenado pela API mock.
 * Os dados ficam em memória e são reiniciados junto com o servidor.
 */

export interface Product {
  id: number;
  name: string;
  description: string;

  /**
   * O preço é armazenado como inteiro para evitar imprecisões
   * de ponto flutuante durante o cálculo dos pedidos.
   * Exemplo: 24990 representa R$ 249,90.
   */
  priceInCents: number;
  stock: number;
}