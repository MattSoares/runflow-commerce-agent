import { z } from 'zod';

export const orderItemSchema = z
  .object({
    productId: z
      .number()
      .int('O ID do produto deve ser um número inteiro.')
      .positive('O ID do produto deve ser positivo.'),

    quantity: z
      .number()
      .int('A quantidade deve ser um número inteiro.')
      .positive('A quantidade deve ser maior que zero.'),
  })
  .strict();

export const createOrderSchema = z
  .array(orderItemSchema)
  .min(1, 'O pedido deve conter pelo menos um item.');

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
