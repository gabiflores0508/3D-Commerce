import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Topbar } from './Topbar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileDrawer } from './MobileDrawer';
import { WhatsappFloating } from './WhatsappFloating';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useUIStore } from '@/store/useUIStore';

export function PublicLayout() {
  const { pathname } = useLocation();
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  // Fecha drawers ao navegar e rola para o topo (instantâneo, sem jank visual)
  useEffect(() => {
    setCartOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, setCartOpen, setMobileMenuOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileDrawer />
      <CartDrawer />
      <WhatsappFloating />
      <ScrollRestoration />
    </div>
  );
}
