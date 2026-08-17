import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { AppError } from '../errors/appError.js';
import { createOrder } from './orderService.js';

const originalStocks = products.map(({ stock }) => stock);
const originalOrderCount = orders.length;

beforeEach(() => {
  products.forEach((product, index) => {
    product.stock = originalStocks[index]!;
  });
  orders.splice(originalOrderCount);
});

describe('createOrder', () => {
  it('cria o pedido, calcula o total e baixa o estoque', () => {
    const order = createOrder([
      { productId: 1, quantity: 2 },
      { productId: 4, quantity: 1 },
    ]);

    assert.equal(order.id, 1043);
    assert.equal(order.status, 'processing');
    assert.equal(order.totalInCents, 79970);
    assert.equal(products[0]!.stock, 10);
    assert.equal(products[3]!.stock, 4);
  });

  it('soma itens repetidos antes de validar o estoque', () => {
    const order = createOrder([
      { productId: 1, quantity: 2 },
      { productId: 1, quantity: 3 },
    ]);

    assert.equal(order.items.length, 1);
    assert.equal(order.items[0]!.quantity, 5);
    assert.equal(products[0]!.stock, 7);
  });

  it('não altera estoque nem pedidos quando algum item é inválido', () => {
    assert.throws(
      () => createOrder([
        { productId: 1, quantity: 1 },
        { productId: 4, quantity: 1000 },
      ]),
      (error) => error instanceof AppError && error.code === 'INSUFFICIENT_STOCK',
    );

    assert.equal(products[0]!.stock, originalStocks[0]);
    assert.equal(orders.length, originalOrderCount);
  });
});
