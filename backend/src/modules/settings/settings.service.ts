import type { SiteSettings } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { decimalToNumber } from '../../utils/decimal';
import { safeUnlinkSiteImage, siteImageUrl } from '../../lib/upload';
import type { UpdateSettingsInput } from './settings.schemas';

/** Existe UM registro só. id fixo `main`. */
const SETTINGS_ID = 'main';

/** Defaults usados quando o banco está zerado (primeiro boot pós-migration). */
const DEFAULTS = {
  storeName: '3DCommerce',
  whatsapp: '',
  email: 'contato@3dcommerce.com',
  instagram: null,
  address: '',
  cnpj: null,
  logoUrl: null,
  heroTitle: null,
  heroSubtitle: null,
  aboutTitle: null,
  aboutText: null,
  seoTitle: null,
  seoDescription: null,
  pixDiscountPercent: 5,
  freeShippingThreshold: 299,
  shippingNote: null,
} as const;

export interface SettingsDTO {
  id: string;
  storeName: string;
  whatsapp: string;
  email: string;
  instagram: string | null;
  address: string;
  cnpj: string | null;
  logoUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  aboutTitle: string | null;
  aboutText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  pixDiscountPercent: number;
  freeShippingThreshold: number;
  shippingNote: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDTO(s: SiteSettings): SettingsDTO {
  return {
    id: s.id,
    storeName: s.storeName,
    whatsapp: s.whatsapp,
    email: s.email,
    instagram: s.instagram,
    address: s.address,
    cnpj: s.cnpj,
    logoUrl: s.logoUrl,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    aboutTitle: s.aboutTitle,
    aboutText: s.aboutText,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    pixDiscountPercent: decimalToNumber(s.pixDiscountPercent) ?? 0,
    freeShippingThreshold: decimalToNumber(s.freeShippingThreshold) ?? 0,
    shippingNote: s.shippingNote,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

/** Garante o registro único; cria com defaults se não existir. */
async function ensureSettings(): Promise<SiteSettings> {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...DEFAULTS },
    update: {},
  });
}

export const settingsService = {
  async getPublic(): Promise<SettingsDTO> {
    const settings = await ensureSettings();
    return toDTO(settings);
  },

  async getAdmin(): Promise<SettingsDTO> {
    const settings = await ensureSettings();
    return toDTO(settings);
  },

  async update(input: UpdateSettingsInput): Promise<SettingsDTO> {
    await ensureSettings();
    const updated = await prisma.siteSettings.update({
      where: { id: SETTINGS_ID },
      // `partial()` no schema já deixa cada key opcional; o Prisma ignora undefined.
      data: input,
    });
    return toDTO(updated);
  },

  async setLogo(filename: string): Promise<SettingsDTO> {
    const current = await ensureSettings();
    // Remove logo antigo se estiver em /uploads/site/
    if (current.logoUrl) safeUnlinkSiteImage(current.logoUrl);
    const updated = await prisma.siteSettings.update({
      where: { id: SETTINGS_ID },
      data: { logoUrl: siteImageUrl(filename) },
    });
    return toDTO(updated);
  },
};
