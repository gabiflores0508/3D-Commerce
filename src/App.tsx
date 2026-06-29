import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from '@/routes/AppRoutes';

export default function App() {
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
