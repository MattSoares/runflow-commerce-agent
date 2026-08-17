/**
 * Representa um erro esperado durante o uso da aplicação.
 *
 * Esses erros possuem um status HTTP e um código público, permitindo que
 * sejam enviados ao cliente sem expor detalhes internos do servidor.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}