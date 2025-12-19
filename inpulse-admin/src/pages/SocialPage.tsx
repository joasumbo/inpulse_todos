import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SocialLink } from '../lib/supabase';
import { Plus, Edit, Trash2, Save, X, Loader, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe } from 'lucide-react';

const platforms = [
  { name: 'Facebook', icon: Facebook },
  { name: 'Instagram', icon: Instagram },
  { name: 'LinkedIn', icon: Linkedin },
  { name: 'Twitter', icon: Twitter },
  { name: 'YouTube', icon: Youtube },
  { name: 'Outro', icon: Globe },
];

export function SocialPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    const { data } = await supabase
      .from('social_links')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setSocialLinks(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingLink || !editingLink.platform || !editingLink.url) return;

    setSaving(true);

    if (editingLink.id) {
      // Update
      const { error } = await supabase
        .from('social_links')
        .update(editingLink)
        .eq('id', editingLink.id);

      if (!error) {
        setSocialLinks(socialLinks.map(link => link.id === editingLink.id ? editingLink as SocialLink : link));
      }
    } else {
      // Insert
      const newLink = {
        ...editingLink,
        order_index: socialLinks.length,
      };
      
      const { data, error } = await supabase
        .from('social_links')
        .insert([newLink])
        .select()
        .single();

      if (!error && data) {
        setSocialLinks([...socialLinks, data]);
      }
    }

    setSaving(false);
    setEditingLink(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este link?')) return;

    const { error } = await supabase.from('social_links').delete().eq('id', id);

    if (!error) {
      setSocialLinks(socialLinks.filter(link => link.id !== id));
    }
  };

  const toggleActive = async (link: SocialLink) => {
    const { error } = await supabase
      .from('social_links')
      .update({ is_active: !link.is_active })
      .eq('id', link.id);

    if (!error) {
      setSocialLinks(socialLinks.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l));
    }
  };

  const getPlatformIcon = (platform: string) => {
    const found = platforms.find(p => p.name === platform);
    return found ? found.icon : Globe;
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
        <p className="text-gray-600">{socialLinks.length} redes sociais configuradas</p>
        <button
          onClick={() => setEditingLink({ platform: 'Facebook', url: '', is_active: true })}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Nova Rede Social
        </button>
      </div>

      {/* Editor Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">
              {editingLink.id ? 'Editar Rede Social' : 'Nova Rede Social'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataforma *
                </label>
                <select
                  value={editingLink.platform || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, platform: e.target.value, icon_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {platforms.map((platform) => (
                    <option key={platform.name} value={platform.name}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={editingLink.url || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLink.is_active !== false}
                    onChange={(e) => setEditingLink({ ...editingLink, is_active: e.target.checked })}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Link ativo</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingLink(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} className="inline mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingLink.platform || !editingLink.url}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader className="inline animate-spin mr-2" size={20} /> : <Save size={20} className="inline mr-2" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialLinks.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            Nenhuma rede social configurada ainda
          </div>
        ) : (
          socialLinks.map((link) => {
            const Icon = getPlatformIcon(link.platform);
            
            return (
              <div
                key={link.id}
                className={`bg-white rounded-xl shadow-sm p-6 ${
                  !link.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{link.platform}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(link)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      link.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {link.is_active ? 'Ativo' : 'Inativo'}
                  </button>

                  <button
                    onClick={() => setEditingLink(link)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
