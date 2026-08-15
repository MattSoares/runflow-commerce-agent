import type { Request, Response } from 'express';

import {
  getProductById,
  listProducts as listProductsService,
} from '../services/catalogService.js';
import type { Product } from '../types/product.js';

function formatProduct(product: Product) {
  /*
   * O domínio mantém o preço em centavos para cálculos seguros.
   * A resposta HTTP apresenta o valor em reais para facilitar o consumo.
   */
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.priceInCents / 100,
    stock: product.stock,
  };
}

export function listProducts(
  _request: Request,
  response: Response,
): void {
  const catalog = listProductsService().map(formatProduct);

  response.status(200).json({
    data: catalog,
  });
}

export function getProduct(
  request: Request,
  response: Response,
): void {
  const productId = Number(request.params.id);
  const product = getProductById(productId);

  response.status(200).json({
    data: formatProduct(product),
  });
}