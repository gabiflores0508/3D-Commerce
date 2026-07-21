import type { Response } from 'express';

/**
 * Envelope padrão da API:
 *
 * Sucesso  → { ok: true, data: <T> }
 * Erro     → { ok: false, error: { code, message, details? } }
 */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>): Response<ApiSuccess<T>> {
  const body: ApiSuccess<T> = meta ? { ok: true, data, meta } : { ok: true, data };
  return res.status(200).json(body);
}

export function created<T>(res: Response, data: T): Response<ApiSuccess<T>> {
  return res.status(201).json({ ok: true, data });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response<ApiError> {
  const body: ApiError = { ok: false, error: { code, message, ...(details !== undefined ? { details } : {}) } };
  return res.status(status).json(body);
}
