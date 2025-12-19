import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/supabase';
import { Save, Loader, ArrowLeft, Upload } from 'lucide-react';

export function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    is_published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      loadPost();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPost = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setPost(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `blog-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (uploadError) {
      setMessage('Erro ao fazer upload da imagem');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    setPost({ ...post, featured_image: publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (id === 'new') {
      const { error } = await supabase.from('blog_posts').insert([post]);
      
      if (error) {
        setMessage('Erro ao criar post');
      } else {
        setMessage('Post criado com sucesso!');
        setTimeout(() => navigate('/blog'), 1500);
      }
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id);
      
      if (error) {
        setMessage('Erro ao salvar post');
      } else {
        setMessage('Post salvo com sucesso!');
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
        onClick={() => navigate('/blog')}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem Destacada
          </label>
          {post.featured_image && (
            <img src={post.featured_image} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-3" />
          )}
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors inline-flex">
            {uploading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
            {uploading ? 'Enviando...' : 'Upload Imagem'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Post *
          </label>
          <input
            type="text"
            value={post.title || ''}
            onChange={(e) => {
              const title = e.target.value;
              setPost({ 
                ...post, 
                title,
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resumo/Excerpt
          </label>
          <textarea
            value={post.excerpt || ''}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Breve resumo do post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo *
          </label>
          <textarea
            value={post.content || ''}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
            placeholder="Escreva o conteúdo do post..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              type="text"
              value={post.category || ''}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Notícias, Dicas, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={post.tags?.join(', ') || ''}
              onChange={(e) => setPost({ ...post, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="eventos, tecnologia, ..."
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={post.is_published || false}
              onChange={(e) => setPost({ ...post, is_published: e.target.checked })}
              className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">Publicar post</span>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/blog')}
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
            {saving ? 'Salvando...' : 'Salvar Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
