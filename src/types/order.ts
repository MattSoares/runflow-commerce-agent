export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPriceInCents: number;
  subtotalInCents: number;
}

export type OrderStatus =
  | 'processing'
  | 'shipped'
  | 'delivered';

export interface Order {
  id: number;
  status: OrderStatus;
  items: OrderItem[];
  totalInCents: number;
  createdAt: string;
}