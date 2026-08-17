export const toolDeclarations = [
  {
    name: 'list_products',
    description: 'Lista o catálogo atual com ID, nome, preço e estoque de cada produto.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_product',
    description: 'Consulta descrição, preço e estoque atual de um produto pelo ID.',
    parameters: {
      type: 'OBJECT',
      properties: { productId: { type: 'INTEGER', description: 'ID do produto' } },
      required: ['productId'],
    },
  },
  {
    name: 'get_order_status',
    description: 'Consulta status, itens e total de um pedido pelo ID.',
    parameters: {
      type: 'OBJECT',
      properties: { orderId: { type: 'INTEGER', description: 'ID do pedido' } },
      required: ['orderId'],
    },
  },
  {
    name: 'create_order',
    description: 'Cria um pedido com um ou mais produtos. Só chamar após conhecer IDs e quantidades.',
    parameters: {
      type: 'OBJECT',
      properties: {
        items: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              productId: { type: 'INTEGER' },
              quantity: { type: 'INTEGER' },
            },
            required: ['productId', 'quantity'],
          },
        },
      },
      required: ['items'],
    },
  },
] as const;
