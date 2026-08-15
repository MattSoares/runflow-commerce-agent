import type { Product } from '../types/product.js';

/**
 * Catálogo inicial da loja.
 *
 * O desafio permite persistência em memória, portanto alterações no estoque
 * serão perdidas quando o servidor for reiniciado.
 */

export const products: Product[] = [
  {
    id: 1,
    name: 'Fone Bluetooth Pulse',
    description:
      'Fone sem fio com cancelamento de ruído e autonomia de até 30 horas.',
    priceInCents: 24990,
    stock: 12,
  },
  {
    id: 2,
    name: 'Teclado Mecânico Flow',
    description:
      'Teclado ABNT2 com switches táteis, iluminação branca e conexão USB-C.',
    priceInCents: 38990,
    stock: 8,
  },
  {
    id: 3,
    name: 'Mouse Sem Fio Orbit',
    description:
      'Mouse ergonômico de 8.000 DPI com Bluetooth e receptor USB.',
    priceInCents: 17990,
    stock: 15,
  },
  {
    id: 4,
    name: 'Webcam Vision Full HD',
    description:
      'Webcam 1080p com microfone duplo e correção automática de iluminação.',
    priceInCents: 29990,
    stock: 5,
  },
  {
    id: 5,
    name: 'Hub USB-C Connect 7 em 1',
    description:
      'Hub com HDMI, leitor de cartões, USB-A, USB-C e Power Delivery.',
    priceInCents: 21990,
    stock: 0,
  },
  {
    id: 6,
    name: 'Suporte de Notebook Rise',
    description:
      'Suporte ajustável em alumínio para notebooks de até 17 polegadas.',
    priceInCents: 14990,
    stock: 20,
  },
  {
    id: 7,
    name: 'Luminária de Mesa Focus',
    description:
      'Luminária LED regulável com três temperaturas de cor e porta USB.',
    priceInCents: 12990,
    stock: 7,
  },
  {
    id: 8,
    name: 'Cabo USB-C Pro 2m',
    description:
      'Cabo trançado de 100 W compatível com carregamento rápido.',
    priceInCents: 5990,
    stock: 30,
  },
];