import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Page } from '../lib/supabase';
import { Save, Loader, ArrowLeft } from 'lucide-react';

export function PageEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Partial<Page>>({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    is_published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      loadPage();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPage = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setPage(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (id === 'new') {
      const { error } = await supabase.from('pages').insert([page]);
      
      if (error) {
        setMessage('Erro ao criar página');
      } else {
        setMessage('Página criada com sucesso!');
        setTimeout(() => navigate('/pages'), 1500);
      }
    } else {
      const { error } = await supabase
        .from('pages')
        .update(page)
        .eq('id', id);
      
      if (error) {
        setMessage('Erro ao salvar página');
      } else {
        setMessage('Página salva com sucesso!');
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate('/pages')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {message && (
          <div
            className={`px-4 py-3 rounded-lg ${
              message.includes('sucesso')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Página *
            </label>
            <input
              type="text"
              value={page.title || ''}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={page.slug || ''}
              onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="exemplo-pagina"
              required
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={page.is_published || false}
              onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
              className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">Publicar página</span>
          </label>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">SEO</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={page.meta_title || ''}
                onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Título para SEO (60 caracteres ideal)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={page.meta_description || ''}
                onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Descrição para SEO (160 caracteres ideal)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/pages')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Salvando...' : 'Salvar Página'}
          </button>
        </div>
      </form>
    </div>
  );
}
