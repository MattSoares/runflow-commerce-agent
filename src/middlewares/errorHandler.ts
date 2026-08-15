import type { ErrorRequestHandler } from 'express';

import { AppError } from '../errors/appError.js';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });

    return;
  }

  /*
   * Erros inesperados são registrados no servidor para investigação,
   * mas seus detalhes não são enviados ao cliente. Isso evita expor
   * informações internas da aplicação.
   */
  console.error(error);

  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro interno inesperado.',
    },
  });
};