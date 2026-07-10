import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductPurchaseMode,
  type CouponDiscountType,
  type Order,
  type OrderItem,
  type User,
} from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../utils/httpError';
import { decimalToNumber } from '../../utils/decimal';
import { couponsService } from '../coupons/coupons.service';
import type {
  AdminOrdersQuery,
  CreateOrderInput,
  MeOrdersQuery,
  UpdateOrderStatusInput,
} from './orders.schemas';

type OrderWithRelations = Order & {
  items: OrderItem[];
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
};

/** DTO — todos os valores monetários como `number`, sem `passwordHash`. */
export interface OrderDTO {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressSnapshot: unknown;
  subtotal: number;
  shippingValue: number;
  discountValue: number;
  /** subtotal + frete, antes do desconto do cupom. */
  totalBeforeDiscount: number;
  total: number;
  couponId: string | null;
  couponCode: string | null;
  couponDiscountType: CouponDiscountType | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    productSku: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  user?: { id: string; name: string; email: string } | null;
}

function toOrderDTO(order: OrderWithRelations): OrderDTO {
  return {
    id: order.id,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    addressSnapshot: order.addressSnapshot,
    subtotal: decimalToNumber(order.subtotal) ?? 0,
    shippingValue: decimalToNumber(order.shippingValue) ?? 0,
    discountValue: decimalToNumber(order.discountValue) ?? 0,
    totalBeforeDiscount:
      (decimalToNumber(order.subtotal) ?? 0) + (decimalToNumber(order.shippingValue) ?? 0),
    total: decimalToNumber(order.total) ?? 0,
    couponId: order.couponId,
    couponCode: order.couponCode,
    couponDiscountType: order.couponDiscountType,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        productSku: it.productSku,
        quantity: it.quantity,
        unitPrice: decimalToNumber(it.unitPrice) ?? 0,
        total: decimalToNumber(it.total) ?? 0,
      })),
    user: order.user
      ? { id: order.user.id, name: order.user.name, email: order.user.email }
      : undefined,
  };
}

const includeRelations = {
  items: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderInclude;

export const ordersService = {
  /**
   * Cria um pedido a partir do carrinho do usuário.
   * Tudo dentro de uma transação: validações, criação, baixa de estoque
   * e limpeza do carrinho. Se qualquer passo falhar, nada é persistido.
   */
  async createFromCart(userId: string, input: CreateOrderInput): Promise<OrderDTO> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw HttpError.badRequest('Carrinho vazio.');
    }

    // Revalidação de cada item antes da transação: existência, ativo, modo, estoque.
    for (const item of cart.items) {
      if (!item.product) {
        throw HttpError.badRequest('Um dos produtos do carrinho não existe mais.');
      }
      if (!item.product.active) {
        throw HttpError.badRequest(`Produto "${item.product.name}" não está mais disponível.`);
      }
      if (item.product.purchaseMode === ProductPurchaseMode.QUOTE) {
        throw HttpError.badRequest(
          `Produto "${item.product.name}" é apenas via orçamento.`,
        );
      }
      if (item.quantity > item.product.stock) {
        throw HttpError.badRequest(
          `Estoque insuficiente para "${item.product.name}" (pediu ${item.quantity}, disponível ${item.product.stock}).`,
        );
      }
    }

    // Cálculos monetários usando Prisma.Decimal para não perder precisão.
    const subtotal = cart.items.reduce((acc, i) => {
      const line = new Prisma.Decimal(i.unitPrice).mul(i.quantity);
      return acc.add(line);
    }, new Prisma.Decimal(0));
    const subtotalNum = decimalToNumber(subtotal) ?? 0;

    // Cupom: SEMPRE revalidado no backend. O `input.discountValue` do cliente
    // é ignorado — o desconto vem exclusivamente do cupom resolvido aqui.
    const resolved = input.couponCode
      ? await couponsService.resolveForOrder(input.couponCode, subtotalNum, userId)
      : null;

    const freeShipping = resolved?.freeShipping ?? false;
    const shipping = new Prisma.Decimal(freeShipping ? 0 : input.shippingValue);
    const discount = new Prisma.Decimal(resolved ? resolved.discountAmount : 0);
    let total = subtotal.add(shipping).sub(discount);
    if (total.lt(0)) total = new Prisma.Decimal(0); // nunca negativo

    const order = await prisma.$transaction(async (tx) => {
      // Consome o cupom de forma ATÔMICA antes de criar o pedido.
      // updateMany com guarda de limite evita corrida em cupons como VIP5:
      // se dois pedidos simultâneos disputam o último uso, só um passa.
      if (resolved) {
        const c = resolved.coupon;
        if (c.usageLimit != null) {
          const upd = await tx.coupon.updateMany({
            where: { id: c.id, usageCount: { lt: c.usageLimit } },
            data: { usageCount: { increment: 1 } },
          });
          if (upd.count === 0) throw HttpError.conflict('Cupom esgotado.');
        } else {
          await tx.coupon.update({
            where: { id: c.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }

      const created = await tx.order.create({
        data: {
          userId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          addressSnapshot: input.address as unknown as Prisma.InputJsonValue,
          subtotal,
          shippingValue: shipping,
          discountValue: discount,
          total,
          status: OrderStatus.PENDING,
          paymentMethod: input.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          notes: input.notes ?? null,
          // Snapshot do cupom aplicado (preserva histórico).
          couponId: resolved?.coupon.id ?? null,
          couponCode: resolved?.coupon.code ?? null,
          couponDiscountType: resolved?.coupon.discountType ?? null,
          items: {
            create: cart.items.map((item) => {
              const line = new Prisma.Decimal(item.unitPrice).mul(item.quantity);
              return {
                productId: item.productId,
                productName: item.product.name,
                productSku: item.product.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: line,
              };
            }),
          },
        },
        include: includeRelations,
      });

      // Baixa de estoque — decrementa cada produto atômico dentro da tx.
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Limpa o carrinho (mantém o Cart em si, só apaga os items).
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return toOrderDTO(order);
  },

  async listMine(userId: string, query: MeOrdersQuery) {
    const where: Prisma.OrderWhereInput = { userId };
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: includeRelations,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      orders: rows.map(toOrderDTO),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getMine(userId: string, orderId: string): Promise<OrderDTO> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: includeRelations,
    });
    // Não vaza se o pedido é de outro user — retorna 404 igual.
    if (!order) throw HttpError.notFound('Pedido não encontrado.');
    return toOrderDTO(order);
  },

  async listAdmin(query: AdminOrdersQuery) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
    if (query.couponCode) where.couponCode = query.couponCode;

    if (query.search) {
      where.OR = [
        { id: { equals: query.search } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput =
      query.sort === 'oldest'
        ? { createdAt: 'asc' }
        : query.sort === 'total_asc'
        ? { total: 'asc' }
        : query.sort === 'total_desc'
        ? { total: 'desc' }
        : { createdAt: 'desc' };

    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: includeRelations,
        orderBy,
        skip,
        take: query.limit,
      }),
    ]);

    return {
      orders: rows.map(toOrderDTO),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getAdmin(orderId: string): Promise<OrderDTO> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: includeRelations,
    });
    if (!order) throw HttpError.notFound('Pedido não encontrado.');
    return toOrderDTO(order);
  },

  async updateStatus(orderId: string, input: UpdateOrderStatusInput): Promise<OrderDTO> {
    const exists = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!exists) throw HttpError.notFound('Pedido não encontrado.');

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      },
      include: includeRelations,
    });
    return toOrderDTO(updated);
  },
};
