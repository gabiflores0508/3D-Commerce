/**
 * Erro HTTP padrão da API. Lançar para o middleware global capturar e
 * retornar no formato `{ ok:false, error: { code, message, details? } }`.
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'HttpError';
  }

  static badRequest(message = 'Requisição inválida', details?: unknown) {
    return new HttpError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Não autenticado') {
    return new HttpError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Acesso negado') {
    return new HttpError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Recurso não encontrado') {
    return new HttpError(404, 'NOT_FOUND', message);
  }
  static conflict(message = 'Conflito de dados') {
    return new HttpError(409, 'CONFLICT', message);
  }
  static unprocessable(message = 'Entidade não processável', details?: unknown) {
    return new HttpError(422, 'UNPROCESSABLE_ENTITY', message, details);
  }
  static tooLarge(message = 'Payload muito grande') {
    return new HttpError(413, 'PAYLOAD_TOO_LARGE', message);
  }
  static internal(message = 'Erro interno do servidor') {
    return new HttpError(500, 'INTERNAL_ERROR', message);
  }
}
