import type { Request, Response } from 'express';

import { products } from '../data/products.js';

export function listProducts(
  _request: Request,
  response: Response,
): void {

    /*
   * O domínio mantém o preço em centavos para realizar cálculos seguros,
   * enquanto a resposta HTTP apresenta o valor em reais para o consumidor.
   */
  
  const catalog = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.priceInCents / 100,
    stock: product.stock,
  }));

  response.status(200).json({
    data: catalog,
  });
}