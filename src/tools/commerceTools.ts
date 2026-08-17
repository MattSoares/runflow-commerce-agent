import { z } from 'zod';

import { AppError } from '../errors/appError.js';
import { createOrderSchema } from '../schemas/orderSchemas.js';

const productArgs = z.object({ productId: z.number().int().positive() });
const orderArgs = z.object({ orderId: z.number().int().positive() });
const createArgs = z.object({ items: createOrderSchema });

async function apiRequest(path: string, init?: RequestInit): Promise<unknown> {
  const baseUrl = process.env.COMMERCE_API_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

  try {
    const response = await fetch(`${baseUrl}${path}`, init);
    const payload = await response.json() as { data?: unknown; error?: unknown };
    return response.ok ? payload.data : { error: payload.error };
  } catch {
    throw new AppError(502, 'COMMERCE_API_UNAVAILABLE', 'A API da loja não está disponível.');
  }
}

export async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_products':
      return apiRequest('/products');
    case 'get_product': {
      const { productId } = productArgs.parse(args);
      return apiRequest(`/products/${productId}`);
    }
    case 'get_order_status': {
      const { orderId } = orderArgs.parse(args);
      return apiRequest(`/orders/${orderId}`);
    }
    case 'create_order': {
      const { items } = createArgs.parse(args);
      return apiRequest('/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(items),
      });
    }
    default:
      throw new AppError(400, 'UNKNOWN_TOOL', `Ferramenta desconhecida: ${name}.`);
  }
}
