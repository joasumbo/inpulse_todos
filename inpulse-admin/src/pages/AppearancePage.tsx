import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SiteConfig } from '../lib/supabase';
import { Save, Loader, Upload } from 'lucide-react';

export function AppearancePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from('site_config').select('*').single();
    if (data) setConfig(data);
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !config) return;

    const file = e.target.files[0];
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (uploadError) {
      setMessage('Erro ao fazer upload do logo');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    setConfig({ ...config, logo_url: publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('site_config')
      .update({
        logo_url: config.logo_url,
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
      })
      .eq('id', config.id);

    setSaving(false);

    if (error) {
      setMessage('Erro ao salvar aparência');
    } else {
      setMessage('Aparência salva com sucesso!');
      setTimeout(() => setMessage(''), 3000);
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo do Site
          </label>
          <div className="flex items-center gap-4">
            {config?.logo_url && (
              <img
                src={config.logo_url}
                alt="Logo"
                className="h-16 w-auto object-contain border rounded"
              />
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
              {uploading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
              {uploading ? 'Enviando...' : 'Upload Logo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor Primária
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config?.primary_color || '#000000'}
                onChange={(e) => setConfig({ ...config!, primary_color: e.target.value })}
                className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config?.primary_color || '#000000'}
                onChange={(e) => setConfig({ ...config!, primary_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor Secundária
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config?.secondary_color || '#ffffff'}
                onChange={(e) => setConfig({ ...config!, secondary_color: e.target.value })}
                className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config?.secondary_color || '#ffffff'}
                onChange={(e) => setConfig({ ...config!, secondary_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Preview das Cores</h3>
          <div className="flex gap-4">
            <div
              className="h-24 flex-1 rounded-lg flex items-center justify-center text-white font-semibold shadow-md"
              style={{ backgroundColor: config?.primary_color }}
            >
              Cor Primária
            </div>
            <div
              className="h-24 flex-1 rounded-lg flex items-center justify-center font-semibold shadow-md border"
              style={{ backgroundColor: config?.secondary_color, color: config?.primary_color }}
            >
              Cor Secundária
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
