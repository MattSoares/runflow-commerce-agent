import { Router } from 'express';

import { createOrder, getOrder } from '../controllers/orderController.js';

export const orderRoutes = Router();

orderRoutes.get('/:id', getOrder);
orderRoutes.post('/', createOrder);
