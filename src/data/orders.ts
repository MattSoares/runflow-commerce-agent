import type { Order } from '../types/order.js';

/**
 * Pedidos iniciais usados para demonstrar consultas e testar o agente.
 *
 * Como a persistência é em memória, novos pedidos e alterações serão
 * descartados sempre que o servidor for reiniciado.
 */
export const orders: Order[] = [
  {
    id: 1042,
    status: 'shipped',
    items: [
      {
        productId: 3,
        productName: 'Mouse Sem Fio Orbit',
        quantity: 1,
        unitPriceInCents: 17990,
        subtotalInCents: 17990,
      },
      {
        productId: 8,
        productName: 'Cabo USB-C Pro 2m',
        quantity: 2,
        unitPriceInCents: 5990,
        subtotalInCents: 11980,
      },
    ],
    totalInCents: 29970,
    createdAt: '2026-08-12T14:30:00.000Z',
  },
  {
    id: 1041,
    status: 'delivered',
    items: [
      {
        productId: 6,
        productName: 'Suporte de Notebook Rise',
        quantity: 1,
        unitPriceInCents: 14990,
        subtotalInCents: 14990,
      },
    ],
    totalInCents: 14990,
    createdAt: '2026-08-05T10:00:00.000Z',
  },
];