import { Outlet, ScrollRestoration, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { Drawer } from '@/components/ui/Drawer';

export function AdminLayout() {
  const isAuth = useAdminAuthStore((s) => s.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!isAuth) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex min-h-screen bg-bg-soft">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Menu Admin">
        <AdminSidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <ScrollRestoration />
    </div>
  );
}
