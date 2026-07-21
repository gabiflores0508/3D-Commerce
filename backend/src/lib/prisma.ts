import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

/**
 * Singleton do Prisma Client.
 *
 * Em dev, o `tsx watch` recarrega o módulo várias vezes; sem este cache
 * cada hot-reload abriria uma nova conexão e acabaria estourando o pool
 * do Postgres. Em produção `globalThis` é descartado a cada deploy.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma__ = prisma;
}
