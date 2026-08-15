import 'dotenv/config';

import cors from 'cors';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Runflow Commerce Agent está funcionando.',
  });
});

app.listen(port, () => {
  console.log(`Servidor disponível em http://localhost:${port}`);
});