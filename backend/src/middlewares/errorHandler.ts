import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { HttpError } from '../utils/httpError';
import { fail } from '../utils/apiResponse';
import { env } from '../config/env';

/**
 * Middleware global de erro. Deve ser o ÚLTIMO `app.use(...)`.
 *
 * Capacidades:
 * - Reconhece HttpError (status/code custom).
 * - Reconhece ZodError (validação) → 422.
 * - Captura erro de JSON inválido do body-parser → 400.
 * - Demais erros → 500 sem expor stack em produção.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1) Erros próprios da aplicação
  if (err instanceof HttpError) {
    return fail(res, err.status, err.code, err.message, err.details);
  }

  // 2) Erros de validação (Zod)
  if (err instanceof ZodError) {
    return fail(res, 422, 'VALIDATION_ERROR', 'Dados inválidos.', err.flatten());
  }

  // 2b) Erros do Multer (tamanho, quantidade, tipo)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      // Limite varia por rota (5 MB para imagens de produto, 25 MB para quotes).
      // Como o multer não expõe o limite aqui, damos uma mensagem genérica.
      return fail(res, 413, 'FILE_TOO_LARGE', 'Arquivo excede o tamanho máximo permitido.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return fail(res, 400, 'TOO_MANY_FILES', 'Muitos arquivos enviados.');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return fail(res, 400, 'UNEXPECTED_FIELD', 'Campo de upload inesperado. Use "images".');
    }
    return fail(res, 400, 'UPLOAD_ERROR', err.message);
  }

  // 3) Body JSON malformado (body-parser do Express)
  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.parse.failed') {
    return fail(res, 400, 'BAD_JSON', 'JSON da requisição é inválido.');
  }

  // 4) Payload muito grande
  if (err && typeof err === 'object' && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
    return fail(res, 413, 'PAYLOAD_TOO_LARGE', 'Corpo da requisição muito grande.');
  }

  // 5) Demais erros — não vazar internals em produção
  // eslint-disable-next-line no-console
  console.error('[errorHandler] Unhandled error:', err);
  const expose = env.NODE_ENV !== 'production';
  return fail(
    res,
    500,
    'INTERNAL_ERROR',
    'Erro interno do servidor.',
    expose ? { message: (err as Error)?.message } : undefined,
  );
};
