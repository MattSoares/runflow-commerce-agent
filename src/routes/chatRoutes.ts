import { Router } from 'express';

import { chat } from '../controllers/chatController.js';

export const chatRoutes = Router();
chatRoutes.post('/', chat);
