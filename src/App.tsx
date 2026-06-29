import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from '@/routes/AppRoutes';
import { useAdminDataStore } from '@/store/useAdminDataStore';

export default function App() {
  const customLogo = useAdminDataStore((s) => s.settings.logo);

  // Usa a logo do site como favicon. Se o admin enviou uma logo personalizada,
  // o favicon passa a refletir essa logo; senão, mantém o favicon.svg padrão.
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (customLogo) {
      link.type = customLogo.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
      link.href = customLogo;
    } else {
      link.type = 'image/svg+xml';
      link.href = '/favicon.svg';
    }
  }, [customLogo]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1115',
            color: '#FAFAF7',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#22D3EE', secondary: '#0F1115' } },
        }}
      />
    </>
  );
}
