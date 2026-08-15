import cors from 'cors';
import express from 'express';

import { productRoutes } from './routes/productRoutes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Runflow Commerce Agent está funcionando.',
  });
});

app.use('/products', productRoutes);