import { MapPin, Phone, Truck } from 'lucide-react';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { whatsappContact } from '@/utils/whatsapp';
import { site } from '@/config/site';

export function Topbar() {
  const settings = useAdminDataStore((s) => s.settings);
  return (
    <div className="hidden bg-ink text-bg/90 text-xs md:block">
      <div className="container-x flex h-9 items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> {settings.shippingNote}
          </span>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Abrir localização da loja no Google Maps — ${site.city}`}
            className="inline-flex items-center gap-1.5 transition hover:text-accent"
          >
            <MapPin className="h-3.5 w-3.5" /> Loja física em {site.city}
          </a>
        </div>
        <a
          href={whatsappContact()}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Falar pelo WhatsApp ${site.whatsappDisplay}`}
          className="inline-flex items-center gap-1.5 transition hover:text-accent"
        >
          <Phone className="h-3.5 w-3.5" /> WhatsApp {site.whatsappDisplay}
        </a>
      </div>
    </div>
  );
}
