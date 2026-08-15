/**
 * Representa um erro esperado durante o uso da aplicação.
 *
 * Esse erro vai possuir um status HTTP e um código público, permitindo que
 * seja enviado ao cliente sem expor detalhes do servidor.
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}