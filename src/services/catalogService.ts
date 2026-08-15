import { products } from '../data/products.js';
import { AppError } from '../errors/appError.js';

export function listProducts() {
  return products;
}

export function getProductById(productId: number) {
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError(
      400,
      'INVALID_PRODUCT_ID',
      'O ID do produto deve ser um número inteiro positivo.',
    );
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    throw new AppError(
      404,
      'PRODUCT_NOT_FOUND',
      `Produto ${productId} não encontrado.`,
    );
  }

  return product;
}