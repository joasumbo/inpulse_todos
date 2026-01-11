import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { HomeContent } from '../lib/supabase';
import { Notification } from '../components/Notification';

export function HomeContentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HomeContent | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .single();

      if (error) throw error;
      setContent(data);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('home_content')
        .update({
          hero_badge: content.hero_badge,
          hero_title: content.hero_title,
          hero_subtitle: content.hero_subtitle,
          hero_description: content.hero_description,
          hero_cta_primary: content.hero_cta_primary,
          hero_cta_secondary: content.hero_cta_secondary,
        })
        .eq('id', content.id);

      if (error) throw error;
      
      setNotification({ type: 'success', message: 'Conteúdo atualizado com sucesso!' });
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setNotification({ type: 'error', message: 'Erro ao salvar conteúdo. Tente novamente.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!content) return <div>Erro ao carregar conteúdo</div>;

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conteúdo da Home Page</h1>
        <p className="text-gray-600">Edite os textos principais da página inicial</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge (Texto pequeno no topo)
          </label>
          <input
            type="text"
            value={content.hero_badge}
            onChange={(e) => setContent({ ...content, hero_badge: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Disponível para novos projetos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Principal
          </label>
          <input
            type="text"
            value={content.hero_title}
            onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: INPULSE"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítulo (Texto colorido)
          </label>
          <input
            type="text"
            value={content.hero_subtitle}
            onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Grupo Multidisciplinar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={content.hero_description}
            onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descrição completa dos serviços"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Botão Primário (Texto)
            </label>
            <input
              type="text"
              value={content.hero_cta_primary}
              onChange={(e) => setContent({ ...content, hero_cta_primary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Começar Projeto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Botão Secundário (Texto)
            </label>
            <input
              type="text"
              value={content.hero_cta_secondary}
              onChange={(e) => setContent({ ...content, hero_cta_secondary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Explorar Serviços"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={18} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
