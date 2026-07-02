import {
  OrderStatus,
  PaymentStatus,
  ProductPurchaseMode,
  QuoteStatus,
  UserRole,
} from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { decimalToNumber } from '../../utils/decimal';

const PENDING_QUOTE_STATUSES: QuoteStatus[] = [
  QuoteStatus.RECEIVED,
  QuoteStatus.ANALYZING,
  QuoteStatus.WAITING_CUSTOMER,
];

/**
 * Distribuições completas com todas as chaves do enum,
 * mesmo que a contagem seja 0. Deixa o frontend/dashboard
 * mais fácil de renderizar (não precisa fallback).
 */
function emptyOrderStatusCounts(): Record<OrderStatus, number> {
  return {
    PENDING: 0,
    CONFIRMED: 0,
    IN_PRODUCTION: 0,
    READY: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELED: 0,
  };
}

function emptyQuoteStatusCounts(): Record<QuoteStatus, number> {
  return {
    RECEIVED: 0,
    ANALYZING: 0,
    WAITING_CUSTOMER: 0,
    APPROVED: 0,
    REJECTED: 0,
    CONVERTED_TO_ORDER: 0,
  };
}

function emptyPurchaseModeCounts(): Record<ProductPurchaseMode, number> {
  return { DIRECT: 0, QUOTE: 0, BOTH: 0 };
}

export const dashboardService = {
  async getOverview() {
    // ---- Contagens agrupadas em uma única transação ----------------------
    const [
      totalProducts,
      totalActiveProducts,
      totalInactiveProducts,
      totalCategories,
      totalActiveCategories,
      totalCustomers,
      totalOrders,
      totalQuotes,
      pendingOrders,
      paidOrdersCount,
      pendingQuotes,
      lowStockCount,
      ordersByStatusGroup,
      quotesByStatusGroup,
      productsByPurchaseModeGroup,
      paidAggregate,
      recentOrdersRaw,
      recentQuotesRaw,
      lowStockProductsRaw,
    ] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: false } }),
      prisma.category.count(),
      prisma.category.count({ where: { active: true } }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.order.count(),
      prisma.quote.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      prisma.quote.count({ where: { status: { in: PENDING_QUOTE_STATUSES } } }),
      prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
      prisma.order.groupBy({ by: ['status'], _count: true, orderBy: { status: 'asc' } }),
      prisma.quote.groupBy({ by: ['status'], _count: true, orderBy: { status: 'asc' } }),
      prisma.product.groupBy({
        by: ['purchaseMode'],
        _count: true,
        orderBy: { purchaseMode: 'asc' },
      }),
      // Faturamento: soma + média sobre pedidos com paymentStatus = PAID.
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
        _avg: { total: true },
      }),
      // Recentes: últimos 5 pedidos com contagem de itens.
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      // Recentes: últimos 5 orçamentos + user básico (sem passwordHash).
      prisma.quote.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          title: true,
          status: true,
          estimatedValue: true,
          createdAt: true,
          _count: { select: { files: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      // Produtos com estoque baixo (limite 10, menor estoque primeiro).
      prisma.product.findMany({
        where: { active: true, stock: { lte: 5 } },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          stock: true,
          price: true,
          promotionalPrice: true,
          active: true,
          featured: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { position: 'asc' },
            take: 1,
            select: { id: true, url: true, alt: true },
          },
        },
      }),
    ]);

    // ---- Serialização das listas ----------------------------------------
    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: decimalToNumber(o.total) ?? 0,
      createdAt: o.createdAt.toISOString(),
      itemsCount: o._count.items,
    }));

    const recentQuotes = recentQuotesRaw.map((q) => ({
      id: q.id,
      customerName: q.customerName,
      customerEmail: q.customerEmail,
      customerPhone: q.customerPhone,
      title: q.title,
      status: q.status,
      estimatedValue: decimalToNumber(q.estimatedValue),
      createdAt: q.createdAt.toISOString(),
      filesCount: q._count.files,
      // `user` só com id/name/email — sem passwordHash. Se for null, ausente.
      user: q.user ? { id: q.user.id, name: q.user.name, email: q.user.email } : null,
    }));

    const lowStockProducts = lowStockProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      stock: p.stock,
      price: decimalToNumber(p.price) ?? 0,
      promotionalPrice: decimalToNumber(p.promotionalPrice),
      active: p.active,
      featured: p.featured,
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
        : null,
      image: p.images[0]
        ? { id: p.images[0].id, url: p.images[0].url, alt: p.images[0].alt }
        : null,
    }));

    // ---- Distribuições (com todas as chaves preenchidas) ----------------
    const ordersByStatus = emptyOrderStatusCounts();
    for (const row of ordersByStatusGroup) {
      // Com `_count: true`, `row._count` é `number`.
      ordersByStatus[row.status] = typeof row._count === 'number' ? row._count : 0;
    }

    const quotesByStatus = emptyQuoteStatusCounts();
    for (const row of quotesByStatusGroup) {
      quotesByStatus[row.status] = typeof row._count === 'number' ? row._count : 0;
    }

    const productsByPurchaseMode = emptyPurchaseModeCounts();
    for (const row of productsByPurchaseModeGroup) {
      productsByPurchaseMode[row.purchaseMode] =
        typeof row._count === 'number' ? row._count : 0;
    }

    // ---- Receita --------------------------------------------------------
    const estimatedRevenue = decimalToNumber(paidAggregate._sum.total) ?? 0;
    // `_avg` retorna null quando não há linhas.
    const averageOrderValue = decimalToNumber(paidAggregate._avg.total) ?? 0;

    return {
      metrics: {
        totalProducts,
        totalActiveProducts,
        totalInactiveProducts,
        totalCategories,
        totalActiveCategories,
        totalCustomers,
        totalOrders,
        totalQuotes,
        pendingOrders,
        pendingQuotes,
        paidOrders: paidOrdersCount,
        estimatedRevenue,
        totalRevenue: estimatedRevenue, // idêntico nesta versão
        averageOrderValue,
        lowStockCount,
      },
      recentOrders,
      recentQuotes,
      lowStockProducts,
      ordersByStatus,
      quotesByStatus,
      productsByPurchaseMode,
    };
  },
};
