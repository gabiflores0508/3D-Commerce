import { useParams } from 'react-router-dom';
import Shop from './Shop';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useSEO } from '@/utils/seo';

export default function Category() {
  const { slug } = useParams();
  const category = useAdminDataStore((s) => s.categories.find((c) => c.slug === slug));
  useSEO(category?.name ?? 'Categoria', category?.description);
  if (!category) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
      </div>
    );
  }
  return <Shop categorySlug={slug} title={category.name} />;
}
