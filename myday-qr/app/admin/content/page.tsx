'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Check, RefreshCw } from 'lucide-react';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  label: string;
  description: string;
}

const categories = [
  { id: 'hero', label: 'Hero / Cabeçalho' },
  { id: 'para_quem', label: 'Para quem é' },
  { id: 'diferencial', label: 'Diferencial' },
  { id: 'contact', label: 'Contacto' },
  { id: 'footer', label: 'Rodapé' },
];

export default function ContentPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('hero');
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data } = await supabase
        .from('site_config')
        .select('*')
        .order('category', { ascending: true });

      if (data) setConfigs(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
    setLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    setChanges({ ...changes, [key]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      for (const [key, value] of Object.entries(changes)) {
        await supabase
          .from('site_config')
          .update({ 
            value, 
            updated_at: new Date().toISOString(),
            updated_by: user?.id 
          })
          .eq('key', key);
      }

      setChanges({});
      setSaved(true);
      fetchConfigs();
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
    setSaving(false);
  };

  const filteredConfigs = configs.filter(c => c.category === activeCategory);
  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Conteúdo do Site</h1>
          <p className="text-gray-400 mt-1">Edita os textos da landing page</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-green-400 flex items-center gap-2 text-sm">
              <Check size={16} /> Guardado!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Config Items */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="divide-y divide-gray-700">
          {filteredConfigs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Nenhuma configuração nesta categoria
            </div>
          ) : (
            filteredConfigs.map((config) => (
              <div key={config.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="lg:w-1/3">
                    <label className="block text-white font-medium">
                      {config.label}
                    </label>
                    {config.description && (
                      <p className="text-sm text-gray-400 mt-1">{config.description}</p>
                    )}
                  </div>
                  <div className="lg:w-2/3">
                    {config.type === 'textarea' ? (
                      <textarea
                        value={changes[config.key] ?? config.value}
                        onChange={(e) => handleChange(config.key, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                    ) : (
                      <input
                        type="text"
                        value={changes[config.key] ?? config.value}
                        onChange={(e) => handleChange(config.key, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    )}
                    {changes[config.key] !== undefined && (
                      <p className="text-xs text-amber-400 mt-2">
                        Alteração pendente
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Changes Notice */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 left-4 lg:left-auto bg-amber-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
          <span className="font-medium">
            {Object.keys(changes).length} alteração(ões) por guardar
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
