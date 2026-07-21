import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';

/** Payload gravado no JWT. Mantém apenas o mínimo — dados de perfil vêm do DB. */
export interface JwtPayload {
  sub: string;   // user.id
  email: string;
  role: UserRole;
}

export function signAuthToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Verifica e decodifica o token. Lança erro se inválido/expirado — o
 * middleware é quem traduz para `HttpError.unauthorized()`.
 */
export function verifyAuthToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Payload de token inválido');
  }
  const payload = decoded as Record<string, unknown>;
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
    throw new Error('Payload de token inválido');
  }
  return { sub: payload.sub, email: payload.email, role: payload.role as UserRole };
}
