import { Link } from 'react-router-dom';
import { useSEO } from '@/utils/seo';

export default function NotFound() {
  useSEO('Página não encontrada');
  return (
    <div className="container-x flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-7xl font-bold text-ink-mute">404</p>
      <h1 className="mt-3 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-sm text-ink-mute">A página que você procura pode ter sido movida ou não existe mais.</p>
      <Link to="/" className="btn-primary mt-6">
        Voltar para a Home
      </Link>
    </div>
  );
}
