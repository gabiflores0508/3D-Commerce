import bcrypt from 'bcryptjs';
import { UserRole, type User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../utils/httpError';
import { signAuthToken } from '../../utils/jwt';
import type { RegisterInput, LoginInput } from './auth.schemas';

/**
 * View pública do usuário — nunca inclui `passwordHash`.
 * Use este tipo em qualquer response que devolva `user`.
 */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

function toPublicUser(u: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role' | 'active' | 'createdAt'>): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
  };
}

const BCRYPT_ROUNDS = 10;

export const authService = {
  async register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw HttpError.conflict('Este e-mail já está cadastrado.');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
        role: UserRole.CUSTOMER,
        active: true,
      },
    });

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role });
    return { user: toPublicUser(user), token };
  },

  async login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
    // Mesma mensagem para "não existe" e "senha errada" — não vaza enumeração.
    const invalid = HttpError.unauthorized('E-mail ou senha inválidos.');
    const disabled = HttpError.forbidden('Conta desativada. Fale com o suporte.');

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      // Preserva tempo constante (aproximado) mesmo quando o usuário não existe
      // — evita side-channel de enumeração por latência.
      await bcrypt.compare(input.password, '$2b$10$abcdefghijklmnopqrstuv');
      throw invalid;
    }
    if (!user.active) throw disabled;

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw invalid;

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role });
    return { user: toPublicUser(user), token };
  },

  async getMe(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw HttpError.unauthorized('Usuário não encontrado.');
    if (!user.active) throw HttpError.forbidden('Conta desativada.');
    return toPublicUser(user);
  },

  /** Usado pelo authMiddleware — retorna dados mínimos para popular req.user. */
  async findActiveUserById(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, active: true },
      select: { id: true, email: true, role: true },
    });
  },
};
