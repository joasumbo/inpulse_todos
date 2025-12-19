import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Page } from '../lib/supabase';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';

export function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPages(data);
    setLoading(false);
  };

  const togglePublish = async (page: Page) => {
    const { error } = await supabase
      .from('pages')
      .update({ is_published: !page.is_published })
      .eq('id', page.id);

    if (!error) {
      setPages(pages.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p));
    }
  };

  if (loading) {
    return <TableSkeleton rows={7} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{pages.length} páginas criadas</p>
        <Link
          to="/pages/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Nova Página
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Título</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Slug</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{page.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">/{page.slug}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => togglePublish(page)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      page.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                    {page.is_published ? 'Publicado' : 'Rascunho'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/pages/${page.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    <Edit size={16} />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
