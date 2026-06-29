import type { StoreSettings } from '@/types';
import { site } from '@/config/site';

export const seedStoreSettings: StoreSettings = {
  name: site.name,
  whatsapp: site.whatsapp,
  instagram: site.instagram,
  email: site.email,
  address: site.address,
  cnpj: site.cnpj,
  about:
    'A 3DCommerce é especializada em soluções completas de impressão 3D. Atuamos em Bento Gonçalves/RS com loja física e enviamos para todo o Brasil, oferecendo filamentos, resinas, impressoras e suporte técnico especializado.',
  shippingNote: site.shippingNote,
  freeShippingThreshold: site.freeShippingThreshold,
  pixDiscountPercent: site.pixDiscountPercent,
};
