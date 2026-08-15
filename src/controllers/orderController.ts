import type { Request, Response } from 'express';

import { getOrderById } from '../services/orderService.js';
import type { Order } from '../types/order.js';

function formatOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPriceInCents / 100,
      subtotal: item.subtotalInCents / 100,
    })),
    total: order.totalInCents / 100,
    createdAt: order.createdAt,
  };
}

export function getOrder(
  request: Request,
  response: Response,
): void {
  const orderId = Number(request.params.id);
  const order = getOrderById(orderId);

  response.status(200).json({
    data: formatOrder(order),
  });
}