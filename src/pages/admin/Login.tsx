import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { Logo } from '@/components/ui/Logo';
import { useSEO } from '@/utils/seo';
import { site } from '@/config/site';

export default function Login() {
  useSEO('Admin Login');
  const { isAuthenticated, login } = useAdminAuthStore();
  const [email, setEmail] = useState<string>(site.admin.email);
  const [password, setPassword] = useState<string>(site.admin.password);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(email, password)) {
      toast.success('Bem-vindo!');
      navigate('/admin');
    } else {
      toast.error('Credenciais inválidas');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-5">
      <form onSubmit={submit} className="card w-full max-w-md p-7">
        <Logo />
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-ink-mute">Painel administrativo</p>
        <h1 className="mt-5 text-2xl font-bold">Acessar admin</h1>
        <p className="mt-1 text-sm text-ink-mute">Use suas credenciais para entrar.</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="!pl-9" />
            </div>
          </div>
          <div>
            <Label>Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!pl-9"
              />
            </div>
          </div>
        </div>

        <Button type="submit" fullWidth className="mt-6">
          Entrar
        </Button>

        <p className="mt-5 rounded-xl bg-bg-soft p-3 text-[11px] text-ink-mute">
          ⓘ Demo: <code>{site.admin.email}</code> / <code>{site.admin.password}</code>
        </p>
      </form>
    </div>
  );
}
