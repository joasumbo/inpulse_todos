import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MenuItem } from '../lib/supabase';
import { Plus, Edit, Trash2, Save, X, GripVertical, Loader } from 'lucide-react';

export function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setMenuItems(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.label || !editingItem.url) return;

    setSaving(true);

    if (editingItem.id) {
      // Update
      const { error } = await supabase
        .from('menu_items')
        .update(editingItem)
        .eq('id', editingItem.id);

      if (!error) {
        setMenuItems(menuItems.map(item => item.id === editingItem.id ? editingItem as MenuItem : item));
      }
    } else {
      // Insert
      const newItem = {
        ...editingItem,
        order_index: menuItems.length,
      };
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert([newItem])
        .select()
        .single();

      if (!error && data) {
        setMenuItems([...menuItems, data]);
      }
    }

    setSaving(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item do menu?')) return;

    const { error } = await supabase.from('menu_items').delete().eq('id', id);

    if (!error) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const toggleActive = async (item: MenuItem) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);

    if (!error) {
      setMenuItems(menuItems.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
    }
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{menuItems.length} itens no menu</p>
        <button
          onClick={() => setEditingItem({ label: '', url: '', is_active: true })}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Novo Item
        </button>
      </div>

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">
              {editingItem.id ? 'Editar Item' : 'Novo Item'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Link *
                </label>
                <input
                  type="text"
                  value={editingItem.label || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ex: Home, Sobre, Contato"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="text"
                  value={editingItem.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ex: /, /sobre, /contato"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Item ativo</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} className="inline mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingItem.label || !editingItem.url}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader className="inline animate-spin mr-2" size={20} /> : <Save size={20} className="inline mr-2" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {menuItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum item no menu ainda
          </div>
        ) : (
          <div className="divide-y">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 ${
                  !item.is_active ? 'opacity-50' : ''
                }`}
              >
                <GripVertical size={20} className="text-gray-400 cursor-move" />
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.url}</p>
                </div>

                <button
                  onClick={() => toggleActive(item)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.is_active ? 'Ativo' : 'Inativo'}
                </button>

                <button
                  onClick={() => setEditingItem(item)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
