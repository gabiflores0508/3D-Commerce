export const site = {
  name: '3DCommerce',
  tagline: 'Tudo para impressão 3D em um só lugar',
  whatsapp: '5554992752253',
  whatsappDisplay: '(54) 99275-2253',
  email: 'commerce3d@outlook.com',
  instagram: 'https://www.instagram.com/3dcommerce_bg/',
  instagramHandle: '@3dcommerce_bg',
  address: "L'América Shopping Center — Rua 13 de Maio, 877, São Bento, Bento Gonçalves/RS",
  mapsUrl: 'https://maps.app.goo.gl/ppFbmAxauMKhj3vf8',
  mapsEmbedQuery: "L'América Shopping Center, Rua 13 de Maio 877, Bento Gonçalves RS",
  city: 'Bento Gonçalves/RS',
  cnpj: '66.771.571/0001-38',
  shippingNote: 'Enviamos para todo o Brasil',
  freeShippingThreshold: 299,
  pixDiscountPercent: 5,
  admin: {
    email: 'admin@3dcommerce.com',
    password: '3dcommerce2026',
  },
  coupons: {
    BEMVINDO10: { type: 'percent', value: 10, label: 'Boas-vindas 10% off' },
    PIX5: { type: 'percent', value: 5, label: 'Pix extra 5%' },
    FRETE3D: { type: 'shipping', value: 100, label: 'Frete grátis' },
  } as const,
} as const;

export type CouponCode = keyof typeof site.coupons;
