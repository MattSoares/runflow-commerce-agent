import { orders } from '../data/orders.js';
import { AppError } from '../errors/appError.js';

export function getOrderById(orderId: number) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new AppError(
      400,
      'INVALID_ORDER_ID',
      'O ID do pedido deve ser um número inteiro positivo.',
    );
  }

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    throw new AppError(
      404,
      'ORDER_NOT_FOUND',
      `Pedido ${orderId} não encontrado.`,
    );
  }

  return order;
}