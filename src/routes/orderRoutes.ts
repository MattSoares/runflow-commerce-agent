import { Router } from 'express';

import { getOrder } from '../controllers/orderController.js';

export const orderRoutes = Router();

orderRoutes.get('/:id', getOrder);