'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Check, Image as ImageIcon, GripVertical } from 'lucide-react';

interface Example {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export default function ExamplesPage() {
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExample, setEditingExample] = useState<Example | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const { data } = await supabase
        .from('examples')
        .select('*')
        .order('display_order', { ascending: true });

      if (data) setExamples(data);
    } catch (error) {
      console.error('Erro ao buscar exemplos:', error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingExample(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (example: Example) => {
    setEditingExample(example);
    setFormData({
      title: example.title,
      description: example.description || '',
      image_url: example.image_url || '',
      is_active: example.is_active
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title) return;

    setSaving(true);
    try {
      const exampleData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        display_order: editingExample?.display_order || examples.length + 1
      };

      if (editingExample) {
        await supabase
          .from('examples')
          .update(exampleData)
          .eq('id', editingExample.id);
      } else {
        await supabase
          .from('examples')
          .insert(exampleData);
      }

      fetchExamples();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres excluir este exemplo?')) return;

    try {
      await supabase
        .from('examples')
        .delete()
        .eq('id', id);

      fetchExamples();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleToggleActive = async (example: Example) => {
    try {
      await supabase
        .from('examples')
        .update({ is_active: !example.is_active })
        .eq('id', example.id);

      fetchExamples();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Exemplos</h1>
          <p className="text-gray-400 mt-1">Exemplos mostrados na landing page</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Exemplo
        </button>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examples.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            Nenhum exemplo cadastrado
          </div>
        ) : (
          examples.map((example, index) => (
            <div 
              key={example.id}
              className={`bg-gray-800 rounded-xl border overflow-hidden transition-all ${
                example.is_active ? 'border-gray-700 hover:border-gray-600' : 'border-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex">
                {/* Image */}
                <div className="w-32 h-32 bg-gray-700 flex-shrink-0">
                  {example.image_url ? (
                    <img 
                      src={example.image_url} 
                      alt={example.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-white">{example.title}</h3>
                    </div>
                    {!example.is_active && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                        Inativo
                      </span>
                    )}
                  </div>
                  {example.description && (
                    <p className="text-gray-400 text-sm mt-2 flex-1">
                      {example.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => handleToggleActive(example)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        example.is_active 
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {example.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => handleEdit(example)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(example.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingExample ? 'Editar Exemplo' : 'Novo Exemplo'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Título do exemplo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Descrição do exemplo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL da Imagem</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="/imagens/exemplo.jpeg"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">
                  Exemplo ativo
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
