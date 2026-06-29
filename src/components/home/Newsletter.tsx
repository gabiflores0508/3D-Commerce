import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Digite um e-mail válido.');
      return;
    }
    toast.success('Inscrição realizada! Obrigado.');
    setEmail('');
  }
  return (
    <section className="container-x py-16">
      <div className="overflow-hidden rounded-3xl bg-ink p-8 text-bg md:p-12">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bg/60">Novidades</p>
            <h2 className="mt-1 font-display text-3xl font-bold">Receba ofertas e novidades da 3DCommerce</h2>
            <p className="mt-2 text-sm text-bg/70">
              Cupons, novos filamentos e impressoras em primeira mão.
            </p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="w-full rounded-xl bg-bg px-9 py-3 text-sm text-ink placeholder:text-ink-mute outline-none"
              />
            </label>
            <button type="submit" className="btn-primary !bg-accent !text-ink hover:!bg-accent-soft">
              Inscrever
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
