import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { AppError } from '../errors/appError.js';
import type { OrderItemInput } from '../schemas/orderSchemas.js';
import type { Order } from '../types/order.js';

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

export function createOrder(inputItems: OrderItemInput[]): Order {
  const quantities = new Map<number, number>();

  for (const item of inputItems) {
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const items = [...quantities].map(([productId, quantity]) => {
    const product = products.find((candidate) => candidate.id === productId);

    if (!product) {
      throw new AppError(
        404,
        'PRODUCT_NOT_FOUND',
        `Produto ${productId} não encontrado.`,
      );
    }

    if (product.stock < quantity) {
      throw new AppError(
        409,
        'INSUFFICIENT_STOCK',
        `Estoque insuficiente para o produto ${productId}.`,
        { productId, requested: quantity, available: product.stock },
      );
    }

    return {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPriceInCents: product.priceInCents,
      subtotalInCents: product.priceInCents * quantity,
    };
  });

  // O estoque só é alterado depois que todos os itens foram validados.
  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.productId)!;
    product.stock -= item.quantity;
  }

  const order: Order = {
    id: Math.max(1000, ...orders.map(({ id }) => id)) + 1,
    status: 'processing',
    items,
    totalInCents: items.reduce((total, item) => total + item.subtotalInCents, 0),
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  return order;
}
